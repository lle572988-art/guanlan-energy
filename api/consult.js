// Vercel Serverless — consultation booking (干净版)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email } = req.body || {};
    console.log('Consultation:', name || '?', '<' + (email || '?') + '>');
    return res.status(200).json({ success: true, message: 'Request received.' });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
}
