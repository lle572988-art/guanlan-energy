#!/usr/bin/env node
/**
 * Phase 5 — inject AI Interactive Chart Widget into programmatic SEO pages.
 * Scans pages/*.html and pages/transit/*.html (repo root, not output/).
 *
 * Injection points:
 *   1. Below .faq-section (post-FAQ conversion)
 *   2. Before <footer> (bottom capture)
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const pagesDir = path.join(rootDir, 'pages');

const MARKER_FAQ_START = '<!-- GUANLAN_AI_WIDGET_FAQ -->';
const MARKER_FAQ_END = '<!-- /GUANLAN_AI_WIDGET_FAQ -->';
const MARKER_FOOT_START = '<!-- GUANLAN_AI_WIDGET_FOOT -->';
const MARKER_FOOT_END = '<!-- /GUANLAN_AI_WIDGET_FOOT -->';
const WIDGET_SCRIPT = '<script defer src="/js/conversion-widget.js"></script>';

function buildSelectOptions(type) {
  if (type === 'year') {
    const opts = [];
    for (let y = 2026; y >= 1940; y -= 1) opts.push(`<option value="${y}">${y}</option>`);
    return opts.join('');
  }
  if (type === 'month') {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      return `<option value="${m}">${m}</option>`;
    }).join('');
  }
  if (type === 'day') {
    return Array.from({ length: 31 }, (_, i) => {
      const d = i + 1;
      return `<option value="${d}">${d}</option>`;
    }).join('');
  }
  if (type === 'hour') {
    const branches = [
      [0, 'Zi (11pm–1am)'],
      [1, 'Chou (1–3am)'],
      [3, 'Yin (3–5am)'],
      [5, 'Mao (5–7am)'],
      [7, 'Chen (7–9am)'],
      [9, 'Si (9–11am)'],
      [11, 'Wu (11am–1pm)'],
      [13, 'Wei (1–3pm)'],
      [15, 'Shen (3–5pm)'],
      [17, 'You (5–7pm)'],
      [19, 'Xu (7–9pm)'],
      [21, 'Hai (9–11pm)'],
    ];
    return `<option value="">Unknown hour</option>${branches
      .map(([v, l]) => `<option value="${v}">${l}</option>`)
      .join('')}`;
  }
  return '';
}

function widgetBlock(slot) {
  return `${slot === 'faq' ? MARKER_FAQ_START : MARKER_FOOT_START}
<section class="guanlan-ai-widget" aria-label="AI chart report">
  <div class="guanlan-ai-widget__card">
    <p class="guanlan-ai-widget__eyebrow">Guanlan AI Engine</p>
    <h2 class="guanlan-ai-widget__title">🤖 Unlock Your Personal 2026 Cosmic Vector</h2>
    <p class="guanlan-ai-widget__sub">The static blueprint is generic. Enter your birth details to dynamic-compile your personalized Zi Wei Dou Shu annual report via our Guanlan AI Engine.</p>
    <form class="guanlan-ai-widget__form" novalidate>
      <div class="guanlan-ai-widget__grid">
        <label>Birth Year<select name="birth_year" required><option value="">Year</option>${buildSelectOptions('year')}</select></label>
        <label>Month<select name="birth_month" required><option value="">Mo</option>${buildSelectOptions('month')}</select></label>
        <label>Day<select name="birth_day" required><option value="">Day</option>${buildSelectOptions('day')}</select></label>
        <label>Hour<select name="birth_hour">${buildSelectOptions('hour')}</select></label>
      </div>
      <label class="guanlan-ai-widget__email">Email for AI Report<input type="email" name="email" placeholder="you@email.com" required autocomplete="email"></label>
      <button type="submit" class="guanlan-ai-widget__btn">
        <span class="guanlan-ai-widget__btn-label">Generate AI Karma Report ➔</span>
        <span class="guanlan-ai-widget__btn-spin" hidden aria-hidden="true">Compiling…</span>
      </button>
      <p class="guanlan-ai-widget__status" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>
<style>
.guanlan-ai-widget{margin:2.5rem 0;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif}
.guanlan-ai-widget__card{background:linear-gradient(145deg,rgba(15,20,35,.95),rgba(22,29,48,.92));border:1px solid rgba(201,169,110,.28);border-radius:1rem;padding:1.75rem;box-shadow:0 24px 48px rgba(0,0,0,.35)}
.guanlan-ai-widget__eyebrow{font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(201,169,110,.55);margin:0 0 .75rem}
.guanlan-ai-widget__title{font-family:'Cormorant Garamond',serif;font-size:1.45rem;font-weight:400;color:#C9A96E;margin:0 0 .65rem;line-height:1.25}
.guanlan-ai-widget__sub{font-size:.95rem;color:rgba(255,255,255,.62);margin:0 0 1.25rem;line-height:1.6}
.guanlan-ai-widget__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.65rem;margin-bottom:.85rem}
.guanlan-ai-widget label{display:flex;flex-direction:column;gap:.35rem;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.45)}
.guanlan-ai-widget__email{margin-bottom:1rem}
.guanlan-ai-widget select,.guanlan-ai-widget input{width:100%;background:rgba(11,15,26,.85);border:1px solid rgba(201,169,110,.2);color:rgba(255,255,255,.88);padding:.55rem .6rem;border-radius:.5rem;font-size:.9rem}
.guanlan-ai-widget select:focus,.guanlan-ai-widget input:focus{outline:2px solid rgba(201,169,110,.45);outline-offset:1px}
.guanlan-ai-widget__btn{width:100%;background:#C9A96E;color:#0B0F1A;border:none;padding:.85rem 1rem;border-radius:.5rem;font-weight:700;font-size:.85rem;letter-spacing:.04em;cursor:pointer;transition:filter .2s}
.guanlan-ai-widget__btn:hover:not(:disabled){filter:brightness(1.08)}
.guanlan-ai-widget__btn:disabled{opacity:.65;cursor:wait}
.guanlan-ai-widget__status{min-height:1.25rem;margin:.75rem 0 0;font-size:.82rem;color:rgba(201,169,110,.85)}
@media(max-width:640px){.guanlan-ai-widget__grid{grid-template-columns:repeat(2,1fr)}}
</style>
${slot === 'foot' ? MARKER_FOOT_END : MARKER_FAQ_END}`;
}

function stripWidgets(html) {
  return html
    .replace(/<!-- GUANLAN_AI_WIDGET_FAQ -->[\s\S]*?<!-- \/GUANLAN_AI_WIDGET_FAQ -->/g, '')
    .replace(/<!-- GUANLAN_AI_WIDGET_FOOT -->[\s\S]*?<!-- \/GUANLAN_AI_WIDGET_FOOT -->/g, '');
}

function ensureWidgetScript(html) {
  if (html.includes('/js/conversion-widget.js')) return html;
  return html.replace('</body>', `${WIDGET_SCRIPT}\n</body>`);
}

function injectWidgets(html) {
  let out = stripWidgets(html);

  if (out.includes('class="faq-section"')) {
    out = out.replace(
      /(<div class="faq-section">[\s\S]*?<\/div>\s*)/,
      `$1\n  ${widgetBlock('faq')}\n\n  `
    );
  }

  out = out.replace(/(\s*<footer>)/, `\n  ${widgetBlock('foot')}\n$1`);

  return ensureWidgetScript(out);
}

function collectHtmlFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectHtmlFiles(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

function main() {
  const files = collectHtmlFiles(pagesDir);
  if (!files.length) {
    console.error('❌ No HTML files under pages/');
    process.exit(1);
  }

  let updated = 0;
  files.forEach((filePath) => {
    const before = fs.readFileSync(filePath, 'utf8');
    const after = injectWidgets(before);
    if (after !== before) {
      fs.writeFileSync(filePath, after);
      updated += 1;
    }
  });

  console.log(`\n🤖 Conversion widget injected`);
  console.log(`   Scanned: ${files.length} pages`);
  console.log(`   Updated: ${updated} pages`);
  console.log(`   Slots: post-FAQ + pre-footer\n`);
}

main();
