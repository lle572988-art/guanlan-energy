// api/upload-compass-image.mjs — Host room photo on Blob for cure API (small follow-up JSON)
import { put } from '@vercel/blob';

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const dataUrl = body.dataUrl || body.data_url;
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      return res.status(400).json({ error: 'Missing image dataUrl' });
    }

    const match = dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
    if (!match) return res.status(400).json({ error: 'Invalid image data' });

    const buf = Buffer.from(match[2], 'base64');
    if (buf.length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large — try a smaller photo' });
    }

    const ext = match[1].includes('png') ? 'png' : 'jpg';
    const blob = await put(`compass/uploads/${Date.now()}.${ext}`, buf, {
      access: 'public',
      contentType: match[1],
    });
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('[upload-compass-image]', err.message);
    return res.status(500).json({ error: 'Could not upload image' });
  }
}
