/**
 * Generate Living Compass SEO pages: Kua 1-9 (no 5) + 3 pain-point guides.
 * Run: node scripts/generate-compass-seo.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const KUA_PAGES = {
  1: {
    han: '坎', en: 'Kan · The Water', group: 'East',
    char: 'Deep, intuitive, adaptable — you find paths others miss.',
    shengqi: 'SE', tianyi: 'E', yannian: 'S', fuwei: 'N',
    wealth: 'Southeast', health: 'East', love: 'South',
  },
  2: {
    han: '坤', en: 'Kun · The Earth', group: 'West',
    char: 'Steady and nourishing — people lean on you when you stay patient.',
    shengqi: 'NE', tianyi: 'W', yannian: 'NW', fuwei: 'SW',
    wealth: 'Northeast', health: 'West', love: 'Northwest',
  },
  3: {
    han: '震', en: 'Zhen · The Thunder', group: 'East',
    char: 'A spark of initiative — expressive, fast, happiest when starting.',
    shengqi: 'S', tianyi: 'N', yannian: 'SE', fuwei: 'E',
    wealth: 'South', health: 'North', love: 'Southeast',
  },
  4: {
    han: '巽', en: 'Xun · The Wind', group: 'East',
    char: 'Gentle but far-reaching — you persuade without force.',
    shengqi: 'N', tianyi: 'S', yannian: 'E', fuwei: 'SE',
    wealth: 'North', health: 'South', love: 'East',
  },
  6: {
    han: '乾', en: 'Qian · The Heaven', group: 'West',
    char: 'A natural strategist — clear-eyed, principled, built to lead.',
    shengqi: 'W', tianyi: 'NE', yannian: 'SW', fuwei: 'NW',
    wealth: 'West', health: 'Northeast', love: 'Southwest',
  },
  7: {
    han: '兌', en: 'Dui · The Lake', group: 'West',
    char: 'Warm and magnetic — you connect and bring ease.',
    shengqi: 'NW', tianyi: 'SW', yannian: 'NE', fuwei: 'W',
    wealth: 'Northwest', health: 'Southwest', love: 'Northeast',
  },
  8: {
    han: '艮', en: 'Gen · The Mountain', group: 'West',
    char: 'Grounded and still — immovable once decided.',
    shengqi: 'SW', tianyi: 'NW', yannian: 'W', fuwei: 'NE',
    wealth: 'Southwest', health: 'Northwest', love: 'West',
  },
  9: {
    han: '離', en: 'Li · The Fire', group: 'East',
    char: 'Bright and visible — passionate, illuminating.',
    shengqi: 'E', tianyi: 'SE', yannian: 'N', fuwei: 'S',
    wealth: 'East', health: 'Southeast', love: 'North',
  },
};

const DIRS = [
  { slug: 'north', label: 'North', code: 'N' },
  { slug: 'northeast', label: 'Northeast', code: 'NE' },
  { slug: 'east', label: 'East', code: 'E' },
  { slug: 'southeast', label: 'Southeast', code: 'SE' },
  { slug: 'south', label: 'South', code: 'S' },
  { slug: 'southwest', label: 'Southwest', code: 'SW' },
  { slug: 'west', label: 'West', code: 'W' },
  { slug: 'northwest', label: 'Northwest', code: 'NW' },
];

const ROOMS = [
  { slug: 'bedroom', label: 'bedroom', title: 'Bedroom', tip: 'Sleep and recovery — headboard wall and door lines matter most.' },
  { slug: 'kitchen', label: 'kitchen', title: 'Kitchen', tip: 'Nourishment and wealth flow — stove position and element balance.' },
  { slug: 'office', label: 'home office', title: 'Home Office', tip: 'Desk facing and sector stars affect focus and income work.' },
  { slug: 'living-room', label: 'living room', title: 'Living Room', tip: 'Social energy and visibility — sofa orientation and entry flow.' },
];

const FACING_YEAR = 2026;
const BIRTH_YEAR_START = 1960;
const BIRTH_YEAR_END = 2012;

const ZODIAC = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];

function reduceDigit(n) {
  n = Math.abs(n);
  while (n > 9) {
    n = String(n).split('').reduce((a, d) => a + parseInt(d, 10), 0);
  }
  return n;
}

/** Matches client Ba Zhai logic in compass/index.html */
function kuaForBirthYear(year, gender) {
  const base = reduceDigit(year % 100);
  let k;
  if (year < 2000) {
    k = gender === 'male' ? 10 - base : 5 + base;
  } else {
    k = gender === 'male' ? 9 - base : 6 + base;
  }
  k = reduceDigit(k);
  if (k === 5) k = gender === 'male' ? 2 : 8;
  if (k === 0) k = 9;
  return k;
}

function zodiacForYear(year) {
  return ZODIAC[(year - 4) % 12];
}

