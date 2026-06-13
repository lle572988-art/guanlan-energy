/** Edge POST — persist chart star / birth data in KV for drip personalization. */
export const config = { runtime: 'edge' };

const corsHeaders = {
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Access-Control-Allow-Origin': 'https://metaphysicflow.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store, private',
};

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizeEmail(raw) {
  return String(raw || '').trim().toLowerCase();
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const email = normalizeEmail(body.email);
  if (!email || !email.includes('@')) {
    return jsonResponse({ error: 'Invalid email' }, 400);
  }

  let kv = null;
  try {
    const mod = await import('@vercel/kv');
    kv = mod.kv;
  } catch {
    return jsonResponse({ ok: true, stored: false, reason: 'kv_unavailable' });
  }

  const writes = [];
  if (body.star) writes.push(kv.set(`${email}:star`, String(body.star)));
  if (body.dob) writes.push(kv.set(`${email}:dob`, String(body.dob)));
  if (body.hour !== undefined && body.hour !== null && body.hour !== '') {
    writes.push(kv.set(`${email}:hour`, String(body.hour)));
  }

  try {
    await Promise.all(writes);
    return jsonResponse({ ok: true, stored: writes.length > 0 });
  } catch (err) {
    console.error('[chart-meta]', err);
    return jsonResponse({ error: 'Service error' }, 500);
  }
}
