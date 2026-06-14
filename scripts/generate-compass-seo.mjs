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
];

function compassCta(extra) {
  return `
<div class="compass-cta">
  <h3>See your personal compass</h3>
  <p>Free Ba Zhai calculator — your four lucky directions and four to avoid, mapped on a living compass.</p>
  <a href="/compass/" class="btn">Reveal my compass</a>
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

  const body = `
<p class="eyebrow">Living Compass guide</p>
<h1>${guide.h1}</h1>
<p class="intro">${guide.intro}</p>
${sectionsHtml}
${xray}`;

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

console.log('Generating Living Compass SEO pages…');
Object.keys(KUA_PAGES).forEach((n) => writeKuaPage(n, KUA_PAGES[n]));
GUIDES.forEach(writeGuide);
console.log('Done.');
