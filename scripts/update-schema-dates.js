#!/usr/bin/env node
/**
 * Build-time: set blog dateModified, inject wordCount, flag thin posts.
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const root = path.join(__dirname, '..');
const blogDir = path.join(root, 'blog');
const today = new Date().toISOString().split('T')[0];
const dryRun = process.argv.includes('--dry-run');
const MIN_WORDS = 300;

const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html');

let updated = 0;
const thin = [];

function countWords(html) {
  const $ = cheerio.load(html);
  const text = $('article, .article-body, main, .container, .wrap').first().text() || $('body').text();
  return text.split(/\s+/).filter(Boolean).length;
}

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  const before = fs.readFileSync(filePath, 'utf8');
  let html = before;
  const wc = countWords(html);

  if (wc < MIN_WORDS) thin.push({ file, wc });

  html = html.replace(/"dateModified"\s*:\s*"[^"]+"/g, `"dateModified": "${today}"`);
  html = html.replace(
    /<meta property="article:modified_time" content="[^"]*">/g,
    `<meta property="article:modified_time" content="${today}">`
  );

  if (/"wordCount"\s*:/.test(html)) {
    html = html.replace(/"wordCount"\s*:\s*\d+/g, `"wordCount": ${wc}`);
  } else if (html.includes('"dateModified"')) {
    html = html.replace(
      /("dateModified"\s*:\s*"[^"]+")/,
      `$1,\n      "wordCount": ${wc}`
    );
  }

  const relativeMain = html.match(/"mainEntityOfPage"\s*:\s*['"](\/blog\/[^'"]+)['"]/);
  if (relativeMain) {
    html = html.replace(
      relativeMain[0],
      `"mainEntityOfPage": "https://metaphysicflow.com${relativeMain[1]}"`
    );
  }

  if (html !== before) {
    if (!dryRun) fs.writeFileSync(filePath, html);
    updated += 1;
  }
});

console.log(`\n✅ Schema dates${dryRun ? ' (dry-run)' : ''}: ${updated} updated | ${files.length} processed`);
if (thin.length) {
  console.log(`\n⚠️  ${thin.length} posts under ${MIN_WORDS} words (expand before publish):`);
  thin.slice(0, 15).forEach(({ file, wc }) => console.log(`   - blog/${file}: ${wc} words`));
  if (thin.length > 15) console.log(`   … and ${thin.length - 15} more`);
  if (process.argv.includes('--strict')) process.exit(1);
}
