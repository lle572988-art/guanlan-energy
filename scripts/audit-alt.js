#!/usr/bin/env node
/**
 * Audit blog images for missing or empty alt attributes.
 * Exits 1 if any violations found.
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const blogDir = path.join(__dirname, '..', 'blog');
const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html');

const violations = [];

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);

  $('img').each((i, el) => {
    const alt = $(el).attr('alt');
    if (!alt || alt.trim() === '') {
      const src = $(el).attr('src') || '(no src)';
      violations.push({ file: `blog/${file}`, src, index: i });
    }
  });
});

if (violations.length === 0) {
  console.log(`✅ audit:alt — ${files.length} blog files, no missing alt text`);
  process.exit(0);
}

console.error(`❌ audit:alt — ${violations.length} image(s) with missing or empty alt:\n`);
violations.forEach((v) => {
  console.error(`   ${v.file} [img #${v.index}] src=${v.src}`);
});
process.exit(1);
