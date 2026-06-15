/**
 * Generate A-class Kua pages + B-class facing pages for compass SEO.
 * Data: MANSIONS / KUA_INFO (Ba Zhai) + ANNUAL_2026 (Xuan Kong).
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const KUA_DIR = path.join(ROOT, 'compass/kua');
const FACING_DIR = path.join(ROOT, 'compass/facing');

const DIR_NAME = {
  N: 'North', NE: 'Northeast', E: 'East', SE: 'Southeast',
  S: 'South', SW: 'Southwest', W: 'West', NW: 'Northwest',
};

const STARS = {
  shengqi: { cn: '生氣', en: 'Sheng Qi', label: 'Wealth & Vitality', good: true,
    advice: 'Face this way when you work. Ideal for your main door, desk, and where you take action.' },
  tianyi: { cn: '天醫', en: 'Tian Yi', label: 'Health & Recovery', good: true,
    advice: 'Best wall for your bed headboard. Supports rest, healing, and a nourishing kitchen.' },
  yannian: { cn: '延年', en: 'Yan Nian', label: 'Love & Relationships', good: true,
    advice: 'Face here in heartfelt conversations. Strengthens bonds and patience.' },
  fuwei: { cn: '伏位', en: 'Fu Wei', label: 'Stability & Focus', good: true,
    advice: 'Calm grounding energy. Great for study, meditation, or steady deep work.' },
  huohai: { cn: '禍害', en: 'Huo Hai', label: 'Minor Setbacks', good: false,
    advice: 'Small frustrations gather here. Fine for a hallway or closet — not your bed.' },
  liusha: { cn: '六煞', en: 'Liu Sha', label: 'Stress & Friction', good: false,
    advice: 'Tension pools here. Avoid sleeping or working facing this direction.' },
  wugui: { cn: '五鬼', en: 'Wu Gui', label: 'Conflict & Instability', good: false,
    advice: 'Arguments and misplaced things. Best for storage or a bathroom.' },
  jueming: { cn: '絕命', en: 'Jue Ming', label: 'Greatest Drain', good: false,
    advice: 'Most draining direction. Never bed or desk — toilet or storage is fine.' },
};

const MANSIONS = {
  1: { shengqi: 'SE', tianyi: 'E', yannian: 'S', fuwei: 'N', huohai: 'W', wugui: 'NE', liusha: 'NW', jueming: 'SW' },
  2: { shengqi: 'NE', tianyi: 'W', yannian: 'NW', fuwei: 'SW', huohai: 'E', wugui: 'SE', liusha: 'S', jueming: 'N' },
  3: { shengqi: 'S', tianyi: 'N', yannian: 'SE', fuwei: 'E', huohai: 'SW', wugui: 'NW', liusha: 'NE', jueming: 'W' },
  4: { shengqi: 'N', tianyi: 'S', yannian: 'E', fuwei: 'SE', huohai: 'NE', wugui: 'SW', liusha: 'W', jueming: 'NW' },
  6: { shengqi: 'W', tianyi: 'NE', yannian: 'SW', fuwei: 'NW', huohai: 'SE', wugui: 'S', liusha: 'N', jueming: 'E' },
  7: { shengqi: 'NW', tianyi: 'SW', yannian: 'NE', fuwei: 'W', huohai: 'N', wugui: 'E', liusha: 'SE', jueming: 'S' },
  8: { shengqi: 'SW', tianyi: 'NW', yannian: 'W', fuwei: 'NE', huohai: 'S', wugui: 'N', liusha: 'E', jueming: 'SE' },
  9: { shengqi: 'E', tianyi: 'SE', yannian: 'N', fuwei: 'S', huohai: 'NW', wugui: 'W', liusha: 'SW', jueming: 'NE' },
};

const KUA_INFO = {
  1: { han: '坎', en: 'Kan · The Water', group: 'East', element: 'Water',
    char: 'A deep current — adaptable, intuitive, quietly relentless in finding your way through.' },
  2: { han: '坤', en: 'Kun · The Earth', group: 'West', element: 'Earth',
    char: 'Steady and nourishing — the one people lean on, strongest when patient.' },
  3: { han: '震', en: 'Zhen · The Thunder', group: 'East', element: 'Thunder',
    char: 'A spark of initiative — fast, expressive, happiest when starting things.' },
  4: { han: '巽', en: 'Xun · The Wind', group: 'East', element: 'Wind',
    char: 'Gentle but far-reaching — persuasive, flexible, you move people without force.' },
  6: { han: '乾', en: 'Qian · The Heaven', group: 'West', element: 'Heaven',
    char: 'A natural strategist — clear-eyed, principled, built to lead from the front.' },
  7: { han: '兌', en: 'Dui · The Lake', group: 'West', element: 'Lake',
    char: 'Warm and magnetic — you connect, charm, and bring ease wherever you land.' },
  8: { han: '艮', en: 'Gen · The Mountain', group: 'West', element: 'Mountain',
    char: 'Grounded and still — thoughtful, self-contained, immovable once decided.' },
  9: { han: '離', en: 'Li · The Fire', group: 'East', element: 'Fire',
    char: 'Bright and visible — passionate, illuminating, you draw the eye and the room.' },
};

const KUA_META = {
  1: { h1: 'Kua 1 — The Water: Your Personal Feng Shui Directions', keyword: 'feng shui kua number 1' },
  2: { h1: 'Kua 2 — The Earth: Your Personal Feng Shui Directions', keyword: 'feng shui kua number 2' },
  3: { h1: 'Kua 3 — The Thunder: Your Personal Feng Shui Directions', keyword: 'feng shui kua number 3' },
  4: { h1: 'Kua 4 — The Wind: Your Personal Feng Shui Directions', keyword: 'feng shui kua number 4' },
  6: { h1: 'Kua 6 — The Heaven: Your Personal Feng Shui Directions', keyword: 'feng shui kua number 6' },
  7: { h1: 'Kua 7 — The Lake: Your Personal Feng Shui Directions', keyword: 'feng shui kua number 7' },
  8: { h1: 'Kua 8 — The Mountain: Your Personal Feng Shui Directions', keyword: 'feng shui kua number 8' },
  9: { h1: 'Kua 9 — The Fire: Your Personal Feng Shui Directions', keyword: 'feng shui kua number 9' },
};

const ANNUAL_2026 = {
  center: 2, NW: 3, W: 4, NE: 5, S: 6, N: 7, SW: 8, E: 9, SE: 1,
};

const STAR_INFO = {
  1: { cn: '一白', en: 'One White', label: 'Career & growth', nature: 'good', element: 'Water',
    short: 'Networking and career momentum — activate with water or focused work.' },
  2: { cn: '二黑', en: 'Two Black', label: 'Illness & worry', nature: 'bad', element: 'Earth',
    short: 'Illness star — metal cures, cleanliness, keep quiet.' },
  3: { cn: '三碧', en: 'Three Jade', label: 'Conflict & noise', nature: 'bad', element: 'Wood',
    short: 'Arguments and lawsuits — warm light, reduce noise.' },
  4: { cn: '四綠', en: 'Four Green', label: 'Romance & study', nature: 'mixed', element: 'Wood',
    short: 'Study and romance — plants and soft green, moderate water.' },
  5: { cn: '五黄', en: 'Five Yellow', label: 'Misfortune', nature: 'bad', element: 'Earth',
    short: 'Most dangerous annual star — no renovation, metal only, stillness.' },
  6: { cn: '六白', en: 'Six White', label: 'Authority & mentors', nature: 'good', element: 'Metal',
    short: 'Windfall and mentor luck — declutter, metal accents.' },
  7: { cn: '七赤', en: 'Seven Red', label: 'Theft & sharp edges', nature: 'bad', element: 'Metal',
    short: 'Gossip and financial leakage — water tones, soften corners.' },
  8: { cn: '八白', en: 'Eight White', label: 'Wealth & momentum', nature: 'good', element: 'Earth',
    short: 'Prime wealth star — earth tones, active income work.' },
  9: { cn: '九紫', en: 'Nine Purple', label: 'Celebration & visibility', nature: 'good', element: 'Fire',
    short: 'Period 9 celebration star — lights, social visibility.' },
};

const FACING_PAGES = [
  { slug: 'north-facing', dir: 'N', label: 'North' },
  { slug: 'northeast-facing', dir: 'NE', label: 'Northeast' },
  { slug: 'east-facing', dir: 'E', label: 'East' },
  { slug: 'southeast-facing', dir: 'SE', label: 'Southeast' },
  { slug: 'south-facing', dir: 'S', label: 'South' },
  { slug: 'southwest-facing', dir: 'SW', label: 'Southwest' },
  { slug: 'west-facing', dir: 'W', label: 'West' },
  { slug: 'northwest-facing', dir: 'NW', label: 'Northwest' },
];

const NAV = `
<nav class="lc-nav">
  <a href="/compass/" class="lc-brand">
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18" stroke="#7A9B8E" stroke-width="1.1"/><circle cx="20" cy="20" r="2.4" fill="#A88A52"/></svg>
    <div class="name">The Living Compass<span>静水流深 · feng shui</span></div>
  </a>
  <div class="lc-nav-links">
    <a href="/compass/#how">How it reads you</a>
    <a href="/compass/xray/">Energy X-Ray</a>
    <a href="/compass/family/">Family</a>
    <a href="/compass/moving/">Moving days</a>
    <a href="/compass/tools/">All tools</a>
    <a href="/compass/share/">Share</a>
    <a href="/compass/heatmap/">2026 Heatmap</a>
    <a href="/compass/order/">Reports</a>
    <a href="/compass/guides/">Guides</a>
    <a href="/" class="lc-nav-mf">MetaphysicFlow</a>
  </div>
</nav>`;

const STYLES = `
<style>
.article{padding:40px 0 20px;max-width:720px;}
.article h1{font-family:'Fraunces',serif;font-weight:300;font-size:clamp(2rem,4vw,2.6rem);line-height:1.12;margin-bottom:18px;}
.article h2{font-family:'Fraunces',serif;font-weight:400;font-size:1.35rem;margin:28px 0 10px;color:var(--ink);}
.article p,.article li{color:var(--ink-soft);margin-bottom:14px;line-height:1.65;}
.article .intro{font-size:1.05rem;}
.dir-table{width:100%;border-collapse:collapse;margin:20px 0;font-size:.92rem;}
.dir-table th,.dir-table td{border:1px solid var(--line);padding:10px 12px;text-align:left;vertical-align:top;}
.dir-table th{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);background:rgba(122,155,142,0.08);}
.breadcrumb{font-size:13px;color:var(--ink-faint);margin-bottom:24px;}
.breadcrumb a{color:var(--ink-soft);text-decoration:none;}
.kua-links,.facing-links{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0;}
.kua-links a,.facing-links a{font-size:13px;padding:6px 12px;border:1px solid var(--line);border-radius:999px;color:var(--ink-soft);text-decoration:none;}
details{border:1px solid var(--line);border-radius:10px;padding:14px 18px;margin:12px 0;background:rgba(255,255,255,.3);}
details summary{font-weight:600;cursor:pointer;color:var(--ink);}
.cta-box{border:1px solid rgba(31,42,38,0.12);border-radius:14px;padding:24px;text-align:center;margin:32px 0;background:rgba(122,155,142,0.06);}
</style>`;

const HEAD_LINKS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400&family=Hanken+Grotesk:wght@400;500;600&family=Noto+Serif+SC:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/compass/shared.css">
<script src="/js/plausible-init.js"></script>`;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function kuaCta() {
  return `
<div class="cta-box">
  <p style="font-family:'Fraunces',serif;font-size:1.3rem;font-style:italic;margin-bottom:8px;color:var(--ink);">Don't know your Kua number?</p>
  <p style="font-size:.95rem;color:#3C4A45;margin-bottom:16px;">Enter your birth date and get your personal compass — free, instant, no sign-up.</p>
  <a href="/compass/" style="display:inline-block;font-family:'Hanken Grotesk',sans-serif;font-size:15px;font-weight:600;color:#EAE7DF;background:#1F2A26;border-radius:999px;padding:14px 30px;text-decoration:none;">Calculate My Kua — Free</a>
</div>`;
}

function xrayCta() {
  return `
<div class="cta-box">
  <p style="font-family:'Fraunces',serif;font-size:1.3rem;font-style:italic;margin-bottom:8px;color:var(--ink);">See the stars on YOUR floor plan</p>
  <p style="font-size:.95rem;color:#3C4A45;margin-bottom:16px;">Upload your layout and get the 2026 energy map overlaid — free preview, full cures from $39.</p>
  <a href="/compass/xray/" style="display:inline-block;font-family:'Hanken Grotesk',sans-serif;font-size:15px;font-weight:600;color:#EAE7DF;background:#1F2A26;border-radius:999px;padding:14px 30px;text-decoration:none;">Try Energy X-Ray — Free</a>
</div>`;
}

function starTableRows(keys) {
  return keys.map((key) => {
    const st = STARS[key];
    const dir = MANSIONS[keys.kua][key];
    return `<tr><td>${st.en} (${st.cn})</td><td>${DIR_NAME[dir]} · ${dir}</td><td>${st.label}</td><td>${st.advice}</td></tr>`;
  }).join('');
}

function buildKuaPage(num) {
  const info = KUA_INFO[num];
  const meta = KUA_META[num];
  const map = MANSIONS[num];
  const goodKeys = ['shengqi', 'tianyi', 'yannian', 'fuwei'];
  const badKeys = ['huohai', 'liusha', 'wugui', 'jueming'];
  const canonical = `https://metaphysicflow.com/compass/kua/kua-${num}.html`;
  const title = `${meta.h1} | The Living Compass`;
  const desc = `Kua ${num} (${info.han}) ${info.group} Group — personal lucky directions for wealth, health, love, and stability. Ba Zhai map with practical tips.`;

  const goodRows = goodKeys.map((key) => {
    const st = STARS[key];
    const dir = map[key];
    return `<tr><td>${st.en} (${st.cn})</td><td>${DIR_NAME[dir]} · ${dir}</td><td>${st.label}</td><td>${st.advice}</td></tr>`;
  }).join('');

  const badRows = badKeys.map((key) => {
    const st = STARS[key];
    const dir = map[key];
    return `<tr><td>${st.en} (${st.cn})</td><td>${DIR_NAME[dir]} · ${dir}</td><td>${st.label}</td><td>${st.advice}</td></tr>`;
  }).join('');

  const kuaLinks = Object.keys(KUA_META)
    .filter((n) => Number(n) !== num)
    .map((n) => `<a href="/compass/kua/kua-${n}.html">Kua ${n}</a>`)
    .join('');

  const faqs = [
    {
      q: `What is Kua ${num} in feng shui?`,
      a: `Kua ${num} is ${info.en} (${info.han}) in Ba Zhai feng shui — an ${info.group} Group life gua. Your four lucky directions differ from other Kua numbers; this page lists yours specifically.`,
    },
    {
      q: `Is Kua ${num} East or West Group?`,
      a: `Kua ${num} belongs to the ${info.group} Group (${info.group === 'East' ? '1, 3, 4, 9' : '2, 6, 7, 8'} share compatible directions). ${info.group === 'East' ? 'West' : 'East'} Group Kuas use a different direction map.`,
    },
    {
      q: 'Which direction should my bed face if I am Kua ' + num + '?',
      a: `Headboard toward ${DIR_NAME[map.tianyi]} (${map.tianyi}) — your Tian Yi (天醫) health direction. Face ${DIR_NAME[map.shengqi]} (${map.shengqi}) when working at your desk for Sheng Qi (生氣) wealth energy.`,
    },
  ];

  const faqHtml = faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
  const faqLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  });

  const howToUse = `
<p>For <strong>Kua ${num}</strong>, treat directions as action lines — not superstition, but where your body points when you sleep, work, and enter the home.</p>
<ul>
<li><strong>Bed:</strong> Headboard on the ${DIR_NAME[map.tianyi]} wall (${map.tianyi}) — Tian Yi (天醫) supports recovery and deep sleep.</li>
<li><strong>Desk:</strong> Face ${DIR_NAME[map.shengqi]} (${map.shengqi}) when working — Sheng Qi (生氣) is your strongest wealth-and-action line.</li>
<li><strong>Main door:</strong> If you can choose, an entrance opening toward ${DIR_NAME[map.shengqi]} or ${DIR_NAME[map.fuwei]} (${map.fuwei}) welcomes supportive energy. Avoid aligning the door with ${DIR_NAME[map.jueming]} (${map.jueming}).</li>
<li><strong>Conversations:</strong> Face ${DIR_NAME[map.yannian]} (${map.yannian}) for relationship talks — Yan Nian (延年) softens friction.</li>
</ul>
<p>Annual 2026 flying stars still matter: a personally lucky direction can host Five Yellow this year. Overlay both maps on <a href="/compass/xray/">Energy X-Ray</a> or read the <a href="/compass/2026-flying-stars.html">2026 flying star forecast</a>.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow">
<meta property="og:title" content="${esc(meta.h1)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="article">
${HEAD_LINKS}
<script type="application/ld+json">${faqLd}</script>
${STYLES}
</head>
<body>
${NAV}
<main class="wrap article">
<nav class="breadcrumb"><a href="/">Home</a> › <a href="/compass/">The Living Compass</a> › <a href="/compass/kua/kua-${num}.html">Kua ${num}</a></nav>
<p class="eyebrow">Ba Zhai · 八宅 · Kua ${num}</p>
<h1>${esc(meta.h1)}</h1>
<p class="intro"><span style="font-family:'Noto Serif SC',serif">${info.han}</span> · ${info.en}. ${info.char}</p>
<p>If your personal Kua is <strong>${num}</strong>, you belong to the <strong>${info.group} Group</strong> (东四命 / 西四命). Your four auspicious directions — and four to soften — are fixed. Someone with Kua ${info.group === 'East' ? '6' : '1'} gets a completely different map. This page is only for Kua ${num}.</p>

<h2>Your four auspicious directions · 四吉位</h2>
<table class="dir-table">
<thead><tr><th>Star</th><th>Direction</th><th>Meaning</th><th>Practical use</th></tr></thead>
<tbody>${goodRows}</tbody>
</table>

<h2>Your four directions to soften · 四凶位</h2>
<table class="dir-table">
<thead><tr><th>Star</th><th>Direction</th><th>Meaning</th><th>Practical use</th></tr></thead>
<tbody>${badRows}</tbody>
</table>

<h2>How to use your Kua ${num} directions</h2>
${howToUse}

${kuaCta()}

<p class="kua-links" aria-label="Other Kua numbers">${kuaLinks}</p>
<p>Also see: <a href="/compass/2026-flying-stars.html">2026 flying stars</a> · <a href="/compass/xray/">Energy X-Ray</a> · <a href="/compass/order/">Full report $39</a></p>

<h2>FAQ</h2>
${faqHtml}

<nav class="breadcrumb" style="margin-top:32px;"><a href="/">Home</a> › <a href="/compass/">The Living Compass</a> › Kua ${num}</nav>
</main>
<footer class="lc-footer"><div class="wrap"><p><a href="/">MetaphysicFlow</a> · <a href="/privacy.html">Privacy</a></p></div></footer>
</body>
</html>`;
}

function buildFacingPage({ slug, dir, label }) {
  const doorStar = ANNUAL_2026[dir];
  const doorInfo = STAR_INFO[doorStar];
  const canonical = `https://metaphysicflow.com/compass/facing/${slug}.html`;
  const h1 = `${label}-Facing House Feng Shui: 2026 Flying Star Guide`;
  const title = `${h1} | The Living Compass`;
  const desc = `${label}-facing house feng shui 2026: door star ${doorStar} ${doorInfo.en}, full nine-sector map, free cures, and floor-plan overlay.`;

  const sectors = [
    { key: 'center', label: 'Center · 中宫' },
    { key: 'NW', label: 'Northwest · 西北' },
    { key: 'W', label: 'West · 正西' },
    { key: 'NE', label: 'Northeast · 东北' },
    { key: 'S', label: 'South · 正南' },
    { key: 'N', label: 'North · 正北' },
    { key: 'SW', label: 'Southwest · 西南' },
    { key: 'E', label: 'East · 正东' },
    { key: 'SE', label: 'Southeast · 東南' },
  ];

  const gridRows = sectors.map(({ key, label: lbl }) => {
    const n = ANNUAL_2026[key];
    const si = STAR_INFO[n];
    return `<tr><td>${lbl}</td><td>${n} · ${si.en} (${si.cn})</td><td>${si.element}</td><td>${si.short}</td></tr>`;
  }).join('');

  const sorted = sectors
    .filter((s) => s.key !== 'center')
    .map((s) => ({ ...s, star: ANNUAL_2026[s.key], info: STAR_INFO[ANNUAL_2026[s.key]] }));
  const best = sorted.filter((s) => s.info.nature === 'good').sort((a, b) => b.star - a.star).slice(0, 2);
  const worst = sorted.filter((s) => s.info.nature === 'bad').sort((a, b) => {
    if (a.star === 5) return -1;
    if (b.star === 5) return 1;
    return b.star - a.star;
  }).slice(0, 2);

  const overview = `
<p>In 2026, a <strong>${label.toLowerCase()}-facing</strong> home opens toward ${label} — your entrance sits in the <strong>${doorInfo.en} (${doorInfo.cn})</strong> sector: ${doorInfo.short}</p>
<p><strong>Strongest zones this year:</strong> ${best.map((b) => `${b.label.split('·')[0].trim()} (${b.info.en})`).join('; ')}.</p>
<p><strong>Handle with care:</strong> ${worst.map((w) => `${w.label.split('·')[0].trim()} (${w.info.en})`).join('; ')} — especially if those sectors are bedrooms or kitchens.</p>`;

  const cures = [];
  if (ANNUAL_2026.NE === 5) {
    cures.push(`<li><strong>Northeast Five Yellow:</strong> No digging or demolition in the northeast. Add brass or six coins; keep the zone quiet if it is a bedroom.</li>`);
  }
  if (doorStar === 5) {
    cures.push(`<li><strong>Five Yellow at your door:</strong> Your entrance carries misfortune energy — metal at the door, bright light, no clutter. Delay major entrance renovations.</li>`);
  } else if (doorStar === 2 || doorStar === 7) {
    cures.push(`<li><strong>Caution at the entrance:</strong> ${doorInfo.en} at the door — keep shoes and clutter cleared; metal/white decor at the threshold.</li>`);
  }
  if (ANNUAL_2026.center === 2) {
    cures.push(`<li><strong>Two Black in the center:</strong> The heart of the home feels heavy — declutter hallways and the center of the floor plan; avoid loud renovation in the middle of the house.</li>`);
  }
  cures.push(`<li><strong>Activate the east:</strong> Nine Purple (九紫) in the East — warm lighting and social spaces on the east side boost Period 9 luck.</li>`);
  const cureList = cures.slice(0, 3).join('');

  const watchTeaser = `<p>Your ${label.toLowerCase()} facing fixes the <em>door</em> star — but which star sits on <em>your</em> master bedroom, children's room, or home office depends on the full layout. That room-level map is what the <a href="/compass/order/">$39 full home report</a> delivers — sector cures tailored to your Kua and floor plan.</p>`;

  const facingLinks = FACING_PAGES
    .filter((p) => p.slug !== slug)
    .map((p) => `<a href="/compass/facing/${p.slug}.html">${p.label}</a>`)
    .join('');

  const faqs = [
    {
      q: `What flying star is at the door of a ${label.toLowerCase()}-facing house in 2026?`,
      a: `${doorInfo.en} (${doorInfo.cn}) — star ${doorStar}. ${doorInfo.short}`,
    },
    {
      q: `Where is Five Yellow in 2026 for my ${label.toLowerCase()}-facing home?`,
      a: `Five Yellow sits in the Northeast sector of every home in 2026. For a ${label.toLowerCase()}-facing house, check whether your bedroom or kitchen occupies northeast on your actual floor plan.`,
    },
    {
      q: 'Should I renovate my ' + label.toLowerCase() + '-facing house in 2026?',
      a: `Avoid renovation in the Northeast (Five Yellow) and any sector holding stars 2, 5, or 7 this year. Upload your layout on Energy X-Ray to see which rooms are affected before you drill.`,
    },
  ];

  const faqHtml = faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
  const faqLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  });

  const doorRow = `<tr><td><strong>Your front door (${label})</strong></td><td>${doorStar} · ${doorInfo.en} (${doorInfo.cn})</td><td>${doorInfo.element}</td><td>${doorInfo.short}</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow">
<meta property="og:title" content="${esc(h1)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="article">
${HEAD_LINKS}
<script type="application/ld+json">${faqLd}</script>
${STYLES}
</head>
<body>
${NAV}
<main class="wrap article">
<nav class="breadcrumb"><a href="/">Home</a> › <a href="/compass/">The Living Compass</a> › <a href="/compass/2026-flying-stars.html">2026 Stars</a> › ${label}</nav>
<p class="eyebrow">2026 Flying Stars · ${label} facing</p>
<h1>${esc(h1)}</h1>
<p class="intro">Stand inside, look out through your main door — if you face <strong>${label}</strong>, your home is ${label.toLowerCase()}-facing. In 2026 (Bing Wu / Year of the Fire Horse), annual stars overlay the same nine sectors worldwide; your facing direction sets which star greets you at the threshold.</p>

<h2>2026 star at your front door</h2>
<table class="dir-table">
<thead><tr><th>Sector</th><th>2026 star</th><th>Element</th><th>Meaning</th></tr></thead>
<tbody>${doorRow}</tbody>
</table>

<h2>Full 2026 nine-sector map (all ${label.toLowerCase()}-facing homes)</h2>
<table class="dir-table">
<thead><tr><th>Sector</th><th>Star</th><th>Element</th><th>Overview</th></tr></thead>
<tbody>${gridRows}</tbody>
</table>

<h2>Nine-sector overview for ${label.toLowerCase()}-facing homes</h2>
${overview}

<h2>Three free cures to apply now</h2>
<ul>${cureList}</ul>

<h2>Areas worth a closer look</h2>
${watchTeaser}

${xrayCta()}

<p class="facing-links" aria-label="Other facing directions">${facingLinks}</p>
<p>Also see: <a href="/compass/2026-flying-stars.html">2026 flying star forecast</a> · <a href="/compass/">Living Compass</a> · <a href="/compass/heatmap/">Monthly heatmap</a></p>

<h2>FAQ</h2>
${faqHtml}

<nav class="breadcrumb" style="margin-top:32px;"><a href="/">Home</a> › <a href="/compass/">The Living Compass</a> › ${label} facing</nav>
</main>
<footer class="lc-footer"><div class="wrap"><p><a href="/">MetaphysicFlow</a> · <a href="/privacy.html">Privacy</a></p></div></footer>
</body>
</html>`;
}

// Generate A class
for (const num of Object.keys(KUA_META)) {
  const file = path.join(KUA_DIR, `kua-${num}.html`);
  fs.writeFileSync(file, buildKuaPage(Number(num)), 'utf8');
  console.log('wrote', file);
}

// Generate B class
fs.mkdirSync(FACING_DIR, { recursive: true });
for (const page of FACING_PAGES) {
  const file = path.join(FACING_DIR, `${page.slug}.html`);
  fs.writeFileSync(file, buildFacingPage(page), 'utf8');
  console.log('wrote', file);
}

console.log('Done: 8 Kua + 8 facing pages');

const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const newUrls = [
  'https://metaphysicflow.com/compass/2026-flying-stars.html',
  ...Object.keys(KUA_META).map((n) => `https://metaphysicflow.com/compass/kua/kua-${n}.html`),
  ...FACING_PAGES.map((p) => `https://metaphysicflow.com/compass/facing/${p.slug}.html`),
];
let sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
const lastmod = new Date().toISOString().slice(0, 10);
for (const loc of newUrls) {
  if (sitemap.includes(loc)) continue;
  const entry = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.75</priority>\n  </url>\n`;
  sitemap = sitemap.replace('</urlset>', entry + '</urlset>');
}
fs.writeFileSync(SITEMAP_PATH, sitemap);
console.log('sitemap.xml: ensured', newUrls.length, 'SEO landing URLs');