const GUIDES = [
  {
    slug: 'bed-direction',
    title: 'Which Way Should My Bed Face? · Personal Feng Shui Directions',
    description: 'Your ideal bed direction depends on your Ba Zhai Kua — not a one-size-fits-all rule. Learn how Eight Mansions feng shui picks your health and sleep bearing.',
    h1: 'Which way should my bed face?',
    intro: 'The viral tip "never sleep with feet toward the door" ignores the fact that <strong>your best headboard wall is personal</strong>. In Ba Zhai (八宅) feng shui, your Kua number maps a <em>Tian Yi (天医)</em> direction — the bearing that supports rest and recovery.',
    sections: [
      {
        h2: 'Step 1 — Find your Kua',
        p: 'Use your birth year (solar year boundary around Feb 4) and gender to calculate Kua 1, 2, 3, 4, 6, 7, 8, or 9. Each chart has four helpful and four draining directions.',
      },
      {
        h2: 'Step 2 — Headboard on your Tian Yi wall',
        p: 'Place the headboard against the wall that sits in your Tian Yi direction. You sleep with your head drawing health energy, not your feet pointing at a "bad" door.',
      },
      {
        h2: 'Step 3 — Avoid your Jue Ming bearing',
        p: 'Never orient sleep toward your Jue Ming (绝命) direction — the most draining bearing in your personal chart. It differs for every Kua.',
      },
    ],
  },
  {
    slug: 'bed-facing-door',
    title: 'Bed Facing Door Feng Shui Fix · Without Moving Walls',
    description: 'Sleeping with feet toward the door isn\'t always wrong — but conflicting stars and your personal Kua matter. Practical fixes without renovation.',
    h1: 'Bed facing the door — what to fix first',
    intro: 'A bed aligned with the door is called the "coffin position" in Western feng shui — but <strong>classical Ba Zhai is more precise</strong>. The real question: does the door line up with one of your four draining directions?',
    sections: [
      {
        h2: 'Check your personal chart first',
        p: 'Before buying a screen or moving furniture, calculate your Kua. If the door faces your Sheng Qi or Tian Yi sector, the layout may be fine. If it opens into Jue Ming or Wu Gui, shift the bed or block the line.',
      },
      {
        h2: 'Soft cures renters can use',
        p: 'A solid headboard, a folding screen, a heavy rug, or a curtain on the door — all break the direct rush without drilling holes. Add the element that calms the annual flying star in that sector (metal for Five Yellow, etc.).',
      },
      {
        h2: 'Layer the 2026 flying stars',
        p: 'Your personal Kua tells you <em>which way to face</em>. Annual flying stars tell you <em>what energy sits in each room sector this year</em>. Use both — try our Energy X-Ray preview for the 2026 grid.',
      },
    ],
    xrayCta: true,
  },
  {
    slug: 'feng-shui-renters',
    title: 'Feng Shui for Renters · Lucky Directions Without Renovating',
    description: 'No demolition required. Ba Zhai personal directions, flying star awareness, and soft cures for apartments and studios.',
    h1: 'Feng shui for renters — control what you can',
    intro: 'You can\'t move the front door or tear down walls — but you <strong>can control orientation</strong>: which way you sleep, sit, and work. That is the core of Ba Zhai: personal bearings, not construction.',
    sections: [
      {
        h2: 'Personal directions beat perfect architecture',
        p: 'A rental with awkward layout still works if your desk faces Sheng Qi and your headboard sits on Tian Yi. The compass is free and takes thirty seconds.',
      },
      {
        h2: 'Portable cures',
        p: 'Plants, mirrors (used carefully), metal objects, textiles, and lighting shifts — all movable when the lease ends. Avoid mirrors reflecting the bed or front door.',
      },
      {
        h2: 'Know this year\'s hot zones',
        p: 'In 2026 the center annual star is 7 Red — sectors shift yearly. Preview where Five Yellow and Two Black land in your flat before placing long-term furniture.',
      },
    ],
    xrayCta: true,
  },
  {
    slug: 'cant-sleep-bedroom',
    title: 'Can\'t Sleep? Feng Shui Bedroom Fixes · Personal Directions',
    description: 'Insomnia isn\'t always stress — your headboard wall and bedroom sector stars may clash with your Kua. Practical bedroom feng shui without moving walls.',
    h1: 'Can\'t sleep? Check your bedroom feng shui',
    intro: 'Before you blame blue light or caffeine, check whether your bed fights <strong>your personal chart</strong>. In Ba Zhai, sleeping toward Jue Ming (绝命) or with a draining star in the bedroom sector quietly erodes rest — even in a "pretty" room.',
    sections: [
      {
        h2: 'Step 1 — Headboard on Tian Yi, not Jue Ming',
        p: 'Calculate your Kua. Your Tian Yi (天医) direction is the wall your headboard should anchor to — it supports recovery. Never sleep with your head pointing toward Jue Ming, even if the room layout "looks right."',
      },
      {
        h2: 'Step 2 — Scan 2026 stars in the bedroom sector',
        p: 'If Two Black (illness) or Five Yellow (misfortune) sits in your bedroom this year, keep the room quiet, decluttered, and add metal cures (white, grey, brass). Avoid renovation and loud electronics there.',
      },
      {
        h2: 'Step 3 — Break the door line without drama',
        p: 'Feet toward the door isn\'t always fatal — but a direct rush from the door into the bed line adds unrest. A solid headboard, screen, or heavy rug between door and bed often helps within one night.',
      },
    ],
    xrayCta: true,
    heatmapCta: true,
  },
  {
    slug: 'money-leaving-home',
    title: 'Money Keeps Leaving? Feng Shui Wealth Drain Fixes',
    description: 'Wealth energy leaking in feng shui — bathroom in SE wealth sector, front door aligned with drain, or personal Kua facing wrong. Fixes without renovating.',
    h1: 'Money keeps leaving — where is wealth draining?',
    intro: 'Classical feng shui doesn\'t promise lottery wins — but it <strong>does map where money energy wants to flow</strong> versus where it gets flushed, argued, or blocked. Two layers: your personal Sheng Qi direction and the home\'s wealth sectors in 2026 flying stars.',
    sections: [
      {
        h2: 'Personal layer — face Sheng Qi when you earn',
        p: 'Your Sheng Qi (生气) direction is where you should <em>face</em> during income work — desk, calls, trading screen. If you work with your back to it, momentum feels like uphill even when you\'re skilled.',
      },
      {
        h2: 'House layer — Southeast and star 8 in 2026',
        p: 'Traditionally the wealth corner is Southeast — but annual flying stars shift. In 2026, star 8 (wealth momentum) may land elsewhere. Upload your floor plan in Energy X-Ray to see which room actually holds wealth energy <em>this year</em>.',
      },
      {
        h2: 'Classic drains to close',
        p: 'Bathroom or toilet in the active wealth sector — keep door closed, add earth element. Front door directly aligned with back door or large window — slow the rush with plants or screens. Leaks, clutter, and broken items in the wealth zone signal "money out."',
      },
    ],
    xrayCta: true,
  },
  {
    slug: 'desk-position-promotion',
    title: 'Desk Position for Promotion · Feng Shui Career Direction',
    description: 'Where should your desk face for career growth? Ba Zhai Sheng Qi bearing plus 2026 flying stars on your office sector — not generic "command position" tips.',
    h1: 'Desk position for promotion — face your power direction',
    intro: 'The viral "command position" (see the door, back to wall) helps security — but <strong>career momentum in Ba Zhai is personal</strong>. Your Sheng Qi (生气) direction is where your body should face when doing high-stakes work: proposals, interviews, sales calls.',
    sections: [
      {
        h2: 'Find your Sheng Qi bearing first',
        p: 'Use the free Living Compass with your birth date and gender. Note the compass direction labeled wealth & vitality — that is where your torso and eyes should point during focused career work.',
      },
      {
        h2: 'Office sector vs personal direction',
        p: 'If your home office sits in a sector holding star 6 (authority) or star 8 (wealth) in 2026, that room amplifies promotion energy — especially when your desk also faces Sheng Qi. Star 3 (conflict) or 7 (sharp edges) calls for softer decor and less confrontation there.',
      },
      {
        h2: 'Three desk moves this week',
        p: 'Rotate chair so you face Sheng Qi while working — not just "away from the window." Clear clutter behind you for support. Add one metal object if Five Yellow visits the office sector this month (see the 2026 heatmap).',
      },
    ],
    xrayCta: true,
    heatmapCta: true,
  },
  {
    slug: 'sell-house-fast',
    title: 'Feng Shui to Sell Your House Faster · Curb Appeal Meets Energy',
    description: 'Prepare a home for sale with feng shui — clear the entrance, calm the facing sector stars, and present wealth energy without superstition or renovation.',
    h1: 'Feng shui to sell your house — what buyers feel in 30 seconds',
    intro: 'Buyers decide emotionally in the foyer. Feng shui for selling isn\'t about hiding problems — it\'s about <strong>presenting flow, light, and calm authority</strong> at the front door and wealth path. No crystals required.',
    sections: [
      {
        h2: 'Front door = opportunity mouth',
        p: 'Clean, well-lit entry; working hardware; nothing blocking the door from opening fully. The facing sector\'s 2026 star colors the "first impression" — calm a harsh star with metal or earth, brighten a good star with fresh paint and plants.',
      },
      {
        h2: 'Wealth path from door to main living',
        p: 'Buyers should see a clear, inviting path — no shoes avalanche, no dark corridor. If the wealth sector (often SE, but check flying stars) is a messy storage room, declutter before photos and showings.',
      },
      {
        h2: 'Personalize after you calculate facing',
        p: 'Know which direction the home faces, then preview annual stars on the floor plan. Sellers who understand the home\'s energy map answer buyer questions with confidence — and price with clarity.',
      },
    ],
    xrayCta: true,
  },
  {
    slug: 'bad-luck-areas-2026',
    title: 'Bad Luck Areas in Your House 2026 · Five Yellow & Flying Stars',
    description: 'Where is negative energy in your home in 2026? Identify Five Yellow, Two Black, and conflict stars by sector — and what to do without fear-based feng shui.',
    h1: 'Bad luck areas in your house in 2026',
    intro: 'Searchers want a map, not a sermon. In 2026 flying star feng shui, <strong>Five Yellow (五黄)</strong> and <strong>Two Black (二黑)</strong> are the sectors to handle with care — not panic. No renovation, extra metal, and quiet use are the classic response.',
    sections: [
      {
        h2: 'Annual baseline for 2026',
        p: 'The year\'s center star is 7 Red — sectors rotate from there. Your home\'s "bad luck zones" depend on <em>facing direction</em> and layout — the same year feels different in a north-facing vs south-facing house.',
      },
      {
        h2: 'Monthly shifts matter',
        p: 'Five Yellow can visit your bedroom in March but leave by summer. Use the free 2026 heatmap to scrub month-by-month and avoid digging or major furniture moves when caution stars sit on rooms you use daily.',
      },
      {
        h2: 'Empowering cures (not fear)',
        p: 'Metal element (white, grey, brass, round shapes) calms Five Yellow. Keep affected sectors clean and quiet. This is stewardship, not superstition — you\'re managing energy flow like you manage lighting or airflow.',
      },
    ],
    xrayCta: true,
    heatmapCta: true,
  },
  {
    slug: 'wealth-corner-home',
    title: 'Wealth Corner of My Home · Feng Shui Money Area 2026',
    description: 'Where is the wealth corner in feng shui? Southeast tradition plus your personal Sheng Qi direction and 2026 flying star 8 — find your real money sector.',
    h1: 'Where is the wealth corner of my home?',
    intro: 'Instagram says "far left corner from the door." Classical feng shui says <strong>three wealth corners</strong>: traditional Southeast bagua, your personal Sheng Qi direction, and wherever star 8 (wealth momentum) sits in 2026.',
    sections: [
      {
        h2: 'Southeast — the classical money area',
        p: 'Standing inside your front door, Southeast is the traditional wealth gua. But if that corner is a bathroom or closet, the metaphor is literal — money energy gets flushed or hidden. Close doors, add earth, keep it active with light.',
      },
      {
        h2: 'Your personal wealth direction',
        p: 'Ba Zhai maps Sheng Qi (生气) — your body\'s wealth & vitality bearing. Face that direction at your desk; place active income work there. It may differ from Southeast entirely.',
      },
      {
        h2: '2026 flying star overlay',
        p: 'Star 8 White is the premier wealth star — but it lands in a different room sector each year. Overlay the annual grid on your floor plan to see if your office, kitchen, or entry holds 2026\'s momentum star.',
      },
    ],
    xrayCta: true,
  },
  {
    slug: 'checklist-before-buying',
    title: 'Feng Shui Checklist Before Buying a House · 7-Point Audit',
    description: 'Before you offer on a home, check facing direction, missing corners, bathroom placement, and 2026 flying stars. A practical buyer checklist — not superstition.',
    h1: 'Feng shui checklist before buying a house',
    intro: 'A beautiful listing can still fight your chart — or carry 2026\'s Five Yellow in the master suite. Use this <strong>seven-point audit</strong> on your second visit, before inspection fever sets in.',
    sections: [
      {
        h2: '1. Confirm true facing',
        p: 'Stand at the front door looking outward — that is the facing direction (坐向). Note it precisely (N, NE, E…). Every flying star map keys off this. Photograph the door from outside for later X-Ray upload.',
      },
      {
        h2: '2. Calculate your Kua fit',
        p: 'A west-facing gem can drain an East Group Kua person. Run the free Living Compass with your birth date — check whether the layout lets you sleep on Tian Yi and work facing Sheng Qi without absurd furniture yoga.',
      },
      {
        h2: '3. Scan missing corners',
        p: 'If the floor plan "cuts off" Northwest, West, or Southwest, classical texts flag relationship, children, or authority stress. Soft cures (lights, mirrors used carefully, heavy objects) can compensate — but know what you\'re buying.',
      },
      {
        h2: '4. Bathroom vs kitchen placement',
        p: 'Toilet sharing a wall with the stove, or a bathroom dominating the Southeast wealth gua, is a classic drain pattern. Not a veto — but a negotiation point or cure budget item.',
      },
      {
        h2: '5. Preview 2026 stars on the plan',
        p: 'Overlay the annual grid before you commit. Avoid closing on a home where Five Yellow sits in the nursery if you\'re planning renovation or a newborn — unless you have a clear metal-cure plan.',
      },
      {
        h2: '6. Entry and rear door alignment',
        p: 'Front door shooting straight to a back door or picture window can rush energy out. Screens, plants, or angled furniture slow the flow — note if the layout allows that.',
      },
      {
        h2: '7. Sleep and desk test',
        p: 'Stand in the primary bedroom and home office: can the bed headboard anchor on your Tian Yi wall? Can the desk face Sheng Qi? If not, will you actually re-orient — or is this wishful thinking?',
      },
    ],
    xrayCta: true,
    heatmapCta: true,
  },
  {
    slug: 'missing-corner-love',
    title: 'Missing Corner Feng Shui for Love & Relationships',
    description: 'A missing Southwest or West corner affects partnership energy in classical bagua. Soft cures and personal Yan Nian direction — without demolition.',
    h1: 'Missing corner feng shui for love',
    intro: 'L-shaped flats and clipped corners are common — especially in cities. Classical bagua links <strong>Southwest</strong> to partnership and <strong>West</strong> to children and joy. When those sectors are "missing," relationship energy can feel thin — but cures exist.',
    sections: [
      {
        h2: 'Identify what is actually missing',
        p: 'Overlay a bagua grid on your floor plan (front door as mouth of chi). A missing SW corner often means the relationship gua is literally not in the built footprint — outdoor patio, neighbor wall, or cut-out shape.',
      },
      {
        h2: 'Soft cures without construction',
        p: 'Bright light and earth tones in the SW sector of the <em>whole</em> home (even if the corner is outside). Pairs of objects (two candles, two stones) as symbolism — not clutter. Healthy plants with round leaves in SW when light allows.',
      },
      {
        h2: 'Personal Yan Nian direction',
        p: 'Ba Zhai maps Yan Nian (延年) — your relationship bearing. Face that direction during meals and important conversations; sit there when you want closeness. Personal direction often outperforms generic "put pink in SW" tips.',
      },
    ],
    xrayCta: true,
  },
  {
    slug: 'missing-corner-career',
    title: 'Missing Corner Feng Shui for Career & Authority',
    description: 'Missing North or Northwest corners and career stalls? Map flying stars, desk facing, and classical bagua fixes without renovating.',
    h1: 'Missing corner feng shui for career',
    intro: 'A clipped <strong>North</strong> or <strong>Northwest</strong> corner can correlate with career feeling blocked — not because the universe punishes you, but because the sectors linked to water/career path and authority (乾位) are literally absent from your living space.',
    sections: [
      {
        h2: 'North — path and narrative',
        p: 'North governs career flow in many bagua schools. If missing, strengthen the North sector of the interior grid with water imagery (small fountain, dark blue accents), clear pathways, and no blocked closets.',
      },
      {
        h2: 'Northwest — mentors and authority',
        p: 'NW (乾) connects to leadership and helpful people. Missing NW? Place metal objects (brass, round bowl) in the NW zone inside the home; keep that area uncluttered for "room" for mentors to arrive.',
      },
      {
        h2: 'Desk facing beats corner anxiety',
        p: 'Your personal Sheng Qi direction for focused work often matters more than perfect architecture. Calculate Kua, rotate the desk, then layer 2026 flying stars on the office sector via X-Ray.',
      },
    ],
    xrayCta: true,
    heatmapCta: true,
  },
];

