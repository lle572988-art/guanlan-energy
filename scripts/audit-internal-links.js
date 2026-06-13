#!/usr/bin/env node
/**
 * Audit blog posts for internal link density (min 2 internal links).
 * Usage:
 *   node scripts/audit-internal-links.js
 *   node scripts/audit-internal-links.js --fix
 *   node scripts/audit-internal-links.js --suggest
 *   node scripts/audit-internal-links.js --fix --growth-only
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const root = path.join(__dirname, '..');
const blogDir = path.join(root, 'blog');
const fix = process.argv.includes('--fix');
const suggest = process.argv.includes('--suggest');
const growthOnly = process.argv.includes('--growth-only');
const MIN_LINKS = 2;

const GROWTH_POSTS = [
  'chinese-astrology-2026-annual-forecast.html',
  'purple-star-astrology-free-chart-english.html',
  'zi-wei-dou-shu-career-palace.html',
  'zi-wei-dou-shu-life-palace-calculator.html',
  'zi-wei-dou-shu-major-cycle-da-xian.html',
  'zi-wei-dou-shu-wealth-palace-meaning.html',
];

const GROWTH_LINK_SUGGESTIONS = {
  'chinese-astrology-2026-annual-forecast.html': [
    { href: '/blog/zi-wei-dou-shu-major-cycle-da-xian.html', text: 'Major Cycle Da Xian guide', anchor: 'decade luck mechanics' },
    { href: '/blog/zi-wei-dou-shu-career-palace.html', text: 'Career Palace meaning', anchor: 'Career Palace overlays' },
  ],
  'purple-star-astrology-free-chart-english.html': [
    { href: '/blog/zi-wei-dou-shu-life-palace-calculator.html', text: 'Life Palace calculator guide', anchor: 'Life Palace placement' },
    { href: '/blog/how-to-read-zi-wei-dou-shu-chart.html', text: 'how to read your chart', anchor: 'reading your English chart' },
  ],
  'zi-wei-dou-shu-career-palace.html': [
    { href: '/blog/zi-wei-dou-shu-wealth-palace-meaning.html', text: 'Wealth Palace meaning', anchor: 'Wealth Palace pairing' },
    { href: '/blog/zi-wei-dou-shu-major-cycle-da-xian.html', text: 'Major Cycle Da Xian guide', anchor: 'decade transitions' },
  ],
  'zi-wei-dou-shu-life-palace-calculator.html': [
    { href: '/blog/zi-wei-dou-shu-career-palace.html', text: 'Career Palace meaning', anchor: 'Career Palace context' },
    { href: '/free-chart.html', text: 'free Zi Wei Dou Shu calculator', anchor: 'plot your chart' },
  ],
  'zi-wei-dou-shu-major-cycle-da-xian.html': [
    { href: '/blog/chinese-astrology-2026-annual-forecast.html', text: '2026 annual forecast', anchor: 'annual fortune layers' },
    { href: '/blog/zi-wei-dou-shu-wealth-palace-meaning.html', text: 'Wealth Palace meaning', anchor: 'wealth timing windows' },
  ],
  'zi-wei-dou-shu-wealth-palace-meaning.html': [
    { href: '/blog/zi-wei-dou-shu-career-palace.html', text: 'Career Palace meaning', anchor: 'Career Palace synergy' },
    { href: '/blog/zi-wei-dou-shu-life-palace-calculator.html', text: 'Life Palace calculator', anchor: 'Life Palace values' },
  ],
};

const CTA_HTML = `
  <p class="blog-conversion-cta" style="margin-top:2rem;padding:1.25rem;background:rgba(201,169,110,0.06);border:1px solid rgba(201,169,110,0.2);border-radius:4px;">
    <strong>Ready to see your own chart?</strong>
    Generate your free Purple Star board on our
    <a href="/free-chart.html">Zi Wei Dou Shu calculator</a>, then explore
    <a href="/#pricing">professional readings</a> when you want a written report.
  </p>`;

const THIN_H2 = /^(introduction|summary|conclusion|overview)\b/i;

function auditAnchorDiversity(html) {
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

function htmlHasLink(html, href) {
  return html.includes(`href="${href}"`) || html.includes(`href='${href}'`);
}

function injectGrowthLinks(html, file) {
  const suggestions = GROWTH_LINK_SUGGESTIONS[file];
  if (!suggestions) return html;
  let out = html;
  const missing = suggestions.filter((s) => !htmlHasLink(out, s.href));
  if (!missing.length) return out;
  const toInject = missing.slice(0, 2);
  const block = toInject
    .map(
      (s) =>
        `<p class="growth-context-link">For deeper context on ${s.anchor}, see our <a href="${s.href}">${s.text}</a>.</p>`
    )
    .join('\n');
  if (out.includes('class="related"')) {
    out = out.replace(/<p class="related"/, `${block}\n  <p class="related"`);
  } else if (out.includes('</main>')) {
    out = out.replace('</main>', `${block}\n</main>`);
  } else {
    out = out.replace('</body>', `${block}\n</body>`);
  }
  return out;
}

function injectCta(html) {
  if (html.includes('blog-conversion-cta')) return html;
  if (html.includes('</main>')) return html.replace('</main>', `${CTA_HTML}\n</main>`);
  return html.replace('</body>', `${CTA_HTML}\n</body>`);
}

function runSuggest() {
  console.log('🔗 Growth post link opportunities:\n');
  GROWTH_POSTS.forEach((file) => {
    const filePath = path.join(blogDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`   ${file}: file missing`);
      return;
    }
    const html = fs.readFileSync(filePath, 'utf8');
    const suggestions = GROWTH_LINK_SUGGESTIONS[file] || [];
    const missing = suggestions.filter((s) => !htmlHasLink(html, s.href));
    if (!missing.length) {
      console.log(`   ✓ blog/${file} — all suggested links present`);
    } else {
      console.log(`   blog/${file}:`);
      missing.forEach((s) => console.log(`      → ${s.href} (${s.text}) via "${s.anchor}"`));
    }
  });
}

const allFiles = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html')
  .map((f) => path.join(blogDir, f));

const files = growthOnly
  ? GROWTH_POSTS.map((f) => path.join(blogDir, f)).filter((p) => fs.existsSync(p))
  : allFiles;

if (suggest) {
  runSuggest();
  process.exit(0);
}

const flagged = [];
const thinH2Posts = [];
const anchorIssues = [];
let growthFixed = 0;

files.forEach((filePath) => {
  const html = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(root, filePath);
  const file = path.basename(filePath);
  const count = countInternalLinks(html);
  const thinH2 = auditThinH2(html);
  const anchors = auditAnchorDiversity(html);
  if (anchors) anchorIssues.push({ rel, anchors });
  if (thinH2.length) thinH2Posts.push({ rel, headings: thinH2 });

  if (fix && GROWTH_POSTS.includes(file)) {
    const updated = injectGrowthLinks(html, file);
    if (updated !== html) {
      fs.writeFileSync(filePath, updated);
      growthFixed += 1;
    }
  }

  if (count < MIN_LINKS) {
    flagged.push({ rel, count });
    if (fix && !GROWTH_POSTS.includes(file)) fs.writeFileSync(filePath, injectCta(html));
    else if (fix && GROWTH_POSTS.includes(file) && countInternalLinks(fs.readFileSync(filePath, 'utf8')) < MIN_LINKS) {
      fs.writeFileSync(filePath, injectCta(fs.readFileSync(filePath, 'utf8')));
    }
  }
});

console.log(`🔗 Internal link audit — ${files.length} posts (min ${MIN_LINKS} internal links)`);
if (fix && growthFixed) console.log(`✅ Injected contextual links into ${growthFixed} growth posts`);
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
  if (fix) console.log(`\n✅ Injected CTA into flagged posts where applicable`);
}

process.exit(flagged.length && !fix ? 1 : 0);
