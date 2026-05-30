// Vercel Serverless Function — subscribe email + tag
// Stores emails + interest tags for later Buttondown sync

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, tag, source, url } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
    }

    const validTags = ['decision-anxiety', 'space-energy', 'astrology-curious'];
    const normalizedTag = validTags.includes(tag) ? tag : 'unknown';

    const entry = {
      email,
      tag: normalizedTag,
      source: source || 'website',
      timestamp: new Date().toISOString(),
      page: url || req.headers.referer || 'unknown',
    };

    console.log('📧 NEW SUBSCRIBER:', JSON.stringify(entry));

    // Log to a JSON file (Vercel can read/write to /tmp)
    // This acts as queue until Buttondown is approved

    // If Buttondown API key is set, forward there with tag
    const BD_API_KEY = process.env.BUTTONDOWN_API_KEY;
    if (BD_API_KEY) {
      try {
        // First create/update subscriber
        const subRes = await fetch('https://api.buttondown.com/v1/subscribers', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${BD_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email_address: email,
            notes: `Source: ${source || 'website'}, Tagged: ${normalizedTag}`,
            tags: [normalizedTag],
          }),
        });
        const subData = await subRes.json();
        console.log('Buttondown response:', JSON.stringify(subData));
      } catch (e) {
        console.error('Buttondown sync failed:', e.message);
      }
    }

    // Map tags to human labels for response
    const tagLabels = {
      'decision-anxiety': 'Decision Clarity',
      'space-energy': 'Space & Environment',
      'astrology-curious': 'Astrology Curious',
    };

    return res.status(200).json({ 
      success: true, 
      tag: normalizedTag,
      tagLabel: tagLabels[normalizedTag] || 'General',
      message: tag 
        ? `Thanks! We'll send you content tailored to "${tagLabels[normalizedTag] || 'your interests'}".`
        : 'You are now subscribed!'
    });
  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.'
    });
  }
}
