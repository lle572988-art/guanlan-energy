#!/usr/bin/env node
/**
 * Reddit — 玄学焦虑截流雷达 (OpenClaw / cron)
 *
 * 抓取 r/ziweidoushu · r/bazi · r/astrologyreadings 最新帖，
 * 过滤高 upvote + 低评论的焦虑帖，写入 reddit_radar_tasks.md，Resend 邮件提醒。
 *
 * Env: RESEND_API_KEY, TEST_EMAIL
 *
 * Usage:
 *   node seo-engine/phase3/social-monitor/reddit_radar.mjs
 *   node seo-engine/phase3/social-monitor/reddit_radar.mjs --dry-run
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');
const OUTPUT_MD = path.join(REPO_ROOT, 'reddit_radar_tasks.md');
const STATE_FILE = path.join(__dirname, '../output/social-monitor/reddit_radar_state.json');

const SUBREDDITS = [
  { name: 'ziweidoushu', label: '东方玄学大本营', url: 'https://www.reddit.com/r/ziweidoushu/new/' },
  { name: 'bazi', label: '八字与占星讨论', url: 'https://www.reddit.com/r/bazi/new/' },
  { name: 'astrologyreadings', label: '海外占星焦虑区', url: 'https://www.reddit.com/r/astrologyreadings/new/' },
];

const KEYWORDS = [
  'what does my chart mean',
  'rising sign confused',
  'why is my life',
  '2026 forecast',
  'bazi',
  'ziwei',
  'help me read',
  'career luck',
];

const MIN_UPVOTES_DEFAULT = 1;
const MAX_COMMENTS_DEFAULT = 2;
const POST_LIMIT_PER_SUB_DEFAULT = 30;
const EMAIL_SUBJECT = '【老板，有老外在 Reddit 焦虑，快去截流！】';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * Residential proxy (optional) — set in .env.local:
 *   REDDIT_PROXY_SERVER=http://user:pass@host:port
 *   REDDIT_PROXY_USERNAME=...  (if not embedded in URL)
 *   REDDIT_PROXY_PASSWORD=...
 * Wired into launchStealthBrowser() below.
 */
function getProxyConfig() {
  const server = process.env.REDDIT_PROXY_SERVER || process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (!server) return undefined;
  const cfg = { server };
  if (process.env.REDDIT_PROXY_USERNAME) cfg.username = process.env.REDDIT_PROXY_USERNAME;
  if (process.env.REDDIT_PROXY_PASSWORD) cfg.password = process.env.REDDIT_PROXY_PASSWORD;
  return cfg;
}

async function launchStealthBrowser(headless) {
  const proxy = getProxyConfig();
  if (proxy) console.log(`   🌐 Playwright proxy: ${proxy.server.replace(/:[^:@/]+@/, ':***@')}`);
  return chromium.launch({
    headless,
    proxy,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox',
    ],
  });
}

