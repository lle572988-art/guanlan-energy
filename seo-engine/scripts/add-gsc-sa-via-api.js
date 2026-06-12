#!/usr/bin/env node
/**
 * Bypass GSC UI "email not found" bug — add service account via Webmasters API.
 *
 * Prerequisite (one-time, uses YOUR personal Google account that owns GSC):
 *   gcloud auth application-default login \
 *     --scopes=https://www.googleapis.com/auth/webmasters,https://www.googleapis.com/auth/cloud-platform
 *
 * Or set GOOGLE_APPLICATION_CREDENTIALS to an OAuth client JSON if you prefer.
 *
 * Usage:
 *   node scripts/add-gsc-sa-via-api.js
 *   node scripts/add-gsc-sa-via-api.js --email other-sa@project.iam.gserviceaccount.com
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { resolveProxyAgent } = require('./proxy-agent');

const rootDir = path.join(__dirname, '../..');
const SITE_URL = 'sc-domain:metaphysicflow.com';
const DEFAULT_SA_EMAIL = 'gsc-indexer@guanlan-energy-indexing.iam.gserviceaccount.com';
const SCOPE = 'https://www.googleapis.com/auth/webmasters';

const args = process.argv.slice(2);
const emailIdx = args.indexOf('--email');
const saEmail =
  emailIdx >= 0
    ? args[emailIdx + 1]
    : (() => {
        const keyPath = path.join(rootDir, 'service-account.json');
        if (fs.existsSync(keyPath)) {
          try {
            return JSON.parse(fs.readFileSync(keyPath, 'utf8')).client_email;
          } catch (_) {
            /* fall through */
          }
        }
        return DEFAULT_SA_EMAIL;
      })();

async function main() {
  console.log('\n========================================');
  console.log('  GSC Service Account — API Add User');
  console.log('========================================');
  console.log(`Property: ${SITE_URL}`);
  console.log(`Service account: ${saEmail}`);
  console.log('\nℹ️  Google UI bug (Apr 2026+): new SAs show "email not found" in GSC.');
  console.log('   This script adds the SA via Webmasters API using YOUR owner credentials.\n');

  const { agent, proxyUrl } = await resolveProxyAgent();
  if (proxyUrl) console.log(`🛫 Proxy: ${proxyUrl}\n`);
  if (agent) google.options({ agent });

  const auth = new google.auth.GoogleAuth({
    scopes: [SCOPE],
  });

  let client;
  try {
    client = await auth.getClient();
    await client.getAccessToken();
  } catch (err) {
    console.error('❌ Auth failed:', err.message);
    console.error(`
Run this once (personal Google account that owns metaphysicflow.com GSC):

  gcloud auth application-default login \\
    --scopes=https://www.googleapis.com/auth/webmasters,https://www.googleapis.com/auth/cloud-platform

Then re-run: npm run seo:add-gsc-sa
`);
    process.exit(1);
  }

  const siteEnc = encodeURIComponent(SITE_URL);
  const userEnc = encodeURIComponent(saEmail);
  const apiUrl = `https://www.googleapis.com/webmasters/v3/sites/${siteEnc}/users/${userEnc}`;

  try {
    await client.request({
      url: apiUrl,
      method: 'PUT',
      data: { permissionLevel: 'siteOwner' },
    });
    console.log('✅ Service account added as Owner via API.\n');
    console.log('Next: cd seo-engine && npm run seo:force-index -- --limit 5\n');
  } catch (err) {
    const msg = err.message || String(err);
    console.error('❌ API add failed:', msg);
    if (/not found|unknown user|404/i.test(msg)) {
      console.error(`
Still blocked by Google platform bug for very new service accounts.
Workarounds:
  1. Wait 7–30 days and retry (some SAs propagate later — forum reports ~26 days)
  2. Create SA in an OLDER GCP project (before Apr 2026) if you have one
  3. Skip Indexing API — sitemap (632 URLs) + IndexNow already live
`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
