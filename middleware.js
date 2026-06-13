/** Edge middleware — consultation spots SSR + API rate limits. */
import {
  checkRateLimit,
  rateLimitHeaders,
  rateLimitResponse,
} from './lib/edge-rate-limit.js';

const API_RULES = [
  { prefix: 'subscribe', path: '/api/subscribe', methods: ['POST'], windowSec: 60, max: 5 },
  { prefix: 'spots', path: '/api/spots', methods: ['GET'], windowSec: 60, max: 40 },
  { prefix: 'gumroad-webhook', path: '/api/gumroad-webhook', methods: ['GET', 'POST'], windowSec: 60, max: 15 },
  { prefix: 'gumroad-ping', path: '/api/gumroad-ping', methods: ['POST'], windowSec: 60, max: 15 },
  { prefix: 'api-default', path: '/api', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], windowSec: 60, max: 20 },
];

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

function matchApiRule(pathname, method) {
  for (const rule of API_RULES) {
    if (rule.path !== '/api' && pathname !== rule.path) continue;
    if (rule.path === '/api' && pathname === '/api') continue;
    if (rule.path === '/api' && !pathname.startsWith('/api/')) continue;
    if (rule.path === '/api' && API_RULES.some((r) => r.path !== '/api' && pathname === r.path)) continue;
    if (!rule.methods.includes(method)) continue;
    return rule;
  }
  if (pathname.startsWith('/api/')) {
    const fallback = API_RULES.find((r) => r.path === '/api');
    if (fallback && fallback.methods.includes(method)) return fallback;
  }
  return null;
}

async function enforceApiRateLimit(request) {
  const { pathname } = new URL(request.url);
  const rule = matchApiRule(pathname, request.method);
  if (!rule) {
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }

  const { limited, remaining, resetEpoch, max } = await checkRateLimit(request, {
    prefix: rule.prefix,
    windowSec: rule.windowSec,
    max: rule.max,
  });

  if (limited) {
    return rateLimitResponse(resetEpoch, max);
  }

  return new Response(null, {
    status: 200,
    headers: {
      ...rateLimitHeaders(max, remaining, resetEpoch),
      'x-middleware-next': '1',
    },
  });
}

export default async function middleware(request) {
  const { pathname } = new URL(request.url);

  if (pathname === '/consultation.html' || pathname === '/consultation') {
    if (request.method === 'GET') return injectConsultationSpots(request);
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }

  if (pathname.startsWith('/api')) {
    return enforceApiRateLimit(request);
  }

  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}

export const config = {
  matcher: ['/consultation.html', '/consultation', '/api/:path*'],
};