async function newStealthContext(browser) {
  const context = await browser.newContext({
    userAgent: UA,
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    colorScheme: 'light',
    extraHTTPHeaders: {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'max-age=0',
      'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
  return context;
}

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function parseArgs() {
  const opts = {
    dryRun: false,
    limit: POST_LIMIT_PER_SUB_DEFAULT,
    minUpvotes: MIN_UPVOTES_DEFAULT,
    maxComments: MAX_COMMENTS_DEFAULT,
    headless: true,
  };
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--headed') opts.headless = false;
    else if (a === '--limit' && args[i + 1]) opts.limit = Number(args[++i]) || opts.limit;
    else if (a === '--min-upvotes' && args[i + 1]) opts.minUpvotes = Number(args[++i]) || opts.minUpvotes;
    else if (a === '--max-comments' && args[i + 1]) opts.maxComments = Number(args[++i]) || opts.maxComments;
  }
  return opts;
}

function matchesKeywords(text) {
  const hay = String(text || '').toLowerCase();
  return KEYWORDS.some((kw) => hay.includes(kw.toLowerCase()));
}

function excerpt(text, max = 280) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : clean.slice(0, max - 1) + '…';
}

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch {
    /* ignore */
  }
  return { alertedUrls: [] };
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  state.alertedUrls = (state.alertedUrls || []).slice(-500);
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function normalizePost(raw) {
  return {
    id: raw.id || raw.post_id || '',
    subreddit: raw.subreddit || '',
    subLabel: raw.subLabel || '',
    title: raw.title || '',
    body: raw.body || '',
    url: raw.url || '',
    upvotes: Number(raw.upvotes ?? raw.score ?? 0),
    comments: Number(raw.comments ?? raw.num_comments ?? raw.reply_count ?? 0),
    source: raw.source || 'unknown',
  };
}

async function fetchRedditJson(subreddit, limit) {
  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${Math.min(limit, 100)}&raw_json=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) throw new Error(`Reddit JSON ${res.status}`);
  const data = await res.json();
  const children = data?.data?.children || [];
  return children.map((c) => {
    const p = c.data || {};
    return normalizePost({
      id: p.id,
      subreddit: `r/${subreddit}`,
      title: p.title,
      body: (p.selftext || '').slice(0, 800),
      url: p.permalink ? `https://www.reddit.com${p.permalink}` : p.url,
      upvotes: p.ups ?? p.score ?? 0,
      comments: p.num_comments ?? 0,
      source: 'reddit_json',
    });
  });
}

async function fetchPullPush(subreddit, limit) {
  const params = new URLSearchParams({
    subreddit,
    size: String(Math.min(limit, 100)),
    sort: 'desc',
    sort_type: 'created_utc',
  });
  const url = `https://api.pullpush.io/reddit/search/submission/?${params}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) throw new Error(`PullPush ${res.status}`);
  const data = await res.json();
  return (data.data || []).map((p) =>
    normalizePost({
      id: p.id,
      subreddit: `r/${p.subreddit || subreddit}`,
      title: p.title,
      body: (p.selftext || '').slice(0, 800),
      url: p.permalink ? `https://www.reddit.com${p.permalink}` : p.url,
      upvotes: p.score ?? p.ups ?? 0,
      comments: p.num_comments ?? 0,
      source: 'pullpush',
    })
  );
}

async function fetchViaPlaywright(subreddit, limit, headless) {
  const browser = await launchStealthBrowser(headless);
  const context = await newStealthContext(browser);
  const page = await context.newPage();
  const target = `https://www.reddit.com/r/${subreddit}/new/`;
  const posts = [];

  page.on('response', async (response) => {
    try {
      const u = response.url();
      if (!u.includes('.json') || !u.includes(subreddit)) return;
      const data = await response.json();
      const children = data?.data?.children || [];
      for (const c of children) {
        const p = c.data || {};
        posts.push(
          normalizePost({
            id: p.id,
            subreddit: `r/${subreddit}`,
            title: p.title,
            body: (p.selftext || '').slice(0, 800),
            url: p.permalink ? `https://www.reddit.com${p.permalink}` : p.url,
            upvotes: p.ups ?? p.score ?? 0,
            comments: p.num_comments ?? 0,
            source: 'playwright_json',
          })
        );
      }
    } catch {
      /* ignore */
    }
  });

  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2500);
  await context.close();
  await browser.close();
  return posts.slice(0, limit);
}

async function fetchSubredditPosts(sub, opts) {
  const methods = [
    () => fetchPullPush(sub.name, opts.limit),
    () => fetchRedditJson(sub.name, opts.limit),
    () => fetchViaPlaywright(sub.name, opts.limit, opts.headless),
  ];

  for (const fn of methods) {
    try {
      const posts = await fn();
      if (posts.length) {
        console.log(`   ✓ r/${sub.name}: ${posts.length} posts (${posts[0].source})`);
        return posts.map((p) => ({ ...p, subLabel: sub.label }));
      }
    } catch (err) {
      console.warn(`   ⚠️  r/${sub.name} ${fn.name || 'fetch'}: ${err.message}`);
    }
  }
  console.warn(`   ✗ r/${sub.name}: no posts retrieved`);
  return [];
}

