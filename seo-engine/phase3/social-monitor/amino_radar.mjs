#!/usr/bin/env node
/**
 * Amino Apps — 玄学焦虑雷达 (OpenClaw / cron)
 *
 * 抓取 https://aminoapps.com/c/astrology/ 最新帖子，过滤高互动低回复的焦虑帖，
 * 写入 amino_radar_tasks.md，命中时 Resend 邮件提醒老板。
 *
 * Env: RESEND_API_KEY, TEST_EMAIL (required for email)
 *      RESEND_FROM_EMAIL (optional, default hello@metaphysicflow.com)
 *
 * Usage:
 *   node seo-engine/phase3/social-monitor/amino_radar.mjs
 *   node seo-engine/phase3/social-monitor/amino_radar.mjs --dry-run
 *   node seo-engine/phase3/social-monitor/amino_radar.mjs --limit 50 --max-replies 5
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const OUTPUT_MD = path.join(REPO_ROOT, 'amino_radar_tasks.md');
const STATE_FILE = path.join(__dirname, '../output/social-monitor/amino_radar_state.json');

const COMMUNITY_URLS = [
  'https://aminoapps.com/c/astrology/latest',
  'https://aminoapps.com/c/astrology/',
  'https://aminoapps.com/c/astrology/home',
];

const KEYWORDS = [
  'what does my chart mean',
  'rising sign confused',
  'why is my life',
  '2026 forecast',
  'bazi',
  'ziwei',
];

const MIN_LIKES_DEFAULT = 10;
const MAX_REPLIES_DEFAULT = 5;
const POST_LIMIT_DEFAULT = 50;
const EMAIL_SUBJECT = '【老板，有老外在 Amino 焦虑，快去截流！】';

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split('\n')) {
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
  const args = process.argv.slice(2);
  const opts = {
    dryRun: false,
    limit: POST_LIMIT_DEFAULT,
    minLikes: MIN_LIKES_DEFAULT,
    maxReplies: MAX_REPLIES_DEFAULT,
    headless: true,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--headed') opts.headless = false;
    else if (a === '--limit' && args[i + 1]) opts.limit = Number(args[++i]) || opts.limit;
    else if (a === '--min-likes' && args[i + 1]) opts.minLikes = Number(args[++i]) || opts.minLikes;
    else if (a === '--max-replies' && args[i + 1]) opts.maxReplies = Number(args[++i]) || opts.maxReplies;
  }
  return opts;
}

function parseCount(raw) {
  if (raw == null) return 0;
  const s = String(raw).trim().toLowerCase().replace(/,/g, '');
  if (!s) return 0;
  const km = s.match(/^([\d.]+)\s*([km])$/);
  if (km) {
    const n = parseFloat(km[1]);
    if (km[2] === 'k') return Math.round(n * 1000);
    if (km[2] === 'm') return Math.round(n * 1000000);
  }
  const n = parseInt(s.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

function matchesKeywords(text) {
  const hay = String(text || '').toLowerCase();
  return KEYWORDS.some((kw) => hay.includes(kw.toLowerCase()));
}

function excerpt(text, max = 280) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1) + '…';
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

async function extractPostsFromPage(page, limit) {
  return page.evaluate((maxPosts) => {
    const results = [];
    const seen = new Set();

    function pushPost(item) {
      if (!item.url || seen.has(item.url)) return;
      seen.add(item.url);
      results.push(item);
    }

    function findCounts(root) {
      let likes = 0;
      let comments = 0;
      const text = (root.innerText || '').replace(/\s+/g, ' ');
      const likeMatch = text.match(/(\d[\d.,kKmM]*)\s*(likes?|vote|votes|heart|hearts|♥|👍)/i);
      const commentMatch = text.match(/(\d[\d.,kKmM]*)\s*(comments?|replies?|reply|💬)/i);
      if (likeMatch) likes = likeMatch[1];
      if (commentMatch) comments = commentMatch[1];
      return { likes, comments, text };
    }

    const anchors = Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="/blog/"], a[href*="/page/"]'));
    for (const a of anchors) {
      if (results.length >= maxPosts) break;
      let href = a.href || a.getAttribute('href') || '';
      if (!href || href.startsWith('javascript:')) continue;
      if (!href.startsWith('http')) {
        href = new URL(href, location.origin).href;
      }
      const card = a.closest('article, li, [class*="post"], [class*="blog"], [class*="feed"], [class*="card"], div') || a.parentElement;
      const title = (a.textContent || '').trim() || (card && card.querySelector('h1,h2,h3,h4')?.textContent?.trim()) || '';
      const body = card ? (card.innerText || '') : title;
      const counts = card ? findCounts(card) : { likes: 0, comments: 0, text: body };
      pushPost({
        url: href.split('?')[0],
        title: title || body.slice(0, 80),
        body,
        likesRaw: counts.likes,
        commentsRaw: counts.comments,
      });
    }

    if (results.length < maxPosts) {
      document.querySelectorAll('[data-post-id], [data-blog-id], [class*="Blog"]').forEach((el) => {
        if (results.length >= maxPosts) return;
        const link = el.querySelector('a[href]');
        if (!link) return;
        let href = link.href;
        if (!href.startsWith('http')) href = new URL(href, location.origin).href;
        const counts = findCounts(el);
        pushPost({
          url: href.split('?')[0],
          title: (el.querySelector('h1,h2,h3,h4')?.textContent || link.textContent || '').trim(),
          body: el.innerText || '',
          likesRaw: counts.likes,
          commentsRaw: counts.comments,
        });
      });
    }

    return results.slice(0, maxPosts);
  }, limit);
}

async function scrapeAmino(opts) {
  const browser = await chromium.launch({ headless: opts.headless });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
  const page = await context.newPage();
  const apiPosts = [];

  page.on('response', async (response) => {
    try {
      const url = response.url();
      if (!/aminoapps\.com/i.test(url)) return;
      if (!/blog|feed|post|timeline|community/i.test(url)) return;
      const ct = response.headers()['content-type'] || '';
      if (!ct.includes('json')) return;
      const data = await response.json();
      const list =
        data?.blogList ||
        data?.blogs ||
        data?.items ||
        data?.payload?.blogs ||
        data?.payload?.blogList ||
        (Array.isArray(data) ? data : []);
      if (!Array.isArray(list)) return;
      for (const item of list) {
        const blogId = item.blogId || item.uid || item.id;
        const ndcId = item.ndcId || item.extensions?.communityId;
        const link =
          item.shareUrl ||
          item.link ||
          (blogId ? `https://aminoapps.com/p/${blogId}` : '');
        apiPosts.push({
          url: String(link).split('?')[0],
          title: item.title || item.content || '',
          body: [item.title, item.content, item.richContent?.text].filter(Boolean).join('\n'),
          likesRaw: item.votedCount ?? item.likesCount ?? item.likeCount ?? 0,
          commentsRaw: item.commentsCount ?? item.commentCount ?? 0,
          ndcId,
        });
      }
    } catch {
      /* ignore parse errors */
    }
  });

  let loadedUrl = '';
  let pageTitle = '';
  let maintenance = false;

  for (const url of COMMUNITY_URLS) {
    try {
      console.log(`🌐 Opening ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(2500);
      for (let i = 0; i < 6; i++) {
        await page.mouse.wheel(0, 1400);
        await page.waitForTimeout(800);
      }
      pageTitle = await page.title();
      loadedUrl = page.url();
      const bodyText = await page.locator('body').innerText().catch(() => '');
      if (/maintenance|no longer available|under construction|404|not found/i.test(bodyText + pageTitle)) {
        maintenance = true;
        console.warn('⚠️  Amino page looks offline or in maintenance — DOM scrape may be empty.');
      }
      break;
    } catch (err) {
      console.warn(`   ⚠️  Failed ${url}: ${err.message}`);
    }
  }

  const domPosts = await extractPostsFromPage(page, opts.limit);
  await browser.close();

  const merged = new Map();
  for (const p of [...apiPosts, ...domPosts]) {
    if (!p.url) continue;
    merged.set(p.url, p);
  }

  const posts = Array.from(merged.values())
    .slice(0, opts.limit)
    .map((p) => ({
      ...p,
      likes: parseCount(p.likesRaw),
      comments: parseCount(p.commentsRaw),
    }));

  return { posts, loadedUrl, pageTitle, maintenance };
}

function filterHits(posts, opts) {
  return posts.filter((p) => {
    const blob = `${p.title}\n${p.body}`;
    if (!matchesKeywords(blob)) return false;
    if (p.likes <= opts.minLikes) return false;
    if (p.comments > opts.maxReplies) return false;
    return true;
  });
}

function formatMarkdownSection(hits, meta) {
  const now = new Date().toISOString();
  const lines = [
    `## Scan ${now}`,
    '',
    `- Source: ${meta.loadedUrl || 'n/a'}`,
    `- Page title: ${meta.pageTitle || 'n/a'}`,
    `- Posts scanned: ${meta.totalScanned}`,
    `- Hits: ${hits.length}`,
    meta.maintenance ? '- ⚠️ Amino may be in maintenance — verify manually.' : '',
    '',
  ].filter(Boolean);

  if (!hits.length) {
    lines.push('_No new anxiety leads matched filters._', '');
    return lines.join('\n');
  }

  hits.forEach((h, i) => {
    lines.push(
      `### ${i + 1}. ${h.title || '(untitled)'}`,
      '',
      `- **Likes:** ${h.likes}`,
      `- **Comments:** ${h.comments}`,
      `- **Link:** ${h.url}`,
      '',
      `> ${excerpt(h.body)}`,
      '',
      '---',
      ''
    );
  });
  return lines.join('\n');
}

function appendMarkdown(section) {
  const header = '# Amino 玄学焦虑雷达 — Lead Queue\n\n';
  if (!fs.existsSync(OUTPUT_MD)) {
    fs.writeFileSync(OUTPUT_MD, header + section + '\n', 'utf8');
    return;
  }
  fs.appendFileSync(OUTPUT_MD, '\n' + section + '\n', 'utf8');
}

async function sendAlertEmail(hits) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TEST_EMAIL;
  if (!apiKey || !to) {
    console.warn('⚠️  RESEND_API_KEY or TEST_EMAIL missing — email skipped.');
    return false;
  }

  const from = process.env.RESEND_FROM_EMAIL || 'Guanlan Energy <hello@metaphysicflow.com>';
  const rows = hits
    .map(
      (h, i) => `
      <div style="margin-bottom:1.25rem;padding:1rem;border:1px solid rgba(197,152,74,.35);background:#0a1528;">
        <h3 style="color:#C5984A;margin:0 0 .5rem;font-weight:400;">${i + 1}. ${escapeHtml(h.title || '(untitled)')}</h3>
        <p style="margin:.25rem 0;color:#7FA0BA;font-size:.9rem;">👍 ${h.likes} likes · 💬 ${h.comments} comments</p>
        <p style="color:#C8D8E8;line-height:1.6;">${escapeHtml(excerpt(h.body, 400))}</p>
        <p><a href="${h.url}" style="color:#E2C27A;">Open on Amino →</a></p>
      </div>`
    )
    .join('');

  const html = `
    <div style="max-width:640px;margin:0 auto;font-family:Georgia,serif;background:#060D1A;color:#C8D8E8;padding:2rem;">
      <h1 style="color:#C5984A;font-size:1.4rem;font-weight:300;">${EMAIL_SUBJECT}</h1>
      <p>Found <strong>${hits.length}</strong> high-intent Amino thread(s). Go engage before someone else does.</p>
      ${rows}
      <p style="font-size:.85rem;color:#7FA0BA;margin-top:1.5rem;">Full log: amino_radar_tasks.md in repo root.</p>
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
      subject: EMAIL_SUBJECT,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend ${res.status}: ${text}`);
  }
  return true;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function main() {
  loadDotEnv(path.join(REPO_ROOT, '.env.local'));
  loadDotEnv(path.join(REPO_ROOT, '.env'));

  const opts = parseArgs();
  const state = loadState();
  const alerted = new Set(state.alertedUrls || []);

  console.log('🔭 Amino 玄学焦虑雷达 starting…');
  const { posts, loadedUrl, pageTitle, maintenance } = await scrapeAmino(opts);
  console.log(`   Scraped ${posts.length} posts from ${loadedUrl || 'unknown'}`);

  const hits = filterHits(posts, opts);
  const newHits = hits.filter((h) => !alerted.has(h.url));

  console.log(`   Matched ${hits.length} posts (${newHits.length} new)`);

  const section = formatMarkdownSection(newHits.length ? newHits : hits, {
    loadedUrl,
    pageTitle,
    totalScanned: posts.length,
    maintenance,
  });

  if (!opts.dryRun) {
    appendMarkdown(section);
    console.log(`📝 Appended → ${OUTPUT_MD}`);
  } else {
    console.log('\n--- dry-run preview ---\n');
    console.log(section);
  }

  if (newHits.length && !opts.dryRun) {
    await sendAlertEmail(newHits);
    console.log(`📧 Alert email sent to ${process.env.TEST_EMAIL}`);
    newHits.forEach((h) => alerted.add(h.url));
    state.alertedUrls = Array.from(alerted);
    saveState(state);
  } else if (newHits.length && opts.dryRun) {
    console.log('📧 dry-run: would email', newHits.length, 'hit(s)');
  } else {
    console.log('✅ No new hits — no email.');
  }

  if (maintenance && posts.length === 0) {
    console.warn('\n⚠️  Amino Apps 可能已停服或处于 maintenance 页面。脚本仍会跑，但抓不到帖。');
    console.warn('   建议：把 COMMUNITY_URLS 换成仍活跃的替代社区，或改用 Reddit 版 social_monitor.py。');
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error('❌ amino_radar failed:', err);
  process.exit(1);
});
