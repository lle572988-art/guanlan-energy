/** Edge middleware — consultation spots SSR + API rate limits. */
import {
  checkRateLimit,
  rateLimitHeaders,
  rateLimitResponse,
} from './lib/edge-rate-limit.js';

export const config = {
  runtime: 'edge',
  matcher: ['/consultation.html', '/consultation', '/api/:path*'],
};

const CONSULTATION_SERVICE_OFFERS = [
  { name: 'Life Palace Deep Dive', price: '9.90' },
  { name: 'Full 12-Palace Matrix', price: '39' },
  { name: 'Live Video Session', price: '99' },
];

const CONSULTATION_REVIEWS = [
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Verified Buyer' },
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody:
      'The Zi Wei reading described patterns I had never articulated — career timing and relationship friction landed with uncomfortable accuracy.',
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Chart Reader' },
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody:
      'Finally a Purple Star Astrology consultation in English that goes palace-by-palace instead of generic sun-sign fluff.',
  },
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Returning Client' },
    reviewRating: { '@type': 'Rating', ratingValue: '4', bestRating: '5' },
    reviewBody:
      'The live video session answered follow-up questions my PDF could not — worth the upgrade for high-stakes decisions.',
  },
];

function buildServiceSchemaFragment(availability) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Zi Wei Dou Shu Consultation',
    description: 'Private voice-based deep dive into your Purple Star chart and twelve life palaces.',
    provider: { '@id': 'https://metaphysicflow.com/#organization' },
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    offers: CONSULTATION_SERVICE_OFFERS.map((tier) => ({
      '@type': 'Offer',
      name: tier.name,
      price: tier.price,
      priceCurrency: 'USD',
      availability,
    })),
    review: CONSULTATION_REVIEWS,
  };
}

function mergeServiceSchema(html, availability) {
  const service = buildServiceSchemaFragment(availability);
  const serviceBlock = JSON.stringify(service, null, 2);
  const re =
    /\{\s*"@context"\s*:\s*"https:\/\/schema\.org",\s*"@type"\s*:\s*"Service"[\s\S]*?\n\}/;
  if (re.test(html)) return html.replace(re, serviceBlock);
  return html;
}

const API_RULES = [
  { prefix: 'subscribe', path: '/api/subscribe', methods: ['POST'], windowSec: 60, max: 5 },
  { prefix: 'confirm', path: '/api/confirm', methods: ['GET'], windowSec: 60, max: 20 },
  { prefix: 'chart-meta', path: '/api/chart-meta', methods: ['POST'], windowSec: 60, max: 30 },
  { prefix: 'stats', path: '/api/stats', methods: ['GET', 'POST'], windowSec: 60, max: 60 },
  { prefix: 'spots', path: '/api/spots', methods: ['GET'], windowSec: 60, max: 40 },
  { prefix: 'gumroad-webhook', path: '/api/gumroad-webhook', methods: ['GET', 'POST'], windowSec: 60, max: 15 },
  { prefix: 'ab-stats', path: '/api/ab-stats', methods: ['GET'], windowSec: 60, max: 10 },
  { prefix: 'gumroad-ping', path: '/api/gumroad-ping', methods: ['POST'], windowSec: 60, max: 15 },
  { prefix: 'generate-image', path: '/api/generate-image', methods: ['POST'], windowSec: 86400, max: 2 },
  { prefix: 'compass-cure-image', path: '/api/compass-cure-image', methods: ['POST'], windowSec: 3600, max: 8 },
  { prefix: 'upload-compass-image', path: '/api/upload-compass-image', methods: ['POST'], windowSec: 3600, max: 20 },
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
  html = mergeServiceSchema(html, availability);
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
