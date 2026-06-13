/** Shared edge rate limit — KV when available, in-memory fallback per instance. */
const mem = new Map();

export function clientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function rateLimitHeaders(limit, remaining, resetEpoch) {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    'X-RateLimit-Reset': String(resetEpoch),
  };
}

export async function checkRateLimit(request, { prefix, windowSec = 60, max = 30 }) {
  const ip = clientIp(request);
  const key = `rl:${prefix}:${ip}`;

  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      const count = await kv.incr(key);
      if (count === 1) await kv.expire(key, windowSec);
      const ttl = await kv.ttl(key);
      const resetEpoch = Math.ceil(Date.now() / 1000) + (ttl > 0 ? ttl : windowSec);
      return {
        limited: count > max,
        remaining: Math.max(0, max - count),
        resetEpoch,
        max,
      };
    }
  } catch {
    /* fall through to memory */
  }

  const now = Date.now();
  let bucket = mem.get(key);
  if (!bucket || now - bucket.start >= windowSec * 1000) {
    bucket = { start: now, count: 0 };
  }
  bucket.count += 1;
  mem.set(key, bucket);
  const resetEpoch = Math.ceil((bucket.start + windowSec * 1000) / 1000);
  return {
    limited: bucket.count > max,
    remaining: Math.max(0, max - bucket.count),
    resetEpoch,
    max,
  };
}

export function rateLimitResponse(resetEpoch, max) {
  return new Response(JSON.stringify({ error: 'Too many requests. Try again later.' }), {
    status: 429,
    headers: {
      ...rateLimitHeaders(max, 0, resetEpoch),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Retry-After': '60',
    },
  });
}
