/**
 * Calibrate zwds-core against iztro for known dates.
 * Usage: node scripts/calibrate-zwds.mjs
 */
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { astro } from 'iztro';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');
const require = createRequire(import.meta.url);

const lunar = require(join(root, 'lunar.js'));
global.Solar = lunar.Solar;
global.window = global;
eval(readFileSync(join(root, 'zwds-core.js'), 'utf8'));

const CASES = [
  { y: 2018, m: 8, d: 9, h: 5, label: '2018-08-09 巳时' },
  { y: 2016, m: 6, d: 15, h: 5, label: '2016-06-15 巳时' },
  { y: 1983, m: 10, d: 21, h: 7, label: '1983-10-21 未时 (anchor)' },
];

let failed = 0;

for (const c of CASES) {
  const ref = astro.bySolar(`${c.y}-${c.m}-${c.d}`, c.h, '男', true, 'zh-CN');
  const ours = global.zwdsCore.calculateChart(c.y, c.m, c.d, c.h, 'M');
  const refSoul = ref.palaces.find((p) => p.name === '命宫' || p.name === '命宮');
  const refZiWei = ref.palaces.find((p) => p.majorStars.some((s) => s.name === '紫微'));
  const refStars = (refSoul?.majorStars || []).map((s) => s.name).join(',') || '-';
  const ourStars = (ours.palaces[0]?.majorStars || []).join(',') || '-';

  const checks = [
    ['五行局', ref.fiveElementsClass.replace('局', ''), ours.bureau.replace('局', '')],
    ['命宫支', ref.earthlyBranchOfSoulPalace, ours.lifeStemBranch.slice(-1)],
    ['紫微支', refZiWei?.earthlyBranch, ours.ziWeiBranch],
    ['命宫主星', refStars, ourStars],
  ];

  const normStar = (s) =>
    String(s)
      .replace(/机/g, '機')
      .replace(/阴/g, '陰')
      .replace(/阳/g, '陽')
      .replace(/禄/g, '祿')
      .replace(/权/g, '權')
      .replace(/杀/g, '殺')
      .replace(/破军/g, '破軍');

  console.log(`\n=== ${c.label} ===`);
  for (const [name, expected, actual] of checks) {
    const norm = (s) => String(s).replace(/[二三四五六]/g, (d) => ({ 二: 2, 三: 3, 四: 4, 五: 5, 六: 6 }[d] || d));
    const ok =
      name === '命宫主星'
        ? normStar(expected) === normStar(actual)
        : norm(expected) === norm(actual) || expected === actual;
    if (!ok) failed++;
    console.log(`${ok ? 'OK' : 'FAIL'} ${name}: ref=${expected} ours=${actual}`);
  }
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nAll calibration checks passed.');
