import Stripe from 'stripe';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Debug: check env var
  const sk = process.env.STRIPE_SECRET_KEY;
  if (!sk) {
    console.error('STRIPE_SECRET_KEY not set');
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured', debug: 'env_missing' });
    return;
  }
  
  if (!sk.startsWith('sk_')) {
    console.error('STRIPE_SECRET_KEY invalid format');
    res.status(500).json({ error: 'Invalid Stripe key format', debug: 'bad_key_format' });
    return;
  }

  try {
    const stripe = new Stripe(sk);
    const origin = req.headers.origin || 'https://metaphysicflow.com';
    
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Guanlan Energy — Full BaZi Report (10,000 Words)',
            description: 'Your complete Five Elements distribution, wealth sector activation, 2026 career timing, and personalized 10-Year Major Pillar analysis.',
          },
          unit_amount: 690,
        },
        quantity: 1,
      }],
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/checkout.html`,
      billing_address_collection: 'required',
    });
    
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ 
      error: 'Failed to create checkout session', 
      detail: err.message,
      debug: 'stripe_error'
    });
  }
}
