#!/usr/bin/env node
/**
 * Update article:modified_time meta and JSON-LD dateModified from git log.
 *
 * Usage:
 *   node scripts/update-dates.js
 *   node scripts/update-dates.js --staged
 *   node scripts/update-dates.js --dry-run
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const blogDir = path.join(rootDir, 'blog');
const dryRun = process.argv.includes('--dry-run');
const stagedOnly = process.argv.includes('--staged');

function gitLastModified(relPath) {
  try {
    const out = execSync(`git log -1 --format="%ai" -- "${relPath}"`, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (!out) {
      if (dryRun) console.log(`NO_GIT_DATE ${relPath}`);
      return new Date().toISOString();
    }
    return new Date(out).toISOString();
  } catch {
    if (dryRun) console.log(`NO_GIT_DATE ${relPath}`);
    return new Date().toISOString();
  }
}

function getStagedBlogFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd: rootDir,
      encoding: 'utf8',
    });
    return out
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('blog/') && line.endsWith('.html') && line !== 'blog/index.html');
  } catch {
    return [];
  }
}

function listBlogFiles() {
  if (stagedOnly) return getStagedBlogFiles();
  return fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith('.html') && f !== 'index.html')
    .map((f) => path.join('blog', f));
}

function upsertModifiedMeta(html, iso) {
  const tag = `<meta property="article:modified_time" content="${iso}">`;
  if (html.includes('property="article:modified_time"')) {
    return html.replace(
      /<meta property="article:modified_time" content="[^"]*">/,
      tag
    );
  }
  const anchor = html.match(/<meta property="og:type"[^>]+>/);
  if (anchor) {
    return html.replace(anchor[0], `${anchor[0]}\n${tag}`);
  }
  const canonical = html.match(/<link rel="canonical"[^>]+>/);
  if (canonical) {
    return html.replace(canonical[0], `${canonical[0]}\n${tag}`);
  }
  return html.replace('</head>', `${tag}\n</head>`);
}

function updateDateModifiedJsonLd(html, dateOnly) {
  return html.replace(/"dateModified"\s*:\s*"[^"]+"/g, `"dateModified": "${dateOnly}"`);
}

function updateFile(relPath) {
  const filePath = path.join(rootDir, relPath);
  if (!fs.existsSync(filePath)) return false;

  const iso = gitLastModified(relPath);
  const dateOnly = iso.split('T')[0];
  const before = fs.readFileSync(filePath, 'utf8');
  let html = before;
  html = upsertModifiedMeta(html, iso);
  html = updateDateModifiedJsonLd(html, dateOnly);

  if (html === before) return false;
  if (!dryRun) fs.writeFileSync(filePath, html);
  return true;
}

const files = listBlogFiles();
let updated = 0;

console.log(`📅 Blog date update${dryRun ? ' (dry-run)' : ''}${stagedOnly ? ' (staged)' : ''}`);

files.forEach((relPath) => {
  if (updateFile(relPath)) {
    updated += 1;
    console.log(`   ✓ ${relPath} → ${gitLastModified(relPath).split('T')[0]}`);
  }
});

console.log(`\n✅ Updated: ${updated} | Processed: ${files.length}`);
