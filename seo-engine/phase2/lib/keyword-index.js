const fs = require('fs');
const path = require('path');
const { repoRoot, loadSeoConfig, readJsonIfExists } = require('./paths');

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(text) {
  const stop = new Set([
    'a', 'an', 'the', 'and', 'or', 'for', 'in', 'on', 'to', 'of', 'is', 'are',
    'your', 'with', 'what', 'how', 'why', 'free', 'online', 'guide', 'meaning',
  ]);
  return normalize(text)
    .split(/\s+/)
    .filter((t) => t.length > 2 && !stop.has(t));
}

function loadMatrixPages(filePath) {
  const data = readJsonIfExists(filePath);
  if (!data?.pages) return [];
  return data.pages.map((p) => ({
    source: path.basename(filePath),
    slug: p.slug,
    keyword: p.keyword,
    title: p.title,
    path: `/pages/${p.slug}.html`,
  }));
}

function loadSitemapUrls() {
  const sitemapPath = path.join(repoRoot, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return [];
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => m[1].trim());
}

function loadBlogStarPages() {
  const starsPath = path.join(repoRoot, 'data/stars.json');
  const data = readJsonIfExists(starsPath);
  if (!data?.stars) return [];
  return data.stars.map((s) => ({
    source: 'stars.json',
    slug: s.slug,
    keyword: `${s.name} meaning ZWDS`,
    title: s.name,
    path: s.blog_url || `/blog/zi-wei-dou-shu-${s.slug}-star-meaning.html`,
  }));
}

function buildSiteInventory() {
  const config = loadSeoConfig();
  const seoEngineData = path.join(repoRoot, 'seo-engine/data');

  const pages = [
    ...loadMatrixPages(path.join(seoEngineData, 'infinite-matrix.json')),
    ...loadMatrixPages(path.join(seoEngineData, 'transit-matrix.json')),
    ...loadMatrixPages(path.join(seoEngineData, 'keywords-matrix.json')),
    ...loadBlogStarPages(),
  ];

  const priorityPages = (config.priority_pages || [])
    .filter((p) => p.path)
    .map((p) => ({
      source: 'seo_config.priority_pages',
      slug: p.path.replace(/^\//, '').replace(/\.html$/, ''),
      keyword: p.keyword,
      title: p.keyword,
      path: p.path,
    }));

  const clusterKeywords = [];
  Object.entries(config.keyword_clusters || {}).forEach(([cluster, kws]) => {
    (kws || []).forEach((kw) => {
      clusterKeywords.push({
        source: `seo_config.${cluster}`,
        slug: normalize(kw).replace(/\s+/g, '-'),
        keyword: kw,
        title: kw,
        path: null,
      });
    });
  });

  const allPages = [...pages, ...priorityPages, ...clusterKeywords];
  const sitemapUrls = loadSitemapUrls();

  const keywordSet = new Set();
  const slugSet = new Set();
  const tokenSet = new Set();

  allPages.forEach((p) => {
    if (p.keyword) keywordSet.add(normalize(p.keyword));
    if (p.slug) slugSet.add(normalize(p.slug));
    tokens(p.keyword || p.title || p.slug).forEach((t) => tokenSet.add(t));
  });

  sitemapUrls.forEach((url) => {
    try {
      const u = new URL(url);
      const slug = u.pathname.split('/').filter(Boolean).pop() || '';
      slugSet.add(normalize(slug.replace(/\.html$/, '')));
      tokens(slug.replace(/-/g, ' ')).forEach((t) => tokenSet.add(t));
    } catch {
      /* ignore bad URLs */
    }
  });

  return {
    config,
    pages: allPages,
    sitemapUrls,
    keywordSet,
    slugSet,
    tokenSet,
    stats: {
      matrix_pages: pages.length,
      sitemap_urls: sitemapUrls.length,
      unique_keywords: keywordSet.size,
    },
  };
}

function coversTopic(inventory, phrase) {
  const norm = normalize(phrase);
  if (!norm) return { covered: false, reason: 'empty' };

  if (inventory.keywordSet.has(norm)) {
    return { covered: true, reason: 'exact_keyword' };
  }

  for (const kw of inventory.keywordSet) {
    if (kw.includes(norm) || norm.includes(kw)) {
      return { covered: true, reason: 'keyword_substring', match: kw };
    }
  }

  const slugLike = norm.replace(/\s+/g, '-');
  if (inventory.slugSet.has(slugLike) || inventory.slugSet.has(norm.replace(/\s+/g, ''))) {
    return { covered: true, reason: 'slug_match' };
  }

  const phraseTokens = tokens(phrase);
  if (phraseTokens.length === 0) return { covered: false, reason: 'no_tokens' };

  const overlap = phraseTokens.filter((t) => inventory.tokenSet.has(t));
  const ratio = overlap.length / phraseTokens.length;
  if (ratio >= 0.6 && overlap.length >= 2) {
    return { covered: true, reason: 'token_overlap', overlap, ratio };
  }

  return { covered: false, reason: 'gap', overlap, ratio };
}

module.exports = {
  normalize,
  tokens,
  buildSiteInventory,
  coversTopic,
};
