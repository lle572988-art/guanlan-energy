const fs = require('fs');
const path = require('path');
const { loadSeoConfig, ensureOutputDir } = require('../lib/paths');
const { buildSiteInventory, coversTopic, normalize } = require('../lib/keyword-index');
const { fetchText, discoverUrls } = require('../lib/fetch-html');
const { extractPageIntel } = require('./extract-page-intel');

function renderMarkdown(report) {
  const lines = [
    '# Competitor Keyword Gap Report',
    '',
    `Generated: ${report.generated_at}`,
    `Site: ${report.site.domain}`,
    '',
    '## Summary',
    '',
    `- Competitors analyzed: ${report.summary.competitors_analyzed}`,
    `- Competitor pages fetched: ${report.summary.competitor_pages_fetched}`,
    `- Gap opportunities: **${report.summary.gap_count}**`,
    `- Already covered (by our inventory): ${report.summary.covered_count}`,
    '',
    '## Our inventory',
    '',
    `- Matrix + config keywords: ${report.our_inventory.unique_keywords}`,
    `- Sitemap URLs: ${report.our_inventory.sitemap_urls}`,
    '',
    '## Top gap opportunities',
    '',
  ];

  report.gaps.slice(0, 30).forEach((g, i) => {
    lines.push(
      `### ${i + 1}. ${g.phrase}`,
      `- Competitor: **${g.competitor_label}** (${g.competitor_priority})`,
      `- Source URL: ${g.url}`,
      `- Suggested action: ${g.suggested_action}`,
      ''
    );
  });

  if (report.gaps.length === 0) {
    lines.push('_No clear gaps detected in fetched sample — widen `competitor_max_pages` or add seed URLs._', '');
  }

  lines.push('## Per-competitor breakdown', '');
  report.competitors.forEach((c) => {
    lines.push(`### ${c.label} (${c.domain})`);
    lines.push(`- Priority: ${c.priority}`);
    lines.push(`- Pages fetched: ${c.pages_fetched} / ${c.urls_discovered}`);
    lines.push(`- Gaps found: ${c.gap_count}`);
    if (c.fetch_errors.length) {
      lines.push(`- Fetch errors: ${c.fetch_errors.length}`);
    }
    lines.push('');
  });

  lines.push('## Recommended next pages (from config clusters)', '');
  (report.config_pending || []).forEach((p) => {
    lines.push(`- [${p.status}] ${p.keyword}${p.path ? ` → ${p.path}` : ''}`);
  });

  return lines.join('\n');
}

function writeGapReport(report) {
  const outDir = ensureOutputDir('competitor-intel');
  const stamp = report.generated_at.slice(0, 10);
  const jsonPath = path.join(outDir, `gap-report-${stamp}.json`);
  const mdPath = path.join(outDir, `gap-report-${stamp}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(mdPath, renderMarkdown(report));

  return { jsonPath, mdPath };
}

function suggestAction(phrase, competitor) {
  const p = normalize(phrase);
  if (/calculator|chart|free/.test(p)) return 'Add/optimize calculator landing page + FAQ schema';
  if (/vs|compare|difference|bazi/.test(p)) return 'Expand compare content — see /blog/bazi-vs-zi-wei-dou-shu.html';
  if (/2026|forecast|horoscope|year/.test(p)) return 'Build transit/forecast page via seo:transit + generate-transit-pages';
  if (/palace|gong/.test(p)) return 'Matrix page or palace guide — run seo:multiply if star×palace combo missing';
  if (/star|meaning/.test(p)) return 'Star profile blog post or matrix page';
  return `Create static HTML page under pages/ or blog/ targeting "${phrase}"`;
}

function buildGapEntries(competitor, pages, inventory) {
  const gaps = [];
  const covered = [];

  pages.forEach((page) => {
    const primaryPhrase = page.title || page.h1 || page.slug.replace(/-/g, ' ');
    const check = coversTopic(inventory, primaryPhrase);

    const entry = {
      competitor_id: competitor.id,
      competitor_label: competitor.label,
      competitor_priority: competitor.priority,
      url: page.url,
      phrase: primaryPhrase,
      slug: page.slug,
      coverage: check,
    };

    if (check.covered) {
      covered.push(entry);
    } else {
      gaps.push({
        ...entry,
        suggested_action: suggestAction(primaryPhrase, competitor),
      });
    }

    page.h2_sample.forEach((h2) => {
      const h2Check = coversTopic(inventory, h2);
      if (!h2Check.covered && h2.length > 12) {
        gaps.push({
          competitor_id: competitor.id,
          competitor_label: competitor.label,
          competitor_priority: competitor.priority,
          url: page.url,
          phrase: h2,
          slug: page.slug,
          coverage: h2Check,
          suggested_action: suggestAction(h2, competitor),
        });
      }
    });
  });

  const seen = new Set();
  const dedupedGaps = gaps.filter((g) => {
    const key = `${g.competitor_id}:${normalize(g.phrase)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  dedupedGaps.sort((a, b) => {
    const pri = { P0: 0, P1: 1, P2: 2 };
    return (pri[a.competitor_priority] ?? 9) - (pri[b.competitor_priority] ?? 9);
  });

  return { gaps: dedupedGaps, covered };
}

module.exports = { writeGapReport, renderMarkdown, buildGapEntries, suggestAction };