async function scrapeReddit(opts) {
  const all = [];
  const seen = new Set();
  for (const sub of SUBREDDITS) {
    console.log(`🔍 Scanning r/${sub.name} (${sub.label})…`);
    const batch = await fetchSubredditPosts(sub, opts);
    for (const p of batch) {
      const key = p.id || p.url;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      all.push(p);
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  return all;
}

function filterHits(posts, opts) {
  return posts.filter((p) => {
    const blob = `${p.title}\n${p.body}`;
    if (!matchesKeywords(blob)) return false;
    if (p.upvotes < opts.minUpvotes) return false;
    if (p.comments > opts.maxComments) return false;
    return true;
  });
}

function formatMarkdownSection(hits, meta) {
  const now = new Date().toISOString();
  const lines = [
    `## Scan ${now}`,
    '',
    `- Subreddits: ${SUBREDDITS.map((s) => `r/${s.name}`).join(', ')}`,
    `- Posts scanned: ${meta.totalScanned}`,
    `- Hits: ${hits.length}`,
    '',
  ];

  if (!hits.length) {
    lines.push('_No anxiety leads matched filters this run._', '');
    return lines.join('\n');
  }

  hits.forEach((h, i) => {
    lines.push(
      `### ${i + 1}. [${h.subreddit}] ${h.title || '(untitled)'}`,
      '',
      `- **Upvotes:** ${h.upvotes}`,
      `- **Comments:** ${h.comments}`,
      `- **Link:** ${h.url}`,
      `- **Source:** ${h.source}`,
      '',
      h.body ? `> ${excerpt(h.body)}` : '_Link post — open thread for content._',
      '',
      '---',
      ''
    );
  });
  return lines.join('\n');
}

function appendMarkdown(section) {
  const header = '# Reddit 玄学焦虑截流雷达 — Lead Queue\n\n';
  if (!fs.existsSync(OUTPUT_MD)) {
    fs.writeFileSync(OUTPUT_MD, header + section + '\n', 'utf8');
    return;
  }
  fs.appendFileSync(OUTPUT_MD, '\n' + section + '\n', 'utf8');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendAlertEmail(hits) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TEST_EMAIL;
  if (!apiKey || !to) {
    console.warn('⚠️  RESEND_API_KEY or TEST_EMAIL missing — email skipped.');
    return false;
  }

  const from = process.env.RESEND_FROM_EMAIL || 'Guanlan Energy <hello@metaphysicflow.com>';
  const subject = hits.length
    ? EMAIL_SUBJECT
    : '【老板，Reddit雷达前线战报 — 今日0命中，系统正常】';

  const rows = hits.length
    ? hits
        .map(
          (h, i) => `
      <div style="margin-bottom:1.25rem;padding:1rem;border:1px solid rgba(197,152,74,.35);background:#0a1528;">
        <h3 style="color:#C5984A;margin:0 0 .5rem;font-weight:400;">${i + 1}. ${escapeHtml(h.subreddit)} — ${escapeHtml(h.title || '(untitled)')}</h3>
        <p style="margin:.25rem 0;color:#7FA0BA;font-size:.9rem;">⬆️ ${h.upvotes} upvotes · 💬 ${h.comments} comments</p>
        <p style="color:#C8D8E8;line-height:1.6;">${escapeHtml(excerpt(h.body, 400) || 'Link post — open thread.')}</p>
        <p><a href="${h.url}" style="color:#E2C27A;">Open on Reddit →</a></p>
      </div>`
        )
        .join('')
    : `<p style="color:#C8D8E8;line-height:1.7;">今日扫描完成，暂无帖子同时满足：<strong>焦虑关键词 + upvotes ≥ 1 + comments ≤ 2</strong>。雷达正常运行，命中后会立刻发截流提醒。</p>`;

  const html = `
    <div style="max-width:640px;margin:0 auto;font-family:Georgia,serif;background:#060D1A;color:#C8D8E8;padding:2rem;">
      <h1 style="color:#C5984A;font-size:1.4rem;font-weight:300;">${subject}</h1>
      <p>Scanned <strong>${hits.length ? hits.length : '0'}</strong> intercept candidate(s) this run.</p>
      ${rows}
      <p style="font-size:.85rem;color:#7FA0BA;margin-top:1.5rem;">Full log: reddit_radar_tasks.md in repo root.</p>
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend ${res.status}: ${text}`);
  }
  return true;
}

