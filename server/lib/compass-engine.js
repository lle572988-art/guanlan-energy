/**
 * Ba Zhai + Xuan Kong engines for server-side report generation.
 */
import { Solar } from 'lunar-javascript';

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const FLY_ORDER = ['center', 'NW', 'W', 'NE', 'S', 'N', 'SW', 'E', 'SE'];
const GRID_LAYOUT = [
  ['NW', 'N', 'NE'],
  ['W', 'center', 'E'],
  ['SW', 'S', 'SE'],
];

const DIR_LABEL = {
  N: 'North', NE: 'Northeast', E: 'East', SE: 'Southeast',
  S: 'South', SW: 'Southwest', W: 'West', NW: 'Northwest', center: 'Center',
};

const KUA_DIRECTIONS = {
  1: { shengqi: 'SE', tianyi: 'E', yannian: 'S', fuwei: 'N', huohai: 'W', wugui: 'NE', liusha: 'NW', jueming: 'SW' },
  2: { shengqi: 'NE', tianyi: 'W', yannian: 'NW', fuwei: 'SW', huohai: 'E', wugui: 'SE', liusha: 'S', jueming: 'N' },
  3: { shengqi: 'S', tianyi: 'N', yannian: 'SE', fuwei: 'E', huohai: 'SW', wugui: 'NW', liusha: 'NE', jueming: 'W' },
  4: { shengqi: 'N', tianyi: 'S', yannian: 'E', fuwei: 'SE', huohai: 'SW', wugui: 'NW', liusha: 'NE', jueming: 'W' },
  6: { shengqi: 'W', tianyi: 'NE', yannian: 'SW', fuwei: 'NW', huohai: 'SE', wugui: 'E', liusha: 'N', jueming: 'S' },
  7: { shengqi: 'NW', tianyi: 'SW', yannian: 'NE', fuwei: 'W', huohai: 'N', wugui: 'S', liusha: 'E', jueming: 'SE' },
  8: { shengqi: 'SW', tianyi: 'NW', yannian: 'W', fuwei: 'NE', huohai: 'S', wugui: 'N', liusha: 'E', jueming: 'SE' },
  9: { shengqi: 'E', tianyi: 'SE', yannian: 'N', fuwei: 'S', huohai: 'W', wugui: 'NE', liusha: 'SW', jueming: 'NW' },
};

const KUA_META = {
  1: { cn: '坎', archetype: 'The Listener', group: 'east' },
  2: { cn: '坤', archetype: 'The Nurturer', group: 'west' },
  3: { cn: '震', archetype: 'The Initiator', group: 'east' },
  4: { cn: '巽', archetype: 'The Connector', group: 'east' },
  6: { cn: '乾', archetype: 'The Strategist', group: 'west' },
  7: { cn: '兌', archetype: 'The Communicator', group: 'west' },
  8: { cn: '艮', archetype: 'The Guardian', group: 'west' },
  9: { cn: '离', archetype: 'The Illuminator', group: 'east' },
};

const STAR_INFO = {
  1: { cn: '一白', en: 'One White', label: 'Career & growth', nature: 'good' },
  2: { cn: '二黑', en: 'Two Black', label: 'Illness & worry', nature: 'bad' },
  3: { cn: '三碧', en: 'Three Jade', label: 'Conflict & noise', nature: 'bad' },
  4: { cn: '四绿', en: 'Four Green', label: 'Romance & study', nature: 'mixed' },
  5: { cn: '五黄', en: 'Five Yellow', label: 'Misfortune — avoid renovation', nature: 'bad' },
  6: { cn: '六白', en: 'Six White', label: 'Authority & mentors', nature: 'good' },
  7: { cn: '七赤', en: 'Seven Red', label: 'Theft & sharp edges', nature: 'bad' },
  8: { cn: '八白', en: 'Eight White', label: 'Wealth & momentum', nature: 'good' },
  9: { cn: '九紫', en: 'Nine Purple', label: 'Celebration & visibility', nature: 'good' },
};

