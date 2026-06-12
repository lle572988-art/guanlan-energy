/**
 * Phase 6 — AI karma report fulfillment orchestrator.
 * Widget lead → Claude report → Resend HTML email.
 */

import { generateAiKarmaReport } from './generate-ai-karma-report.js';
import { buildKarmaReportEmailHtml, sendKarmaReportEmail } from './send-karma-email.js';

export function emailSubject(pageContext) {
  if (pageContext.pageType === 'transit' && pageContext.year && pageContext.star) {
    return `Your ${pageContext.year} ${pageContext.star} Transit Report · Guanlan Energy`;
  }
  if (pageContext.pageType === 'star-palace' && pageContext.star) {
    return `Your ${pageContext.star} Palace Reading · Guanlan Energy`;
  }
  return 'Your Purple Star Personal Report · Guanlan Energy';
}

/**
 * @returns {Promise<{ aiReportJob: object, emailJob: object }>}
 */
export async function fulfillKarmaReport(lead, pageContext) {
  const aiReportJob = await generateAiKarmaReport(lead, pageContext);
  const html = buildKarmaReportEmailHtml({
    reportText: aiReportJob.text,
    pageContext,
    lead,
  });
  const emailJob = await sendKarmaReportEmail({
    to: lead.email,
    subject: emailSubject(pageContext),
    html,
    tags: [
      { name: 'source', value: lead.source || 'widget' },
      { name: 'page_type', value: pageContext.pageType || 'general' },
    ],
  });
  return { aiReportJob, emailJob };
}

export function findRecentFulfillment(leads, email, withinMs = 60 * 60 * 1000) {
  const needle = String(email || '').trim().toLowerCase();
  if (!needle) return null;
  const cutoff = Date.now() - withinMs;
  for (let i = leads.length - 1; i >= 0; i -= 1) {
    const row = leads[i];
    if (row.email !== needle) continue;
    const ts = Date.parse(row.captured_at || '');
    if (!Number.isFinite(ts) || ts < cutoff) continue;
    if (row.emailSent || row.aiReportStatus) return row;
  }
  return null;
}