const ZODIAC_2026 = [
  { slug: 'rat', label: 'Rat', cn: '鼠', sampleYears: '1960, 1972, 1984, 1996, 2008, 2020' },
  { slug: 'ox', label: 'Ox', cn: '牛', sampleYears: '1961, 1973, 1985, 1997, 2009, 2021' },
  { slug: 'tiger', label: 'Tiger', cn: '虎', sampleYears: '1962, 1974, 1986, 1998, 2010, 2022' },
  { slug: 'rabbit', label: 'Rabbit', cn: '兔', sampleYears: '1963, 1975, 1987, 1999, 2011, 2023' },
  { slug: 'dragon', label: 'Dragon', cn: '龙', sampleYears: '1964, 1976, 1988, 2000, 2012, 2024' },
  { slug: 'snake', label: 'Snake', cn: '蛇', sampleYears: '1965, 1977, 1989, 2001, 2013, 2025' },
  { slug: 'horse', label: 'Horse', cn: '马', sampleYears: '1966, 1978, 1990, 2002, 2014, 2026', yearAnimal: true },
  { slug: 'goat', label: 'Goat', cn: '羊', sampleYears: '1967, 1979, 1991, 2003, 2015, 2027' },
  { slug: 'monkey', label: 'Monkey', cn: '猴', sampleYears: '1968, 1980, 1992, 2004, 2016, 2028' },
  { slug: 'rooster', label: 'Rooster', cn: '鸡', sampleYears: '1969, 1981, 1993, 2005, 2017, 2029' },
  { slug: 'dog', label: 'Dog', cn: '狗', sampleYears: '1970, 1982, 1994, 2006, 2018, 2030' },
  { slug: 'pig', label: 'Pig', cn: '猪', sampleYears: '1971, 1983, 1995, 2007, 2019, 2031' },
];

