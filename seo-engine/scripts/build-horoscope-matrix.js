const fs = require('fs');
const path = require('path');

const baseConfig = {
  site: {
    domain: 'https://metaphysicflow.com',
    cta_page: '/free-chart.html',
    cta_text: 'Get Your Free Chart Reading',
    brand_name: 'Guanlan Energy',
    author: 'Guanlan Energy',
    faq_page: '/faq.html',
    logo: '/images/og-chart.jpg',
  },
};

const YEAR = 2026;
const YEAR_NAME = 'Bing Wu (Fire Horse)';

const ZODIAC = [
  {
    id: 'rat',
    animal: 'Rat',
    chinese: '鼠',
    clash: 'clash',
    theme: 'restructuring and defensive positioning',
    career: 'Avoid impulsive job jumps; consolidate skills before Q3 pivots.',
    wealth: 'Cash flow tight early year; liquidity buffers matter before autumn decisions.',
    love: 'Communication friction peaks mid-year — slow negotiations in partnerships.',
    health: 'Sleep and nervous-system load; schedule recovery before Horse-month intensity.',
  },
  {
    id: 'ox',
    animal: 'Ox',
    chinese: '牛',
    clash: 'neutral',
    theme: 'slow accumulation and authority through consistency',
    career: 'Recognition arrives through reliability, not visibility stunts.',
    wealth: 'Conservative gains; property and long-cycle assets favored over speculation.',
    love: 'Stable partnerships deepen; singles attract through grounded presence.',
    health: 'Digestive and musculoskeletal routines pay off — don’t skip maintenance.',
  },
  {
    id: 'tiger',
    animal: 'Tiger',
    chinese: '虎',
    clash: 'harmony',
    theme: 'momentum, travel luck, and bold professional moves',
    career: 'Promotion windows open when you accept visible leadership.',
    wealth: 'Income expands through networks and cross-border opportunities.',
    love: 'Magnetic social year; clarify commitment before summer distractions.',
    health: 'High energy — channel into sport, not burnout sprints.',
  },
  {
    id: 'rabbit',
    animal: 'Rabbit',
    chinese: '兔',
    clash: 'neutral',
    theme: 'creative refinement and selective alliances',
    career: 'Behind-the-scenes strategists outperform loud competitors.',
    wealth: 'Creative IP and consulting outperform passive bets.',
    love: 'Gentle courtship wins; avoid over-accommodating toxic dynamics.',
    health: 'Emotional sensitivity rises — boundaries protect vitality.',
  },
  {
    id: 'dragon',
    animal: 'Dragon',
    chinese: '龍',
    clash: 'harmony',
    theme: 'status elevation and public narrative control',
    career: 'Brand and reputation become currency — polish your public story.',
    wealth: 'Large deals possible; legal clarity before signing.',
    love: 'High standards attract quality matches; ego tests relationships.',
    health: 'Watch cardiovascular stress during peak visibility months.',
  },
  {
    id: 'snake',
    animal: 'Snake',
    chinese: '蛇',
    clash: 'harmony',
    theme: 'strategic patience and hidden advantage',
    career: 'Research, finance, and advisory roles shine.',
    wealth: 'Delayed gratification — best returns post-autumn.',
    love: 'Depth over breadth; one meaningful bond beats many flings.',
    health: 'Kidney/adrenal balance through rest cycles and hydration.',
  },
  {
    id: 'horse',
    animal: 'Horse',
    chinese: '馬',
    clash: 'self-punishment',
    theme: 'identity reset and self-directed reinvention',
    career: 'Ben Ming year volatility — double-check contracts and partners.',
    wealth: 'Avoid doubling down on ego projects; diversify.',
    love: 'Passionate but unstable — pace major commitments.',
    health: 'Accident-prone if over-rushing; slow down physically.',
  },
  {
    id: 'goat',
    animal: 'Goat',
    chinese: '羊',
    clash: 'harmony',
    theme: 'artistic output and collaborative prosperity',
    career: 'Team-based wins; solo isolation hurts momentum.',
    wealth: 'Income through aesthetics, care, hospitality, design.',
    love: 'Romantic idealism — verify actions, not words.',
    health: 'Immune sensitivity; prioritize nutrition and calm environments.',
  },
  {
    id: 'monkey',
    animal: 'Monkey',
    chinese: '猴',
    clash: 'harmony',
    theme: 'clever pivots and tech-enabled opportunity',
    career: 'Side projects can become main income streams.',
    wealth: 'Trading and arbitrage luck — discipline stops overtrading.',
    love: 'Wit attracts partners; honesty prevents mixed signals.',
    health: 'Mental overstimulation — digital detox helps focus.',
  },
  {
    id: 'rooster',
    animal: 'Rooster',
    chinese: '雞',
    clash: 'neutral',
    theme: 'precision, audit, and reputation repair',
    career: 'Detail-oriented roles rewarded; sloppy work gets exposed.',
    wealth: 'Tax, compliance, and bookkeeping themes — clean house early.',
    love: 'Direct communication clears long-standing misunderstandings.',
    health: 'Respiratory and skin sensitivity; air quality matters.',
  },
  {
    id: 'dog',
    animal: 'Dog',
    chinese: '狗',
    clash: 'harmony',
    theme: 'loyalty dividends and protective alliances',
    career: 'Mentors and old contacts reopen doors.',
    wealth: 'Steady salary growth; speculative hype feels hollow.',
    love: 'Trust-building year; betrayal patterns can finally end.',
    health: 'Joint and mobility care; walking beats extreme training.',
  },
  {
    id: 'pig',
    animal: 'Pig',
    chinese: '豬',
    clash: 'neutral',
    theme: 'abundance mindset with boundary setting',
    career: 'Hospitality and human-service sectors favor you.',
    wealth: 'Generosity must have limits — say no to co-signing.',
    love: 'Warm connections; watch over-giving in unequal bonds.',
    health: 'Metabolic balance — moderation beats crash diets.',
  },
];

