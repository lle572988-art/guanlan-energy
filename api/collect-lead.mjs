// Vercel Serverless — Phase 6 AI karma report fulfillment
// POST — enrich → Claude report → Resend email → Blob + ESP
// GET  — list leads (requires LEAD_ADMIN_TOKEN query param)

import { put, list } from '@vercel/blob';
import { enrichLead, validateLeadPayload } from '../server/lib/lead-enrichment.js';
import { syncLeadToEsp } from '../server/lib/esp-adapters.js';
import { generateChartPDF } from '../server/lib/generate-chart-pdf.js';
import { getEspConfig } from '../server/lib/esp-config.js';
import { parsePageContext } from '../server/lib/parse-page-context.js';
import {
  fulfillKarmaReport,
  findRecentFulfillment,
} from '../server/lib/karma-fulfillment.js';

const BLOB_PATH = 'leads.json';

function requireAdmin(req, res) {
  const token = process.env.LEAD_ADMIN_TOKEN;
  if (!token) return true;
  const provided = req.query?.token || req.headers['x-admin-token'];
  if (provided !== token) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    if (!requireAdmin(req, res)) return;
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

  if (enriched.source === 'ai-widget-programmatic-seo' && !enriched.dob) {
    return res.status(400).json({ error: 'Birth date required' });
  }

  const pageContext = parsePageContext(enriched.sourceUrl || enriched.page);
  const isWidgetLead = enriched.source === 'ai-widget-programmatic-seo';

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

  if (isWidgetLead) {
    const recent = findRecentFulfillment(leads, enriched.email);
    if (recent?.emailSent) {
      return res.status(200).json({
        success: true,
        message: 'Report already sent recently — check your inbox',
        deduplicated: true,
        pageContext,
      });
    }
  }

  let pdfJob = null;
  let aiReportJob = null;
  let emailJob = null;

  try {
    if (isWidgetLead) {
      ({ aiReportJob, emailJob } = await fulfillKarmaReport(enriched, pageContext));
    } else if (enriched.pdfReady && req.body?.chartSvg) {
      pdfJob = await generateChartPDF({
        email: enriched.email,
        dob: enriched.dob,
        hour: enriched.hour,
        country: enriched.country,
        mainStar: enriched.mainStar,
        mainStarEn: enriched.mainStarEn,
        chartSvg: req.body.chartSvg,
        name: enriched.name,
      });
    }
  } catch (err) {
    console.error('[collect-lead] fulfillment error:', err.message);
    return res.status(500).json({
      error: 'Fulfillment failed',
      detail: err.message,
    });
  }

  const espResult = await syncLeadToEsp(enriched);

  const record = {
    ...enriched,
    pageContext,
    pdfJobId: pdfJob?.jobId || null,
    pdfStatus: pdfJob?.status || null,
    aiReportStatus: aiReportJob?.status || null,
    aiReportModel: aiReportJob?.model || null,
    aiReportWords: aiReportJob?.wordCount || null,
    emailSent: !!emailJob?.sent,
    emailDetail: emailJob?.reason || emailJob?.id || null,
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

  const fulfillmentOk = isWidgetLead ? !!emailJob?.sent : true;

  return res.status(fulfillmentOk ? 200 : 502).json({
    success: fulfillmentOk,
    message: emailJob?.sent
      ? 'Lead captured — AI report emailed'
      : isWidgetLead
        ? 'Report generated but email failed — check RESEND_API_KEY'
        : 'Lead captured',
    total: leads.length,
    pageContext,
    aiReport: aiReportJob
      ? { status: aiReportJob.status, model: aiReportJob.model, wordCount: aiReportJob.wordCount }
      : null,
    email: emailJob,
    pdfJob,
    esp: espResult,
  });
}
