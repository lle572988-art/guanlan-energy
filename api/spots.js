export const config = { runtime: 'edge' };

const DEFAULT_SPOTS = 8;
const CACHE_SECONDS = 60;

async function readSpots(kv) {
  let remaining = await kv.get('spots');
  if (remaining == null) {
    await kv.set('spots', DEFAULT_SPOTS);
    remaining = DEFAULT_SPOTS;
  }
  return Math.max(0, Number(remaining) || 0);
}

export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  let remaining = DEFAULT_SPOTS;
  let kvAvailable = false;
  try {
    const { kv } = await import('@vercel/kv');
    remaining = await readSpots(kv);
    kvAvailable = true;
  } catch {
    /* KV optional in dev */
  }

  const cacheControl = kvAvailable
    ? `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=120`
    : 'no-store';

  return new Response(JSON.stringify({ remaining }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
    },
  });
}
