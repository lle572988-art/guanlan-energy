#!/usr/bin/env node
/**
 * Star/palace hub pages must include WebPage + BreadcrumbList (Home → Blog → Hub).
 * Usage: node scripts/audit-hub-schema.js
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const blogDir = path.join(root, 'blog');

const HUB_PATTERNS = [
  /zi-wei-dou-shu-.*-star-meaning\.html$/,
  /palace/i,
  /12-palaces-zi-wei-dou-shu-explained\.html$/,
  /what-is-my-life-palace-in-zi-wei-dou-shu\.html$/,
];

function isHub(file) {
  return HUB_PATTERNS.some((re) => re.test(file));
}

function hasWebPage(html) {
  return /"@type"\s*:\s*"WebPage"/.test(html);
}

function hasBlogBreadcrumb(html) {
  return /"@type"\s*:\s*"BreadcrumbList"[\s\S]*?"name"\s*:\s*"Blog"/.test(html);
}

const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.html') && f !== 'index.html' && isHub(f));

let failed = 0;
files.forEach((file) => {
  const html = fs.readFileSync(path.join(blogDir, file), 'utf8');
  if (!hasWebPage(html)) {
    console.error(`❌ blog/${file}: missing WebPage JSON-LD`);
    failed += 1;
  }
  if (!hasBlogBreadcrumb(html)) {
    console.error(`❌ blog/${file}: missing BreadcrumbList with Blog label`);
    failed += 1;
  }
});

if (failed) {
  console.error(`\n❌ audit-hub-schema: ${failed} issue(s) across ${files.length} hub page(s)`);
  process.exit(1);
}

console.log(`✅ audit-hub-schema: ${files.length} hub page(s) OK`);
