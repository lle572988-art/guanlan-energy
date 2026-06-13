/** A/B stats — Plausible cta_variant breakdown with 95% confidence winner. */
export const config = { runtime: 'edge' };

const SITE_ID = 'metaphysicflow.com';
const CACHE_KEY = 'ab_stats_cache';
const CACHE_TTL = 3600;

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, private',
    },
  });
}

function normalCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z >= 0 ? 1 - p : p;
}

function twoProportionZTest(successA, totalA, successB, totalB) {
  if (totalA < 1 || totalB < 1) return { z: 0, pValue: 1, significant: false };
  const pA = successA / totalA;
  const pB = successB / totalB;
  const pooled = (successA + successB) / (totalA + totalB);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / totalA + 1 / totalB));
  if (se === 0) return { z: 0, pValue: 1, significant: false };
  const z = (pA - pB) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));
  return { z, pValue, significant: pValue < 0.05 };
}

async function queryPlausible(apiKey, body) {
  const res = await fetch('https://plausible.io/api/v2/query', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Plausible ${res.status}: ${text}`);
  }
  return res.json();
}

function variantCountFromResults(data, variant) {
  const rows = data?.results || [];
  for (const row of rows) {
    const dim = row.dimensions?.[0];
    if (dim === variant) return Number(row.metrics?.[0] || 0);
  }
  return 0;
}

async function fetchEventCount(apiKey, eventName, variant) {
  const filters = [['is', 'event:name', [eventName]]];
  if (variant) filters.push(['is', 'event:props:variant', [variant]]);
  const data = await queryPlausible(apiKey, {
    site_id: SITE_ID,
    metrics: ['events'],
    date_range: '30d',
    dimensions: variant ? [] : ['event:props:variant'],
    filters,
  });
  if (variant) return Number(data?.results?.[0]?.metrics?.[0] || 0);
  return {
    A: variantCountFromResults(data, 'A'),
    B: variantCountFromResults(data, 'B'),
  };
}

async function buildStats(apiKey) {
  const exposures = await fetchEventCount(apiKey, 'cta_variant');
  const conversionsA = await fetchEventCount(apiKey, 'form_submit', 'A');
  const conversionsB = await fetchEventCount(apiKey, 'form_submit', 'B');

  const totalA = exposures.A || 0;
  const totalB = exposures.B || 0;
  const test = twoProportionZTest(conversionsA, totalA, conversionsB, totalB);

  let winner = null;
  let recommendation = 'Insufficient data — need more cta_variant exposures and form_submit events per variant.';
  if (test.significant) {
    const rateA = totalA ? conversionsA / totalA : 0;
    const rateB = totalB ? conversionsB / totalB : 0;
    winner = rateA >= rateB ? 'A' : 'B';
    recommendation = `Recommend variant ${winner} at 95% confidence (p=${test.pValue.toFixed(4)}).`;
  } else if (totalA + totalB >= 100) {
    recommendation = 'No statistically significant winner yet — continue collecting data.';
  }

  return {
    ok: true,
    site_id: SITE_ID,
    date_range: '30d',
    exposures: { A: totalA, B: totalB },
    conversions: { A: conversionsA, B: conversionsB },
    test: {
      pValue: Number(test.pValue.toFixed(6)),
      significant: test.significant,
      confidence: 0.95,
    },
    winner,
    recommendation,
  };
}

export default async function handler(request) {
  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const url = new URL(request.url);
  const token = url.searchParams.get('token') || '';
  const expected = process.env.AB_STATS_TOKEN;
  if (!expected || token !== expected) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const apiKey = process.env.PLAUSIBLE_API_KEY;
  if (!apiKey) {
    return jsonResponse({
      error: 'PLAUSIBLE_API_KEY not configured',
      hint: 'Set PLAUSIBLE_API_KEY in Vercel env to enable A/B stats.',
    }, 503);
  }

  let kv = null;
  try {
    const mod = await import('@vercel/kv');
    kv = mod.kv;
  } catch {
    /* KV optional */
  }

  if (kv) {
    try {
      const cached = await kv.get(CACHE_KEY);
      if (cached) {
        const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return jsonResponse({ ...data, cached: true });
      }
    } catch (err) {
      console.error('[ab-stats] cache read', err);
    }
  }

  try {
    const data = await buildStats(apiKey);

    console.log('[ab-stats]', data.recommendation, {
      exposures: data.exposures,
      conversions: data.conversions,
      pValue: data.test.pValue,
      winner: data.winner,
    });

    if (kv) {
      try {
        await kv.put(CACHE_KEY, JSON.stringify(data), { ex: CACHE_TTL });
      } catch (err) {
        console.error('[ab-stats] cache write', err);
      }
    }

    return jsonResponse(data);
  } catch (err) {
    console.error('[ab-stats]', err);
    return jsonResponse({ error: err.message || 'Plausible query failed' }, 502);
  }
}
