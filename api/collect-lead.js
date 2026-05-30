// Vercel Serverless — 留资收集 (Vercel Blob)
// POST — 追加留资 | GET — 返回列表
import { put, list } from '@vercel/blob';

const BLOB_PATH = 'leads.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — list + read via SDK
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: BLOB_PATH });
      if (!blobs || blobs.length === 0)
        return res.status(200).json({ success: true, total: 0, leads: [] });
      // Private store: read via authenticated download URL using fetch with token
      const resp = await fetch(blobs[0].url, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
      });
      if (!resp.ok) throw new Error('fetch');
      const data = await resp.json();
      const leads = Array.isArray(data.leads) ? data.leads : [];
      return res.status(200).json({ success: true, total: leads.length, leads });
    } catch (e) {
      return res.status(200).json({ success: true, total: 0, leads: [] });
    }
  }

  // POST — 追加
  const { email, page } = req.body || {};
  if (!email || !email.includes('@'))
    return res.status(400).json({ error: 'Invalid email' });

  let leads = [];
  try {
    const { blobs } = await list({ prefix: BLOB_PATH });
    if (blobs && blobs.length > 0) {
      const resp = await fetch(blobs[0].url, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        leads = Array.isArray(data.leads) ? data.leads : [];
      }
    }
  } catch (e) { /* first time */ }

  leads.push({
    email,
    page: page || '/',
    captured_at: new Date().toISOString(),
    tag: 'widget-bazi-wealth'
  });

  try {
    await put(BLOB_PATH, JSON.stringify({ leads }, null, 2), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (e) {
    console.error('Blob put error:', e.message);
    return res.status(500).json({ error: 'Blob put failed: ' + e.message });
  }

  return res.status(200).json({ success: true, message: 'Lead captured', total: leads.length });
}
