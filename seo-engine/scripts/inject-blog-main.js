#!/usr/bin/env node
/**
 * Wrap blog article body in <main> for posts missing semantic main landmark.
 *
 * Usage:
 *   node scripts/inject-blog-main.js
 *   node scripts/inject-blog-main.js --dry-run
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../..');
const blogDir = path.join(rootDir, 'blog');
const dryRun = process.argv.includes('--dry-run');

const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html');

let updated = 0;
let skipped = 0;

console.log(`📰 Blog <main> injection${dryRun ? ' (dry-run)' : ''}`);

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  if (/<main[\s>]/i.test(html)) {
    skipped += 1;
    return;
  }

  let next = html;

  // Pattern A: <div class="container"> article wrapper
  if (next.includes('<div class="container">')) {
    next = next.replace('<div class="container">', '<main class="container">');
    if (next.includes('<nav data-seo-related')) {
      next = next.replace(/<\/div>\s*\n\s*<nav data-seo-related/, '</main>\n\n<nav data-seo-related');
    } else {
      next = next.replace(
        /<\/div>\s*\n\s*<script defer src="\/js\/site-contact\.js">/,
        '</main>\n  <script defer src="/js/site-contact.js">'
      );
    }
  } else if (next.includes('<div class="wrap">') && !next.includes('<main')) {
    next = next.replace('<div class="wrap">', '<main class="wrap">');
    if (next.includes('<nav data-seo-related')) {
      next = next.replace(/<\/div>\s*\n\s*<nav data-seo-related/, '</main>\n\n<nav data-seo-related');
    } else {
      next = next.replace(
        /<\/div>\s*\n\s*<script defer src="\/js\/site-contact\.js">/,
        '</main>\n  <script defer src="/js/site-contact.js">'
      );
    }
  } else if (/<article[\s>]/.test(next)) {
    next = next.replace(/<article(\s|>)/, '<main class="article"$1');
    next = next.replace('</article>', '</main>');
  } else if (next.includes('<header class="article-hero">')) {
    // Pattern B: hero + sections without main
    next = next.replace(
      /(<header class="article-hero">[\s\S]*?<\/header>)/,
      '<main class="content-wrapper">\n$1'
    );
    const closeBefore = next.search(/<script defer src="\/js\/site-contact\.js">|<footer|<nav data-seo/);
    if (closeBefore > -1) {
      next = next.slice(0, closeBefore) + '</main>\n' + next.slice(closeBefore);
    }
  } else {
    skipped += 1;
    return;
  }

  if (next === html || !/<main[\s>]/i.test(next)) {
    skipped += 1;
    return;
  }

  if (!dryRun) fs.writeFileSync(filePath, next);
  updated += 1;
  console.log(`   ✓ ${file}`);
});

console.log(`\n✅ Updated: ${updated} | Skipped: ${skipped}`);