const ZODIAC_2026_TIPS = {
  rat: 'Rats benefit from clarifying water paths in the North sector — career narrative and sleep hygiene matter in a fast Horse year.',
  ox: 'Ox natives thrive on steady earth tones; avoid over-committing in sectors holding conflict star 3 this year.',
  tiger: 'Tigers get visibility boosts when desk faces personal Sheng Qi — channel Horse-year momentum without burnout.',
  rabbit: 'Rabbits should watch romance sector stars (often SW) — freshen lighting and pair symbols if the corner feels stale.',
  dragon: 'Dragons align with Horse-year fire — celebrate wins publicly but soften sharp corners where star 7 visits.',
  snake: 'Snakes gain from quiet metal cures where Five Yellow rotates — plan renovation timing via the monthly heatmap.',
  horse: '2026 is your namesake year — visibility star 9 can amplify marketing and moves. Protect rest: headboard on Tian Yi, not Jue Ming.',
  goat: 'Goats stabilize with earth element in SW; partnership conversations face Yan Nian for best results.',
  monkey: 'Monkeys should leverage NW authority stars when present — network intentionally, declutter metal clutter if star 7 lands there.',
  rooster: 'Roosters benefit from metal accents when illness star 2 visits bedroom — keep routines, not panic.',
  dog: 'Dogs harmonize Horse fire with water accents in the North career path — avoid arguing in conflict-star sectors.',
  pig: 'Pigs welcome celebration energy in social zones — star 9 sectors are for hosting; still face Sheng Qi when earning.',
};

