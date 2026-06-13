#!/usr/bin/env node
/**
 * Local smoke test for Phase 6 karma fulfillment.
 * Usage:
 *   npm run karma:test
 *   npm run karma:send   (needs .env.local with API keys)
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnvFile() {
  const envPath = join(root, '.env.local');
  if (!existsSync(envPath)) return;
  readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
}

loadEnvFile();

function envKeyIssue(name, value) {
  if (!value) return `${name} is not set in .env.local`;
  if (/[^\x00-\x7F]/.test(value)) {
    return `${name} contains non-ASCII characters (often a pasted "…" placeholder) — use the full key from DeepSeek/Resend, no ellipsis`;
  }
  if (value.length < 20) {
    return `${name} looks truncated (${value.length} chars) — paste the complete key, not a redacted preview like sk-abc…xyz`;
  }
  return null;
}

const send = process.argv.includes('--send');
const sample = {
  email: process.env.TEST_EMAIL || 'test@example.com',
  birthYear: '1990',
  birthMonth: '6',
  birthDay: '15',
  birthHour: '11',
  source: 'ai-widget-programmatic-seo',
  sourceUrl: '/pages/transit/2026-lian-zhen-hua-ji-in-career-palace.html',
  page: '/pages/transit/2026-lian-zhen-hua-ji-in-career-palace.html',
  pdfReady: false,
};

async function main() {
  const { enrichLead } = await import('../server/lib/lead-enrichment.js');
  const { parsePageContext } = await import('../server/lib/parse-page-context.js');
  const { fulfillKarmaReport, emailSubject } = await import('../server/lib/karma-fulfillment.js');
  const { generateAiKarmaReport } = await import('../server/lib/generate-ai-karma-report.js');
  const { buildKarmaReportEmailHtml, sendKarmaReportEmail } = await import(
    '../server/lib/send-karma-email.js'
  );

  const lead = enrichLead(sample);
  const pageContext = parsePageContext(lead.sourceUrl);

  console.log('\n=== Phase 6 Karma Fulfillment Test ===');
  console.log('Page context:', pageContext.pageType, '·', pageContext.keyword);
  const aiKey = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const aiIssue = envKeyIssue('AI_API_KEY', aiKey);
  const resendIssue = envKeyIssue('RESEND_API_KEY', resendKey);

  console.log(
    'AI_API_KEY:',
    aiIssue ? `INVALID — ${aiIssue}` : aiKey ? 'configured · model=deepseek-chat' : 'MISSING (fallback template)'
  );
  console.log('Resend:', resendIssue ? `INVALID — ${resendIssue}` : resendKey ? 'configured' : 'MISSING');

  if (aiIssue || resendIssue) {
    console.error('\nFix .env.local with full keys (no … or ... placeholders), save, and re-run.\n');
    process.exit(1);
  }
  console.log('Mode:', send ? 'GENERATE + SEND' : 'GENERATE ONLY\n');

  if (send) {
    const { aiReportJob, emailJob } = await fulfillKarmaReport(lead, pageContext);
    console.log(`Report: ${aiReportJob.status} · ${aiReportJob.wordCount} words`);
    console.log('Email:', emailJob.sent ? `sent id=${emailJob.id}` : `failed: ${emailJob.reason}`);
    process.exit(emailJob.sent ? 0 : 1);
    return;
  }

  const aiReportJob = await generateAiKarmaReport(lead, pageContext);
  console.log(`Report: ${aiReportJob.status} · ${aiReportJob.wordCount} words · model=${aiReportJob.model}`);
  console.log('\n--- Preview (first 400 chars) ---\n');
  console.log(aiReportJob.text.slice(0, 400) + '...\n');
  console.log('Dry run OK. Run npm run karma:send to deliver via Resend.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
