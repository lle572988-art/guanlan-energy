// api/generate-reading.js
// 🛡️ 安全中转：Anthropic Claude API Key 隐藏在 Vercel 环境变量 ANTHROPIC_API_KEY 中
// 设置方式：Vercel Dashboard → Settings → Environment Variables → ANTHROPIC_API_KEY
// 前端 → /api/generate-reading（同源，无 Key 暴露）→ Anthropic API

const ALLOWED_ORIGINS = [
  'https://guanlanenergy.com',
  'https://www.guanlanenergy.com',
  'http://localhost:3000',
  'http://localhost:5173'
];

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS_CAP = 1200;

export default async function handler(req, res) {
  const origin = req.headers.origin || '';

  // CORS
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(origin) ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: ANTHROPIC_API_KEY is not set.' });
  }

  try {
    const { messages, max_tokens } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const upstream = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: Math.min(Number(max_tokens) || 1000, MAX_TOKENS_CAP),
        messages
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data?.error?.message || 'Anthropic API error',
        status: upstream.status
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      details: error.message
    });
  }
}
