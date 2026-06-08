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

  const sk = process.env.STRIPE_SECRET_KEY;
  if (!sk) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  try {
    const stripe = new Stripe(sk);
    const origin = req.headers.origin || 'https://guanlanenergy.com';
    const { product, price, description } = req.body || {};

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
      success_url: `${origin}/?payment=success&product=${product || 'custom'}`,
      cancel_url: `${origin}/checkout.html?product=${product || 'full-chart'}`,
      metadata: {
        product: product || 'custom',
        source: 'guanlan-energy',
      },
    });

    console.log('Stripe session created:', session.id, 'for:', product);
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message, err.type);
    res.status(500).json({ error: 'Payment service unavailable', detail: err.message });
  }
}