async function sendScanDigestEmail(posts, hits, meta) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TEST_EMAIL;
  if (!apiKey || !to) return false;

  if (hits.length) return sendAlertEmail(hits);

  const from = process.env.RESEND_FROM_EMAIL || 'Guanlan Energy <hello@metaphysicflow.com>';
  const top = [...posts].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);
  const subSummary = SUBREDDITS.map((s) => {
    const n = posts.filter((p) => p.subreddit === `r/${s.name}`).length;
    return `${s.name}: ${n} posts`;
  }).join(' · ');

  const preview = top
    .map(
      (p, i) =>
        `<li style="margin-bottom:.5rem;"><a href="${p.url}" style="color:#E2C27A;">${escapeHtml(excerpt(p.title, 70))}</a> — ⬆️${p.upvotes} 💬${p.comments}</li>`
    )
    .join('');

  const html = `
    <div style="max-width:640px;margin:0 auto;font-family:Georgia,serif;background:#060D1A;color:#C8D8E8;padding:2rem;">
      <h1 style="color:#C5984A;font-size:1.4rem;font-weight:300;">【老板，Reddit雷达前线战报 — 今日0命中，系统正常】</h1>
      <p>扫描 <strong>${meta.totalScanned}</strong> 帖 · 截流命中 <strong>0</strong></p>
      <p style="color:#7FA0BA;font-size:.9rem;">${escapeHtml(subSummary)}</p>
      <p style="margin-top:1rem;">热门帖预览（未达截流阈值）：</p>
      <ul style="line-height:1.6;padding-left:1.2rem;">${preview || '<li>暂无数据</li>'}</ul>
      <p style="font-size:.85rem;color:#7FA0BA;margin-top:1.5rem;">命中后会改发：${EMAIL_SUBJECT}</p>
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: '【老板，Reddit雷达前线战报 — 今日0命中，系统正常】',
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return true;
}

async function main() {
  loadDotEnv(path.join(REPO_ROOT, '.env.local'));
  loadDotEnv(path.join(REPO_ROOT, '.env'));

  const opts = parseArgs();
  const state = loadState();
  const alerted = new Set(state.alertedUrls || []);

  console.log('🔭 Reddit 玄学焦虑截流雷达 starting…');
  const posts = await scrapeReddit(opts);
  console.log(`   Total unique posts: ${posts.length}`);

  const hits = filterHits(posts, opts);
  const newHits = hits.filter((h) => !alerted.has(h.url));

  console.log(`   Matched ${hits.length} posts (${newHits.length} new for email)`);

  const section = formatMarkdownSection(newHits.length ? newHits : hits, {
    totalScanned: posts.length,
  });

  if (!opts.dryRun) {
    appendMarkdown(section);
    console.log(`📝 Appended → ${OUTPUT_MD}`);
  } else {
    console.log('\n--- dry-run preview ---\n');
    console.log(section);
  }

  if (!opts.dryRun) {
    const toEmail = newHits.length ? newHits : hits;
    await sendScanDigestEmail(posts, toEmail, { totalScanned: posts.length });
    if (newHits.length) {
      console.log(`📧 Intercept alert sent to ${process.env.TEST_EMAIL}`);
      newHits.forEach((h) => alerted.add(h.url));
      state.alertedUrls = Array.from(alerted);
      saveState(state);
    } else if (hits.length) {
      console.log('✅ Hits already alerted — sent daily digest only.');
    } else {
      console.log(`📧 Daily digest sent to ${process.env.TEST_EMAIL} (0 intercept hits)`);
    }
  } else if (newHits.length) {
    console.log('📧 dry-run: would email', newHits.length, 'hit(s)');
  } else {
    console.log('✅ No matching hits this run.');
  }
}

main().catch((err) => {
  console.error('❌ reddit_radar failed:', err);
  process.exit(1);
});
