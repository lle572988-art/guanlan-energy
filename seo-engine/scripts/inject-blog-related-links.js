#!/usr/bin/env node
/**
 * Inject related programmatic-SEO hub links into blog posts.
 * Usage: node scripts/inject-blog-related-links.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../..');
const blogDir = path.join(rootDir, 'blog');
const dryRun = process.argv.includes('--dry-run');
const marker = 'data-seo-related="true"';

const relatedBlock = `
<nav ${marker} aria-label="Related ZWDS guides" style="margin:2.5rem 0 0;padding:1.25rem 0 0;border-top:1px solid rgba(201,169,110,0.15);font-size:0.92rem;line-height:2;">
  <p style="font-family:Georgia,serif;font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;color:rgba(201,169,110,0.55);margin-bottom:0.35rem;">Related guides</p>
  <a href="/pages/transit/2026-lian-zhen-hua-ji-in-career-palace.html" style="color:#C5984A;margin-right:1rem;">2026 Lian Zhen · Career</a>
  <a href="/pages/horoscope/2026-annual-forecast.html" style="color:#C5984A;margin-right:1rem;">2026 forecast hub</a>
  <a href="/pages/feng-shui-partner-every-life-stage-vs-zwds.html" style="color:#C5984A;margin-right:1rem;">Feng Shui vs chart</a>
  <a href="/pages/iching-divination-vs-zi-wei-dou-shu.html" style="color:#C5984A;margin-right:1rem;">I Ching vs ZWDS</a>
  <a href="/free-chart.html" style="color:#C5984A;">Free calculator</a>
</nav>`;

const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html');

let updated = 0;
let skipped = 0;

console.log(`🔗 Blog related-links injection${dryRun ? ' (dry-run)' : ''}`);

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  if (html.includes(marker)) {
    skipped += 1;
    return;
  }

  const anchor = '<script defer src="/js/site-contact.js">';
  if (!html.includes(anchor)) {
    skipped += 1;
    return;
  }

  html = html.replace(anchor, `${relatedBlock}\n  ${anchor}`);
  if (!dryRun) fs.writeFileSync(filePath, html);
  updated += 1;
  console.log(`   ✓ ${file}`);
});

console.log(`\n✅ Updated: ${updated} | Skipped: ${skipped}`);
