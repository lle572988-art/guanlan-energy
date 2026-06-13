#!/usr/bin/env node
/**
 * Audit JSON-LD on live URLs or local HTML files.
 * Adapted from Phase 3 schema_engine.py for static HTML (not Next.js).
 *
 * Usage:
 *   node audit-schema.js --url https://metaphysicflow.com/free-chart.html
 *   node audit-schema.js --sample
 *   node audit-schema.js --dir ../../pages --limit 20
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { repoRoot, ensureOutputDir } = require('../lib/paths');

const SITE = 'https://metaphysicflow.com';

const RECOMMENDED = {
  calculator: ['WebApplication', 'SoftwareApplication', 'FAQPage'],
  article: ['Article', 'FAQPage', 'BreadcrumbList'],
  blog: ['Article'],
  horoscope: ['Article', 'FAQPage', 'BreadcrumbList'],
  compare: ['Article', 'FAQPage', 'BreadcrumbList'],
};

const SAMPLE_URLS = [
  { url: `${SITE}/free-chart.html`, profile: 'calculator' },
  { url: `${SITE}/faq.html`, profile: 'article' },
  { url: `${SITE}/pages/empower-destiny-bazi-vs-zi-wei-dou-shu.html`, profile: 'compare' },
  { url: `${SITE}/pages/horoscope/2026-dragon-forecast.html`, profile: 'horoscope' },
  { url: `${SITE}/blog/the-psychology-of-minimalist-spaces.html`, profile: 'blog' },
];

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'MetaphysicFlow-SchemaAudit/1.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchHtml(res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href)
            .then(resolve)
            .catch(reject);
          return;
        }
        let body = '';
        res.on('data', (c) => { body += c; });
        res.on('end', () => resolve(body));
      })
      .on('error', reject);
  });
}

function extractSchemaTypes(html) {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const types = [];
  const graphs = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1].trim());
      graphs.push(data);
      if (data['@graph']) {
        data['@graph'].forEach((node) => {
          if (node['@type']) types.push(node['@type']);
        });
      } else if (Array.isArray(data)) {
        data.forEach((node) => {
          if (node['@type']) types.push(node['@type']);
        });
      } else if (data['@type']) {
        types.push(data['@type']);
      }
    } catch {
      types.push('parse_error');
    }
  }
  return { types: [...new Set(types)], graphs, count: types.length };
}

function auditHtml(html, meta = {}) {
  const { types, count } = extractSchemaTypes(html);
  const profile = meta.profile || 'article';
  const recommended = RECOMMENDED[profile] || RECOMMENDED.article;
  const missing = recommended.filter((t) => !types.includes(t));
  const present = recommended.filter((t) => types.includes(t));
  const score = recommended.length ? Math.round((present.length / recommended.length) * 100) : 100;

  return {
    ...meta,
    schemas_found: types,
    schemas_recommended: recommended,
    schemas_missing: missing,
    script_blocks: count,
    score_pct: score,
    status: missing.length === 0 ? 'complete' : 'gaps',
  };
}

function auditFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(repoRoot, filePath);
  let profile = 'article';
  if (rel.includes('free-chart')) profile = 'calculator';
  else if (rel.includes('horoscope')) profile = 'horoscope';
  else if (rel.includes('empower-destiny') || rel.includes('vs-')) profile = 'compare';
  else if (rel.startsWith('blog/')) profile = 'blog';
  return auditHtml(html, { file: rel, profile });
}

async function auditUrl(url, profile) {
  const html = await fetchHtml(url);
  return auditHtml(html, { url, profile });
}

async function main() {
  const args = process.argv.slice(2);
  const outDir = ensureOutputDir('schema-audit');
  const today = new Date().toISOString().split('T')[0];
  let results = [];

  if (args.includes('--url')) {
    const i = args.indexOf('--url');
    const url = args[i + 1];
    const profile = args.includes('--profile') ? args[args.indexOf('--profile') + 1] : 'article';
    results = [await auditUrl(url, profile)];
  } else if (args.includes('--sample')) {
    for (const s of SAMPLE_URLS) {
      process.stderr.write(`Auditing ${s.url}...\n`);
      results.push(await auditUrl(s.url, s.profile));
    }
  } else if (args.includes('--dir')) {
    const i = args.indexOf('--dir');
    const dir = path.resolve(repoRoot, args[i + 1] || 'pages');
    const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : 50;
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.html'))
      .slice(0, limit)
      .map((f) => path.join(dir, f));
    results = files.map(auditFile);
  } else {
    console.log('Usage: node audit-schema.js --sample | --url <url> [--profile compare] | --dir pages [--limit 20]');
    process.exit(1);
  }

  const outPath = path.join(outDir, `audit-${today}.json`);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

  console.log(`\n📋 Schema audit → ${outPath}\n`);
  results.forEach((r) => {
    const label = r.url || r.file;
    console.log(`${r.status === 'complete' ? '✅' : '⚠️ '} ${label}`);
    console.log(`   found: ${r.schemas_found.join(', ') || '(none)'}`);
    if (r.schemas_missing.length) {
      console.log(`   missing: ${r.schemas_missing.join(', ')}`);
    }
    console.log(`   score: ${r.score_pct}%\n`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