const STAR_TIPS = {
  1: 'Activate with water features or focused career work in this sector.',
  2: 'Keep clean and quiet; add metal objects if this is a bedroom.',
  3: 'Reduce noise; avoid excessive red decor.',
  4: 'Good for study and romance; keep fresh and bright.',
  5: 'No renovation here. Add metal (white/grey/brass). Avoid fire colors.',
  6: 'Excellent for office and leadership; keep uncluttered.',
  7: 'Avoid sharp points; soften with rounded decor.',
  8: 'Prime wealth sector — desk, safe, or active income work.',
  9: 'Celebration star — social areas, visibility, marketing.',
};

function reduceDigit(n) {
  n = Math.abs(parseInt(n, 10) || 0);
  while (n > 9) {
    n = String(n).split('').reduce((a, d) => a + parseInt(d, 10), 0);
  }
  return n;
}

function solarYearFromDob(dob) {
  if (!dob) return new Date().getFullYear();
  const [y, m, d] = dob.split('-').map(Number);
  if (m < 2 || (m === 2 && d < 4)) return y - 1;
  return y;
}

function calculateKua(lunarYear, gender) {
  const sum = reduceDigit(lunarYear);
  const isMale = gender === 'male' || gender === 'm';
  let kua;
  if (isMale) {
    kua = lunarYear >= 2000 ? 9 - sum : 10 - sum;
    if (kua === 10) kua = 1;
    if (kua === 5) kua = 2;
    if (kua < 1) kua = 9;
  } else {
    kua = lunarYear >= 2000 ? sum + 6 : sum + 5;
    while (kua > 9) kua -= 9;
    if (kua === 0) kua = 9;
    if (kua === 5) kua = 8;
  }
  return kua;
}

export function calculateBaZhai({ dob, gender, houseFacing }) {
  if (!dob || !gender) return null;
  const parts = dob.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  let lunarYear = y;
  try {
    lunarYear = Solar.fromYmd(y, m, d).getLunar().getYear();
  } catch { /* use solar year boundary fallback */ }
  const kua = calculateKua(lunarYear, gender);
  const meta = KUA_META[kua];
  const dirs = KUA_DIRECTIONS[kua];
  if (!meta || !dirs) return null;

  const groupLabel = meta.group === 'east' ? 'East Group · 東四命' : 'West Group · 西四命';
  return {
    kua,
    cn: meta.cn,
    archetype: meta.archetype,
    group: meta.group,
    groupLabel,
    directions: dirs,
    actions: [
      `Sit facing ${dirs.shengqi} in meetings and focused work.`,
      `Headboard against the ${dirs.tianyi} wall when sleeping.`,
      `Face ${dirs.yannian} for important conversations.`,
    ],
  };
}

export function annualCenterStar(year) {
  const y = parseInt(year, 10) || new Date().getFullYear();
  const offset = y - 2024;
  let center = 9 - (offset % 9);
  if (center < 1) center += 9;
  return center;
}

export function buildAnnualChart(year) {
  const y = parseInt(year, 10) || 2026;
  const center = annualCenterStar(y);
  const chart = {};
  let star = center;
  for (const dir of FLY_ORDER) {
    chart[dir] = star;
    star -= 1;
    if (star < 1) star = 9;
  }
  const cells = GRID_LAYOUT.map((row) =>
    row.map((direction) => {
      const num = chart[direction];
      const info = STAR_INFO[num];
      return { direction, star: num, ...info };
    }),
  );
  return { year: y, centerStar: center, chart, cells };
}

