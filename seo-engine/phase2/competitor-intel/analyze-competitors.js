#!/usr/bin/env node
/**
 * Competitor keyword reverse-engineering + gap analysis.
 * Reads competitors from config/seo_config.json → outputs JSON + MD in phase2/output/.
 *
 * Usage:
 *   npm run phase2:competitor-intel
 *   npm run phase2:competitor-intel -- --dry-run
 *   npm run phase2:competitor-intel -- --competitor zwds-calculator
 *   npm run phase2:competitor-intel -- --max-pages 20
 */

const { loadSeoConfig, ensureOutputDir } = require('../lib/paths');
const { buildSiteInventory } = require('../lib/keyword-index');
const { fetchText, discoverUrls } = require('../lib/fetch-html');
const { extractPageIntel } = require('./extract-page-intel');
const { writeGapReport, buildGapEntries } = require('./gap-report');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const filterIdx = args.indexOf('--competitor');
const filterId = filterIdx >= 0 ? args[filterIdx + 1] : null;
const maxIdx = args.indexOf('--max-pages');
const maxPagesOverride = maxIdx >= 0 ? parseInt(args[maxIdx + 1], 10) : null;

async function analyzeCompetitor(competitor, options) {
  const { maxPages, timeoutMs } = options;
  console.log(`\n🔍 ${competitor.label} (${competitor.domain})`);

  const urls = await discoverUrls(competitor.domain, {
    seedUrls: competitor.seed_urls || ['/'],
    maxPages,
    timeoutMs,
  });
  console.log(`   URLs discovered: ${urls.length}`);

  if (dryRun) {
    return {
      ...competitor,
      urls_discovered: urls.length,
      pages_fetched: 0,
      pages: [],
      fetch_errors: [],
      gap_count: 0,
      dry_run_urls: urls.slice(0, 10),
    };
  }

  const pages = [];
  const fetchErrors = [];

  for (const url of urls) {
    process.stdout.write(`   fetch ${url.slice(0, 70)}… `);
    const res = await fetchText(url, { timeoutMs });
    if (!res.ok || !res.body) {
      console.log('❌');
      fetchErrors.push({ url, status: res.status, error: res.error });
      continue;
    }
    const intel = extractPageIntel(url, res.body);
    pages.push(intel);
    console.log('✓');
    await new Promise((r) => setTimeout(r, 400));
  }

  return {
    ...competitor,
    urls_discovered: urls.length,
    pages_fetched: pages.length,
    pages,
    fetch_errors: fetchErrors,
  };
}

async function main() {
  const config = loadSeoConfig();
  const phase2 = config.phase2 || {};
  const maxPages = maxPagesOverride || phase2.competitor_max_pages || 40;
  const timeoutMs = phase2.competitor_fetch_timeout_ms || 12000;

  let competitors = config.competitors || [];
  if (filterId) {
    competitors = competitors.filter((c) => c.id === filterId);
    if (!competitors.length) {
      console.error(`❌ No competitor with id "${filterId}" in seo_config.json`);
      process.exit(1);
    }
  }

  if (!competitors.length) {
    console.error('❌ No competitors[] in config/seo_config.json');
    process.exit(1);
  }

  ensureOutputDir('competitor-intel');
  const inventory = buildSiteInventory();
  console.log('\n📊 Site inventory loaded');
  console.log(`   Keywords indexed: ${inventory.stats.unique_keywords}`);
  console.log(`   Sitemap URLs: ${inventory.stats.sitemap_urls}`);

  const competitorResults = [];
  let allGaps = [];
  let allCovered = 0;

  for (const comp of competitors) {
    const result = await analyzeCompetitor(comp, { maxPages, timeoutMs });
    if (dryRun) {
      competitorResults.push(result);
      continue;
    }

    const { gaps, covered } = buildGapEntries(comp, result.pages, inventory);
    allGaps = allGaps.concat(gaps);
    allCovered += covered.length;

    competitorResults.push({
      id: comp.id,
      label: comp.label,
      domain: comp.domain,
      priority: comp.priority,
      urls_discovered: result.urls_discovered,
      pages_fetched: result.pages_fetched,
      gap_count: gaps.length,
      fetch_errors: result.fetch_errors,
      top_gaps: gaps.slice(0, 5).map((g) => ({ phrase: g.phrase, url: g.url })),
    });
  }

  const report = {
    generated_at: new Date().toISOString(),
    site: config.site,
    dry_run: dryRun,
    our_inventory: inventory.stats,
    summary: {
      competitors_analyzed: competitors.length,
      competitor_pages_fetched: competitorResults.reduce((n, c) => n + (c.pages_fetched || 0), 0),
      gap_count: allGaps.length,
      covered_count: allCovered,
    },
    config_pending: (config.priority_pages || []).filter((p) => p.status === 'pending'),
    competitors: competitorResults,
    gaps: allGaps,
  };

  const { jsonPath, mdPath } = writeGapReport(report);
  console.log('\n✅ Gap report written');
  console.log(`   ${jsonPath}`);
  console.log(`   ${mdPath}`);
  console.log(`   Gaps: ${report.summary.gap_count}`);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
