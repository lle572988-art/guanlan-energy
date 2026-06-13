#!/usr/bin/env node
/**
 * Remove noindexed blog URLs from sitemap.xml (scans full blog/ directory).
 * Exits 1 if any noindexed blog URL remains in sitemap after cleanup.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sitemapPath = path.join(root, 'sitemap.xml');
const blogDir = path.join(root, 'blog');

function isNoindex(html) {
  const m = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  return m && /noindex/i.test(m[1]);
}

const exclude = new Set();
const blogFiles = fs.readdirSync(blogDir).filter((f) => f.endsWith('.html') && f !== 'index.html');
blogFiles.forEach((f) => {
  const html = fs.readFileSync(path.join(blogDir, f), 'utf8');
  if (isNoindex(html)) exclude.add(`https://metaphysicflow.com/blog/${f}`);
});

let xml = fs.readFileSync(sitemapPath, 'utf8');
let removed = 0;

exclude.forEach((loc) => {
  const re = new RegExp(`\\s*<url>\\s*<loc>${loc.replace(/\./g, '\\.')}<\\/loc>[\\s\\S]*?<\\/url>\\s*`, 'g');
  const before = xml;
  xml = xml.replace(re, '\n');
  if (xml !== before) removed += 1;
});

if (removed) fs.writeFileSync(sitemapPath, xml);

require('./sync-sitemap-blog.js');

const finalXml = fs.readFileSync(sitemapPath, 'utf8');
const stillPresent = [...exclude].filter((loc) => finalXml.includes(`<loc>${loc}</loc>`));

console.log(`🗺️  Sitemap audit — scanned ${blogFiles.length} blog posts, ${exclude.size} noindexed, ${removed} removed`);
if (exclude.size && removed < exclude.size) {
  console.warn(`⚠️  ${exclude.size - removed} noindexed URL(s) were not present in sitemap`);
}
if (stillPresent.length) {
  console.error(`❌ ${stillPresent.length} noindexed blog URL(s) still in sitemap:`);
  stillPresent.forEach((loc) => console.error(`   ${loc}`));
  process.exit(1);
}
console.log('✅ No noindexed blog posts remain in sitemap');
