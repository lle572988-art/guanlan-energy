/** Gumroad webhook — verify signature, adjust consultation spot counter, order drip emails. */
export const config = { runtime: 'edge', regions: ['iad1'] };

const SITE = 'https://metaphysicflow.com';
const SPOT_PRODUCTS = new Set(['partner-compatibility', 'annual', 'partner', 'annual-cosmic']);

const PRODUCT_LABELS = {
  'life-palace-dive': 'Life Palace Deep Dive',
  'three-palace-snapshot': 'Three-Palace Snapshot',
  'full-chart': 'Full 12-Palace Matrix',
  'live-reading': 'Live Video Consultation',
  'partner-compatibility': 'Partner Compatibility Reading',
  'compass-room': 'Energy X-Ray · Single Room',
  'compass-home': 'Energy X-Ray · Full Home',
  'compass-home-year': 'Home + 2026 Year Report',
  'compass-annual': 'Living Compass Annual Pass',
  annual: 'Annual Cosmic Alignment',
};

const PERMALINK_PRODUCT = {
  acvsfx: 'life-palace-dive',
  lfoxf: 'three-palace-snapshot',
  tiuyjr: 'full-chart',
  lozmm: 'live-reading',
  compassrm: 'compass-room',
  compasshm: 'compass-home',
  compassyr: 'compass-home-year',
  compassann: 'compass-annual',
};

const PRODUCT_USD = {
  'life-palace-dive': 9.9,
  'three-palace-snapshot': 19,
  'full-chart': 39,
  'live-reading': 99,
  acvsfx: 9.9,
  lfoxf: 19,
  tiuyjr: 39,
  lozmm: 99,
  compassrm: 19,
  compasshm: 39,
  compassyr: 49,
  compassann: 79,
};

async function trackPlausiblePurchase(productId, priceCents) {
  const pid = String(productId || '').toLowerCase();
  const mapped = PERMALINK_PRODUCT[pid] || pid;
  let amount = PRODUCT_USD[mapped] || PRODUCT_USD[pid] || 0;
  if (priceCents != null && priceCents !== '') {
    const parsed = Number(priceCents) / 100;
    if (Number.isFinite(parsed) && parsed > 0) amount = parsed;
  }
  try {
    const payload = {
      name: 'Purchase-Success',
      url: `${SITE}/thank-you.html?product=${encodeURIComponent(mapped)}&ref=gumroad-webhook`,
      domain: 'metaphysicflow.com',
      props: { product: mapped, channel: 'gumroad_webhook' },
    };
    if (amount > 0) payload.revenue = { currency: 'USD', amount };
    await fetch('https://plausible.io/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[gumroad-webhook] Plausible event', err.message);
  }
}

async function sendResendEmail(apiKey, payload, entityRefId) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (entityRefId) headers['X-Entity-Ref-ID'] = String(entityRefId);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('[gumroad-webhook] Resend error', res.status, text);
  }
}

function emailShell(title, bodyHtml) {
  return `<div style="max-width:560px;margin:0 auto;font-family:Georgia,serif;background:#060D1A;color:#C8D8E8;padding:2rem;">
    <h1 style="color:#C5984A;font-size:1.4rem;font-weight:300;">${title}</h1>
    ${bodyHtml}
    <p style="font-style:italic;color:#7FA0BA;font-size:0.9rem;margin-top:1.5rem;">— Guanlan Energy · Purple Star Astrology</p>
  </div>`;
}

function isCompassPermalink(pid) {
  var p = String(pid || '').toLowerCase();
  return p.indexOf('compass') === 0 || p === 'compassrm' || p === 'compasshm' || p === 'compassyr';
}

