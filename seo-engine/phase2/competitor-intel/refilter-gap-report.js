#!/usr/bin/env node
/**
 * Re-apply gap-filter to an existing gap-report JSON (no re-fetch).
 * Usage: node refilter-gap-report.js [path/to/gap-report-YYYY-MM-DD.json]
 */

const fs = require('fs');
const path = require('path');
const { filterAndRankGaps } = require('../competitor-intel/gap-filter');
const { renderMarkdown, writeGapReport } = require('../competitor-intel/gap-report');

const phase2Dir = path.join(__dirname, '..');
const defaultReport = path.join(
  phase2Dir,
  'output/competitor-intel/gap-report-2026-06-12.json'
);

const inputPath = path.resolve(process.argv[2] || defaultReport);

if (!fs.existsSync(inputPath)) {
  console.error(`❌ Not found: ${inputPath}`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const rawGaps = report.gaps || [];
const filtered = filterAndRankGaps(rawGaps);

report.gaps = filtered;
report.summary = {
  ...report.summary,
  gap_count_raw: rawGaps.length,
  gap_count: filtered.length,
  filtered_out: rawGaps.length - filtered.length,
};
report.refiltered_at = new Date().toISOString();

const { jsonPath, mdPath } = writeGapReport(report);

console.log(`📊 Refiltered gap report`);
console.log(`   Raw gaps: ${rawGaps.length}`);
console.log(`   After filter: ${filtered.length}`);
console.log(`   JSON: ${jsonPath}`);
console.log(`   MD:   ${mdPath}`);
console.log(`\n   Top 10:`);
filtered.slice(0, 10).forEach((g, i) => {
  console.log(`   ${i + 1}. [${g.quality_score}] ${g.phrase.slice(0, 70)}`);
});
