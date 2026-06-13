#!/usr/bin/env node
/**
 * Sync sitemap: blog lastmod, priorities, add missing blog URLs.
 * Priority tiers: / → 1.0, free-chart → 0.9, bazi-calculator → 0.8,
 * blog/*.html → 0.6, everything else → 0.3.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sitemapPath = path.join(root, 'sitemap.xml');
const blogDir = path.join(root, 'blog');

function readModified(relPath) {
  const filePath = path.join(root, relPath);
  if (!fs.existsSync(filePath)) return new Date().toISOString();
  const html = fs.readFileSync(filePath, 'utf8');
  const m = html.match(/property="article:modified_time"\s+content="([^"]+)"/);
  if (m) return m[1].includes('T') ? m[1] : `${m[1]}T00:00:00+00:00`;
  const d = html.match(/"dateModified"\s*:\s*"([^"]+)"/);
  if (d) return d[1].includes('T') ? d[1] : `${d[1]}T00:00:00+00:00`;
  return new Date(fs.statSync(filePath).mtime).toISOString();
}

function urlChangefreq(loc) {
  const normalized = loc.replace(/\/$/, '');
  if (normalized === 'https://metaphysicflow.com') return 'weekly';
  if (loc.endsWith('/free-chart.html')) return 'weekly';
  if (/\/blog\/[^/]+\.html$/.test(loc)) return 'monthly';
  return 'monthly';
}

function upsertChangefreq(block, changefreq) {
  if (/<changefreq>/.test(block)) {
    return block.replace(/<changefreq>[^<]+<\/changefreq>/, `<changefreq>${changefreq}</changefreq>`);
  }
  return block.replace('</url>', `    <changefreq>${changefreq}</changefreq>\n  </url>`);
}

function urlPriority(loc) {
  const normalized = loc.replace(/\/$/, '');
  if (normalized === 'https://metaphysicflow.com') return '1.0';
  if (loc.endsWith('/free-chart.html')) return '0.9';
  if (loc.endsWith('/bazi-calculator.html')) return '0.8';
  if (/\/blog\/[^/]+\.html$/.test(loc)) return '0.6';
  return '0.3';
}

function upsertPriority(block, priority) {
  if (/<priority>/.test(block)) {
    return block.replace(/<priority>[^<]+<\/priority>/, `<priority>${priority}</priority>`);
  }
  return block.replace('</url>', `    <priority>${priority}</priority>\n  </url>`);
}

let xml = fs.readFileSync(sitemapPath, 'utf8');

// Normalize lastmod to ISO 8601
xml = xml.replace(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g, '<lastmod>$1T00:00:00+00:00</lastmod>');

const TOOL_PAGES = [
  { rel: 'free-chart.html', priority: '0.9', changefreq: 'weekly' },
  { rel: 'bazi-calculator.html', priority: '0.8', changefreq: 'monthly' },
];

TOOL_PAGES.forEach(({ rel, priority, changefreq }) => {
  const loc = `https://metaphysicflow.com/${rel}`;
  const lastmod = readModified(rel);
  const blockRe = new RegExp(
    `<url>\\s*<loc>${loc.replace(/\./g, '\\.')}<\\/loc>[\\s\\S]*?<\\/url>`,
    'g'
  );
  const match = xml.match(blockRe);
  const entry = `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
  if (match) {
    let block = match[0];
    block = block.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${lastmod}</lastmod>`);
    block = upsertPriority(block, priority);
    xml = xml.replace(match[0], block);
  } else {
    xml = xml.replace('</urlset>', `${entry}</urlset>`);
  }
});

const blogFiles = fs.readdirSync(blogDir).filter((f) => f.endsWith('.html') && f !== 'index.html');
let updated = 0;
let added = 0;

blogFiles.forEach((file) => {
  const rel = `blog/${file}`;
  const loc = `https://metaphysicflow.com/${rel}`;
  const lastmod = readModified(rel);
  const priority = '0.6';

  const blockRe = new RegExp(
    `<url>\\s*<loc>${loc.replace(/\./g, '\\.')}<\\/loc>[\\s\\S]*?<\\/url>`,
    'g'
  );
  const match = xml.match(blockRe);

  if (match) {
    let block = match[0];
    const before = block;
    block = block.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${lastmod}</lastmod>`);
    block = upsertPriority(block, priority);
    if (block !== before) {
      xml = xml.replace(before, block);
      updated += 1;
    }
  } else {
    const entry = `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>
`;
    xml = xml.replace('</urlset>', `${entry}</urlset>`);
    added += 1;
  }
});

// Enforce priority + changefreq tiers on every URL in the sitemap
xml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (full, inner) => {
  const locM = inner.match(/<loc>([^<]+)<\/loc>/);
  if (!locM) return full;
  const loc = locM[1];
  const priority = urlPriority(loc);
  const changefreq = urlChangefreq(loc);
  let block = inner;
  if (/<priority>/.test(block)) {
    block = block.replace(/<priority>[^<]+<\/priority>/, `<priority>${priority}</priority>`);
  } else {
    block = block.trimEnd() + `\n    <priority>${priority}</priority>\n  `;
  }
  block = upsertChangefreq(block, changefreq);
  return `<url>${block}</url>`;
});

fs.writeFileSync(sitemapPath, xml);

const urlCount = (xml.match(/<url>/g) || []).length;
const queryUrls = (xml.match(/<loc>[^<]*\?[^<]*<\/loc>/g) || []).length;
console.log(`✅ Sitemap: ${urlCount} URLs | ${updated} updated | ${added} added | blog posts: ${blogFiles.length}`);
if (queryUrls) {
  console.warn(`⚠️  ${queryUrls} URL(s) contain query strings — review sitemap.xml`);
} else {
  console.log('✓ No query-string URLs in sitemap');
}
