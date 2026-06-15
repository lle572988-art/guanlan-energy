// Post-purchase home details for manual Energy X-Ray fulfillment
import { put, list } from '@vercel/blob';

const BLOB_PATH = 'compass-report-intakes.json';

async function sendResend({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL
    ? `Guanlan Energy <${process.env.RESEND_FROM_EMAIL}>`
    : 'Guanlan Energy <chart@metaphysicflow.com>';
  if (!apiKey) return false;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    console.error('[compass-report-intake] Resend error:', await res.text());
    return false;
  }
  return true;
}

function sellerRecipients() {
  const raw = process.env.SELLER_NOTIFY_EMAIL
    || 'lle572988@gmail.com,hello@metaphysicflow.com';
  return [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))];
}

async function loadIntakes() {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH });
    if (!blobs?.length) return [];
    const resp = await fetch(blobs[0].url, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return Array.isArray(data.intakes) ? data.intakes : [];
  } catch (e) {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const facing = String(body.facing || '').trim();
  const dob = String(body.dob || '').trim();
  const gender = String(body.gender || '').trim();
  const notes = String(body.notes || '').trim();
  const floorPlanUrl = String(body.floorPlanUrl || body.floor_plan_url || '').trim();
  const product = String(body.product || 'compass-home').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  if (!facing) return res.status(400).json({ error: 'Home facing required' });
  if (!dob) return res.status(400).json({ error: 'Date of birth required' });
  if (!floorPlanUrl) return res.status(400).json({ error: 'Floor plan image required' });

  const record = {
    id: `intake-${Date.now()}`,
    email,
    facing,
    dob,
    gender,
    notes,
    floorPlanUrl,
    product,
    createdAt: new Date().toISOString(),
  };

  try {
    const intakes = await loadIntakes();
    intakes.push(record);
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await put(BLOB_PATH, JSON.stringify({ intakes }), {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false,
      });
    }
  } catch (e) {
    console.error('[compass-report-intake] blob error:', e.message);
  }

  const sellerHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;padding:1.5rem;">
      <p style="font-family:sans-serif;font-size:11px;letter-spacing:2px;color:#7A9B8E;">LIVING COMPASS · INTAKE</p>
      <h2 style="font-weight:400;">New home report intake</h2>
      <ul style="line-height:1.7;color:#3C4A45;">
        <li><strong>Product:</strong> ${product}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Facing:</strong> ${facing}</li>
        <li><strong>DOB:</strong> ${dob}</li>
        <li><strong>Gender:</strong> ${gender || '—'}</li>
        <li><strong>Floor plan:</strong> <a href="${floorPlanUrl}">${floorPlanUrl}</a></li>
        ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
      </ul>
    </div>`;

  await Promise.all(
    sellerRecipients().map((to) =>
      sendResend({
        to,
        subject: `[Intake] ${product} — ${email}`,
        html: sellerHtml,
      })
    )
  );

  await sendResend({
    to: email,
    subject: 'We received your home details — Living Compass',
    html: `
      <div style="max-width:560px;margin:0 auto;font-family:Georgia,serif;background:#EAE7DF;color:#1F2A26;padding:2rem;">
        <p style="font-family:sans-serif;font-size:11px;letter-spacing:2px;color:#7A9B8E;text-transform:uppercase;">The Living Compass</p>
        <h1 style="font-size:1.5rem;font-weight:400;">Home details received</h1>
        <p>Thank you for submitting your floor plan and birth details. Your personalized <strong>2026 Home Energy Report</strong> will be delivered to this email within <strong>24 hours</strong>.</p>
        <p style="font-size:0.9rem;color:#6B7873;margin-top:1.25rem;">Questions? Reply to this email or write hello@metaphysicflow.com</p>
      </div>`,
  });

  return res.status(200).json({ success: true });
}
