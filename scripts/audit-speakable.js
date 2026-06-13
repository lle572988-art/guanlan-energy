#!/usr/bin/env node
/**
 * Verify speakable cssSelector values in JSON-LD resolve to DOM nodes.
 * Usage: node scripts/audit-speakable.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const root = path.join(__dirname, '..');
const PAGES = ['index.html', 'free-chart.html'];

function extractSpeakableSelectors(html) {
  const selectors = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    let data;
    try {
      data = JSON.parse(m[1]);
    } catch {
      continue;
    }
    const nodes = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data];
    nodes.forEach((node) => {
      if (!node || typeof node !== 'object') return;
      const speakable = node.speakable;
      if (!speakable) return;
      const css = speakable.cssSelector;
      if (Array.isArray(css)) selectors.push(...css);
      else if (typeof css === 'string') selectors.push(css);
    });
    if (data.speakable) {
      const css = data.speakable.cssSelector;
      if (Array.isArray(css)) selectors.push(...css);
      else if (typeof css === 'string') selectors.push(css);
    }
  }
  return [...new Set(selectors)];
}

let failed = 0;

PAGES.forEach((rel) => {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing ${rel}`);
    failed += 1;
    return;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);
  const selectors = extractSpeakableSelectors(html);
  if (!selectors.length) {
    console.warn(`⚠️  ${rel}: no speakable cssSelector in JSON-LD`);
    return;
  }
  selectors.forEach((sel) => {
    if (!$(sel).length) {
      console.error(`❌ ${rel}: speakable selector not found — ${sel}`);
      failed += 1;
    }
  });
  if (failed === 0) console.log(`✓ ${rel}: ${selectors.length} speakable selector(s) OK`);
});

if (failed) {
  console.error(`\n❌ audit-speakable: ${failed} failure(s)`);
  process.exit(1);
}
console.log('\n✅ audit-speakable passed');