function compassCta(extra) {
  return `
<div class="compass-cta">
  <h3>Map it on your home</h3>
  <p>Free Ba Zhai compass plus 2026 flying star X-Ray preview — then unlock the full PDF.</p>
  <a href="/compass/" class="btn">Reveal my compass</a>
  <a href="/compass/xray/" class="btn btn-ghost" style="margin-left:8px;">Free X-Ray preview</a>
  <a href="/compass/order/" class="btn btn-ghost" style="margin-left:8px;">Full report — $39</a>
  <a href="/compass/heatmap/" class="btn btn-ghost" style="margin-left:8px;">2026 heatmap</a>
  ${extra || ''}
</div>`;
}

function pageShell({ title, description, canonical, body, schemaName }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description.replace(/"/g, '&quot;')}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400&family=Hanken+Grotesk:wght@400;500;600&family=Noto+Serif+SC:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/compass/shared.css">
<script src="/js/plausible-init.js"></script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"${schemaName.replace(/"/g, '\\"')}","description":"${description.replace(/"/g, '\\"')}","url":"${canonical}","publisher":{"@type":"Organization","name":"Guanlan Energy"}}
</script>
<style>
.article{padding:40px 0 20px;max-width:720px;}
.article h1{font-family:'Fraunces',serif;font-weight:300;font-size:clamp(2rem,4vw,2.6rem);line-height:1.12;margin-bottom:18px;}
.article h2{font-family:'Fraunces',serif;font-weight:400;font-size:1.35rem;margin:28px 0 10px;color:var(--ink);}
.article p{color:var(--ink-soft);margin-bottom:14px;line-height:1.65;}
.article .intro{font-size:1.05rem;}
.dir-table{width:100%;border-collapse:collapse;margin:20px 0;font-size:.92rem;}
.dir-table th,.dir-table td{border:1px solid var(--line);padding:10px 12px;text-align:left;}
.dir-table th{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);background:rgba(122,155,142,0.08);}
.kua-pill{display:inline-block;font-family:'IBM Plex Mono',monospace;font-size:11px;border:1px solid var(--brass);color:var(--brass);border-radius:999px;padding:4px 12px;margin-bottom:16px;}
</style>
</head>
<body>
<nav class="lc-nav">
  <a href="/compass/" class="lc-brand">
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18" stroke="#7A9B8E" stroke-width="1.1"/><circle cx="20" cy="20" r="2.4" fill="#A88A52"/></svg>
    <div class="name">The Living Compass<span>八宅 · Ba Zhai</span></div>
  </a>
  <div class="lc-nav-links">
    <a href="/compass/">Compass</a>
    <a href="/compass/xray/">X-Ray</a>
    <a href="/">MetaphysicFlow</a>
  </div>
</nav>
<main class="wrap article">
${body}
${compassCta()}
</main>
<footer class="lc-footer"><div class="wrap"><p><a href="/">MetaphysicFlow</a> · <a href="/privacy.html">Privacy</a></p></div></footer>
</body>
</html>`;
}

function writeKuaPage(num, data) {
  const canonical = `https://metaphysicflow.com/compass/kua/${num}`;
  const title = `Feng Shui Kua ${num} Lucky Directions · ${data.en}`;
  const description = `Kua ${num} (${data.han}) ${data.group} Group lucky directions: wealth ${data.wealth}, health ${data.health}, relationships ${data.love}. Personal Ba Zhai map — not generic tips.`;

  const body = `
<p class="eyebrow">Kua ${num} · ${data.han} · ${data.group} Group</p>
<span class="kua-pill">八宅命卦</span>
<h1>Feng Shui Kua ${num} lucky directions</h1>
<p class="intro"><span style="font-family:'Noto Serif SC',serif">${data.han}</span> · ${data.en}. ${data.char}</p>
<p>If your Ba Zhai Kua is <strong>${num}</strong>, your helpful directions are fixed — the same tips do not apply to someone with Kua ${num === 6 ? 1 : 6}. This page maps the four directions you should face (and four to avoid) for wealth, health, love, and stability.</p>

<h2>Your four allies · 四吉位</h2>
<table class="dir-table">
<thead><tr><th>Star</th><th>Sector</th><th>Use</th></tr></thead>
<tbody>
<tr><td>生气 Sheng Qi</td><td>${data.shengqi} · ${data.wealth}</td><td>Wealth &amp; vitality — face when working</td></tr>
<tr><td>天医 Tian Yi</td><td>${data.tianyi} · ${data.health}</td><td>Health — headboard wall</td></tr>
<tr><td>延年 Yan Nian</td><td>${data.yannian} · ${data.love}</td><td>Relationships — conversations</td></tr>
<tr><td>伏位 Fu Wei</td><td>${data.fuwei}</td><td>Stability — daily routines</td></tr>
</tbody>
</table>

<h2>Not sure if you're Kua ${num}?</h2>
<p>Kua is calculated from birth year (around Feb 4 solar boundary) and gender — not from zodiac alone. Use the free Living Compass to confirm your number in seconds.</p>
<p><a href="/compass/" class="btn">Calculate my Kua →</a></p>

<h2>Pair with your home's 2026 stars</h2>
<p>Personal directions tell you where <em>you</em> thrive. Annual flying stars tell you what energy sits in each room sector this year. <a href="/compass/xray/">Try the Energy X-Ray preview</a>.</p>`;

  const html = pageShell({ title, description, canonical, body, schemaName: title });
  const dir = path.join(ROOT, 'compass', 'kua');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${num}.html`), html);
  console.log('  kua/' + num + '.html');
}

function writeGuide(guide) {
  const canonical = `https://metaphysicflow.com/compass/guides/${guide.slug}`;
  const sectionsHtml = guide.sections.map((s) => `<h2>${s.h2}</h2><p>${s.p}</p>`).join('\n');
  const xray = guide.xrayCta
    ? '<p style="margin-top:20px;"><a href="/compass/xray/" class="btn btn-ghost">Preview 2026 flying stars on your photo →</a></p>'
    : '';
  const heatmap = guide.heatmapCta
    ? '<p style="margin-top:12px;"><a href="/compass/heatmap/" class="btn btn-ghost">Scrub the 2026 monthly heatmap →</a></p>'
    : '';

  const body = `
<p class="eyebrow">Living Compass guide</p>
<h1>${guide.h1}</h1>
<p class="intro">${guide.intro}</p>
${sectionsHtml}
${xray}
${heatmap}`;

  const html = pageShell({
    title: guide.title,
    description: guide.description,
    canonical,
    body,
    schemaName: guide.h1,
  });
  const dir = path.join(ROOT, 'compass', 'guides');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${guide.slug}.html`), html);
  console.log('  guides/' + guide.slug + '.html');
}

function writeYearFacing(dir) {
  const slug = `${dir.slug}-facing-house`;
  const canonical = `https://metaphysicflow.com/compass/2026/${slug}`;
  const title = `${FACING_YEAR} Flying Star Feng Shui for a ${dir.label}-Facing House`;
  const description = `${FACING_YEAR} annual and monthly flying stars for homes facing ${dir.label}. Where wealth, caution, and renovation risk land this year.`;

  const body = `
<p class="eyebrow">${FACING_YEAR} · 玄空飞星 · ${dir.label}</p>
<h1>${FACING_YEAR} flying stars for a ${dir.label.toLowerCase()}-facing house</h1>
<p class="intro">When your front door looks <strong>${dir.label.toLowerCase()}</strong>, the door sector carries the year's dominant star — and every other room inherits a different ${FACING_YEAR} energy signature.</p>
<h2>What sits at your door in ${FACING_YEAR}</h2>
<p>Use the free Energy X-Ray with facing set to <strong>${dir.code}</strong> to see the full nine-sector grid on your floor plan. The ${dir.label} sector is your facing palace — it sets the tone for visitors, opportunities, and how energy enters.</p>
<h2>Month-by-month shifts</h2>
<p>Annual stars are the baseline; monthly stars move caution and wealth zones through the home. Scrub the <a href="/compass/heatmap/">2026 home energy heatmap</a> to see when Five Yellow or Eight White land on your bedroom or office.</p>
<h2>Pair with your personal Kua</h2>
<p>Flying stars describe the <em>house</em>. Your Ba Zhai Kua describes <em>you</em>. A ${dir.label.toLowerCase()}-facing home can be excellent for one Kua and draining for another — calculate yours first.</p>
<p><a href="/compass/?facing=${dir.code}" class="btn">Calculate my Kua →</a></p>`;

  const html = pageShell({ title, description, canonical, body, schemaName: title });
  const outDir = path.join(ROOT, 'compass', '2026');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${slug}.html`), html);
  console.log('  2026/' + slug + '.html');
}

function writeFacingRoom(dir, room) {
  const slug = `${dir.slug}-${room.slug}`;
  const canonical = `https://metaphysicflow.com/compass/facing/${slug}`;
  const title = `Is a ${dir.label}-Facing ${room.title} Good Feng Shui?`;
  const description = `${dir.label}-facing ${room.title} feng shui — how annual flying stars and your personal Kua interact. Practical fixes without renovating.`;

  const body = `
<p class="eyebrow">Facing × room · ${dir.label} · ${room.title}</p>
<h1>Is a ${dir.label.toLowerCase()}-facing ${room.title.toLowerCase()} good feng shui?</h1>
<p class="intro">A ${dir.label.toLowerCase()}-facing home places the <strong>${room.title.toLowerCase()}</strong> in a specific sector of the bagua grid. Whether that sector is helpful or draining depends on <em>your personal Kua</em> and <em>this year's flying stars</em> — not a one-size rule.</p>
<p>${room.tip}</p>
<h2>Check two layers</h2>
<p><strong>1. Personal Ba Zhai</strong> — your birth year and gender resolve four lucky directions. A ${dir.label.toLowerCase()}-facing layout may align your ${room.title.toLowerCase()} with Tian Yi (health) or Jue Ming (draining) — only your Kua chart knows.</p>
<p><strong>2. ${FACING_YEAR} flying stars</strong> — each sector holds a different annual star. In ${FACING_YEAR} the center star is 7 Red; Five Yellow and Two Black rotate through rooms month by month.</p>
<p><a href="/compass/2026/${dir.slug}-facing-house" class="btn btn-ghost">${FACING_YEAR} stars for ${dir.label.toLowerCase()}-facing homes →</a></p>
<h2>Quick fixes without moving walls</h2>
<p>Adjust orientation (headboard wall, desk facing), add element cures for the star in that sector, and use the monthly heatmap to avoid renovating when Five Yellow visits your ${room.title.toLowerCase()} zone.</p>`;

  const html = pageShell({ title, description, canonical, body, schemaName: title });
  const outDir = path.join(ROOT, 'compass', 'facing');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${slug}.html`), html);
  console.log('  facing/' + slug + '.html');
}

function kuaSummary(kua, genderLabel) {
  const data = KUA_PAGES[kua];
  if (!data) return `<p>${genderLabel}: Kua ${kua} — <a href="/compass/">calculate exact directions</a>.</p>`;
  return `<p><strong>${genderLabel} · Kua ${kua}</strong> (${data.han} · ${data.group} Group) — wealth faces <strong>${data.wealth}</strong>, health headboard <strong>${data.health}</strong>, relationships <strong>${data.love}</strong>. <a href="/compass/kua/${kua}">Full Kua ${kua} map →</a></p>`;
}

function writeBirthYearPage(year) {
  const canonical = `https://metaphysicflow.com/compass/born/${year}`;
  const zodiac = zodiacForYear(year);
  const kuaM = kuaForBirthYear(year, 'male');
  const kuaF = kuaForBirthYear(year, 'female');
  const title = `Feng Shui for People Born in ${year} · Kua & Lucky Directions`;
  const description = `Born in ${year} (${zodiac})? Your Ba Zhai Kua differs by gender — men often Kua ${kuaM}, women Kua ${kuaF}. Personal lucky directions for wealth, sleep, and desk facing.`;

  const body = `
<p class="eyebrow">Birth year · ${year} · ${zodiac}</p>
<h1>Feng shui for people born in ${year}</h1>
<p class="intro">Searching "feng shui for ${year} births" lands you on generic tips. <strong>Eight Mansions (八宅)</strong> is personal: your Kua number comes from birth year <em>and gender</em>, then maps four lucky and four draining directions.</p>

<h2>Your likely Kua numbers</h2>
<p class="intro" style="font-size:.95rem;">Uses the classical solar-year formula (same as our free Living Compass). If you were born <strong>before Feb 4</strong>, you may belong to the prior year's chart — use the calculator with your exact date.</p>
${kuaSummary(kuaM, 'Man born in ' + year)}
${kuaSummary(kuaF, 'Woman born in ' + year)}

<h2>What to do with this</h2>
<ul style="color:var(--ink-soft);line-height:1.65;margin-bottom:16px;padding-left:1.2rem;">
  <li>Headboard on your <strong>Tian Yi (天医)</strong> wall for sleep and recovery</li>
  <li>Face <strong>Sheng Qi (生气)</strong> at your desk for momentum and income work</li>
  <li>Avoid sleeping toward <strong>Jue Ming (绝命)</strong> — your most draining bearing</li>
</ul>

<h2>Layer ${FACING_YEAR} flying stars on your home</h2>
<p>Your Kua tells you <em>which way to face</em>. Annual flying stars tell you <em>what energy sits in each room sector this year</em>. Map both on your floor plan with the free tools below.</p>
<p>
  <a href="/compass/?date=${year}-07-01&gender=female&auto=1" class="btn">Reveal my compass (sample date)</a>
</p>
<p style="font-size:.9rem;color:var(--ink-faint);">Opens the calculator with Jul 1, ${year} — change to your exact birthday for precision.</p>`;

  const html = pageShell({ title, description, canonical, body, schemaName: title });
  const outDir = path.join(ROOT, 'compass', 'born');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${year}.html`), html);
  console.log('  born/' + year + '.html');
}

function writeZodiac2026Page(z) {
  const canonical = `https://metaphysicflow.com/compass/2026/zodiac/${z.slug}`;
  const yearBadge = z.yearAnimal ? ' · Year of the Horse' : '';
  const title = `2026 Feng Shui for ${z.label} (${z.cn})${yearBadge}`;
  const description = `${z.label} (${z.cn}) feng shui in 2026 — Horse year flying stars, personal Kua directions, and practical cures. Sample birth years: ${z.sampleYears}.`;
  const tip = ZODIAC_2026_TIPS[z.slug];
  const horseNote = z.yearAnimal
    ? '<p><strong>2026 is your zodiac year (本命年).</strong> Visibility star 9 can amplify wins — but protect sleep and avoid overexposure in draining sectors. Headboard on Tian Yi, not Jue Ming.</p>'
    : '';

  const body = `
<p class="eyebrow">2026 · ${z.label} ${z.cn} · Horse year</p>
<h1>2026 feng shui for ${z.label.toLowerCase()} (${z.cn})</h1>
<p class="intro">Zodiac is one layer; <strong>Ba Zhai Kua</strong> is personal. Born in ${z.sampleYears}? Your lucky directions depend on exact birth date and gender — not the animal alone.</p>
${horseNote}
<h2>${z.label} in a Horse year</h2>
<p>${tip}</p>
<h2>Three layers to stack</h2>
<p><strong>1. Personal Kua</strong> — Sheng Qi for wealth work, Tian Yi for sleep, Yan Nian for partnership talks.</p>
<p><strong>2. 2026 flying stars</strong> — Five Yellow, Two Black, and star 9 rotate through room sectors month by month.</p>
<p><strong>3. Your home's facing</strong> — door direction sets the annual grid. <a href="/compass/heatmap/">Scrub the monthly heatmap</a> before renovating or signing leases.</p>
<p><a href="/compass/" class="btn">Calculate my Kua →</a> <a href="/compass/xray/" class="btn btn-ghost" style="margin-left:8px;">Free X-Ray preview</a></p>`;

  const html = pageShell({ title, description, canonical, body, schemaName: title });
  const outDir = path.join(ROOT, 'compass', '2026', 'zodiac');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${z.slug}.html`), html);
  console.log('  2026/zodiac/' + z.slug + '.html');
}

function writeZodiacHub() {
  const canonical = 'https://metaphysicflow.com/compass/2026/zodiac/';
  const cards = ZODIAC_2026.map((z) => {
    const badge = z.yearAnimal ? ' <span style="font-size:.75rem;color:var(--brass);">2026 year</span>' : '';
    return `<a class="guide-card" href="/compass/2026/zodiac/${z.slug}"><h2>${z.label} ${z.cn}${badge}</h2><p>${z.sampleYears}</p></a>`;
  }).join('\n    ');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>2026 Zodiac Feng Shui · Horse Year · All 12 Signs</title>
<meta name="description" content="2026 Horse year feng shui for all 12 Chinese zodiac signs — personal Kua, flying stars, and monthly heatmap tools on every page.">
<link rel="canonical" href="${canonical}">
<link rel="stylesheet" href="/compass/shared.css">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400&family=Hanken+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
.hero{padding:40px 0 20px;}
.hero h1{font-family:'Fraunces',serif;font-weight:300;font-size:clamp(2rem,4vw,2.6rem);}
.guide-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:28px 0;}
.guide-card{border:1px solid var(--line);border-radius:var(--radius);padding:18px;background:rgba(255,255,255,.4);text-decoration:none;color:inherit;display:block;transition:border-color .2s,background .2s;}
.guide-card:hover{border-color:var(--celadon);background:rgba(122,155,142,.08);}
.guide-card h2{font-family:'Fraunces',serif;font-size:1.05rem;margin-bottom:6px;color:var(--ink);}
.guide-card p{font-size:.88rem;color:var(--ink-soft);line-height:1.5;}
@media(max-width:900px){.guide-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:600px){.guide-grid{grid-template-columns:1fr;}}
</style>
</head>
<body>
<nav class="lc-nav">
  <a href="/compass/" class="lc-brand">
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18" stroke="#7A9B8E"/><circle cx="20" cy="20" r="2.4" fill="#A88A52"/></svg>
    <div class="name">The Living Compass<span>2026 Zodiac</span></div>
  </a>
  <div class="lc-nav-links">
    <a href="/compass/heatmap/">Heatmap</a>
    <a href="/compass/guides/">Guides</a>
    <a href="/compass/">Compass</a>
  </div>
</nav>
<main class="wrap">
  <header class="hero">
    <p class="eyebrow" style="margin-bottom:12px;">丙午 · Year of the Horse · 2026</p>
    <h1>2026 feng shui by zodiac sign</h1>
    <p style="color:var(--ink-soft);max-width:40em;line-height:1.6;">Each sign gets Horse-year context — then stack your personal Kua and home facing with the free tools below.</p>
  </header>
  <div class="guide-grid">
    ${cards}
  </div>
  <div class="compass-cta">
    <h3>Personal beats generic</h3>
    <p>Zodiac pages explain the year — the compass calculates your exact directions.</p>
    <a href="/compass/" class="btn">Reveal my compass</a>
    <a href="/compass/heatmap/" class="btn btn-ghost" style="margin-left:8px;">2026 heatmap</a>
  </div>
</main>
<footer class="lc-footer"><div class="wrap"><p><a href="/">MetaphysicFlow</a></p></div></footer>
</body>
</html>`;

  const outDir = path.join(ROOT, 'compass', '2026', 'zodiac');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  console.log('  2026/zodiac/index.html');
}

