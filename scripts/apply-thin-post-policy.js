#!/usr/bin/env node
/**
 * Thin post policy: <150 words → noindex; 150-299 → expand with H2s + links.
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const root = path.join(__dirname, '..');
const blogDir = path.join(root, 'blog');
const NOINDEX_MAX = 149;
const THIN_MAX = 299;
const TARGET_MIN = 400;

const EXPANSIONS = {
  'purple-star-astrology-vs-western-astrology.html': `
  <h2>What does Purple Star Astrology mean in your Life Palace?</h2>
  <p>In Zi Wei Dou Shu, the Life Palace (命宮) anchors identity, temperament, and the star that colors every other palace reading. Western Sun-sign language describes ego expression; Purple Star Astrology describes which imperial star governs your fate board — Purple Emperor, Strategist, Commander, and twelve other archetypes — with far more granular palace context than a single tropical sign.</p>
  <h2>How does Zi Wei Dou Shu affect career timing compared to Western transits?</h2>
  <p>Western career insight often comes from Saturn transits and tenth-house progressions. Zi Wei maps vocation through the Career Palace (官祿宮), Major Cycles (大限), and annual overlays — useful when you need decade-scale vocational arcs, not just year-by-year mood shifts. <a href="/free-chart.html">Generate your fate map</a> free, then compare with a <a href="/#pricing">professional Zi Wei Dou Shu reading</a> when you want written timing windows.</p>`,
  'metaphysical-timeline-bazi.html': `
  <h2>What does your BaZi timeline mean in Zi Wei Dou Shu?</h2>
  <p>BaZi Four Pillars describe elemental cycles and day-master strength; Zi Wei Dou Shu maps those cycles onto twelve life domains with fourteen major stars. Used together, BaZi answers <em>when</em> elemental pressure peaks while Purple Star Astrology answers <em>where</em> in life — wealth, love, career — the pressure lands.</p>
  <h2>How does Purple Star Astrology affect major life transitions?</h2>
  <p>Major Cycles shift palace emphasis every ten years; annual fortune layers add month-level timing. If your metaphysical timeline feels chaotic, start with a <a href="/free-chart.html">Zi Wei Dou Shu calculator</a> preview, then deepen with a <a href="/bazi-calculator.html">BaZi eight characters chart</a> for elemental balance.</p>`,
  'desk-feng-shui-founders.html': `
  <h2>What does desk command position mean for career energy in Zi Wei Dou Shu?</h2>
  <p>Feng Shui command position mirrors the Career Palace theme in Purple Star Astrology: visibility, authority, and control of your professional narrative. Founders with strong Career Palace stars tolerate open-plan chaos better; others need literal backing support — wall, screen, or anchor — to express natal authority.</p>
  <h2>How does workspace layout affect wealth palace activation?</h2>
  <p>Wealth Palace (財帛宮) in Zi Wei Dou Shu describes how resources flow toward you, not just how hard you grind. Pair desk corrections with a <a href="/free-chart.html">free Purple Star chart</a> to see whether your Wealth Palace favors accumulation, risk, or partnership income. Explore <a href="/#pricing">written palace readings</a> when ready for a full audit.</p>`,
  'feng-shui-career-path-birth-element.html': `
  <h2>What does your birth element mean for career path in Zi Wei Dou Shu?</h2>
  <p>Five Elements in BaZi describe day-master balance; Zi Wei Dou Shu places career vocation inside the Career Palace with specific stars — Commander, Strategist, Emperor — that refine how your element expresses at work. Element alone cannot tell you whether you lead, advise, or build behind the scenes.</p>
  <h2>How does Purple Star Astrology affect long-term vocation choices?</h2>
  <p>Major Cycles rotate emphasis across palaces every decade; a Wood-heavy chart in a Metal Cycle year feels different from the same chart in a Fire Cycle. <a href="/free-chart.html">Generate your Zi Wei Dou Shu chart</a> to see Career + Wealth palace highlights, or order a <a href="/#pricing">Life Palace deep dive</a> for personalized guidance.</p>`,
  'feng-shui-zoom-meeting-energy.html': `
  <h2>What does virtual meeting energy mean for your Career Palace?</h2>
  <p>Remote work compresses Career Palace signals into camera frame and voice tone — the modern equivalent of ming tang (bright hall) in classical Feng Shui. Zi Wei readers watch whether Career Palace stars favor visibility (Sun, Emperor) or backstage strategy (Strategist, Oracle).</p>
  <h2>How does Zi Wei Dou Shu guide professional presence on video calls?</h2>
  <p>Annual fortune overlays can flag years when self-promotion helps versus years when overexposure backfires. Start with our <a href="/free-chart.html">Purple Star calculator</a> for instant Career palace context, then book a <a href="/#pricing">Zi Wei Dou Shu consultation</a> if you want cycle-specific coaching.</p>`,
  'home-office-energy-flow.html': `
  <h2>What does home office energy flow mean in Purple Star Astrology?</h2>
  <p>The Property Palace (田宅宮) and Career Palace interact when work happens at home — spatial energy and natal vocation map must align or friction shows up as procrastination, irritability, or creative blocks. Purple Star Astrology names which palace is activated during WFH seasons.</p>
  <h2>How does Zi Wei Dou Shu affect productivity at home?</h2>
  <p>Stars in the Virtue Palace (福德宮) describe inner peace; weak flow there makes even perfect desk Feng Shui feel hollow. <a href="/free-chart.html">Calculate your chart</a> to see Virtue + Career highlights, and compare with a <a href="/#pricing">full 12-palace matrix</a> when you need written timing for renovation or relocation decisions.</p>`,
};

function wordCount(html) {
  const $ = cheerio.load(html);
  const text = $('article, .article-body, main, .container, .wrap').first().text() || $('body').text();
  return text.split(/\s+/).filter(Boolean).length;
}

function addNoindex(html) {
  if (/name=["']robots["']/i.test(html)) {
    return html.replace(/<meta name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex, follow">');
  }
  return html.replace(/<meta charset="UTF-8">/i, '<meta charset="UTF-8">\n<meta name="robots" content="noindex, follow">');
}

function expandPost(html, block) {
  if (html.includes('data-thin-expanded')) return html;
  const marker = '<!-- data-thin-expanded="true" -->';
  if (html.includes('</main>')) {
    return html.replace('</main>', `${block}\n${marker}\n</main>`);
  }
  return html.replace('</body>', `${block}\n${marker}\n</body>`);
}

const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.html') && f !== 'index.html');
let noindexed = 0;
let expanded = 0;

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const wc = wordCount(html);
  const before = html;

  if (wc <= NOINDEX_MAX) {
    html = addNoindex(html);
    if (html !== before) noindexed += 1;
  } else if (wc <= THIN_MAX && EXPANSIONS[file]) {
    html = expandPost(html, EXPANSIONS[file]);
    if (html !== before) expanded += 1;
  }

  if (html !== before) fs.writeFileSync(filePath, html);
});

console.log(`📄 Thin post policy — ${files.length} posts | ${noindexed} noindexed (≤${NOINDEX_MAX}w) | ${expanded} expanded`);
