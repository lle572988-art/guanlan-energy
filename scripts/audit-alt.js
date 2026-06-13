#!/usr/bin/env node
/**
 * Audit blog images for missing alt; auto-fix from og:title or slug when --fix.
 * Exits 1 if any violations remain after optional fix pass.
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const blogDir = path.join(__dirname, '..', 'blog');
const fix = process.argv.includes('--fix');

function slugToTitle(slug) {
  return slug
    .replace(/\.html$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function fallbackAlt($, file) {
  const og = ($('meta[property="og:title"]').attr('content') || '').trim();
  if (og) return og;
  return slugToTitle(path.basename(file));
}

const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html');

let fixed = 0;
const violations = [];

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });
  let changed = false;
  const altFallback = fallbackAlt($, file);

  $('img').each((i, el) => {
    const alt = ($(el).attr('alt') || '').trim();
    if (alt) return;
    if (fix) {
      $(el).attr('alt', altFallback);
      changed = true;
      fixed += 1;
    } else {
      violations.push({ file: `blog/${file}`, src: $(el).attr('src') || '(no src)', index: i });
    }
  });

  if (changed) fs.writeFileSync(filePath, $.html());
});

if (fix && fixed) console.log(`🔧 audit:alt — auto-fixed ${fixed} image(s)`);

if (violations.length === 0) {
  console.log(`✅ audit:alt — ${files.length} blog files, no missing alt text`);
  process.exit(0);
}

console.error(`❌ audit:alt — ${violations.length} image(s) with missing or empty alt:\n`);
violations.forEach((v) => {
  console.error(`   ${v.file} [img #${v.index}] src=${v.src}`);
});
console.error('\n   Run: node scripts/audit-alt.js --fix');
process.exit(1);
