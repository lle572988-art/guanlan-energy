#!/usr/bin/env node
/**
 * Inject or refresh Article + Breadcrumb JSON-LD on blog/*.html posts.
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
const today = new Date().toISOString().split('T')[0];

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
  const datePublished = dateMatch ? dateMatch[1].trim() : today;

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
        dateModified: today,
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

function schemaTag(schema) {
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>\n`;
}

function upsertSchema(html, schema) {
  const tag = schemaTag(schema);
  if (hasJsonLd(html)) {
    return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/i, tag);
  }
  if (html.includes('</head>')) {
    return html.replace('</head>', `${tag}</head>`);
  }
  return tag + html;
}

const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html');

let inserted = 0;
let refreshed = 0;

console.log(`📝 Blog schema injection${dryRun ? ' (dry-run)' : ''} · dateModified=${today}`);

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  const html = fs.readFileSync(filePath, 'utf8');
  const hadSchema = hasJsonLd(html);
  const meta = extractMeta(html, file);
  const next = upsertSchema(html, buildBlogSchema(meta));

  if (!dryRun) {
    fs.writeFileSync(filePath, next);
  }

  if (hadSchema) {
    refreshed += 1;
    console.log(`   ↻ ${file}`);
  } else {
    inserted += 1;
    console.log(`   ✓ ${file}`);
  }
});

console.log(`\n✅ Inserted: ${inserted} | Refreshed dateModified: ${refreshed} | Total: ${files.length}`);

module.exports = { buildBlogSchema, extractMeta, upsertSchema };
