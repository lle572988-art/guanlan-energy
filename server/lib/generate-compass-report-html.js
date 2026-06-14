/**
 * Full Energy X-Ray HTML reports for email / blob delivery.
 */
import {
  buildAnnualChart,
  calculateBaZhai,
  insightsForFacing,
  quarterlyCenters,
  DIR_LABEL,
  STAR_INFO,
  STAR_TIPS,
} from './compass-engine.js';

const PRODUCT_TITLES = {
  'compass-room': 'Energy X-Ray · Single Room Report',
  'compass-home': 'Energy X-Ray · Full Home Report',
  'compass-home-year': 'Home + Annual Energy Forecast',
};

function gridTable(cells) {
  let html = '<table class="grid"><thead><tr><th>Sector</th><th>Star</th><th>Theme</th><th>Cure note</th></tr></thead><tbody>';
  cells.forEach((row) => {
    row.forEach((cell) => {
      if (cell.direction === 'center') return;
      html += `<tr><td>${DIR_LABEL[cell.direction]}</td><td>${cell.star} ${cell.cn}</td><td>${cell.label}</td><td>${STAR_TIPS[cell.star] || ''}</td></tr>`;
    });
  });
  html += '</tbody></table>';
  return html;
}

function curesSection(kua, insights, tier) {
  let html = '<h2>Three moves this week</h2><ol>';
  if (kua) {
    kua.actions.forEach((a) => { html += `<li>${a}</li>`; });
  }
  if (insights) {
    html += `<li>Front door faces ${insights.facingLabel} — honor the ${insights.facingInfo.en} energy there in ${insights.facingLabel.split(' ')[0]} sector.</li>`;
  }
  html += '<li>Declutter the sector with Five Yellow or Two Black if present — add metal or keep quiet.</li></ol>';

  if (tier === 'compass-room' && insights) {
    html += `<h2>Your priority room · ${insights.facingLabel}</h2><p>${STAR_TIPS[insights.facingStar] || ''}</p>`;
  }

  if (tier === 'compass-home-year') {
    const quarters = quarterlyCenters(insights?.year || 2026);
    html += '<h2>2026 quarterly centers</h2><table class="grid"><thead><tr><th>Quarter</th><th>Center star</th><th>Focus</th></tr></thead><tbody>';
    quarters.forEach((q) => {
      const info = STAR_INFO[q.center];
      html += `<tr><td>${q.q} (${q.months})</td><td>${q.center} ${info.cn}</td><td>${info.label}</td></tr>`;
    });
    html += '</tbody></table>';
    html += '<p>Shift desk and renovation plans when the center star changes — avoid digging in sectors holding 5 Yellow.</p>';
  }
  return html;
}

export function buildCompassReportHtml({ productKey, dob, gender, facing, year, email }) {
  const tier = productKey || 'compass-home';
  const title = PRODUCT_TITLES[tier] || PRODUCT_TITLES['compass-home'];
  const y = parseInt(year, 10) || 2026;
  const face = facing || 'S';
  const chart = buildAnnualChart(y);
  const insights = insightsForFacing(chart, face);
  const kua = dob && gender ? calculateBaZhai({ dob, gender, houseFacing: face }) : null;

  const css = `
    body{font-family:Georgia,serif;color:#1F2A26;background:#EAE7DF;padding:48px;line-height:1.55;max-width:800px;margin:0 auto}
    h1{font-weight:400;font-size:28px;margin-bottom:6px}
    .meta{font-family:monospace;font-size:12px;color:#6B7873;margin-bottom:28px}
    h2{font-size:13px;margin:32px 0 12px;color:#7A9B8E;font-family:monospace;letter-spacing:.14em;text-transform:uppercase}
    p,li{color:#3C4A45}
    .grid{width:100%;border-collapse:collapse;font-size:13px;margin:16px 0}
    .grid th,.grid td{border:1px solid rgba(31,42,38,.15);padding:10px 12px;text-align:left;vertical-align:top}
    .grid th{background:rgba(122,155,142,.15);font-family:monospace;font-size:10px}
    .badge{display:inline-block;font-family:monospace;font-size:11px;border:1px solid #A88A52;color:#A88A52;padding:4px 12px;border-radius:999px;margin-bottom:16px}
    .foot{margin-top:48px;font-size:11px;color:#6B7873;border-top:1px solid rgba(31,42,38,.12);padding-top:20px}
  `;

  let body = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${title}</title><style>${css}</style></head><body>`;
  body += `<span class="badge">The Living Compass</span>`;
  body += `<h1>${title}</h1>`;
  body += `<p class="meta">Home faces ${DIR_LABEL[face]} · ${y} flying stars · Prepared for ${email || 'you'} · ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>`;

  body += `<h2>Executive snapshot</h2><p>${insights.headline}</p><ul>`;
  insights.highlights.forEach((h) => {
    body += `<li><strong>${h.dirLabel} · star ${h.star}</strong> — ${h.label}</li>`;
  });
  body += '</ul>';

  if (kua) {
    body += `<h2>Your Kua ${kua.kua} · ${kua.cn}</h2><p>${kua.archetype} · ${kua.groupLabel}</p><ul>`;
    kua.actions.forEach((a) => { body += `<li>${a}</li>`; });
    body += '</ul>';
  } else {
    body += '<p><em>Personal Kua directions will be added when birth date and gender are provided.</em></p>';
  }

  body += `<h2>${y} sector map</h2>`;
  body += gridTable(chart.cells);

  body += '<h2>Sectors to handle with care</h2><ul>';
  insights.cautions.forEach((c) => {
    body += `<li><strong>${c.dirLabel} · ${c.star}</strong> — ${c.label}. ${STAR_TIPS[c.star] || ''}</li>`;
  });
  body += '</ul>';

  body += curesSection(kua, { ...insights, year: y }, tier);

  body += `<p class="foot">metaphysicflow.com/compass · Empowerment, not prophecy · Guanlan Energy<br>This report is for reflection and wellbeing, not a substitute for professional advice.</p></body></html>`;
  return body;
}

export function isCompassProduct(key) {
  return key === 'compass-room' || key === 'compass-home' || key === 'compass-home-year';
}
