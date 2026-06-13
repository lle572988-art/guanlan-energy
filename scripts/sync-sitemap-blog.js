#!/usr/bin/env node
/**
 * Sync sitemap: blog lastmod, priorities, add missing blog URLs.
 * Priority tiers: hub/index → 1.0, calculator → 0.9, growth posts → 0.8,
 * default blog → 0.6, thin/longtail → 0.5, everything else → 0.3.
 */

const GROWTH_POSTS = new Set([
  'chinese-astrology-2026-annual-forecast.html',
  'purple-star-astrology-free-chart-english.html',
  'zi-wei-dou-shu-career-palace.html',
  'zi-wei-dou-shu-life-palace-calculator.html',
  'zi-wei-dou-shu-major-cycle-da-xian.html',
  'zi-wei-dou-shu-wealth-palace-meaning.html',
]);

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

function readOgImage(relPath) {
  const filePath = path.join(root, relPath);
  if (!fs.existsSync(filePath)) return null;
  const html = fs.readFileSync(filePath, 'utf8');
  const m = html.match(/property="og:image"\s+content="([^"]+)"/);
  return m ? m[1].trim() : null;
}

function isNoindex(relPath) {
  const filePath = path.join(root, relPath);
  if (!fs.existsSync(filePath)) return false;
  const html = fs.readFileSync(filePath, 'utf8');
  const m = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  return m && /noindex/i.test(m[1]);
}

function upsertImageBlock(block, imageUrl) {
  if (!imageUrl) {
    return block.replace(/\s*<image:image>[\s\S]*?<\/image:image>\s*/g, '\n');
  }
  const imageXml = `    <image:image>
      <image:loc>${imageUrl}</image:loc>
    </image:image>`;
  if (/<image:image>/.test(block)) {
    return block.replace(/<image:image>[\s\S]*?<\/image:image>/, imageXml.trim());
  }
  return block.replace('</url>', `${imageXml}\n  </url>`);
}

function urlChangefreq(loc) {
  const normalized = loc.replace(/\/$/, '');
  if (normalized === 'https://metaphysicflow.com') return 'daily';
  if (loc.endsWith('/free-chart.html')) return 'weekly';
  if (loc.endsWith('/consultation.html')) return 'weekly';
  if (/\/blog\/[^/]+\.html$/.test(loc)) return 'monthly';
  return 'monthly';
}

function upsertChangefreq(block, changefreq) {
  if (/<changefreq>/.test(block)) {
    return block.replace(/<changefreq>[^<]+<\/changefreq>/, `<changefreq>${changefreq}</changefreq>`);
  }
  return block.replace('</url>', `    <changefreq>${changefreq}</changefreq>\n  </url>`);
}

function blogFileFromLoc(loc) {
  const m = loc.match(/\/blog\/([^/]+\.html)$/);
  return m ? m[1] : null;
}

function urlPriority(loc) {
  const normalized = loc.replace(/\/$/, '');
  if (normalized === 'https://metaphysicflow.com') return '1.0';
  if (normalized === 'https://metaphysicflow.com/blog' || loc.endsWith('/blog/index.html')) return '1.0';
  if (loc.endsWith('/free-chart.html')) return '1.0';
  if (loc.endsWith('/consultation.html')) return '0.9';
  if (loc.endsWith('/bazi-calculator.html')) return '0.8';
  const blogFile = blogFileFromLoc(loc);
  if (blogFile) {
    if (GROWTH_POSTS.has(blogFile)) return '0.8';
    if (/^seo-/.test(blogFile)) return '0.5';
    return '0.6';
  }
  if (/\/longtail\//.test(loc) || /\/longtail_pages\//.test(loc)) return '0.5';
  return '0.3';
}

function upsertPriority(block, priority) {
  if (/<priority>/.test(block)) {
    return block.replace(/<priority>[^<]+<\/priority>/, `<priority>${priority}</priority>`);
  }
  return block.replace('</url>', `    <priority>${priority}</priority>\n  </url>`);
}

let xml = fs.readFileSync(sitemapPath, 'utf8');
if (!xml.includes('xmlns:image=')) {
  xml = xml.replace(
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
  );
}

// Normalize lastmod to ISO 8601
xml = xml.replace(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g, '<lastmod>$1T00:00:00+00:00</lastmod>');

const TOOL_PAGES = [
  { rel: 'free-chart.html', priority: '1.0', changefreq: 'weekly' },
  { rel: 'consultation.html', priority: '0.9', changefreq: 'weekly' },
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
  if (isNoindex(rel)) return;
  const loc = `https://metaphysicflow.com/${rel}`;
  const lastmod = readModified(rel);
  const priority = GROWTH_POSTS.has(file) ? '0.8' : (/^seo-/.test(file) ? '0.5' : '0.6');

  const blockRe = new RegExp(
    `<url>\\s*<loc>${loc.replace(/\./g, '\\.')}<\\/loc>[\\s\\S]*?<\\/url>`,
    'g'
  );
  const match = xml.match(blockRe);

  const ogImage = readOgImage(rel);

  if (match) {
    let block = match[0];
    const before = block;
    block = block.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${lastmod}</lastmod>`);
    block = upsertPriority(block, priority);
    block = upsertImageBlock(block, ogImage);
    if (block !== before) {
      xml = xml.replace(before, block);
      updated += 1;
    }
  } else {
    let entry = `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>`;
    if (ogImage) {
      entry += `
    <image:image>
      <image:loc>${ogImage}</image:loc>
    </image:image>`;
    }
    entry += `
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

// Purge any noindexed blog URLs that may remain from older sitemap entries
blogFiles.forEach((file) => {
  const rel = `blog/${file}`;
  if (!isNoindex(rel)) return;
  const loc = `https://metaphysicflow.com/${rel}`;
  const re = new RegExp(`\\s*<url>\\s*<loc>${loc.replace(/\./g, '\\.')}<\\/loc>[\\s\\S]*?<\\/url>\\s*`, 'g');
  xml = xml.replace(re, '\n');
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
