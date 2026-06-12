const fs = require('fs');
const path = require('path');
const { getStarSchema } = require('../../lib/structured-data');

const rootDir = path.join(__dirname, '../..');
const dataFile = process.env.SEO_DATA
  ? path.resolve(__dirname, process.env.SEO_DATA)
  : fs.existsSync(path.join(__dirname, '../data/infinite-matrix.json'))
    ? path.join(__dirname, '../data/infinite-matrix.json')
    : path.join(__dirname, '../data/keywords-matrix.json');

const config = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const pagesDir = path.join(rootDir, 'pages');
const { site } = config;
const isMatrix = dataFile.includes('infinite-matrix');

fs.mkdirSync(pagesDir, { recursive: true });

const today = new Date().toISOString().split('T')[0];
const ctaHref = site.cta_page.startsWith('http') ? site.cta_page : site.cta_page;
const faqHref = site.faq_page || '/faq.html';

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function metaDescription(page) {
  return page.description || page.meta_description || '';
}

function buildSchema(page) {
  const faqQ = isMatrix
    ? `What is the critical impact of ${page.keyword}?`
    : `What is ${page.keyword}?`;
  return getStarSchema(
    {
      ...page,
      description: metaDescription(page),
      faq_question: faqQ,
      datePublished: today,
      dateModified: today,
    },
    site
  );
}

function generateHTML(page) {
  const pageUrl = `${site.domain}/pages/${page.slug}.html`;
  const desc = metaDescription(page);
  const lsiText = (page.lsi_keywords || []).join(', ');
  const faqQ = isMatrix
    ? `What is the critical impact of ${page.keyword}?`
    : `What is ${page.keyword}?`;
  const schemaGraph = buildSchema(page);
  const linkPlaceholder = isMatrix ? '<!-- SILO_LINKS -->' : '<!-- RELATED_LINKS -->';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(page.title)}</title>
<meta name="description" content="${escHtml(desc)}">
<link rel="canonical" href="${escHtml(pageUrl)}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta property="og:title" content="${escHtml(page.title)}">
<meta property="og:description" content="${escHtml(desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${escHtml(pageUrl)}">
<meta property="og:image" content="${site.domain}${site.logo || '/images/og-chart.jpg'}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=EB+Garamond&display=swap" rel="stylesheet">
<script type="application/ld+json">
${JSON.stringify(schemaGraph, null, 2)}
</script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0B0F1A; color: rgba(255,255,255,0.88); font-family: 'EB Garamond', Georgia, serif; line-height: 1.75; padding: 40px 20px; }
  .container { max-width: 800px; margin: 0 auto; }
  nav { margin-bottom: 2rem; font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; }
  nav a { color: rgba(201,169,110,0.55); text-decoration: none; margin-right: 1rem; }
  nav a:hover { color: #C9A96E; }
  h1, h2 { font-family: 'Cormorant Garamond', serif; color: #C9A96E; font-weight: 400; }
  h1 { font-size: 2rem; margin-bottom: 1rem; line-height: 1.25; }
  h2 { font-size: 1.35rem; margin: 2rem 0 0.75rem; }
  p { margin-bottom: 1rem; color: rgba(255,255,255,0.78); }
  .lead { font-size: 1.08rem; color: rgba(255,255,255,0.62); font-style: italic; }
  .cta-box { border: 1px solid rgba(201,169,110,0.25); padding: 2rem; text-align: center; margin: 2.5rem 0; background: rgba(22,29,48,0.8); }
  .btn { background: #C9A96E; color: #0B0F1A; padding: 12px 28px; text-decoration: none; font-weight: 600; letter-spacing: 0.05em; display: inline-block; margin-top: 0.5rem; }
  .faq-section { background: rgba(22,29,48,0.6); padding: 1.25rem 1.5rem; border-left: 3px solid #C9A96E; margin-top: 1.5rem; }
  footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid rgba(201,169,110,0.12); font-size: 0.85rem; color: rgba(255,255,255,0.45); text-align: center; }
  footer a { color: rgba(201,169,110,0.65); }
</style>
</head>
<body>
<div class="container">
  <nav>
    <a href="/">Home</a>
    <a href="${ctaHref}">Free Calculator</a>
    <a href="${faqHref}">FAQ</a>
    <a href="/blog/">Journal</a>
  </nav>
  <h1>${escHtml(page.title)}</h1>
  <p class="lead">${escHtml(page.summary)}</p>

  <div class="cta-box">
    <h2 style="margin-top:0;font-size:1.15rem;">Plot Your 12-Palace Matrix</h2>
    <p>See where ${escHtml(page.star_name || 'your major stars')} lands across all palaces — free English chart.</p>
    <a href="${ctaHref}" class="btn">${escHtml(site.cta_text || 'Get Your Free Chart Reading')}</a>
  </div>

  <h2>${escHtml(faqQ)}</h2>
  <p>${escHtml(page.definition)}</p>

  <h2>Palace Context: ${escHtml(page.palace_label || page.keyword)}</h2>
  <p>${escHtml(page.summary)} In Purple Star Astrology (Zi Wei Dou Shu), star-palace combinations form the micro-resolution layer beneath macro BaZi timing.</p>

  <h2>LSI &amp; Cross-Reference Nodes</h2>
  <p>Analysts cross-check: ${escHtml(lsiText)} against annual luck overlays and Four Transformations (Si Hua).</p>

  <h2>Eastern Metaphysics Reading</h2>
  <p>When ${escHtml(page.star_name || 'this star')} occupies the ${escHtml(page.palace_label || page.keyword)}, a disciplined Eastern metaphysics reading weighs palace strength, star brightness, and Si Hua transformations before drawing conclusions about life domains and timing cycles.</p>

  <div class="faq-section">
    <h2 style="margin-top:0;font-size:1.1rem;">Structured FAQ</h2>
    <p><strong>Q: ${escHtml(faqQ)}</strong></p>
    <p><strong>A:</strong> ${escHtml(page.definition)}</p>
  </div>

  ${linkPlaceholder}

  <div class="cta-box">
    <h2 style="margin-top:0;font-size:1.15rem;">Unlock Your Cosmic Blueprint</h2>
    <a href="${ctaHref}" class="btn">Access Free Calculator</a>
  </div>

  <footer>
    <p>${escHtml(site.name || site.brand_name)} · <a href="${faqHref}">Official FAQ</a> · <a href="${ctaHref}">Free Chart</a></p>
  </footer>
</div>
<script defer src="/js/site-contact.js"></script>
</body>
</html>`;
}

console.log(`📂 Data source: ${path.basename(dataFile)}`);
config.pages.forEach((page) => {
  const outPath = path.join(pagesDir, `${page.slug}.html`);
  fs.writeFileSync(outPath, generateHTML(page));
});

console.log(`\n📄 ${config.pages.length} pages → /pages/`);

// Phase 3: compile transit matrix when running full generate (no SEO_DATA override)
if (!process.env.SEO_DATA) {
  require('./generate-transit-pages.js');
}
