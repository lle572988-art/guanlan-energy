// Vercel Serverless — lead capture, ESP sync, Day-0 PDF hook
// POST — enrich + store lead + trigger ESP + PDF job
// GET  — list stored leads (admin)

import { put, list } from '@vercel/blob';
import { enrichLead, validateLeadPayload } from '../server/lib/lead-enrichment.js';
import { syncLeadToEsp } from '../server/lib/esp-adapters.js';
import { generateChartPDF } from '../server/lib/generate-chart-pdf.js';
import { getEspConfig } from '../server/lib/esp-config.js';

const BLOB_PATH = 'leads.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: BLOB_PATH });
      if (!blobs || blobs.length === 0) {
        return res.status(200).json({ success: true, total: 0, leads: [] });
      }
      const resp = await fetch(blobs[0].url, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      });
      if (!resp.ok) throw new Error('fetch');
      const data = await resp.json();
      const leads = Array.isArray(data.leads) ? data.leads : [];
      return res.status(200).json({ success: true, total: leads.length, leads });
    } catch (e) {
      return res.status(200).json({ success: true, total: 0, leads: [] });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const enriched = enrichLead(req.body || {});
  const validation = validateLeadPayload(enriched);
  if (!validation.ok) {
    return res.status(400).json({ error: validation.error });
  }

  let leads = [];
  try {
    const { blobs } = await list({ prefix: BLOB_PATH });
    if (blobs && blobs.length > 0) {
      const resp = await fetch(blobs[0].url, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        leads = Array.isArray(data.leads) ? data.leads : [];
      }
    }
  } catch (e) {
    /* first lead */
  }

  // Day 0 PDF generation hook (non-blocking for response latency)
  let pdfJob = null;
  if (enriched.pdfReady) {
    try {
      pdfJob = await generateChartPDF({
        email: enriched.email,
        dob: enriched.dob,
        hour: enriched.hour,
        country: enriched.country,
        mainStar: enriched.mainStar,
        mainStarEn: enriched.mainStarEn,
        chartSvg: req.body?.chartSvg || '',
        name: enriched.name,
      });
    } catch (err) {
      console.error('[collect-lead] PDF hook error:', err.message);
      pdfJob = { status: 'error', error: err.message };
    }
  }

  // Push to ESP (Mailchimp / ConvertKit / Loops) with palace tags
  const espResult = await syncLeadToEsp(enriched);

  const record = {
    ...enriched,
    pdfJobId: pdfJob?.jobId || null,
    pdfStatus: pdfJob?.status || null,
    espProvider: espResult.provider || getEspConfig().provider,
    espSynced: !!espResult.synced,
    espDetail: espResult.error || espResult.reason || null,
  };

  leads.push(record);

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

  return res.status(200).json({
    success: true,
    message: 'Lead captured',
    total: leads.length,
    mainStar: enriched.mainStar,
    mainStarEn: enriched.mainStarEn,
    tags: enriched.tags,
    pdfJob,
    esp: espResult,
  });
}
