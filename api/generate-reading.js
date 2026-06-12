// api/generate-reading.js
// 🛡️ 安全中转：AI API Key 隐藏在 Vercel 环境变量 AI_API_KEY 中
// 兼容旧名 ANTHROPIC_API_KEY。当前使用 DeepSeek API。

const ALLOWED_ORIGINS = [
  'https://guanlanenergy.com',
  'https://www.guanlanenergy.com',
  'http://localhost:3000',
  'http://localhost:5173'
];

const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';
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

  const apiKey = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: AI_API_KEY is not set.' });
  }

  try {
    const { messages, max_tokens } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    // 转换 Anthropic Messages 格式 → OpenAI Chat Completions 格式
    const openaiMessages = messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const upstream = await fetch(DEEPSEEK_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: Math.min(Number(max_tokens) || 1000, MAX_TOKENS_CAP),
        messages: openaiMessages,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data?.error?.message || 'DeepSeek API error',
        status: upstream.status
      });
    }

    // 将 OpenAI Chat Completions 格式转回类似 Anthropic 的格式
    // 保持前端兼容
    const reply = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({
      content: [{ type: 'text', text: reply }],
      model: MODEL,
      usage: data.usage,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      details: error.message
    });
  }
}
