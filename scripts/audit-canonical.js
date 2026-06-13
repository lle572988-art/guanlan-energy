#!/usr/bin/env node
/**
 * Audit canonical, hreflang, and og:url alignment on key pages + all blog posts.
 * Usage:
 *   node scripts/audit-canonical.js
 *   node scripts/audit-canonical.js --fix
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const root = path.join(__dirname, '..');
const blogDir = path.join(root, 'blog');
const DOMAIN = 'https://metaphysicflow.com';
const fix = process.argv.includes('--fix');

const KEY_PAGES = [
  { rel: 'index.html', url: `${DOMAIN}/`, needsHreflang: true },
  { rel: 'free-chart.html', url: `${DOMAIN}/free-chart.html` },
  { rel: 'consultation.html', url: `${DOMAIN}/consultation.html` },
  { rel: 'bazi-calculator.html', url: `${DOMAIN}/bazi-calculator.html`, needsHreflang: true },
];

function blogPages() {
  return fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith('.html') && f !== 'index.html')
    .map((f) => ({
      rel: `blog/${f}`,
      url: `${DOMAIN}/blog/${f}`,
      needsHreflang: true,
    }));
}

const PAGES = [...KEY_PAGES, ...blogPages()];

const violations = [];

function isNoindex(html) {
  const m = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  return m && /noindex/i.test(m[1]);
}

function upsertMeta(html, pattern, replacement, insertAfter) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace(insertAfter, `${insertAfter}\n${replacement}`);
}

function fixPage({ rel, url, needsHreflang }, html) {
  let out = html;
  const canonicalTag = `<link rel="canonical" href="${url}">`;
  const ogUrlTag = `<meta property="og:url" content="${url}">`;
  const hreflangEn = `<link rel="alternate" hreflang="en" href="${url}">`;
  const hreflangDefault = `<link rel="alternate" hreflang="x-default" href="${url}">`;

  if (/<link rel="canonical"/i.test(out)) {
    out = out.replace(/<link rel="canonical"[^>]*>/i, canonicalTag);
  } else {
    out = out.replace(/<meta charset="UTF-8"\s*\/?>/i, (m) => `${m}\n${canonicalTag}`);
  }

  if (/property="og:url"/i.test(out)) {
    out = out.replace(/<meta property="og:url"[^>]*>/i, ogUrlTag);
  } else if (/property="og:type"/i.test(out)) {
    out = out.replace(/<meta property="og:type"[^>]*>/i, (m) => `${ogUrlTag}\n${m}`);
  } else {
    out = out.replace(canonicalTag, `${canonicalTag}\n${ogUrlTag}\n<meta property="og:type" content="article">`);
  }

  if (needsHreflang) {
    if (/hreflang="en"/i.test(out)) {
      out = out.replace(/<link rel="alternate" hreflang="en"[^>]*>/i, hreflangEn);
    } else {
      out = out.replace(canonicalTag, `${canonicalTag}\n${hreflangEn}`);
    }
    if (/hreflang="x-default"/i.test(out)) {
      out = out.replace(/<link rel="alternate" hreflang="x-default"[^>]*>/i, hreflangDefault);
    } else {
      out = out.replace(hreflangEn, `${hreflangEn}\n${hreflangDefault}`);
    }
  }

  if (isNoindex(out)) {
    if (/name=["']robots["']/i.test(out)) {
      out = out.replace(/<meta name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex, follow">');
    } else {
      out = out.replace(/<meta charset="UTF-8"\s*\/?>/i, (m) => `${m}\n<meta name="robots" content="noindex, follow">`);
    }
  }

  return out;
}

function auditPage(page) {
  const { rel, url, needsHreflang } = page;
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) {
    violations.push({ rel, issue: 'file missing' });
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  if (fix) {
    const fixed = fixPage(page, html);
    if (fixed !== html) {
      fs.writeFileSync(filePath, fixed);
      html = fixed;
    }
  }

  const $ = cheerio.load(html);

  const canonical = ($('link[rel="canonical"]').attr('href') || '').trim();
  const ogUrl = ($('meta[property="og:url"]').attr('content') || '').trim();

  if (!canonical) {
    violations.push({ rel, issue: 'missing canonical' });
  } else if (canonical !== url) {
    violations.push({ rel, issue: `canonical mismatch: ${canonical} (expected ${url})` });
  }

  if (!ogUrl) {
    violations.push({ rel, issue: 'missing og:url' });
  } else if (ogUrl !== url) {
    violations.push({ rel, issue: `og:url mismatch: ${ogUrl} (expected ${url})` });
  }

  if (needsHreflang) {
    const hreflangEn = ($('link[rel="alternate"][hreflang="en"]').attr('href') || '').trim();
    const hreflangDefault = ($('link[rel="alternate"][hreflang="x-default"]').attr('href') || '').trim();
    if (!hreflangEn) violations.push({ rel, issue: 'missing hreflang=en' });
    else if (hreflangEn !== url) violations.push({ rel, issue: `hreflang=en mismatch: ${hreflangEn}` });
    if (!hreflangDefault) violations.push({ rel, issue: 'missing hreflang=x-default' });
    else if (hreflangDefault !== url) violations.push({ rel, issue: `hreflang=x-default mismatch: ${hreflangDefault}` });
  }

  if (isNoindex(html)) {
    const robots = ($('meta[name="robots"]').attr('content') || '').trim();
    if (!/noindex,\s*follow/i.test(robots)) {
      violations.push({ rel, issue: `noindex post needs "noindex, follow" (got: ${robots || 'missing'})` });
    }
  }
}

PAGES.forEach(auditPage);

if (violations.length === 0) {
  console.log(`✅ audit:canonical — ${PAGES.length} pages OK${fix ? ' (fix applied where needed)' : ''}`);
  process.exit(0);
}

console.error(`❌ audit:canonical — ${violations.length} issue(s):\n`);
violations.slice(0, 30).forEach((v) => console.error(`   ${v.rel}: ${v.issue}`));
if (violations.length > 30) console.error(`   … and ${violations.length - 30} more`);
process.exit(1);
