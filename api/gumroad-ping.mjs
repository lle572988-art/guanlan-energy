// Gumroad Ping — POST sale notifications → buyer + seller emails
// Configure once: Gumroad → Settings → Advanced → Ping → https://metaphysicflow.com/api/gumroad-ping
import { put, list } from '@vercel/blob';
import {
  resolveGumroadProduct,
  thankYouUrl,
  extractBirthContext,
} from '../server/lib/gumroad-catalog.js';
import { lookupLeadByEmail, leadToBirthFields } from '../server/lib/lead-lookup.js';
import { fulfillCompassOrder } from '../server/lib/fulfill-compass-order.js';
import { isCompassProduct } from '../server/lib/generate-compass-report-html.js';

const SALES_PATH = 'gumroad-sales.json';

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
    console.error('[gumroad-ping] Resend error:', await res.text());
    return false;
  }
  return true;
}

function sellerNotifyRecipients() {
  const raw = process.env.SELLER_NOTIFY_EMAIL
    || 'lle572988@gmail.com,hello@metaphysicflow.com';
  return [...new Set(
    raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  )];
}

async function notifySeller(meta, body, birthFields) {
  const subject = `[Sale] ${meta.name} — ${body.email || 'buyer'}`;
  const html = sellerEmailHtml(meta, body, birthFields);
  const recipients = sellerNotifyRecipients();
  await Promise.all(recipients.map((to) => sendResend({ to, subject, html })));
}

function buyerEmailHtml(product, email, birthFields, reportUrl) {
  const thanks = thankYouUrl(product.key);
  const isCompass = product.key && product.key.startsWith('compass');
  const deliveryNote = isCompass && reportUrl
    ? `Your Energy X-Ray report is ready — <a href="${reportUrl}" style="color:#7A9B8E;">open your report</a> (save or print as PDF from your browser).`
    : isCompass
      ? 'Your Energy X-Ray PDF will arrive within <strong>48 hours</strong> once we confirm your home details.'
      : 'Your personalized PDF reading will be delivered to <strong>' + email + '</strong> within <strong>24–48 hours</strong>.';

  const hasBirth = birthFields['Date of birth'] && (birthFields['Birth hour'] || birthFields['Gender'] || birthFields['Home facing']);
  const fieldLines = Object.entries(birthFields)
    .map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`)
    .join('');

  return `
    <div style="max-width:560px;margin:0 auto;font-family:Georgia,serif;background:${isCompass ? '#EAE7DF' : '#06100c'};color:${isCompass ? '#1F2A26' : '#f0ebe0'};padding:2rem;">
      <p style="font-family:sans-serif;font-size:11px;letter-spacing:2px;color:${isCompass ? '#7A9B8E' : '#c9a84c'};text-transform:uppercase;">${isCompass ? 'The Living Compass' : 'Guanlan Energy'}</p>
      <h1 style="color:${isCompass ? '#1F2A26' : '#e8d4a0'};font-size:1.6rem;font-weight:400;">Thank you for your purchase</h1>
      <p><strong>${product.name}</strong> (${product.price}) — order confirmed.</p>
      <p>${deliveryNote}</p>
      ${hasBirth ? `
        <p style="margin-top:1rem;color:${isCompass ? '#6B7873' : 'rgba(240,235,224,0.75)'};">We received your details:</p>
        <ul style="color:${isCompass ? '#3C4A45' : 'rgba(240,235,224,0.75)'};">${fieldLines}</ul>` : `
        <p style="background:${isCompass ? 'rgba(122,155,142,0.15)' : 'rgba(201,168,76,0.12)'};border:1px solid ${isCompass ? 'rgba(122,155,142,0.35)' : 'rgba(201,168,76,0.25)'};padding:1rem;">
          <strong>Action needed:</strong> Reply to this email with your <strong>date of birth</strong>${isCompass ? ', <strong>gender</strong>, and <strong>home facing</strong>' : ', <strong>birth hour</strong> (e.g. Zi Hour 23:00–01:00), and birth city if known'}.
        </p>`}
      <p><a href="${thanks}" style="display:inline-block;margin-top:1rem;padding:12px 24px;background:${isCompass ? '#1F2A26' : '#c9a84c'};color:${isCompass ? '#EAE7DF' : '#06100c'};text-decoration:none;font-family:sans-serif;font-size:12px;letter-spacing:1px;">View next steps on our site</a></p>
      <p style="font-size:0.85rem;color:${isCompass ? '#6B7873' : 'rgba(240,235,224,0.45)'};margin-top:1.5rem;">Questions? hello@metaphysicflow.com</p>
    </div>`;
}

function sellerEmailHtml(product, body, birthFields) {
  const fields = Object.entries(birthFields)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #333;color:#999;">${k}</td><td style="padding:6px 12px;border-bottom:1px solid #333;">${v}</td></tr>`)
    .join('');

  return `
    <div style="font-family:sans-serif;max-width:560px;color:#eee;">
      <h2 style="color:#c9a84c;">New Gumroad sale — ${product.name}</h2>
      <p><strong>Buyer:</strong> ${body.email || '—'}<br>
      <strong>Name:</strong> ${body.full_name || '—'}<br>
      <strong>Price:</strong> ${body.price || product.price}<br>
      <strong>Sale ID:</strong> ${body.sale_id || '—'}</p>
      ${fields ? `<p style="margin-top:12px;color:#c9a84c;font-size:12px;letter-spacing:1px;">BIRTH DETAILS FOR READING</p><table style="width:100%;border-collapse:collapse;margin-top:8px;">${fields}</table>` : '<p><em>No birth details — ask buyer to reply with DOB + birth hour.</em></p>'}
      <p style="margin-top:16px;"><a href="https://app.gumroad.com/sales">Open Gumroad Sales →</a></p>
    </div>`;
}