async function sendPurchaseDrip(email, productId, saleId, kv) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !email) return;

  const entityRefId = saleId || `${email}-${Date.now()}`;
  const label = PRODUCT_LABELS[productId] || 'Zi Wei Dou Shu Reading';
  const thankYou = `${SITE}/thank-you.html?product=${encodeURIComponent(productId || '')}&ref=gumroad`;
  let consultUrl = `${SITE}/consultation.html#book`;
  const liveUrl = 'https://lleonard88.gumroad.com/l/lozmm?wanted=true';
  let mainStar = '';

  if (kv) {
    try {
      mainStar = (await kv.get(`${email}:star`)) || '';
      const dob = (await kv.get(`${email}:dob`)) || '';
      const hour = (await kv.get(`${email}:hour`)) || '';
      const params = new URLSearchParams();
      if (dob) params.set('dob', dob);
      if (hour) params.set('hour', hour);
      const q = params.toString();
      if (q) consultUrl = `${SITE}/consultation.html?${q}#book`;
    } catch (err) {
      console.error('[gumroad-webhook] KV personalization', err.message);
    }
  }

  const starLabel = mainStar ? ` (${mainStar})` : '';

  await sendResendEmail(apiKey, {
    from: 'Guanlan Energy <hello@metaphysicflow.com>',
    to: email,
    subject: `Order confirmed — ${label}`,
    html: emailShell('Your Purple Star reading is confirmed', `
      <p>Thank you for your purchase of <strong>${label}</strong>.</p>
      <p>We have received your order${saleId ? ` (#${saleId})` : ''} and started fulfillment. Check your inbox for Gumroad receipt details.</p>
      <p><a href="${thankYou}" style="color:#E2C27A;">View order confirmation →</a></p>
    `),
  }, entityRefId);

  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await sendResendEmail(apiKey, {
    from: 'Guanlan Energy <hello@metaphysicflow.com>',
    to: email,
    subject: mainStar
      ? `Three tips for your ${mainStar} chart while you wait`
      : 'Three tips while you wait for your Zi Wei reading',
    scheduledAt: in24h,
    html: emailShell(`Reading tips for your${starLabel} chart`, `
      <p>While your ${label} is being prepared, here are three ways to get more from your chart${mainStar ? ` with <strong>${mainStar}</strong> as your anchor star` : ''}:</p>
      <ol style="line-height:1.8;padding-left:1.2rem;">
        <li>Re-read your <strong>Life Palace</strong> — it anchors every other palace in Zi Wei Dou Shu.</li>
        <li>Compare your <strong>Wealth</strong> and <strong>Career</strong> palaces for timing clues.</li>
        <li>Note questions as they arise — a live session makes follow-ups far more actionable.</li>
      </ol>
      <p><a href="${SITE}/free-chart.html" style="color:#E2C27A;">Revisit your free chart →</a></p>
    `),
  }, entityRefId);

  const in72h = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
  await sendResendEmail(apiKey, {
    from: 'Guanlan Energy <hello@metaphysicflow.com>',
    to: email,
    subject: 'Ask your chart questions live — $99 video session',
    scheduledAt: in72h,
    html: emailShell('Upgrade to a live walkthrough', `
      <p>Written readings answer <em>what</em> is in your chart. A 30-minute Live Video Session ($99) answers <em>why it matters now</em>.</p>
      <p>Bring career, relationship, or timing questions — recording included.</p>
      <p><a href="${liveUrl}" style="display:inline-block;padding:12px 20px;background:#C5984A;color:#060D1A;text-decoration:none;border-radius:2px;">Book Live Session — $99</a></p>
      <p style="margin-top:1rem;font-size:0.9rem;"><a href="${consultUrl}" style="color:#7FA0BA;">Or browse all consultation options →</a></p>
    `),
  }, entityRefId);
}

async function adjustSpots(delta) {
  try {
    const { kv } = await import('@vercel/kv');
    let current = await kv.get('spots');
    if (current == null) current = 8;
    current = Math.max(0, Number(current) + delta);
    await kv.set('spots', current);
    return current;
  } catch (err) {
    console.error('[gumroad-webhook] KV error:', err.message);
    return null;
  }
}

async function verifySignature(request, rawBody) {
  const secret = process.env.GUMROAD_SECRET;
  if (!secret) return false;
  const sig = request.headers.get('x-gumroad-signature') || request.headers.get('X-Gumroad-Signature');
  if (!sig) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const expected = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return sig === expected || sig === `sha256=${expected}`;
}

function parseBody(raw, contentType) {
  if (!raw) return {};
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  const params = new URLSearchParams(raw);
  const body = {};
  params.forEach((v, k) => {
    body[k] = v;
  });
  return body;
}

function isSpotProduct(body) {
  const slug = (body.short_product_id || body.product_permalink || body.product_id || '').toLowerCase();
  const name = (body.product_name || '').toLowerCase();
  if (SPOT_PRODUCTS.has(slug)) return true;
  if (/partner|compatibility|annual|cosmic alignment/.test(name)) return true;
  return false;
}

export default async function handler(request, context) {
  if (request.method === 'GET') {
    return new Response(
      JSON.stringify({
        ok: true,
        webhook_url: 'https://metaphysicflow.com/api/gumroad-webhook',
        note: 'Configure in Gumroad Advanced → Ping or webhook with GUMROAD_SECRET for HMAC',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const rawBody = await request.text();
  const contentType = request.headers.get('content-type') || '';

  if (!(await verifySignature(request, rawBody))) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = parseBody(rawBody, contentType);
  if (body.test === 'true' || body.test === true) {
    return new Response('ok');
  }

  const saleId = body.sale_id || body.order_number || '';
  let kv = null;
  try {
    const mod = await import('@vercel/kv');
    kv = mod.kv;
  } catch {
    /* KV optional */
  }

  if (kv && saleId) {
    const idKey = `gumroad:${saleId}`;
    try {
      const seen = await kv.get(idKey);
      if (seen) {
        console.log('[gumroad-webhook] duplicate sale', saleId);
        return new Response('ok', { status: 200, headers: { 'Content-Type': 'text/plain' } });
      }
    } catch (err) {
      console.error('[gumroad-webhook] idempotency check', err.message);
    }
  }

  const refunded = body.refunded === 'true' || body.refunded === true;
  const productId = body.short_product_id || body.product_permalink || body.product_id || 'unknown';
  console.log('[gumroad-webhook] purchase', {
    email: body.email || '',
    product: productId,
    refunded,
  });

  const headers = { 'Content-Type': 'text/plain' };
  if (!refunded) {
    headers['Set-Cookie'] =
      'purchased=true; Path=/; Max-Age=2592000; Secure; SameSite=Lax';
    const dripEmail = body.email || body.purchaser_email || '';
    const dripProduct = String(productId).toLowerCase();
    const dripSaleId = saleId;
    const dripPrice = body.price || body.full_price || body.recurrence_price || '';
    const asyncWork = Promise.all([
      isCompassPermalink(dripProduct) ? Promise.resolve() : sendPurchaseDrip(dripEmail, dripProduct, dripSaleId, kv).catch((err) => {
        console.error('[gumroad-webhook] drip error:', err.message);
      }),
      trackPlausiblePurchase(dripProduct, dripPrice).catch((err) => {
        console.error('[gumroad-webhook] plausible error:', err.message);
      }),
    ]);
    if (context && typeof context.waitUntil === 'function') {
      context.waitUntil(asyncWork);
    }
    if (kv && dripSaleId) {
      try {
        await kv.set(`gumroad:${dripSaleId}`, '1', { ex: 86400 });
      } catch (err) {
        console.error('[gumroad-webhook] idempotency write', err.message);
      }
    }
  }

  if (isSpotProduct(body)) {
    const remaining = await adjustSpots(refunded ? 1 : -1);
    console.log('[gumroad-webhook] spots →', remaining);
  }

  return new Response('ok', { status: 200, headers });
}
