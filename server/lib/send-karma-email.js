/**
 * Resend delivery for AI karma reports + premium conversion hook.
 */

import { GUMROAD_PRODUCTS } from './gumroad-catalog.js';

const SITE = 'https://metaphysicflow.com';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function paragraphsHtml(text) {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      if (/^\d+[\.)]\s/.test(p)) {
        return `<p style="margin:0 0 1rem;line-height:1.75;color:rgba(240,235,224,0.88);">${escapeHtml(p)}</p>`;
      }
      return `<p style="margin:0 0 1.1rem;line-height:1.75;color:rgba(240,235,224,0.88);">${escapeHtml(p)}</p>`;
    })
    .join('');
}

export function buildKarmaReportEmailHtml({ reportText, pageContext, lead }) {
  const utm = 'utm_source=karma_email&utm_medium=email&utm_campaign=phase6_widget';
  const fullChartBase = GUMROAD_PRODUCTS.tiuyjr?.checkout || `${SITE}/checkout.html?product=full-chart`;
  const consultBase = GUMROAD_PRODUCTS.lozmm?.checkout || `${SITE}/checkout.html?product=live-reading`;
  const fullChart = fullChartBase.includes('?') ? `${fullChartBase}&${utm}` : `${fullChartBase}?${utm}`;
  const consult = consultBase.includes('?') ? `${consultBase}&${utm}` : `${consultBase}?${utm}`;
  const headline = pageContext.headline || 'Your Personal Cosmic Vector';

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#06100c;">
  <div style="max-width:600px;margin:0 auto;font-family:Georgia,'Times New Roman',serif;background:#0B0F1A;color:#f0ebe0;padding:2rem 1.75rem;">
    <p style="font-family:ui-sans-serif,system-ui,sans-serif;font-size:11px;letter-spacing:2px;color:#c9a96e;text-transform:uppercase;margin:0 0 1rem;">Guanlan Energy · Purple Star Astrology</p>
    <h1 style="color:#e8d4a0;font-size:1.65rem;font-weight:400;margin:0 0 .5rem;line-height:1.3;">${escapeHtml(headline)}</h1>
    <p style="font-size:0.9rem;color:rgba(201,169,110,0.65);margin:0 0 1.5rem;">Compiled for ${escapeHtml(lead.email)} · Birth ${escapeHtml(lead.dob || '—')}</p>
    <div style="border-top:1px solid rgba(201,169,110,0.2);padding-top:1.25rem;">
      ${paragraphsHtml(reportText)}
    </div>
    <div style="margin-top:2rem;padding:1.25rem 1.5rem;background:linear-gradient(135deg,rgba(201,169,110,0.15),rgba(22,29,48,0.9));border:1px solid rgba(201,169,110,0.35);border-radius:8px;">
      <p style="font-family:ui-sans-serif,system-ui,sans-serif;font-size:0.72rem;letter-spacing:0.14em;text-transform:uppercase;color:#c9a96e;margin:0 0 0.65rem;">Premium unlock</p>
      <p style="margin:0 0 1rem;line-height:1.65;color:#f0ebe0;font-size:0.95rem;"><strong style="color:#e8d4a0;">The transit alert is critical.</strong> To unlock your full 10-year major luck (Da Yun) mitigation blueprint, join our premium channel or book a 1-on-1 AI deep consultation.</p>
      <p style="margin:0 0 0.75rem;">
        <a href="${fullChart}" style="display:inline-block;background:#C9A96E;color:#0B0F1A;text-decoration:none;padding:12px 22px;font-family:ui-sans-serif,system-ui,sans-serif;font-weight:700;font-size:0.85rem;border-radius:6px;">Unlock Full 12-Palace Matrix →</a>
      </p>
      <p style="margin:0;">
        <a href="${consult}" style="color:#c9a96e;font-family:ui-sans-serif,system-ui,sans-serif;font-size:0.85rem;">Or book Live AI Deep Consultation ($99)</a>
      </p>
    </div>
    <p style="margin-top:2rem;font-size:0.75rem;color:rgba(240,235,224,0.4);text-align:center;">
      <a href="${SITE}/free-chart.html" style="color:rgba(201,169,110,0.55);">Free Chart Calculator</a> ·
      <a href="${SITE}/faq.html" style="color:rgba(201,169,110,0.55);">FAQ</a>
    </p>
  </div>
</body>
</html>`;
}

export async function sendKarmaReportEmail({ to, subject, html, tags = [] }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL
    ? `Guanlan Energy <${process.env.RESEND_FROM_EMAIL}>`
    : 'Guanlan Energy <chart@metaphysicflow.com>';
  const replyTo = process.env.RESEND_REPLY_TO || process.env.RESEND_FROM_EMAIL || undefined;

  if (!apiKey) {
    console.warn('[send-karma-email] RESEND_API_KEY missing — email skipped');
    return { sent: false, reason: 'RESEND_API_KEY not configured' };
  }

  const payload = {
    from,
    to,
    subject,
    html,
  };
  if (replyTo) payload.reply_to = replyTo;
  if (tags.length) payload.tags = tags;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error('[send-karma-email] Resend error:', detail);
    return { sent: false, reason: detail.slice(0, 200) };
  }

  const data = await res.json().catch(() => ({}));
  return { sent: true, id: data.id || null };
}