function buildPage(z) {
  const slug = `horoscope/${YEAR}-${z.id}-forecast`;
  const keyword = `Zi Wei Dou Shu ${YEAR} ${z.animal} forecast`;
  const title = `${YEAR} ${z.animal} Year ZWDS Forecast — Purple Star Astrology (${YEAR_NAME})`;
  const description = `${YEAR} Purple Star Astrology outlook for ${z.animal}-year natives (${z.chinese}): career, wealth, love, and health under the ${YEAR_NAME} cycle.`;
  const summary = `${YEAR} activates ${z.theme} for ${z.animal}-year readers. In Zi Wei Dou Shu, annual overlays interact with your natal Life, Wealth, and Career palaces — this page maps the ${YEAR_NAME} rhythm before you generate your personal chart.`;

  return {
    slug,
    leaf_slug: `${YEAR}-${z.id}-forecast`,
    category: 'Horoscope2026',
    year: YEAR,
    year_name: YEAR_NAME,
    zodiac_id: z.id,
    zodiac_animal: z.animal,
    zodiac_chinese: z.chinese,
    clash_relation: z.clash,
    keyword,
    title,
    description,
    summary,
    career_block: z.career,
    wealth_block: z.wealth,
    love_block: z.love,
    health_block: z.health,
    content_block: `The ${YEAR_NAME} stem-branch cycle (${YEAR}) sets a Fire-Horse tempo: acceleration, visibility, and decisive movement. For ${z.animal}-year natives, the annual overlay emphasizes ${z.theme}. Purple Star Astrology does not replace your birth chart — it layers annual Si Hua and palace activations on top of natal structure. Cross-check this forecast against your free English chart to see which palaces receive ${YEAR}'s Four Transformations.`,
    faq_question: `Is ${YEAR} a good year for ${z.animal} in Zi Wei Dou Shu?`,
    faq_answer: `It depends on your full chart, not zodiac alone. ${z.animal}-year themes in ${YEAR} lean toward ${z.theme}. ${z.clash === 'clash' ? 'Clash years demand defensive timing — avoid rash moves in Horse month.' : z.clash === 'self-punishment' ? 'Ben Ming years amplify volatility — prioritize stability and health.' : 'Favorable annual chemistry supports growth when natal palaces align.'} Generate your chart for palace-specific timing.`,
    lsi_keywords: [
      `${YEAR} ${z.animal} Chinese astrology`,
      'Purple Star annual forecast',
      'Zi Wei Dou Shu horoscope',
      YEAR_NAME,
      `${z.animal} career wealth love`,
    ],
  };
}

const pages = ZODIAC.map(buildPage);

pages.unshift({
  slug: `horoscope/${YEAR}-annual-forecast`,
  leaf_slug: `${YEAR}-annual-forecast`,
  category: 'HoroscopeHub2026',
  year: YEAR,
  year_name: YEAR_NAME,
  zodiac_id: 'all',
  zodiac_animal: 'All Signs',
  keyword: `${YEAR} horoscope forecast Zi Wei Dou Shu`,
  title: `${YEAR} Zi Wei Dou Shu Annual Forecast Hub — ${YEAR_NAME} Purple Star Outlook`,
  description: `Complete ${YEAR} Purple Star Astrology annual forecast index for all 12 Chinese zodiac birth years. Career, wealth, love, and health themes under ${YEAR_NAME}.`,
  summary: `The ${YEAR_NAME} year shifts global tempo toward speed, visibility, and decisive action. This hub links all 12 zodiac-year forecasts plus your personalized 12-palace chart.`,
  career_block: 'Annual Career Palace activations vary by birth year — use zodiac pages as orientation, then chart for precision.',
  wealth_block: 'Wealth Palace timing in 2026 favors prepared liquidity and documented contracts.',
  love_block: 'Spouse Palace themes intensify during clash and self-punishment years — pace commitments.',
  health_block: 'Health Palace load rises in Horse year — recovery routines are non-negotiable.',
  content_block: `Zi Wei Dou Shu annual forecasting combines heavenly stem-branch chemistry (here: ${YEAR_NAME}) with your natal palace matrix. Select your birth-year animal below, then generate your free English chart to see where 2026 Si Hua stars land on your Life, Wealth, and Career palaces.`,
  faq_question: `How is Zi Wei Dou Shu ${YEAR} forecast different from Chinese zodiac horoscope?`,
  faq_answer: `ZWDS uses birth date, hour, and gender to map 12 palaces and 14 major stars. Zodiac-year forecasts describe collective themes for your birth animal; your chart personalizes which palaces activate in ${YEAR}.`,
  lsi_keywords: ['2026 ZWDS forecast', 'Purple Star annual hub', 'Chinese astrology 2026', YEAR_NAME],
  hub_links: ZODIAC.map((z) => ({
    href: `/pages/horoscope/${YEAR}-${z.id}-forecast.html`,
    label: `${z.animal} (${z.chinese}) ${YEAR} forecast`,
  })),
});

const outPath = path.join(__dirname, '../data/horoscope-matrix.json');
fs.writeFileSync(outPath, JSON.stringify({ ...baseConfig, pages }, null, 2));
console.log(`✅ horoscope-matrix.json — ${pages.length} pages (${ZODIAC.length} zodiac + 1 hub)`);
