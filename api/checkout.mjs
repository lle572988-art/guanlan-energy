// api/checkout.mjs
// Vercel Serverless Function — Creates Stripe Checkout Session for any product
import Stripe from 'stripe';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const sk = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!sk) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }
  if (!/^sk_(live|test)_/.test(sk)) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY invalid format' });
    return;
  }

  try {
    const stripe = new Stripe(sk, {
      apiVersion: '2024-11-20.acacia',
      maxNetworkRetries: 2,
      timeout: 20000,
    });
    const origin = req.headers.origin || req.headers.referer?.replace(/\/[^/]*$/, '') || 'https://metaphysicflow.com';
    const { product, price, description, facing, year, dob, gender } = req.body || {};

    const products = {
      'life-palace-dive': {
        name: 'Life Palace Deep Dive',
        description: 'Dedicated Life Palace (命宫) deep analysis — master star nature, life mission, and 2026 activation preview. 8–10 page illustrated PDF.',
        unit_amount: 990,
      },
      'three-palace-snapshot': {
        name: 'Three-Palace Snapshot',
        description: 'Life, Wealth, and Career palace reading with 2026 activation notes — 12–14 page illustrated PDF.',
        unit_amount: 1900,
      },
      'starter': {
        name: 'Life Palace Deep Dive',
        description: 'Dedicated Life Palace (命宫) deep analysis — 8–10 page illustrated PDF.',
        unit_amount: 990,
      },
      'full-chart': {
        name: 'Full 12-Palace Matrix',
        description: 'All 12 palaces fully interpreted with Major Cycle, Four Transformations, and 2026 annual forecast — 20–25 page PDF.',
        unit_amount: 3900,
      },
      'partner-compatibility': {
        name: 'Partner Compatibility Reading',
        description: 'Reciprocal analysis of Relationship and Spouse palaces across two matching natal charts. Comprehensive illustrated PDF guide.',
        unit_amount: 5900,
      },
      'live-reading': {
        name: 'Live 1-on-1 Video Consultation',
        description: '30-minute private Zoom session with complete chart walkthrough, annotated PDF, and session recording.',
        unit_amount: 9900,
      },
      'annual': {
        name: 'Annual Cosmic Alignment',
        description: 'Quarterly in-depth reports · Solar term reminders · Unlimited email Q&A · Priority booking all year.',
        unit_amount: 19900,
      },
      'compass-room': {
        name: 'Energy X-Ray · Single Room Report',
        description: 'One room deep-dive — 2026 flying stars, personal Kua overlay, and three-step cures. HTML report emailed instantly; print as PDF from your browser.',
        unit_amount: 1900,
      },
      'compass-home': {
        name: 'Energy X-Ray · Full Home Report',
        description: 'Whole-home flying star map, four personal directions, room-by-room cures, and printable checklist. HTML report emailed instantly.',
        unit_amount: 3900,
      },
      'compass-home-year': {
        name: 'Home + 2026 Year Energy Forecast',
        description: 'Full home X-Ray plus 2026 monthly flying star calendar and activation windows. HTML report emailed instantly.',
        unit_amount: 4900,
      },
      'compass-annual': {
        name: 'Living Compass Annual · Home Energy Pass',
        description: 'Full home report plus 12 months of heatmap updates — monthly star briefs, quarterly shifts, and priority email Q&A.',
        unit_amount: 7900,
      },
    };

    let selected;
    if (product && products[product]) {
      selected = products[product];
    } else if (price) {
      selected = {
        name: description || 'Guanlan Energy Product',
        description: '',
        unit_amount: price,
      };
    } else {
      return res.status(400).json({
        error: 'Please specify a product (life-palace-dive, three-palace-snapshot, full-chart, partner-compatibility, live-reading, annual) or provide price in cents.',
      });
    }

    const metadata = {
      product: product || 'custom',
      source: 'guanlan-energy',
    };
    if (facing) metadata.guanlan_facing = String(facing);
    if (year) metadata.guanlan_xray_year = String(year);
    if (dob) metadata.guanlan_dob = String(dob);
    if (gender) metadata.guanlan_gender = String(gender);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: selected.name,
            description: selected.description,
          },
          unit_amount: selected.unit_amount,
        },
        quantity: 1,
      }],
      customer_email: undefined,
      success_url: `${origin}/thank-you.html?product=${encodeURIComponent(product || 'custom')}&stripe=1`,
      cancel_url: `${origin}/checkout.html?product=${encodeURIComponent(product || 'full-chart')}`,
      metadata,
    });

    console.log('Stripe session created:', session.id, 'for:', product);
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.type || err.code, err.message);
    const detail = err.type === 'StripeAuthenticationError'
      ? 'Stripe API key rejected — rotate STRIPE_SECRET_KEY in Vercel env.'
      : err.message;
    res.status(500).json({ error: 'Payment service unavailable', detail });
  }
}
