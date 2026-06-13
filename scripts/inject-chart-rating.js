#!/usr/bin/env node
/**
 * Inject aggregateRating.ratingCount into free-chart.html JSON-LD.
 * Source: KV (2s timeout) → CHART_RATING_COUNT env → data/chart-stats.json → default 127
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const chartHtml = path.join(root, 'free-chart.html');
const sitemapPath = path.join(root, 'sitemap.xml');
const statsFile = path.join(root, 'data', 'chart-stats.json');
const KV_TIMEOUT_MS = 2000;

function envCount() {
  if (process.env.CHART_RATING_COUNT) {
    const n = Number(process.env.CHART_RATING_COUNT);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
  }
  if (fs.existsSync(statsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
      const n = Number(data.count ?? data.chart_generated);
      if (Number.isFinite(n) && n > 0) return Math.floor(n);
    } catch (err) {
      console.warn('[inject-chart-rating] invalid stats file:', err.message);
    }
  }
  return 127;
}

async function readCountFromKv() {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('KV timeout')), KV_TIMEOUT_MS);
  });
  const read = (async () => {
    const { kv } = await import('@vercel/kv');
    const { metadata } = await kv.getWithMetadata('chart_stats');
    const n = Number(metadata?.count);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
    throw new Error('KV count missing');
  })();
  return Promise.race([read, timeout]);
}

async function resolveCount() {
  try {
    const kvCount = await readCountFromKv();
    console.log(`✓ inject-chart-rating: KV count → ${kvCount}`);
    return kvCount;
  } catch (err) {
    const fallback = envCount();
    console.warn(`[inject-chart-rating] KV skipped (${err.message}) — using fallback ${fallback}`);
    return fallback;
  }
}

async function main() {
  const count = await resolveCount();
  let html = fs.readFileSync(chartHtml, 'utf8');
  const re = /("aggregateRating"\s*:\s*\{[\s\S]*?"ratingCount"\s*:\s*")(\d+)(")/;
  if (!re.test(html)) {
    console.error('[inject-chart-rating] aggregateRating.ratingCount not found in free-chart.html');
    process.exit(1);
  }
  html = html.replace(re, `$1${count}$3`);
  fs.writeFileSync(chartHtml, html);

  if (fs.existsSync(sitemapPath)) {
    const lastmod = new Date().toISOString();
    const loc = 'https://metaphysicflow.com/free-chart.html';
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');
    const blockRe = new RegExp(
      `(<url>\\s*<loc>${loc.replace(/\./g, '\\.')}<\\/loc>\\s*<lastmod>)[^<]+(<\\/lastmod>)`,
      'g'
    );
    if (blockRe.test(sitemap)) {
      sitemap = sitemap.replace(blockRe, `$1${lastmod}$2`);
      fs.writeFileSync(sitemapPath, sitemap);
      console.log(`✓ inject-chart-rating: sitemap lastmod → ${lastmod}`);
    }
  }

  console.log(`✓ inject-chart-rating: ratingCount → ${count}`);
}

main().catch((err) => {
  console.error('[inject-chart-rating]', err);
  process.exit(1);
});
