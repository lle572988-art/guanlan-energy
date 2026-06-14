/**
 * Monthly flying star brief for Living Compass Annual members.
 */
import { monthlyBrief } from './compass-engine.js';

const SITE = 'https://metaphysicflow.com';

export function buildMonthlyBriefHtml(member, brief) {
  const heatmap = `${SITE}/compass/heatmap/?facing=${encodeURIComponent(member.facing || 'S')}`;
  const cautionLines = brief.cautions.map((c) =>
    `<li><strong>${c.dirLabel} · star ${c.star}</strong> — ${c.label}. ${c.tip}</li>`,
  ).join('');
  const oppLines = brief.opportunities.map((o) =>
    `<li><strong>${o.dirLabel} · star ${o.star}</strong> — ${o.label}</li>`,
  ).join('');

  return `
    <div style="max-width:560px;margin:0 auto;font-family:Georgia,serif;background:#EAE7DF;color:#1F2A26;padding:2rem;">
      <p style="font-family:monospace;font-size:11px;letter-spacing:2px;color:#7A9B8E;text-transform:uppercase;">The Living Compass · Annual pass</p>
      <h1 style="font-size:1.45rem;font-weight:400;">${brief.monthLabel} ${brief.year} home energy brief</h1>
      <p>Home faces <strong>${brief.facingLabel}</strong> — this month your door sector holds <strong>star ${brief.facingStar}</strong>: ${brief.facingLabelText}.</p>
      <p style="color:#6B7873;font-size:0.95rem;">${brief.headline}</p>
      ${oppLines ? `<p style="font-family:monospace;font-size:11px;letter-spacing:1px;color:#7A9B8E;margin-top:1.25rem;">MOMENTUM SECTORS</p><ul style="color:#3C4A45;line-height:1.55;">${oppLines}</ul>` : ''}
      ${cautionLines ? `<p style="font-family:monospace;font-size:11px;letter-spacing:1px;color:#9a4b3b;margin-top:1rem;">HANDLE WITH CARE</p><ul style="color:#3C4A45;line-height:1.55;">${cautionLines}</ul>` : ''}
      <p style="margin-top:1.5rem;"><a href="${heatmap}" style="display:inline-block;padding:12px 24px;background:#1F2A26;color:#EAE7DF;text-decoration:none;font-family:sans-serif;font-size:12px;border-radius:999px;">Scrub the live heatmap →</a></p>
      <p style="font-size:0.85rem;color:#6B7873;margin-top:1.5rem;">Questions? Reply to this email or hello@metaphysicflow.com · Your pass renews ${new Date(member.expiresAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}.</p>
    </div>`;
}

export function monthlyBriefForMember(member, now = new Date()) {
  const year = parseInt(member.year, 10) || now.getFullYear();
  const month = now.getMonth() + 1;
  const brief = monthlyBrief({ facing: member.facing, year, month });
  const subject = `${brief.monthLabel} ${brief.year} home energy brief · The Living Compass`;
  const html = buildMonthlyBriefHtml(member, brief);
  return { subject, html, monthKey: `${year}-${String(month).padStart(2, '0')}` };
}

async function sendResend({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL
    ? `Guanlan Energy <${process.env.RESEND_FROM_EMAIL}>`
    : 'Guanlan Energy <chart@metaphysicflow.com>';
  if (!apiKey || !to) return false;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    console.error('[compass-monthly-email] Resend:', await res.text());
    return false;
  }
  return true;
}

export async function sendMonthlyBriefToMember(member, now = new Date()) {
  const { subject, html, monthKey } = monthlyBriefForMember(member, now);
  const ok = await sendResend({ to: member.email, subject, html });
  return { ok, monthKey };
}
