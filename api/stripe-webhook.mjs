/**
 * Stripe webhook — auto-deliver Energy X-Ray HTML reports.
 */
import Stripe from 'stripe';
import { fulfillCompassOrder } from '../server/lib/fulfill-compass-order.js';
import { isCompassProduct } from '../server/lib/generate-compass-report-html.js';

export const config = {
  runtime: 'nodejs',
  api: { bodyParser: false },
};

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
    console.error('[stripe-webhook] Resend error:', await res.text());
    return false;
  }
  return true;
}

function buyerHtml(productKey, reportUrl, email) {
  const thanks = `https://metaphysicflow.com/thank-you.html?product=${encodeURIComponent(productKey)}`;
  return `
    <div style="max-width:560px;margin:0 auto;font-family:Georgia,serif;background:#EAE7DF;color:#1F2A26;padding:2rem;">
      <p style="font-family:monospace;font-size:11px;letter-spacing:2px;color:#7A9B8E;text-transform:uppercase;">The Living Compass</p>
      <h1 style="font-size:1.5rem;font-weight:400;">Your Energy X-Ray report is ready</h1>
      <p>Thank you — your personalized home energy map has been generated for <strong>${email}</strong>.</p>
      ${reportUrl ? `<p><a href="${reportUrl}" style="display:inline-block;margin:1rem 0;padding:14px 28px;background:#1F2A26;color:#EAE7DF;text-decoration:none;font-family:sans-serif;font-size:13px;border-radius:999px;">Open your report →</a></p>
      <p style="font-size:0.85rem;color:#6B7873;">Bookmark this link or print from your browser (File → Print → Save as PDF).</p>` : `
      <p>We are finalizing your report — you will receive a follow-up email within 24 hours.</p>`}
      <p><a href="${thanks}" style="color:#7A9B8E;">Order confirmation & next steps</a></p>
      <p style="font-size:0.85rem;color:#6B7873;margin-top:1.5rem;">Questions? hello@metaphysicflow.com</p>
    </div>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sk = (process.env.STRIPE_SECRET_KEY || '').trim();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sk || !whSecret) {
    return res.status(500).json({ error: 'Stripe webhook not configured' });
  }

  const stripe = new Stripe(sk, { apiVersion: '2024-11-20.acacia' });
  const sig = req.headers['stripe-signature'];
  let rawBody;
  if (typeof req.body === 'string') {
    rawBody = req.body;
  } else if (Buffer.isBuffer(req.body)) {
    rawBody = req.body;
  } else {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    rawBody = Buffer.concat(chunks);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err) {
    console.error('[stripe-webhook] signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const productKey = session.metadata?.product || '';
    const email = session.customer_details?.email || session.customer_email;

    if (isCompassProduct(productKey) && email) {
      const fields = {
        'Date of birth': session.metadata?.guanlan_dob || '',
        Gender: session.metadata?.guanlan_gender || '',
        'Home facing': session.metadata?.guanlan_facing || 'S',
        'Flying star year': session.metadata?.guanlan_xray_year || '2026',
      };

      try {
        const result = await fulfillCompassOrder({
          productKey,
          email,
          fields,
          saleId: session.id,
        });
        await sendResend({
          to: email,
          subject: 'Your Energy X-Ray report is ready · The Living Compass',
          html: buyerHtml(productKey, result?.url, email),
        });
        console.log('[stripe-webhook] compass delivered', productKey, result?.url || 'no-blob');
      } catch (err) {
        console.error('[stripe-webhook] compass fulfill:', err.message);
      }
    }
  }

  return res.status(200).json({ received: true });
}
