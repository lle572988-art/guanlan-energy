import Stripe from 'stripe';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const sk = process.env.STRIPE_SECRET_KEY;
  if (!sk) { res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' }); return; }

  try {
    // Use proxy for Stripe connections behind firewalls
    const httpProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    const stripeOpts = {};
    
    const stripe = new Stripe(sk, stripeOpts);
    const origin = req.headers.origin || 'https://metaphysicflow.com';
    
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Guanlan Energy — Full BaZi Report (10,000 Words)',
            description: 'Complete Five Elements distribution, wealth sector activation, 2026 career timing.',
          },
          unit_amount: 690,
        },
        quantity: 1,
      }],
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/checkout.html`,
    });
    
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Payment service unavailable', detail: err.message });
  }
}
