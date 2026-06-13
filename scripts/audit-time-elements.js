#!/usr/bin/env node
/**
 * Blog posts: visible <time datetime="YYYY-MM-DD"> must match datePublished in JSON-LD.
 * Usage:
 *   node scripts/audit-time-elements.js
 *   node scripts/audit-time-elements.js --fix
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const blogDir = path.join(root, 'blog');
const fix = process.argv.includes('--fix');

function readDatePublished(html) {
  const m = html.match(/"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function hasMatchingTime(html, date) {
  const re = new RegExp(`<time\\s+datetime=["']${date}["']`, 'i');
  return re.test(html);
}

function formatHumanDate(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function insertTimeElement(html, date) {
  const timeHtml = `<p class="article-date"><time datetime="${date}">${formatHumanDate(date)}</time></p>`;
  if (/<p class="subtitle"/.test(html)) {
    return html.replace(/(<p class="subtitle"[^>]*>[\s\S]*?<\/p>)/, `$1\n  ${timeHtml}`);
  }
  if (/<h1[^>]*>[\s\S]*?<\/h1>/.test(html)) {
    return html.replace(/(<h1[^>]*>[\s\S]*?<\/h1>)/, `$1\n  ${timeHtml}`);
  }
  return html.replace(/(<main[^>]*>)/, `$1\n  ${timeHtml}`);
}

const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html');

let missing = 0;
let fixed = 0;

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const date = readDatePublished(html);
  if (!date) return;
  if (hasMatchingTime(html, date)) return;

  missing += 1;
  if (fix) {
    html = insertTimeElement(html, date);
    fs.writeFileSync(filePath, html);
    fixed += 1;
  } else {
    console.error(`❌ blog/${file}: missing <time datetime="${date}">`);
  }
});

if (missing && !fix) {
  console.error(`\n❌ audit-time-elements: ${missing} post(s) missing publish <time>`);
  console.error('   Run: node scripts/audit-time-elements.js --fix');
  process.exit(1);
}

console.log(
  fix
    ? `✅ audit-time-elements: fixed ${fixed} post(s)`
    : `✅ audit-time-elements: ${files.length} posts OK`
);
