#!/usr/bin/env node
/**
 * Playbook QC — static HTML quality checks for programmatic SEO pages.
 * Usage: node scripts/playbook-qc.js [--dir pages] [--matrix-only]
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const args = process.argv.slice(2);
const targetDir = args.includes('--dir')
  ? path.resolve(rootDir, args[args.indexOf('--dir') + 1])
  : path.join(rootDir, 'pages');
const matrixOnly = args.includes('--matrix-only');

const configPath = path.join(rootDir, 'config/seo_config.json');
const matrixPath = path.join(rootDir, 'seo-engine/data/infinite-matrix.json');
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
const thresholds = config.qc_thresholds || { min_word_count: 300, min_internal_links: 3 };

let matrixSlugs = new Set();
if (fs.existsSync(matrixPath)) {
  const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
  matrix.pages.forEach((p) => matrixSlugs.add(`${p.slug}.html`));
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '';
}

function extractMetaDesc(html) {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return m ? m[1].trim() : '';
}

function countInternalLinks(html) {
  const hrefs = [...html.matchAll(/href="(\/[^"]*?)"/gi)].map((m) => m[1]);
  return new Set(hrefs.filter((h) => !h.startsWith('//'))).size;
}

function hasCalculatorCta(html) {
  return /free-chart\.html|\/calculator/i.test(html);
}

function hasBreadcrumbNav(html) {
  const hasNavHome = /<nav[\s\S]*?href="\/"/i.test(html);
  const hasBreadcrumbLd = /"@type"\s*:\s*"BreadcrumbList"/i.test(html);
  return hasNavHome || hasBreadcrumbLd;
}

function hasFaqJsonLd(html) {
  return /"@type"\s*:\s*"FAQPage"/i.test(html);
}

function checkHeadingHierarchy(html) {
  const issues = [];
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  if (h1Count !== 1) issues.push(`h1_count=${h1Count}`);
  if (h2Count < 1) issues.push('missing_h2');
  const bodyMatch = html.match(/<body[\s\S]*<\/body>/i);
  if (bodyMatch) {
    const body = bodyMatch[0];
    const firstH1 = body.search(/<h1/i);
    const firstH2 = body.search(/<h2/i);
    if (firstH1 >= 0 && firstH2 >= 0 && firstH2 < firstH1) issues.push('h2_before_h1');
  }
  return issues;
}

function auditFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const base = path.basename(filePath);
  const bodyText = stripHtml(html);
  const wordCount = countWords(bodyText);
  const internalLinks = countInternalLinks(html);
  const headingIssues = checkHeadingHierarchy(html);

  const checks = {
    unique_title: true,
    unique_description: true,
    word_count: wordCount >= thresholds.min_word_count,
    internal_links: internalLinks >= thresholds.min_internal_links,
    calculator_cta: hasCalculatorCta(html),
    breadcrumb: hasBreadcrumbNav(html),
    faq_jsonld: hasFaqJsonLd(html),
    heading_hierarchy: headingIssues.length === 0,
  };

  const failures = [];
  if (!checks.word_count) failures.push(`words=${wordCount}<${thresholds.min_word_count}`);
  if (!checks.internal_links) failures.push(`links=${internalLinks}<${thresholds.min_internal_links}`);
  if (!checks.calculator_cta) failures.push('no_calculator_cta');
  if (!checks.breadcrumb) failures.push('no_breadcrumb');
  if (!checks.faq_jsonld) failures.push('no_faq_jsonld');
  if (!checks.heading_hierarchy) failures.push(...headingIssues);

  return {
    file: base,
    title: extractTitle(html),
    description: extractMetaDesc(html),
    wordCount,
    internalLinks,
    checks,
    failures,
    pass: failures.length === 0,
  };
}

if (!fs.existsSync(targetDir)) {
  console.error(`❌ Directory not found: ${targetDir}`);
  process.exit(1);
}

let files = fs.readdirSync(targetDir).filter((f) => f.endsWith('.html'));
if (matrixOnly) {
  files = files.filter((f) => matrixSlugs.has(f));
} else if (matrixSlugs.size > 0) {
  files = files.filter((f) => matrixSlugs.has(f));
}

const results = files.map((f) => auditFile(path.join(targetDir, f)));

const titleMap = {};
const descMap = {};
results.forEach((r) => {
  titleMap[r.title] = (titleMap[r.title] || 0) + 1;
  descMap[r.description] = (descMap[r.description] || 0) + 1;
});

results.forEach((r) => {
  if (titleMap[r.title] > 1) {
    r.failures.push('duplicate_title');
    r.pass = false;
  }
  if (descMap[r.description] > 1) {
    r.failures.push('duplicate_description');
    r.pass = false;
  }
});

const passed = results.filter((r) => r.pass);
const failed = results.filter((r) => !r.pass);

const issueCounts = {};
failed.forEach((r) => {
  r.failures.forEach((f) => {
    issueCounts[f] = (issueCounts[f] || 0) + 1;
  });
});

console.log('\n========================================');
console.log('  Playbook QC Report');
console.log('========================================');
console.log(`Directory: ${targetDir}`);
console.log(`Pages scanned: ${results.length}`);
console.log(`✅ Pass: ${passed.length}`);
console.log(`❌ Fail: ${failed.length}`);
console.log(`Pass rate: ${results.length ? ((passed.length / results.length) * 100).toFixed(1) : 0}%`);

if (Object.keys(issueCounts).length) {
  console.log('\nTop issues:');
  Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([issue, count]) => console.log(`  ${issue}: ${count}`));
}

if (failed.length) {
  console.log('\nSample failures (first 5):');
  failed.slice(0, 5).forEach((r) => {
    console.log(`  ${r.file}: ${r.failures.join(', ')}`);
  });
}

console.log('========================================\n');

process.exit(failed.length > 0 ? 1 : 0);
