/**
 * Derive SEO page context from sourceUrl for context-aware AI reports.
 */

const STAR_SLUG = {
  'zi-wei': 'Zi Wei',
  'tian-ji': 'Tian Ji',
  'tai-yang': 'Tai Yang',
  'wu-qu': 'Wu Qu',
  'tian-tong': 'Tian Tong',
  'lian-zhen': 'Lian Zhen',
  'tian-fu': 'Tian Fu',
  'tai-yin': 'Tai Yin',
  'tan-lang': 'Tan Lang',
  'ju-men': 'Ju Men',
  'tian-xiang': 'Tian Xiang',
  'tian-liang': 'Tian Liang',
  'qi-sha': 'Qi Sha',
  'po-jun': 'Po Jun',
  'wen-chang': 'Wen Chang',
  'wen-qu': 'Wen Qu',
  'you-bi': 'You Bi',
};

const PALACE_SLUG = {
  'ming-gong': 'Life Palace',
  'parents-palace': 'Parents Palace',
  'spouse-palace': 'Spouse Palace',
  'children-palace': 'Children Palace',
  'wealth-palace': 'Wealth Palace',
  'health-palace': 'Health Palace',
  'travel-palace': 'Travel Palace',
  'friends-palace': 'Friends Palace',
  'career-palace': 'Career Palace',
  'property-palace': 'Property Palace',
  'fu-de-palace': 'Happiness Palace',
  'siblings-palace': 'Siblings Palace',
};

const HUA_SLUG = {
  'hua-lu': 'Hua Lu (Transformation of Abundance)',
  'hua-quan': 'Hua Quan (Transformation of Authority)',
  'hua-ke': 'Hua Ke (Transformation of Recognition)',
  'hua-ji': 'Hua Ji (Transformation of Karmic Friction)',
};

const HOUR_LABELS = {
  0: 'Zi Hour (11pm–1am)',
  1: 'Chou Hour (1–3am)',
  3: 'Yin Hour (3–5am)',
  5: 'Mao Hour (5–7am)',
  7: 'Chen Hour (7–9am)',
  9: 'Si Hour (9–11am)',
  11: 'Wu Hour (11am–1pm)',
  13: 'Wei Hour (1–3pm)',
  15: 'Shen Hour (3–5pm)',
  17: 'You Hour (5–7pm)',
  19: 'Xu Hour (7–9pm)',
  21: 'Hai Hour (9–11pm)',
};

function titleCaseSlug(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function parsePageContext(sourceUrl = '') {
  const path = String(sourceUrl).replace(/^https?:\/\/[^/]+/, '').split('?')[0];
  const ctx = {
    sourceUrl: path,
    pageType: 'general',
    keyword: '',
    year: null,
    star: '',
    transform: '',
    palace: '',
    headline: 'Purple Star Astrology · Personal Annual Vector',
  };

  const transitMatch = path.match(
    /\/pages\/transit\/(\d{4})-([a-z-]+)-(hua-lu|hua-quan|hua-ke|hua-ji)-in-([a-z-]+)\.html/i
  );
  if (transitMatch) {
    const [, year, starSlug, huaSlug, palaceSlug] = transitMatch;
    ctx.pageType = 'transit';
    ctx.year = Number(year);
    ctx.star = STAR_SLUG[starSlug] || titleCaseSlug(starSlug);
    ctx.transform = HUA_SLUG[huaSlug] || huaSlug;
    ctx.palace = PALACE_SLUG[palaceSlug] || titleCaseSlug(palaceSlug);
    ctx.keyword = `${year} ${ctx.star} ${ctx.transform.split(' ')[0]} ${ctx.transform.split(' ')[1] || ''} in ${ctx.palace}`.trim();
    ctx.headline = `${ctx.keyword} — Context-Aware Reading`;
    return ctx;
  }

  const starMatch = path.match(/\/pages\/([a-z-]+)-in-([a-z-]+)\.html/i);
  if (starMatch) {
    const [, starSlug, palaceSlug] = starMatch;
    ctx.pageType = 'star-palace';
    ctx.star = STAR_SLUG[starSlug] || titleCaseSlug(starSlug);
    ctx.palace = PALACE_SLUG[palaceSlug] || titleCaseSlug(palaceSlug);
    ctx.keyword = `${ctx.star} in ${ctx.palace}`;
    ctx.headline = `${ctx.keyword} — Natal Micro-Reading`;
    return ctx;
  }

  if (path.includes('free-chart')) ctx.pageType = 'calculator';
  return ctx;
}

export function formatBirthHour(hour) {
  if (hour === '' || hour === null || hour === undefined) return 'Unknown birth hour (less precise)';
  const n = Number(hour);
  return HOUR_LABELS[n] || `Branch hour index ${n}`;
}

export function buildContextSummary(ctx) {
  if (ctx.pageType === 'transit') {
    return `The visitor submitted from a ${ctx.year} annual transit page: ${ctx.star} undergoing ${ctx.transform} activating the ${ctx.palace}. This is their acute decision-window trigger.`;
  }
  if (ctx.pageType === 'star-palace') {
    return `The visitor submitted from a natal star-palace page: ${ctx.star} seated in the ${ctx.palace}. Emphasize structural personality and palace-domain consequences.`;
  }
  return 'The visitor submitted from a general programmatic SEO entry point. Provide a broad but authoritative Zi Wei Dou Shu annual outlook.';
}
