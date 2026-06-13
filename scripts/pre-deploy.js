#!/usr/bin/env node
/**
 * Pre-deploy gate: schema dates + parallel audits.
 * Usage: node scripts/pre-deploy.js
 */

const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

function run(label, script, args = []) {
  const started = Date.now();
  const result = spawnSync(process.execPath, [path.join(__dirname, script), ...args], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
  const ms = Date.now() - started;
  if (result.status !== 0) {
    console.error(`\n❌ ${label} failed (${ms}ms)`);
    process.exit(result.status || 1);
  }
  console.log(`✓ ${label} (${ms}ms)`);
  return ms;
}

async function runParallel(tasks) {
  const started = Date.now();
  const results = await Promise.all(
    tasks.map(
      ({ label, script, args = [] }) =>
        new Promise((resolve, reject) => {
          const t0 = Date.now();
          const child = spawnSync(process.execPath, [path.join(__dirname, script), ...args], {
            cwd: root,
            stdio: 'pipe',
            encoding: 'utf8',
            env: process.env,
          });
          if (child.stdout) process.stdout.write(child.stdout);
          if (child.stderr) process.stderr.write(child.stderr);
          if (child.status !== 0) {
            reject(new Error(`${label} failed (${Date.now() - t0}ms)`));
            return;
          }
          console.log(`✓ ${label} (${Date.now() - t0}ms)`);
          resolve(Date.now() - t0);
        })
    )
  );
  console.log(`✓ Parallel audits (${Date.now() - started}ms total, ${results.length} scripts)`);
}

(async function main() {
  console.time('prebuild');
  const t0 = Date.now();
  const MAX_MS = 15000;
  console.log('🚀 Pre-deploy checks\n');
  run('apply-thin-post-policy', 'apply-thin-post-policy.js');
  run('update-schema-dates', 'update-schema-dates.js');
  run('audit-sitemap', 'audit-sitemap.js');
  await runParallel([
    { label: 'audit-alt', script: 'audit-alt.js' },
    { label: 'audit-meta', script: 'audit-meta.js' },
    { label: 'audit-internal-links', script: 'audit-internal-links.js' },
    { label: 'audit-breadcrumbs', script: 'audit-breadcrumbs.js', args: ['--skip-url-check'] },
  ]);
  const elapsed = Date.now() - t0;
  console.timeEnd('prebuild');
  if (elapsed > MAX_MS) {
    console.error(`\n❌ Prebuild exceeded ${MAX_MS}ms (${elapsed}ms)`);
    process.exit(1);
  }
  console.log(`\n✅ Pre-deploy passed in ${elapsed}ms`);
})().catch((err) => {
  console.error('\n❌', err.message);
  process.exit(1);
});