export function insightsForFacing(chart, facing) {
  const face = facing || 'S';
  const faceStar = chart.chart[face];
  const faceInfo = STAR_INFO[faceStar];
  const highlights = [];
  const cautions = [];
  Object.keys(chart.chart).forEach((dir) => {
    if (dir === 'center') return;
    const n = chart.chart[dir];
    const info = STAR_INFO[n];
    const entry = { direction: dir, dirLabel: DIR_LABEL[dir], star: n, label: info.label, nature: info.nature };
    if (info.nature === 'good') highlights.push(entry);
    if (info.nature === 'bad') cautions.push(entry);
  });
  return {
    facing: face,
    facingLabel: DIR_LABEL[face],
    facingStar: faceStar,
    facingInfo: faceInfo,
    headline: `Your home faces ${DIR_LABEL[face]} — in ${chart.year} this sector holds ${faceInfo.en} (${faceInfo.cn}): ${faceInfo.label}.`,
    highlights: highlights.slice(0, 4),
    cautions: cautions.slice(0, 4),
  };
}

export function quarterlyCenters(year) {
  const y = parseInt(year, 10);
  const base = annualCenterStar(y);
  return [
    { q: 'Q1', months: 'Jan–Mar', center: base },
    { q: 'Q2', months: 'Apr–Jun', center: ((base - 1) < 1 ? 9 : base - 1) },
    { q: 'Q3', months: 'Jul–Sep', center: ((base - 2) < 1 ? base - 2 + 9 : base - 2) },
    { q: 'Q4', months: 'Oct–Dec', center: ((base - 3) < 1 ? base - 3 + 9 : base - 3) },
  ];
}

function buildChartFromCenter(center, meta) {
  const chart = {};
  let star = center;
  for (const dir of FLY_ORDER) {
    chart[dir] = star;
    star -= 1;
    if (star < 1) star = 9;
  }
  return { year: meta.year, month: meta.month || null, centerStar: center, chart };
}

export function monthlyCenterStar(year, month) {
  const base = annualCenterStar(year);
  const m = parseInt(month, 10) || 1;
  let c = base - (m - 1);
  while (c < 1) c += 9;
  return c;
}

export function buildMonthlyChart(year, month) {
  const y = parseInt(year, 10) || new Date().getFullYear();
  const m = parseInt(month, 10) || 1;
  return buildChartFromCenter(monthlyCenterStar(y, m), { year: y, month: m });
}

/** Monthly brief for annual pass emails */
export function monthlyBrief({ facing = 'S', year, month }) {
  const y = parseInt(year, 10) || new Date().getFullYear();
  const m = parseInt(month, 10) || (new Date().getMonth() + 1);
  const chart = buildMonthlyChart(y, m);
  const face = facing || 'S';
  const faceStar = chart.chart[face];
  const faceInfo = STAR_INFO[faceStar];
  const centerInfo = STAR_INFO[chart.centerStar];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const cautions = [];
  const opportunities = [];
  Object.keys(chart.chart).forEach((dir) => {
    if (dir === 'center') return;
    const n = chart.chart[dir];
    const info = STAR_INFO[n];
    const entry = { direction: dir, dirLabel: DIR_LABEL[dir], star: n, label: info.label, tip: STAR_TIPS[n] };
    if (info.nature === 'bad' || n === 5) cautions.push(entry);
    if (info.nature === 'good' && (n === 8 || n === 9 || n === 6)) opportunities.push(entry);
  });
  return {
    year: y,
    month: m,
    monthLabel: monthNames[m - 1] || String(m),
    centerStar: chart.centerStar,
    centerLabel: centerInfo.label,
    facing: face,
    facingLabel: DIR_LABEL[face],
    facingStar: faceStar,
    facingLabelText: faceInfo.label,
    headline: `${monthNames[m - 1]} ${y}: center star ${chart.centerStar} ${centerInfo.cn} — ${centerInfo.label}. Your door (${DIR_LABEL[face]}) holds star ${faceStar} ${faceInfo.cn}.`,
    cautions: cautions.slice(0, 4),
    opportunities: opportunities.slice(0, 3),
  };
}

export { DIR_LABEL, STAR_INFO, STAR_TIPS, DIRECTIONS };
