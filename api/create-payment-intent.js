// api/create-payment-intent.js
// Vercel Serverless Function - creates a Stripe PaymentIntent
import Stripe from 'stripe';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return res.status(500).json({ error: 'Stripe not configured. Please set STRIPE_SECRET_KEY.' });
    }

    const stripe = new Stripe(stripeKey);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 690, // $6.90 in cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      description: 'Full Five Element Energy Report',
      metadata: {
        product: 'wovthw',
        source: 'guanlan-energy'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
    });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
}
