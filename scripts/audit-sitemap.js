#!/usr/bin/env node
/**
 * Remove noindexed blog URLs from sitemap.xml.
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
fs.readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html')
  .forEach((f) => {
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

console.log(`🗺️  Sitemap audit — ${exclude.size} noindexed blog URL(s), ${removed} removed from sitemap`);
if (exclude.size && removed < exclude.size) {
  console.warn(`⚠️  ${exclude.size - removed} noindexed URL(s) were not present in sitemap`);
}
