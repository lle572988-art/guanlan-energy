import Stripe from 'stripe';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Guanlan Energy — Full BaZi Report (10,000 Words)',
            description: 'Your complete Five Elements distribution, wealth sector activation, 2026 career timing, and personalized 10-Year Major Pillar analysis.',
          },
          unit_amount: 690, // $6.90 in cents
        },
        quantity: 1,
      }],
      success_url: `${req.headers.origin || 'https://metaphysicflow.com'}/?payment=success`,
      cancel_url: `${req.headers.origin || 'https://metaphysicflow.com'}/checkout.html`,
    });
    
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
