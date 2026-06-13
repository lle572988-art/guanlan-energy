#!/usr/bin/env node
/** Link async /css/blog.css on largest blog posts. Usage: node scripts/link-blog-css.js [--fix] */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const blogDir = path.join(root, 'blog');
const fix = process.argv.includes('--fix');
const LINK = '<link rel="stylesheet" href="/css/blog.css" media="print" onload="this.media=\'all\'">';
const OFFSET = parseInt(process.env.BLOG_CSS_OFFSET || '10', 10);
const LIMIT = parseInt(process.env.BLOG_CSS_LIMIT || '20', 10);

const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html')
  .map((f) => ({
    rel: `blog/${f}`,
    size: fs.statSync(path.join(blogDir, f)).size,
  }))
  .sort((a, b) => b.size - a.size)
  .slice(OFFSET, OFFSET + LIMIT);

let linked = 0;
files.forEach(({ rel }) => {
  const filePath = path.join(root, rel);
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('/css/blog.css')) return;
  if (fix) {
    html = html.replace(/<meta charset="UTF-8">/i, `<meta charset="UTF-8">\n${LINK}`);
    fs.writeFileSync(filePath, html);
    linked += 1;
  }
});

console.log(`📰 blog.css link — top ${files.length} posts by size`);
files.forEach(({ rel, size }) => console.log(`   - ${rel} (${Math.round(size / 1024)}KB)`));
if (fix) console.log(`✅ Added async blog.css link to ${linked} posts`);
else if (linked === 0) console.log('Run with --fix to inject <link> tags');
