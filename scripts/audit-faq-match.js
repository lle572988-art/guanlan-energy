#!/usr/bin/env node
/**
 * index.html: FAQ summary text must match FAQPage.mainEntity[].name in JSON-LD.
 * Usage: node scripts/audit-faq-match.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const root = path.join(__dirname, '..');
const filePath = path.join(root, 'index.html');
const html = fs.readFileSync(filePath, 'utf8');
const $ = cheerio.load(html);

function normalize(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

const schemaNames = [];
const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
let m;
while ((m = re.exec(html)) !== null) {
  let data;
  try {
    data = JSON.parse(m[1]);
  } catch {
    continue;
  }
  if (data['@type'] === 'FAQPage' && Array.isArray(data.mainEntity)) {
    data.mainEntity.forEach((q) => {
      if (q && q.name) schemaNames.push(normalize(q.name));
    });
  }
}

const summaryTexts = [];
$('#faq summary[itemprop="name"]').each((_, el) => {
  summaryTexts.push(normalize($(el).text()));
});

if (!schemaNames.length) {
  console.error('❌ No FAQPage.mainEntity names found in index.html JSON-LD');
  process.exit(1);
}
if (summaryTexts.length !== schemaNames.length) {
  console.error(
    `❌ FAQ count mismatch: ${summaryTexts.length} visible summaries vs ${schemaNames.length} schema questions`
  );
  process.exit(1);
}

let failed = 0;
schemaNames.forEach((name, i) => {
  const summary = summaryTexts[i];
  if (summary !== name) {
    console.error(`❌ FAQ #${i + 1} mismatch`);
    console.error(`   summary: ${summary}`);
    console.error(`   schema:  ${name}`);
    failed += 1;
  }
});

if (failed) {
  console.error(`\n❌ audit-faq-match: ${failed} mismatch(es)`);
  process.exit(1);
}

console.log(`✅ audit-faq-match: ${schemaNames.length} FAQ pairs OK`);
