#!/usr/bin/env node
/**
 * Sync blog <lastmod> in sitemap.xml from article:modified_time meta.
 * Removes noindex pages (free-chart.html) from sitemap.
 *
 * Usage: node scripts/sync-sitemap-blog.js
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sitemapPath = path.join(root, 'sitemap.xml');
const blogDir = path.join(root, 'blog');

function readModified(relPath) {
  const html = fs.readFileSync(path.join(root, relPath), 'utf8');
  const m = html.match(/property="article:modified_time"\s+content="([^"]+)"/);
  if (m) return m[1].split('T')[0];
  const d = html.match(/"dateModified"\s*:\s*"([^"]+)"/);
  if (d) return d[1].split('T')[0];
  return null;
}

let xml = fs.readFileSync(sitemapPath, 'utf8');

xml = xml.replace(/\s*<url>\s*<loc>https:\/\/metaphysicflow\.com\/free-chart\.html<\/loc>[\s\S]*?<\/url>\s*/g, '\n');

const blogFiles = fs.readdirSync(blogDir).filter((f) => f.endsWith('.html') && f !== 'index.html');
let updated = 0;

blogFiles.forEach((file) => {
  const rel = `blog/${file}`;
  const loc = `https://metaphysicflow.com/${rel}`;
  const lastmod = readModified(rel);
  if (!lastmod) return;

  const blockRe = new RegExp(
    `(<url>\\s*<loc>${loc.replace(/\./g, '\\.')}<\\/loc>\\s*<lastmod>)([^<]+)(<\\/lastmod>)`,
    'g'
  );
  if (blockRe.test(xml)) {
    xml = xml.replace(blockRe, `$1${lastmod}$3`);
    updated += 1;
  }
});

fs.writeFileSync(sitemapPath, xml);
console.log(`✅ Sitemap synced: ${updated} blog lastmod values updated; free-chart.html removed if present`);
