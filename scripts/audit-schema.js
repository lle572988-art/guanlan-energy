#!/usr/bin/env node
/**
 * Audit blog Article JSON-LD for E-E-A-T author entity.
 * Usage:
 *   node scripts/audit-schema.js
 *   node scripts/audit-schema.js --fix
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const blogDir = path.join(root, 'blog');
const fix = process.argv.includes('--fix');

const AUTHOR_SNIPPET =
  '"author": {\n        "@type": "Person",\n        "name": "The Purple Star Reader",\n        "url": "https://metaphysicflow.com/#about"\n      }';

const AUTHOR_RE =
  /"author"\s*:\s*\{\s*"@type"\s*:\s*"Person"\s*,\s*"name"\s*:\s*"The Purple Star Reader"\s*,\s*"url"\s*:\s*"https:\/\/metaphysicflow\.com\/#about"\s*\}/;

function hasAuthor(html) {
  return AUTHOR_RE.test(html);
}

function injectAuthor(html) {
  if (hasAuthor(html)) return html;

  if (/"author"\s*:\s*\{/.test(html)) {
    return html.replace(
      /"author"\s*:\s*\{[^}]+\}/,
      '"author": { "@type": "Person", "name": "The Purple Star Reader", "url": "https://metaphysicflow.com/#about" }'
    );
  }

  return html.replace(
    /("inLanguage"\s*:\s*"[^"]+",?\s*)/,
    `$1\n        ${AUTHOR_SNIPPET.replace(/\n/g, '\n        ')},`
  );
}

const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html')
  .map((f) => path.join('blog', f));

const missing = [];

files.forEach((rel) => {
  const filePath = path.join(root, rel);
  const html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('application/ld+json')) {
    missing.push({ rel, reason: 'no JSON-LD' });
    return;
  }
  if (!hasAuthor(html)) {
    missing.push({ rel, reason: 'author mismatch' });
    if (fix) {
      fs.writeFileSync(filePath, injectAuthor(html));
    }
  }
});

console.log(`📋 Schema author audit — ${files.length} posts`);
if (missing.length === 0) {
  console.log('✅ All posts have Person author: The Purple Star Reader');
} else {
  console.log(`⚠️  ${missing.length} posts flagged:`);
  missing.forEach(({ rel, reason }) => console.log(`   - ${rel} (${reason})`));
  if (fix) console.log(`\n✅ Fixed ${missing.length} posts`);
}

process.exit(missing.length && !fix ? 1 : 0);
