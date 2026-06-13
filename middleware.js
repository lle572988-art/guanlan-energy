/** Edge middleware — consultation spots SSR + subscribe rate limit. */
const WINDOW_SEC = 60;
const MAX_REQUESTS = 5;
const hits = new Map();

function clientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function rateHeaders(remaining, resetEpoch) {
  return {
    'X-RateLimit-Limit': String(MAX_REQUESTS),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    'X-RateLimit-Reset': String(resetEpoch),
  };
}

function memoryRateLimit(ip) {
  const now = Date.now();
  let bucket = hits.get(ip);
  if (!bucket || now - bucket.windowStart >= WINDOW_SEC * 1000) {
    bucket = { windowStart: now, count: 0 };
  }
  bucket.count += 1;
  hits.set(ip, bucket);
  const resetEpoch = Math.ceil((bucket.windowStart + WINDOW_SEC * 1000) / 1000);
  return { count: bucket.count, resetEpoch };
}

async function kvRateLimit(ip) {
  const { kv } = await import('@vercel/kv');
  const key = `rl:subscribe:${ip}`;
  const count = await kv.incr(key);
  if (count === 1) await kv.expire(key, WINDOW_SEC);
  const ttl = await kv.ttl(key);
  const resetEpoch = Math.ceil(Date.now() / 1000) + (ttl > 0 ? ttl : WINDOW_SEC);
  return { count, resetEpoch };
}

async function readSpots() {
  try {
    const { kv } = await import('@vercel/kv');
    let remaining = await kv.get('spots');
    if (remaining == null) {
      await kv.set('spots', 8);
      remaining = 8;
    }
    return Math.max(0, Number(remaining) || 0);
  } catch {
    return 8;
  }
}

async function injectConsultationSpots(request) {
  const remaining = await readSpots();
  const availability =
    remaining > 0 ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/SoldOut';
  const slotText = `${remaining} consultation slot${remaining === 1 ? '' : 's'} remaining this month`;

  const origin = new URL(request.url);
  const assetUrl = new URL('/consultation.html', origin);
  const res = await fetch(assetUrl.toString(), { headers: { Accept: 'text/html' } });
  if (!res.ok) return res;

  let html = await res.text();
  html = html.replace(
    /"availability"\s*:\s*"https:\/\/schema\.org\/[^"]+"/,
    `"availability": "${availability}"`
  );
  html = html.replace(/Loading session availability…/g, slotText);
  html = html.replace(
    /<meta name="x-spots"[^>]*>/,
    `<meta name="x-spots" content="${remaining}">`
  );

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}

export default async function middleware(request) {
  const { pathname } = new URL(request.url);

  if (pathname === '/consultation.html' || pathname === '/consultation') {
    if (request.method === 'GET') return injectConsultationSpots(request);
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }

  if (pathname !== '/api/subscribe' || request.method !== 'POST') {
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }

  const ip = clientIp(request);
  let count;
  let resetEpoch;

  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const kvResult = await kvRateLimit(ip);
      count = kvResult.count;
      resetEpoch = kvResult.resetEpoch;
    } else {
      const mem = memoryRateLimit(ip);
      count = mem.count;
      resetEpoch = mem.resetEpoch;
    }
  } catch {
    const mem = memoryRateLimit(ip);
    count = mem.count;
    resetEpoch = mem.resetEpoch;
  }

  const remaining = MAX_REQUESTS - count;

  if (count > MAX_REQUESTS) {
    return new Response(JSON.stringify({ error: 'Too many requests. Try again in a minute.' }), {
      status: 429,
      headers: {
        ...rateHeaders(0, resetEpoch),
        'Content-Type': 'application/json',
        'Retry-After': '60',
      },
    });
  }

  return new Response(null, {
    status: 200,
    headers: { ...rateHeaders(remaining, resetEpoch), 'x-middleware-next': '1' },
  });
}

export const config = {
  matcher: ['/consultation.html', '/consultation', '/api/subscribe'],
};
