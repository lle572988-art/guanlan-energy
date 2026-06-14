// api/compass-cure-image.js — Room cure staging via Fal img2img (Wow #3)
function getFalApiKey() {
  const raw = (process.env.FAL_API_KEY || process.env.FAL_KEY || '').trim();
  const cleaned = raw.replace(/[^\x21-\x7E]/g, '');
  return cleaned.length > 256 ? cleaned.slice(0, 256) : cleaned;
}

const CURE_PROMPTS = {
  metal: 'subtle brass bowl, white crystals, round metal decor on shelf, calm minimalist feng shui cure',
  wood: 'healthy green plants, wooden accents, vertical growth energy, natural light',
  water: 'small water feature, dark blue accents, reflective surfaces, flowing calm',
  fire: 'warm amber lighting, candles, red accent textiles, inviting warmth without clutter',
  earth: 'ceramic vases, earth-tone textiles, stable grounded decor, yellow ochre accents',
};

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch {
      return {};
    }
  }
  return req.body;
}

function resolveFalImageInput(body) {
  const imageUrl = (body.imageUrl || body.image_url || '').trim();
  if (imageUrl) return imageUrl;

  const dataUrl = body.dataUrl || body.data_url;
  if (!dataUrl || !String(dataUrl).startsWith('data:')) return null;

  const match = String(dataUrl).match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!match) return null;

  const buf = Buffer.from(match[2], 'base64');
  if (buf.length > 2.5 * 1024 * 1024) {
    throw new Error('Image too large — use a smaller photo');
  }

  return String(dataUrl);
}

async function falFetch(falKey, url, options = {}) {
  const headers = {
    Authorization: `Key ${falKey}`,
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text.slice(0, 200) };
    }
  }
  return { ok: res.ok, status: res.status, data };
}

async function runFalImg2img(falKey, imageInput, prompt) {
  const payload = {
    prompt,
    image_url: imageInput,
    strength: 0.52,
    num_inference_steps: 28,
    num_images: 1,
    output_format: 'jpeg',
  };

  const submit = await falFetch(
    falKey,
    'https://queue.fal.run/fal-ai/flux/dev/image-to-image',
    { method: 'POST', body: JSON.stringify(payload) },
  );

  if (!submit.ok) {
    const detail = submit.data?.detail || submit.data?.error || submit.data?.message;
    throw new Error(detail || `AI service error (${submit.status})`);
  }

  const directUrl = submit.data?.images?.[0]?.url;
  if (directUrl) return directUrl;

  const requestId = submit.data?.request_id;
  if (!requestId) throw new Error('AI service did not return a job id');

  const statusBase = `https://queue.fal.run/fal-ai/flux/dev/image-to-image/requests/${requestId}`;
  const deadline = Date.now() + 52000;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 2000));

    const status = await falFetch(falKey, `${statusBase}/status`, { method: 'GET' });
    const state = status.data?.status;

    if (state === 'COMPLETED') break;
    if (state === 'FAILED') {
      throw new Error(status.data?.error || 'AI image generation failed');
    }
  }

  const result = await falFetch(falKey, statusBase, { method: 'GET' });
  const outUrl = result.data?.images?.[0]?.url;
  if (!outUrl) throw new Error('No image returned from AI service');
  return outUrl;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const falKey = getFalApiKey();
  if (!falKey) {
    return res.status(503).json({ error: 'AI cure preview is not configured yet' });
  }

  try {
    const body = parseBody(req);
    const imageInput = resolveFalImageInput(body);
    const element = String(body.element || 'metal').toLowerCase();
    const cureHint = CURE_PROMPTS[element] || CURE_PROMPTS.metal;
    const room = body.room || 'living room';
    const star = body.star ? `flying star ${body.star} sector` : 'challenging energy sector';

    if (!imageInput) {
      return res.status(400).json({ error: 'Upload a room photo first (dataUrl or imageUrl)' });
    }

    const prompt =
      `Professional interior photo of a ${room}, same layout and architecture as the reference. ` +
      `Add gentle feng shui cures for a ${star}: ${cureHint}. ` +
      'Quiet luxury, celadon and paper tones, no people, no text, photorealistic staging.';

    const outUrl = await runFalImg2img(falKey, imageInput, prompt);
    return res.status(200).json({ url: outUrl, element, room });
  } catch (err) {
    console.error('[compass-cure-image]', err.message);
    const msg = String(err.message || '');
    if (msg.includes('Image too large')) {
      return res.status(400).json({ error: msg });
    }
    if (/exhausted balance|user is locked/i.test(msg)) {
      return res.status(503).json({
        error: 'AI cure preview is temporarily unavailable — billing limit reached.',
      });
    }
    if (/authentication|api key|access application/i.test(msg)) {
      return res.status(503).json({ error: 'AI cure preview is not configured yet' });
    }
    return res.status(502).json({ error: msg || 'Cure image generation failed' });
  }
}
