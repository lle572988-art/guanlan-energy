/** Gumroad webhook — verify signature, adjust consultation spot counter. */
export const config = { runtime: 'edge', regions: ['iad1'] };

const SPOT_PRODUCTS = new Set(['partner-compatibility', 'annual', 'partner', 'annual-cosmic']);

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
  if (!secret) return true;
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

export default async function handler(request) {
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

  if (!isSpotProduct(body)) {
    return new Response('ok');
  }

  const refunded = body.refunded === 'true' || body.refunded === true;
  const remaining = await adjustSpots(refunded ? 1 : -1);
  console.log('[gumroad-webhook] spots →', remaining, body.email || '');

  return new Response('ok');
}
