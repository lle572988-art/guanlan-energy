/**
 * Filter junk phrases from competitor sitemap / UI scraping.
 */

function decodeHtml(s) {
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

const JUNK_PATTERNS = [
  /\.xml$/i,
  /sitemap/i,
  /item added to your cart/i,
  /^country\/region$/i,
  /^update country\/region$/i,
  /^subtotal$/i,
  /^checkout$/i,
  /^cart$/i,
  /^search$/i,
  /^menu$/i,
  /^home$/i,
  /^privacy policy$/i,
  /^terms of service$/i,
  /^meet .{1,30}$/i, // "Meet Tian Qi" — team pages
  /\|\s*asia/i, // competitor brand titles "Sean Chan | Asia's..."
  /consulting group$/i,
  /^\u201c.+\u201d$/, // quoted testimonials
  /^".+"$/, // quoted testimonials
  /millionaire|rising millionaire|earn(ed)? more than/i,
];

const MIN_PHRASE_LEN = 12;
const MAX_PHRASE_LEN = 120;

function isJunkGapPhrase(phrase) {
  const p = decodeHtml(phrase || '').trim();
  if (!p || p.length < MIN_PHRASE_LEN || p.length > MAX_PHRASE_LEN) return true;
  if (JUNK_PATTERNS.some((re) => re.test(p))) return true;
  // File-like slugs
  if (/^[\w.-]+\.(xml|html|json|php)$/i.test(p)) return true;
  // Mostly non-Latin nav noise without ZWDS context
  if (/^[\u4e00-\u9fff\｜\|]+$/.test(p) && !/紫微|zi wei|purple|bazi|易经|占卜/i.test(p)) return true;
  return false;
}

function scoreGapQuality(gap) {
  let score = 0;
  const p = decodeHtml(gap.phrase || '').toLowerCase();

  const pri = { P0: 30, P1: 20, P2: 10 };
  score += pri[gap.competitor_priority] ?? 0;

  const kw = [
    ['zi wei', 25],
    ['zwds', 25],
    ['purple star', 22],
    ['bazi', 18],
    ['feng shui', 15],
    ['career', 12],
    ['wealth', 12],
    ['palace', 12],
    ['chart', 10],
    ['reading', 10],
    ['calculator', 10],
    ['forecast', 10],
    ['易经', 15],
    ['占卜', 12],
    ['soul', 10],
    ['destiny', 10],
  ];
  kw.forEach(([term, pts]) => {
    if (p.includes(term)) score += pts;
  });

  if (/ vs |compare|difference/.test(p)) score += 8;
  if (gap.suggested_action && /compare|calculator|forecast/.test(gap.suggested_action)) score += 5;

  return score;
}

function filterAndRankGaps(gaps) {
  const filtered = gaps.filter((g) => !isJunkGapPhrase(g.phrase));
  return filtered
    .map((g) => ({ ...g, quality_score: scoreGapQuality(g) }))
    .sort((a, b) => b.quality_score - a.quality_score);
}

module.exports = {
  decodeHtml,
  isJunkGapPhrase,
  scoreGapQuality,
  filterAndRankGaps,
};
