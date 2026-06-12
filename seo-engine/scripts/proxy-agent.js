/**
 * Auto-detect local HTTP(S) proxy for Google API calls (Clash/V2Ray common ports).
 */

const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');

const DEFAULT_PROXIES = [
  'http://127.0.0.1:7890',
  'http://127.0.0.1:1087',
  'http://127.0.0.1:10809',
];

const PROBE_URL = 'https://www.googleapis.com/generate_204';
const PROBE_TIMEOUT_MS = 5000;

function unique(list) {
  const seen = new Set();
  return list.filter((item) => {
    if (!item || seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

function probeProxy(proxyUrl) {
  return new Promise((resolve) => {
    const agent = new HttpsProxyAgent(proxyUrl);
    const req = https.get(PROBE_URL, { agent, timeout: PROBE_TIMEOUT_MS }, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

function buildCandidateList(explicitProxy) {
  if (explicitProxy) return [explicitProxy];
  return unique([
    process.env.HTTPS_PROXY,
    process.env.https_proxy,
    process.env.HTTP_PROXY,
    process.env.http_proxy,
    ...DEFAULT_PROXIES,
  ]);
}

/**
 * @returns {Promise<{ agent: import('https-proxy-agent').HttpsProxyAgent | undefined, proxyUrl: string | null }>}
 */
async function resolveProxyAgent(options = {}) {
  const { explicitProxy = null, skip = false } = options;
  if (skip) {
    return { agent: undefined, proxyUrl: null };
  }

  const candidates = buildCandidateList(explicitProxy);
  console.log('🌐 Probing proxy routes for Google API...');

  for (const proxyUrl of candidates) {
    process.stdout.write(`   ${proxyUrl} ... `);
    const ok = await probeProxy(proxyUrl);
    if (ok) {
      console.log('OK');
      return { agent: new HttpsProxyAgent(proxyUrl), proxyUrl };
    }
    console.log('unreachable');
  }

  console.log('⚠️  No local proxy responded — falling back to direct connection');
  return { agent: undefined, proxyUrl: null };
}

module.exports = { resolveProxyAgent, DEFAULT_PROXIES };
