export const config = { runtime: 'edge' };

const STATS_KEY = 'chart_stats';
const DEFAULT_COUNT = 127;

const corsHeaders = {
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Access-Control-Allow-Origin': 'https://metaphysicflow.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
};

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function readCount(kv) {
  const { metadata } = await kv.getWithMetadata(STATS_KEY);
  const n = Number(metadata?.count);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_COUNT;
}

async function writeCount(kv, count) {
  await kv.put(STATS_KEY, null, { metadata: { count } });
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  let kv = null;
  try {
    const mod = await import('@vercel/kv');
    kv = mod.kv;
  } catch {
    /* KV optional in dev */
  }

  if (request.method === 'GET') {
    let count = DEFAULT_COUNT;
    if (kv) {
      try {
        count = await readCount(kv);
      } catch (err) {
        console.error('[stats] GET', err);
      }
    }
    return jsonResponse({ count });
  }

  if (request.method === 'POST') {
    let count = DEFAULT_COUNT + 1;
    if (kv) {
      try {
        const current = await readCount(kv);
        count = current + 1;
        await writeCount(kv, count);
      } catch (err) {
        console.error('[stats] POST', err);
        return jsonResponse({ error: 'Service error' }, 500);
      }
    }
    return jsonResponse({ count });
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}