function collectSitemapUrls() {
  const base = 'https://metaphysicflow.com';
  const urls = [
    `${base}/compass/`,
    `${base}/compass/xray/`,
    `${base}/compass/order/`,
    `${base}/compass/heatmap/`,
    `${base}/compass/guides/`,
    `${base}/compass/2026/zodiac/`,
  ];
  Object.keys(KUA_PAGES).forEach((n) => urls.push(`${base}/compass/kua/${n}`));
  GUIDES.forEach((g) => urls.push(`${base}/compass/guides/${g.slug}`));
  ZODIAC_2026.forEach((z) => urls.push(`${base}/compass/2026/zodiac/${z.slug}`));
  DIRS.forEach((d) => {
    urls.push(`${base}/compass/2026/${d.slug}-facing-house`);
    ROOMS.forEach((r) => urls.push(`${base}/compass/facing/${d.slug}-${r.slug}`));
  });
  for (let y = BIRTH_YEAR_START; y <= BIRTH_YEAR_END; y += 1) {
    urls.push(`${base}/compass/born/${y}`);
  }
  return urls;
}

function syncSitemap(urls) {
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  let xml = fs.readFileSync(sitemapPath, 'utf8');
  xml = xml.replace(/<url>\s*<loc>https:\/\/metaphysicflow\.com\/compass\/[\s\S]*?<\/url>\s*/g, '');
  xml = xml.replace(/\s*<loc>https:\/\/metaphysicflow\.com\/compass\/[\s\S]*?<\/url>\s*/g, '');
  const lastmod = new Date().toISOString();
  const block = urls.map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`).join('\n');
  const marker = /  <url>\s*\n\s*<loc>https:\/\/metaphysicflow\.com\/forecast\.html<\/loc>/;
  if (!marker.test(xml)) {
    console.warn('Sitemap marker not found — skip sync');
    return;
  }
  xml = xml.replace(marker, block + '\n  <url>\n    <loc>https://metaphysicflow.com/forecast.html</loc>');
  fs.writeFileSync(sitemapPath, xml);
  console.log('  sitemap.xml updated (' + urls.length + ' compass URLs)');
}

console.log('Generating Living Compass SEO pages…');
Object.keys(KUA_PAGES).forEach((n) => writeKuaPage(n, KUA_PAGES[n]));
GUIDES.forEach(writeGuide);
DIRS.forEach((d) => {
  writeYearFacing(d);
  ROOMS.forEach((r) => writeFacingRoom(d, r));
});
for (let y = BIRTH_YEAR_START; y <= BIRTH_YEAR_END; y += 1) {
  writeBirthYearPage(y);
}
writeZodiacHub();
ZODIAC_2026.forEach(writeZodiac2026Page);
syncSitemap(collectSitemapUrls());
console.log('Done.');
