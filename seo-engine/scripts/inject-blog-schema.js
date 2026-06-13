#!/usr/bin/env node
/**
 * Inject Article + Breadcrumb JSON-LD into blog/*.html posts missing schema.
 *
 * Usage:
 *   node scripts/inject-blog-schema.js
 *   node scripts/inject-blog-schema.js --dry-run
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../..');
const blogDir = path.join(rootDir, 'blog');
const { DEFAULT_SITE, getBreadcrumbSchema } = require('../../lib/structured-data.js');

const SITE = DEFAULT_SITE;
const dryRun = process.argv.includes('--dry-run');

function decodeHtml(s) {
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function extractMeta(html, fileName) {
  const slug = fileName.replace(/\.html$/, '');
  const pageUrl = `${SITE.domain}/blog/${fileName}`;

  const titleMatch =
    html.match(/<meta property="og:title" content="([^"]+)"/) ||
    html.match(/<title>([^<|]+)/);
  const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
  const dateMatch = html.match(/<div class="date">([^<]+)</);
  const h1Match = html.match(/<h1[^>]*>([^<]+)</);

  const title = decodeHtml((titleMatch && titleMatch[1].trim()) || (h1Match && h1Match[1].trim()) || slug);
  const description = decodeHtml((descMatch && descMatch[1].trim()) || title);
  const datePublished = dateMatch ? dateMatch[1].trim() : new Date().toISOString().split('T')[0];

  return { slug, pageUrl, title, description, datePublished };
}

function buildBlogSchema(meta) {
  const breadcrumb = getBreadcrumbSchema(
    [
      { name: 'Home', url: '/' },
      { name: 'Blog', url: '/blog/index.html' },
      { name: meta.title.length > 80 ? `${meta.title.slice(0, 77)}…` : meta.title, url: `/blog/${meta.slug}.html` },
    ],
    SITE
  );

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${meta.pageUrl}#article`,
        headline: meta.title,
        description: meta.description,
        url: meta.pageUrl,
      datePublished: meta.datePublished,
      dateModified: new Date().toISOString().split('T')[0],
        inLanguage: 'en-US',
        author: { '@type': 'Organization', name: SITE.author || SITE.brand_name },
        publisher: {
          '@type': 'Organization',
          name: SITE.brand_name,
          url: SITE.domain,
          logo: { '@type': 'ImageObject', url: `${SITE.domain}${SITE.logo}` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': meta.pageUrl },
        image: `${SITE.domain}/images/calligraphy.jpg`,
      },
      breadcrumb,
    ],
  };
}

function hasJsonLd(html) {
  return /type=["']application\/ld\+json["']/i.test(html);
}

function injectSchema(html, schema) {
  const tag = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>\n`;
  if (html.includes('</head>')) {
    return html.replace('</head>', `${tag}</head>`);
  }
  return tag + html;
}

const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html');

let updated = 0;
let skipped = 0;

console.log(`📝 Blog schema injection${dryRun ? ' (dry-run)' : ''}`);

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  if (hasJsonLd(html)) {
    skipped += 1;
    return;
  }

  const meta = extractMeta(html, file);
  const schema = buildBlogSchema(meta);
  const next = injectSchema(html, schema);

  if (!dryRun) {
    fs.writeFileSync(filePath, next);
  }
  updated += 1;
  console.log(`   ✓ ${file}`);
});

console.log(`\n✅ Updated: ${updated} | Skipped (already has schema): ${skipped}`);

module.exports = { buildBlogSchema, extractMeta };
