#!/usr/bin/env node
/**
 * Audit blog posts for internal link density (min 2 internal links).
 * Usage:
 *   node scripts/audit-internal-links.js
 *   node scripts/audit-internal-links.js --fix
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const root = path.join(__dirname, '..');
const blogDir = path.join(root, 'blog');
const fix = process.argv.includes('--fix');
const MIN_LINKS = 2;

const CTA_HTML = `
  <p class="blog-conversion-cta" style="margin-top:2rem;padding:1.25rem;background:rgba(201,169,110,0.06);border:1px solid rgba(201,169,110,0.2);border-radius:4px;">
    <strong>Ready to see your own chart?</strong>
    Generate your free Purple Star board on our
    <a href="/free-chart.html">Zi Wei Dou Shu calculator</a>, then explore
    <a href="/#pricing">professional readings</a> when you want a written report.
  </p>`;

const THIN_H2 = /^(introduction|summary|conclusion|overview)\b/i;

function auditAnchorDiversity(html, rel) {
  const $ = cheerio.load(html);
  const anchors = [];
  $('a[href]').each(function () {
    const href = ($(this).attr('href') || '').trim();
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
    if (href.startsWith('/') || !href.includes('://')) {
      anchors.push(($(this).text() || href).trim().toLowerCase());
    }
  });
  if (anchors.length < 2) return null;
  const unique = new Set(anchors);
  if (unique.size < 2 && anchors.length >= 2) return anchors;
  return null;
}

function auditThinH2(html) {
  const $ = cheerio.load(html);
  const warnings = [];
  $('h2').each(function () {
    const text = $(this).text().trim();
    if (THIN_H2.test(text)) warnings.push(text);
  });
  return warnings;
}

function countInternalLinks(html) {
  const $ = cheerio.load(html);
  let count = 0;
  $('a[href]').each(function () {
    const href = ($(this).attr('href') || '').trim();
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
    if (href.startsWith('/') || !href.includes('://')) count += 1;
  });
  return count;
}

function injectCta(html) {
  if (html.includes('blog-conversion-cta')) return html;
  if (html.includes('</main>')) return html.replace('</main>', `${CTA_HTML}\n</main>`);
  return html.replace('</body>', `${CTA_HTML}\n</body>`);
}

const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html')
  .map((f) => path.join(blogDir, f));

const flagged = [];
const thinH2Posts = [];
const anchorIssues = [];

files.forEach((filePath) => {
  const html = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(root, filePath);
  const count = countInternalLinks(html);
  const thinH2 = auditThinH2(html, rel);
  const anchors = auditAnchorDiversity(html, rel);
  if (anchors) anchorIssues.push({ rel, anchors });
  if (thinH2.length) thinH2Posts.push({ rel, headings: thinH2 });
  if (count < MIN_LINKS) {
    flagged.push({ rel: path.relative(root, filePath), count });
    if (fix) fs.writeFileSync(filePath, injectCta(html));
  }
});

console.log(`🔗 Internal link audit — ${files.length} posts (min ${MIN_LINKS} internal links)`);
if (thinH2Posts.length) {
  console.log(`\n⚠️  ${thinH2Posts.length} posts with thin H2 headings:`);
  thinH2Posts.slice(0, 10).forEach(({ rel, headings }) => {
    console.log(`   - ${rel}: ${headings.join(' | ')}`);
  });
}
if (anchorIssues.length) {
  console.log(`\n⚠️  ${anchorIssues.length} posts with duplicate internal anchor text:`);
  anchorIssues.slice(0, 10).forEach(({ rel, anchors }) => {
    console.log(`   - ${rel}: ${anchors.join(' | ')}`);
  });
}
if (flagged.length === 0) {
  console.log('✅ All posts meet internal link minimum');
} else {
  console.log(`❌ ${flagged.length} posts below minimum:`);
  flagged.forEach(({ rel, count }) => console.log(`   - ${rel} (${count} links)`));
  if (fix) console.log(`\n✅ Injected CTA into ${flagged.length} posts`);
}

process.exit(flagged.length && !fix ? 1 : 0);
