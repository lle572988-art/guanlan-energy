// api/compass-cure-image.js — Room cure staging via Fal img2img (Wow #3)
import { put } from '@vercel/blob';

const CURE_PROMPTS = {
  metal: 'subtle brass bowl, white crystals, round metal decor on shelf, calm minimalist feng shui cure',
  wood: 'healthy green plants, wooden accents, vertical growth energy, natural light',
  water: 'small water feature, dark blue accents, reflective surfaces, flowing calm',
  fire: 'warm amber lighting, candles, red accent textiles, inviting warmth without clutter',
  earth: 'ceramic vases, earth-tone textiles, stable grounded decor, yellow ochre accents',
};

export const config = {
  maxDuration: 60,
};

async function resolveImageUrl(body) {
  let imageUrl = body.imageUrl || body.image_url;
  const dataUrl = body.dataUrl || body.data_url;
  if (imageUrl) return imageUrl;

  if (!dataUrl || !dataUrl.startsWith('data:')) return null;

  const match = dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!match) return null;

  const buf = Buffer.from(match[2], 'base64');
  if (buf.length > 2 * 1024 * 1024) {
    throw new Error('Image too large — use a smaller photo');
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_NOT_CONFIGURED');
  }

  const ext = match[1].includes('png') ? 'png' : 'jpg';
  const blob = await put(`compass/uploads/${Date.now()}.${ext}`, buf, {
    access: 'public',
    contentType: match[1],
  });
  return blob.url;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const falKey = process.env.FAL_API_KEY;
  if (!falKey) {
    return res.status(503).json({ error: 'AI cure preview is not configured yet' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Image upload not configured on server' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const imageUrl = await resolveImageUrl(body);
    const element = String(body.element || 'metal').toLowerCase();
    const cureHint = CURE_PROMPTS[element] || CURE_PROMPTS.metal;
    const room = body.room || 'living room';
    const star = body.star ? `flying star ${body.star} sector` : 'challenging energy sector';

    if (!imageUrl) {
      return res.status(400).json({ error: 'Upload a room photo first (dataUrl or imageUrl)' });
    }

    const prompt =
      `Professional interior photo of a ${room}, same layout and architecture as the reference. ` +
      `Add gentle feng shui cures for a ${star}: ${cureHint}. ` +
      'Quiet luxury, celadon and paper tones, no people, no text, photorealistic staging.';

    const falRes = await fetch('https://fal.run/fal-ai/flux/dev/image-to-image', {
      method: 'POST',
      headers: {
        Authorization: `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_url: imageUrl,
        strength: 0.52,
        num_images: 1,
        output_format: 'jpeg',
      }),
    });

    if (!falRes.ok) {
      const errText = await falRes.text();
      console.error('[compass-cure-image] fal error:', falRes.status, errText.slice(0, 300));
      let detail = errText.slice(0, 120);
      try {
        const parsed = JSON.parse(errText);
        detail = parsed.detail || parsed.message || detail;
      } catch { /* raw text */ }
      return res.status(502).json({ error: 'Cure image generation failed' });
    }

    const data = await falRes.json();
    const outUrl = data?.images?.[0]?.url;
    if (!outUrl) return res.status(502).json({ error: 'No image returned' });

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(200).json({ url: outUrl, element, room });
    }

    const imgRes = await fetch(outUrl);
    if (!imgRes.ok) return res.status(200).json({ url: outUrl, element, room });

    const imgBuf = await imgRes.arrayBuffer();
    const blob = await put(`compass/cures/${Date.now()}.jpg`, Buffer.from(imgBuf), {
      access: 'public',
      contentType: 'image/jpeg',
    });
    return res.status(200).json({ url: blob.url, element, room });
  } catch (err) {
    console.error('[compass-cure-image]', err.message);
    const msg = err.message === 'Image too large — use a smaller photo'
      ? err.message
      : err.message === 'BLOB_NOT_CONFIGURED'
        ? 'Image upload not configured on server'
        : 'Internal error';
    return res.status(500).json({ error: msg });
  }
}
