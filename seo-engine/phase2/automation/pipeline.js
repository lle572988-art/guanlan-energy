#!/usr/bin/env node
/**
 * Phase 2 content production orchestrator — static HTML stack.
 * Chains: matrix → generate → widget → silo → sitemap (reuses seo-engine v4 scripts).
 *
 * Usage:
 *   npm run phase2:pipeline
 *   npm run phase2:pipeline -- --dry-run
 *   npm run phase2:pipeline -- --only multiply,generate,sitemap
 *   npm run phase2:pipeline -- --skip parasite
 *   npm run phase2:pipeline -- --with qc,competitor-intel
 *   npm run phase2:full   (pipeline + QC + competitor intel)
 */

const { spawnSync } = require('child_process');
const path = require('path');
const {
  PRODUCTION_STEPS,
  OPTIONAL_STEPS,
  parseStepList,
  seoEngineRoot,
} = require('./steps');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyIdx = args.indexOf('--only');
const skipIdx = args.indexOf('--skip');
const withIdx = args.indexOf('--with');

const onlyList = onlyIdx >= 0 ? parseStepList(args[onlyIdx + 1], PRODUCTION_STEPS) : null;
const skipSet = new Set(
  skipIdx >= 0 ? parseStepList(args[skipIdx + 1], PRODUCTION_STEPS) : []
);
const withOptional = withIdx >= 0 ? parseStepList(args[withIdx + 1], OPTIONAL_STEPS) : [];

function runGenerate() {
  const node = process.execPath;
  const steps = [
    {
      label: 'generate matrix pages',
      cmd: node,
      args: ['scripts/generate-pages.js'],
      env: { ...process.env, SEO_DATA: '../data/infinite-matrix.json' },
    },
    {
      label: 'generate transit pages',
      cmd: node,
      args: ['scripts/generate-transit-pages.js'],
      env: process.env,
    },
    {
      label: 'generate horoscope pages',
      cmd: node,
      args: ['scripts/generate-horoscope-pages.js'],
      env: process.env,
    },
  ];
  for (const s of steps) {
    if (dryRun) {
      console.log(`  [dry-run] ${s.label}`);
      continue;
    }
    const r = spawnSync(s.cmd, s.args, {
      cwd: seoEngineRoot,
      env: s.env,
      stdio: 'inherit',
    });
    if (r.status !== 0) return r.status || 1;
  }
  return 0;
}

function runSitemap() {
  const node = process.execPath;
  const steps = [
    { SEO_DATA: '../data/infinite-matrix.json', label: 'sitemap matrix' },
    { SEO_DATA: '../data/transit-matrix.json', label: 'sitemap transit' },
    { SEO_DATA: '../data/horoscope-matrix.json', label: 'sitemap horoscope' },
  ];
  for (const s of steps) {
    if (dryRun) {
      console.log(`  [dry-run] ${s.label}`);
      continue;
    }
    const r = spawnSync(node, ['scripts/update-sitemap-links.js'], {
      cwd: seoEngineRoot,
      env: { ...process.env, SEO_DATA: s.SEO_DATA },
      stdio: 'inherit',
    });
    if (r.status !== 0) return r.status || 1;
  }
  return 0;
}

function missingEnv(keys) {
  return (keys || []).filter((k) => !process.env[k]);
}

function runStep(step) {
  console.log(`\n▶ ${step.id}: ${step.label}`);

  if (step.requiresEnv) {
    const missing = missingEnv(step.requiresEnv);
    if (missing.length) {
      console.warn(`   ⚠ Skipped — missing env: ${missing.join(', ')}`);
      return 0;
    }
  }

  if (dryRun) {
    if (step.fn === 'generate-pages') console.log('   [dry-run] generate matrix + transit HTML');
    else if (step.fn === 'sitemap') console.log('   [dry-run] merge sitemap (matrix + transit)');
    else console.log(`   [dry-run] node ${step.script}`);
    return 0;
  }

  if (step.fn === 'generate-pages') return runGenerate();
  if (step.fn === 'sitemap') return runSitemap();

  const scriptPath = path.isAbsolute(step.script)
    ? step.script
    : path.join(step.cwd, step.script);

  const result = spawnSync(
    process.execPath,
    [scriptPath, ...(step.args || [])],
    { cwd: step.cwd, env: process.env, stdio: 'inherit' }
  );
  return result.status || 0;
}

function main() {
  let steps = PRODUCTION_STEPS.filter((s) => !skipSet.has(s.id));
  if (onlyList) {
    steps = onlyList
      .map((id) => PRODUCTION_STEPS.find((s) => s.id === id))
      .filter(Boolean);
  }

  const optional = withOptional
    .map((id) => OPTIONAL_STEPS.find((s) => s.id === id))
    .filter(Boolean);

  const pipeline = [...steps, ...optional];

  console.log('========================================');
  console.log('  MetaphysicFlow Phase 2 Pipeline');
  console.log('  Stack: static HTML (no Next.js)');
  console.log('========================================');
  console.log(`Steps: ${pipeline.map((s) => s.id).join(' → ')}`);
  if (dryRun) console.log('Mode: DRY RUN');

  const started = Date.now();
  for (const step of pipeline) {
    const code = runStep(step);
    if (code !== 0) {
      console.error(`\n❌ Pipeline failed at step "${step.id}" (exit ${code})`);
      process.exit(code);
    }
  }

  const sec = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\n✅ Pipeline complete (${sec}s)`);
  if (!dryRun) {
    console.log('Next: node ../../scripts/playbook-qc.js --matrix-only');
    console.log('      bash ../../seo-submit.sh  (IndexNow + manual GSC)');
  }
}

main();
