#!/usr/bin/env node
/**
 * Google Indexing API — force-push transit URLs (URL_UPDATED).
 *
 * Usage:
 *   npm run seo:force-index
 *   npm run seo:force-index -- --dry-run
 *   npm run seo:force-index -- --limit 50 --offset 0
 *
 * Credentials (first match wins):
 *   1. GOOGLE_APPLICATION_CREDENTIALS env var
 *   2. ../../service-account.json (repo root)
 *   3. ../service-account.json (seo-engine/)
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const rootDir = path.join(__dirname, '../..');
const matrixPath = path.join(__dirname, '../data/transit-matrix.json');
const RATE_MS = 334; // ~3 requests / second
const SCOPE = 'https://www.googleapis.com/auth/indexing';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const offsetIdx = args.indexOf('--offset');
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : null;
const offset = offsetIdx >= 0 ? parseInt(args[offsetIdx + 1], 10) : 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveCredentialPath() {
  const candidates = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    path.join(rootDir, 'service-account.json'),
    path.join(__dirname, '../service-account.json'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (fs.existsSync(resolved)) return resolved;
  }
  return null;
}

function loadUrls() {
  if (!fs.existsSync(matrixPath)) {
    console.error('❌ Missing data/transit-matrix.json — run npm run seo:transit first');
    process.exit(1);
  }
  const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
  const base = matrix.site.domain.replace(/\/$/, '');
  return matrix.pages.map((p) => `${base}/pages/${p.slug}.html`);
}

function printSetupGuide() {
  console.error(`
❌ service-account.json not found.

── 10-minute Google Cloud setup ──
1. https://console.cloud.google.com/ → create/select project
2. APIs & Services → Library → enable "Web Search Indexing API"
3. IAM → Service Accounts → Create → download JSON key
4. Save as: ${path.join(rootDir, 'service-account.json')}
5. Google Search Console → sc-domain:metaphysicflow.com
   → Settings → Users → Add user → paste service account email
   → Role: Owner (required for Indexing API)
6. Run: npm run seo:force-index

Note: Default quota is ~200 publish/day. 240 URLs may need:
   npm run seo:force-index -- --limit 200
   npm run seo:force-index -- --offset 200 --limit 40
`);
}

async function main() {
  const allUrls = loadUrls();
  let urls = allUrls.slice(offset);
  if (limit != null && !Number.isNaN(limit)) urls = urls.slice(0, limit);

  console.log('\n========================================');
  console.log('  Google Indexing API — Force Push');
  console.log('========================================');
  console.log(`Transit URLs in matrix: ${allUrls.length}`);
  console.log(`Batch: offset=${offset}, sending=${urls.length}${dryRun ? ' (DRY RUN)' : ''}`);
  console.log(`Rate: ~3 req/sec (${RATE_MS}ms delay)\n`);

  if (dryRun) {
    urls.slice(0, 5).forEach((u, i) => console.log(`  [${i + 1}] ${u}`));
    if (urls.length > 5) console.log(`  ... +${urls.length - 5} more`);
    console.log('\n✅ Dry run complete — no API calls made.\n');
    return;
  }

  const credPath = resolveCredentialPath();
  if (!credPath) {
    printSetupGuide();
    process.exit(1);
  }

  let saEmail = '(unknown)';
  try {
    saEmail = JSON.parse(fs.readFileSync(credPath, 'utf8')).client_email || saEmail;
  } catch (_) {
    /* ignore */
  }
  console.log(`🔑 Credentials: ${credPath}`);
  console.log(`📧 Service account: ${saEmail}\n`);

  const auth = new google.auth.GoogleAuth({
    keyFile: credPath,
    scopes: [SCOPE],
  });
  const indexing = google.indexing({ version: 'v3', auth });

  let ok = 0;
  let fail = 0;
  const errors = [];

  for (let i = 0; i < urls.length; i += 1) {
    const url = urls[i];
    const n = offset + i + 1;
    try {
      await indexing.urlNotifications.publish({
        requestBody: {
          url,
          type: 'URL_UPDATED',
        },
      });
      ok += 1;
      console.log(`✅ [${n}/${allUrls.length}] ${url}`);
    } catch (err) {
      fail += 1;
      const msg = err.response?.data?.error?.message || err.message;
      errors.push({ url, message: msg });
      console.error(`❌ [${n}/${allUrls.length}] ${url}`);
      console.error(`   → ${msg}`);
    }
    if (i < urls.length - 1) await sleep(RATE_MS);
  }

  console.log('\n========================================');
  console.log(`  Done — ✅ ${ok}  ❌ ${fail}`);
  console.log('========================================');
  if (fail && errors[0]?.message.includes('Permission')) {
    console.log('\n💡 Permission denied? Add the service account email as GSC Owner.');
  }
  if (offset + urls.length < allUrls.length) {
    console.log(`\n⏭  Remaining: ${allUrls.length - offset - urls.length} URLs`);
    console.log(`   npm run seo:force-index -- --offset ${offset + urls.length}`);
  }
  console.log('');
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
