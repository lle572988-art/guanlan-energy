/**
 * Content production pipeline steps — maps Phase 2 spec to existing seo-engine scripts.
 * All paths relative to seo-engine/ root unless noted.
 */

const path = require('path');

const seoEngineRoot = path.join(__dirname, '../..');
const repoRoot = path.join(seoEngineRoot, '..');

/** @type {import('./pipeline').PipelineStep[]} */
const PRODUCTION_STEPS = [
  {
    id: 'multiply',
    label: 'Build star×palace keyword matrix',
    script: 'scripts/build-infinite-matrix.js',
    cwd: seoEngineRoot,
    env: {},
  },
  {
    id: 'horoscope',
    label: 'Build 2026 zodiac horoscope matrix',
    script: 'scripts/build-horoscope-matrix.js',
    cwd: seoEngineRoot,
    env: {},
  },
  {
    id: 'transit',
    label: 'Build transit/forecast matrix',
    script: 'scripts/build-transit-matrix.js',
    cwd: seoEngineRoot,
    env: {},
  },
  {
    id: 'generate',
    label: 'Generate static HTML pages (matrix + transit)',
    fn: 'generate-pages',
    cwd: seoEngineRoot,
  },
  {
    id: 'inject',
    label: 'Inject conversion widget into pages/',
    script: path.join(repoRoot, 'scripts/inject-conversion-widget.js'),
    cwd: repoRoot,
  },
  {
    id: 'silo',
    label: 'Wire silo internal links',
    script: 'scripts/silo-link-architect.js',
    cwd: seoEngineRoot,
  },
  {
    id: 'parasite',
    label: 'Spin parasite-ready markdown snippets',
    script: 'scripts/parasite-content-spinner.js',
    cwd: seoEngineRoot,
  },
  {
    id: 'sitemap',
    label: 'Merge matrix + transit URLs into sitemap.xml',
    fn: 'sitemap',
    cwd: seoEngineRoot,
  },
];

/** Optional post-production QA / distribution */
const OPTIONAL_STEPS = [
  {
    id: 'qc',
    label: 'Playbook QC on matrix pages',
    script: path.join(repoRoot, 'scripts/playbook-qc.js'),
    cwd: repoRoot,
    args: ['--matrix-only'],
  },
  {
    id: 'competitor-intel',
    label: 'Competitor gap analysis',
    script: path.join(seoEngineRoot, 'phase2/competitor-intel/analyze-competitors.js'),
    cwd: seoEngineRoot,
  },
  {
    id: 'force-index',
    label: 'Google Indexing API push (transit URLs)',
    script: 'scripts/force-google-index.js',
    cwd: seoEngineRoot,
    requiresEnv: ['GOOGLE_APPLICATION_CREDENTIALS'],
  },
];

function getStep(id) {
  return [...PRODUCTION_STEPS, ...OPTIONAL_STEPS].find((s) => s.id === id);
}

function parseStepList(arg, allSteps) {
  if (!arg) return allSteps.map((s) => s.id);
  return arg.split(',').map((s) => s.trim()).filter(Boolean);
}

module.exports = {
  PRODUCTION_STEPS,
  OPTIONAL_STEPS,
  getStep,
  parseStepList,
  seoEngineRoot,
  repoRoot,
};
