/**
 * Lightweight HTML fetcher for competitor intel (no external deps).
 */

async function fetchText(url, { timeoutMs = 12000, userAgent } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          userAgent ||
          'Mozilla/5.0 (compatible; MetaphysicFlow-SEO-Intel/1.0; +https://metaphysicflow.com)',
        Accept: 'text/html,application/xhtml+xml,text/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });
    if (!res.ok) {
      return { ok: false, status: res.status, url, body: '' };
    }
    const body = await res.text();
    return { ok: true, status: res.status, url: res.url || url, body };
  } catch (err) {
    return { ok: false, status: 0, url, error: err.message, body: '' };
  } finally {
    clearTimeout(timer);
  }
}

function parseSitemapLocs(xml) {
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => m[1].trim());
  return [...new Set(locs)];
}

async function discoverUrls(domain, { seedUrls = ['/'], maxPages = 40, timeoutMs = 12000 } = {}) {
  const base = domain.replace(/\/$/, '');
  const found = new Set();

  for (const seed of seedUrls) {
    const pathPart = seed.startsWith('/') ? seed : `/${seed}`;
    found.add(`${base}${pathPart}`);
  }

  const sitemapCandidates = [
    `${base}/sitemap.xml`,
    `${base}/sitemap_index.xml`,
    `${base}/sitemap-index.xml`,
  ];

  for (const smUrl of sitemapCandidates) {
    const res = await fetchText(smUrl, { timeoutMs });
    if (!res.ok || !res.body.includes('<loc>')) continue;
    parseSitemapLocs(res.body).forEach((loc) => {
      if (loc.startsWith(base)) found.add(loc);
    });
    break;
  }

  return [...found].slice(0, maxPages);
}

module.exports = { fetchText, parseSitemapLocs, discoverUrls };