async function adjustSpots(delta) {
  try {
    const { kv } = await import('@vercel/kv');
    let current = await kv.get('spots');
    if (current == null) current = 8;
    current = Math.max(0, Number(current) + delta);
    await kv.set('spots', current);
    return current;
  } catch (e) {
    console.error('[gumroad-ping] spots KV:', e.message);
    return null;
  }
}

function isSpotTierProduct(meta, body) {
  if (!meta) return false;
  if (meta.key === 'partner-compatibility' || meta.key === 'annual') return true;
  const name = (body.product_name || '').toLowerCase();
  return /partner|compatibility|annual|cosmic alignment/.test(name);
}

async function logSale(entry) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    let sales = [];
    const { blobs } = await list({ prefix: SALES_PATH });
    if (blobs?.length) {
      const resp = await fetch(blobs[0].url);
      if (resp.ok) {
        const data = await resp.json();
        sales = Array.isArray(data.sales) ? data.sales : [];
      }
    }
    sales.unshift(entry);
    sales = sales.slice(0, 200);
    await put(SALES_PATH, JSON.stringify({ sales, updatedAt: new Date().toISOString() }, null, 2), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  } catch (e) {
    console.error('[gumroad-ping] blob log failed:', e.message);
  }
}

async function parsePingBody(req) {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return req.body;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  const { parse } = await import('node:querystring');
  return parse(raw);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      ping_url: 'https://metaphysicflow.com/api/gumroad-ping',
      setup: 'Gumroad → Settings (gear) → Advanced → Ping → paste the ping_url above',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = await parsePingBody(req);
  if (body.test === 'true' || body.test === true) {
    return res.status(200).send('ok');
  }

  const product = resolveGumroadProduct(body);
  const email = body.email;
  if (!email) {
    return res.status(200).send('ok');
  }

  const customFields = extractBirthContext(body);
  const lead = await lookupLeadByEmail(email);
  const fromLead = leadToBirthFields(lead);
  const mergedFields = { ...fromLead, ...customFields };
  const meta = product || { key: 'full-chart', name: body.product_name || 'Zi Wei Reading', price: body.price || '' };
  const refunded = body.refunded === 'true' || body.refunded === true;

  try {
    if (isSpotTierProduct(meta, body)) {
      await adjustSpots(refunded ? 1 : -1);
    }

    let reportUrl = null;
    if (!refunded && isCompassProduct(meta.key)) {
      try {
        const fulfilled = await fulfillCompassOrder({
          productKey: meta.key,
          email,
          fields: mergedFields,
          saleId: body.sale_id || body.order_number,
        });
        reportUrl = fulfilled?.url || null;
      } catch (err) {
        console.error('[gumroad-ping] compass fulfill:', err.message);
      }
    }

    await sendResend({
      to: email,
      subject: reportUrl
        ? `Your Energy X-Ray report is ready · ${meta.name}`
        : `Your ${meta.name} — order confirmed (PDF in 24–48h)`,
      html: buyerEmailHtml(meta, email, mergedFields, reportUrl),
    });

    await notifySeller(meta, body, mergedFields);

    await logSale({
      saleId: body.sale_id,
      email,
      product: meta.key,
      productName: meta.name,
      price: body.price,
      customFields: mergedFields,
      birthSource: Object.keys(customFields).length ? 'checkout_url' : (Object.keys(fromLead).length ? 'lead_db' : 'none'),
      at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[gumroad-ping]', err.message);
  }

  return res.status(200).send('ok');
}
