#!/usr/bin/env node
/**
 * Detect duplicate meta descriptions across blog + key pages.
 * Usage: node scripts/audit-meta.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const root = path.join(__dirname, '..');
const blogDir = path.join(root, 'blog');
const keyPages = [
  'index.html',
  'free-chart.html',
  'bazi-calculator.html',
  'consultation.html',
  'thank-you.html',
];

function metaDescription(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);
  const desc = $('meta[name="description"]').attr('content');
  return desc ? desc.trim() : null;
}

const byDesc = new Map();
const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html')
  .map((f) => path.join('blog', f));

keyPages.forEach((rel) => files.push(rel));

files.forEach((rel) => {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) return;
  const desc = metaDescription(filePath);
  if (!desc) {
    console.warn(`⚠️  Missing meta description: ${rel}`);
    return;
  }
  if (!byDesc.has(desc)) byDesc.set(desc, []);
  byDesc.get(desc).push(rel);
});

const collisions = [...byDesc.entries()].filter(([, list]) => list.length > 1);

console.log(`📝 Meta description audit — ${files.length} pages`);
if (collisions.length === 0) {
  console.log('✅ No duplicate meta descriptions');
  process.exit(0);
}

console.log(`❌ ${collisions.length} duplicate description group(s):`);
collisions.forEach(([desc, list]) => {
  console.log(`\n   "${desc.slice(0, 80)}${desc.length > 80 ? '…' : ''}"`);
  list.forEach((f) => console.log(`     - ${f}`));
});
process.exit(1);
