// api/generate-image.js — Fal Flux → Vercel Blob (FAL_API_KEY / FAL_KEY in env)
import { put } from '@vercel/blob';

function getFalApiKey() {
  return (process.env.FAL_API_KEY || process.env.FAL_KEY || '').trim();
}

const ALLOWED_ELEMENTS = new Set(['metal', 'wood', 'water', 'fire', 'earth']);

const ELEMENT_STYLE = {
  metal: { name: 'Metal', colors: 'white gold and silver', mood: 'sharp, luminous, crystalline' },
  wood: { name: 'Wood', colors: 'deep emerald and jade green', mood: 'organic, flowing' },
  water: { name: 'Water', colors: 'deep blue and obsidian black', mood: 'fluid, mysterious' },
  fire: { name: 'Fire', colors: 'crimson and warm gold', mood: 'radiant, intense, rising' },
  earth: { name: 'Earth', colors: 'amber, ochre and warm brown', mood: 'grounded, ancient' },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const falKey = getFalApiKey();
  if (!falKey) {
    return res.status(500).json({ error: 'FAL_API_KEY not configured' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const rawElement = String(body.element || 'fire').toLowerCase();
    const element = ALLOWED_ELEMENTS.has(rawElement) ? rawElement : 'fire';
    const style = ELEMENT_STYLE[element];

    const prompt =
      `An abstract mystical energy mandala representing the Chinese five-element force of ${style.name}. ` +
      `${style.mood} energy, ${style.colors} palette on a deep black cosmic background. ` +
      `Ethereal nebula, sacred geometry, glowing particles, luxurious and elegant. ` +
      `No text, no letters, no human figures. High detail, 4k wallpaper.`;

    const falRes = await fetch('https://fal.run/fal-ai/flux/dev', {
      method: 'POST',
      headers: {
        Authorization: `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'square_hd',
        num_images: 1,
      }),
    });

    if (!falRes.ok) {
      const errText = await falRes.text();
      console.error('[generate-image] fal error:', falRes.status, errText.slice(0, 200));
      return res.status(502).json({ error: 'Image generation failed' });
    }

    const data = await falRes.json();
    const imageUrl = data?.images?.[0]?.url;
    if (!imageUrl) {
      console.error('[generate-image] no image in fal response');
      return res.status(502).json({ error: 'No image returned' });
    }

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return res.status(200).json({ url: imageUrl, element });
    }

    const imgBuf = await imgRes.arrayBuffer();
    try {
      const { url } = await put(`energy/${element}-${Date.now()}.png`, Buffer.from(imgBuf), {
        access: 'public',
        contentType: 'image/png',
      });
      return res.status(200).json({ url, element });
    } catch (blobErr) {
      console.warn('[generate-image] blob put failed, returning Fal URL:', blobErr.message);
      return res.status(200).json({ url: imageUrl, element });
    }
  } catch (err) {
    console.error('[generate-image] error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
