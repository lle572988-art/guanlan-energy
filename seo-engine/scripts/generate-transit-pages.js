const fs = require('fs');
const path = require('path');
const { getTransitSchema } = require('../../lib/structured-data');

const rootDir = path.join(__dirname, '../..');
const dataPath = path.join(__dirname, '../data/transit-matrix.json');

if (!fs.existsSync(dataPath)) {
  console.error('❌ Missing data/transit-matrix.json — run npm run seo:transit first');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const pagesDir = path.join(rootDir, 'pages');
const { site } = config;
const today = new Date().toISOString().split('T')[0];
const ctaHref = site.cta_page || '/free-chart.html';
const faqHref = site.faq_page || '/faq.html';

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateTransitHTML(page) {
  const pageUrl = `${site.domain}/pages/${page.slug}.html`;
  const desc = page.description || '';
  const lsiText = (page.lsi_keywords || []).join(', ');
  const schemaGraph = getTransitSchema(
    {
      ...page,
      datePublished: `${page.year}-01-01`,
      dateModified: today,
    },
    site
  );

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
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Cormorant+Garamond&display=swap" rel="stylesheet">
<script type="application/ld+json">
${JSON.stringify(schemaGraph, null, 2)}
</script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0B0F1A; color: rgba(255,255,255,0.88); font-family: 'Cormorant Garamond', Georgia, serif; line-height: 1.75; padding: 40px 20px; }
  .container { max-width: 800px; margin: 0 auto; }
  nav { margin-bottom: 2rem; font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; }
  nav a { color: rgba(201,169,110,0.55); text-decoration: none; margin-right: 1rem; }
  nav a:hover { color: #C9A96E; }
  h1, h2 { font-family: 'Cormorant Garamond', serif; color: #C9A96E; font-weight: 400; }
  h1 { font-size: 2rem; margin-bottom: 1rem; line-height: 1.25; }
  h2 { font-size: 1.35rem; margin: 2rem 0 0.75rem; }
  p { margin-bottom: 1rem; color: rgba(255,255,255,0.78); }
  .lead { font-size: 1.08rem; color: rgba(255,255,255,0.62); font-style: italic; }
  .year-badge { display: inline-block; border: 1px solid rgba(201,169,110,0.35); padding: 4px 12px; font-size: 0.75rem; letter-spacing: 0.12em; margin-bottom: 1rem; color: #C9A96E; }
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
  <p class="year-badge">${escHtml(page.year_name || String(page.year))} · Si Hua Transit</p>
  <h1>${escHtml(page.title)}</h1>
  <p class="lead">${escHtml(page.summary)}</p>

  <div class="cta-box">
    <h2 style="margin-top:0;font-size:1.15rem;">Map Your ${page.year} Annual Luck Overlay</h2>
    <p>See where ${escHtml(page.star_name)} ${escHtml(page.transform_type)} lands on your natal ${escHtml(page.palace_label)} — free English chart.</p>
    <a href="${ctaHref}" class="btn">${escHtml(site.cta_text || 'Get Your Free Chart Reading')}</a>
  </div>

  <h2>${page.year} Four Transformations Forecast</h2>
  <p>${escHtml(page.content_block.replace(/\*\*/g, ''))}</p>

  <h2>Palace Impact: ${escHtml(page.palace_label)}</h2>
  <p>When ${escHtml(page.star_name)} carries ${escHtml(page.transform_type)} into the ${escHtml(page.palace_label)} during ${page.year}, Purple Star Astrology treats this as a time-sensitive overlay on natal structure — not a replacement for birth-chart analysis.</p>

  <h2>LSI &amp; Cross-Reference Nodes</h2>
  <p>Analysts cross-check: ${escHtml(lsiText)} against annual luck palaces, decadal limits, and flying-star overlays for ${page.year}.</p>

  <h2>Eastern Metaphysics Reading</h2>
  <p>A disciplined Eastern metaphysics reading for ${page.year} ${escHtml(page.star_name)} ${escHtml(page.transform_type)} weighs stem-branch chemistry, palace activation strength, and personal decade luck before interpreting outcomes in ${escHtml(page.palace_label)}.</p>

  <div class="faq-section">
    <h2 style="margin-top:0;font-size:1.1rem;">Structured FAQ</h2>
    <p><strong>Q: ${escHtml(page.faq_question)}</strong></p>
    <p><strong>A:</strong> ${escHtml(page.faq_answer)}</p>
  </div>

  <div class="cta-box">
    <h2 style="margin-top:0;font-size:1.15rem;">Unlock Your ${page.year} Cosmic Blueprint</h2>
    <a href="${ctaHref}" class="btn">Access Free Calculator</a>
  </div>

  <nav aria-label="2026 transit series" style="margin-top:2rem;padding:1rem 1.25rem;border:1px solid rgba(201,169,110,0.22);">
    <p style="margin:0;color:rgba(255,255,255,0.72);"><strong style="color:#C9A96E;">High-intent transit guides</strong> ·
    <a href="/pages/transit/2026-lian-zhen-hua-ji-in-career-palace.html" style="color:#C9A96E;">2026 Lian Zhen · Career</a> ·
    <a href="/pages/transit/2026-lian-zhen-hua-ji-in-wealth-palace.html" style="color:#C9A96E;">Wealth</a> ·
    <a href="/pages/horoscope/2026-annual-forecast.html" style="color:#C9A96E;">2026 forecast hub</a> ·
    <a href="/pages/feng-shui-partner-every-life-stage-vs-zwds.html" style="color:#C9A96E;">Feng Shui vs chart</a>
    </p>
  </nav>

  <footer>
    <p>${escHtml(site.name || site.brand_name)} · <a href="${faqHref}">Official FAQ</a> · <a href="${ctaHref}">Free Chart</a></p>
  </footer>
</div>
<script defer src="/js/site-contact.js"></script>
</body>
</html>`;
}

console.log('📂 Data source: transit-matrix.json');
let written = 0;
config.pages.forEach((page) => {
  const outPath = path.join(pagesDir, `${page.slug}.html`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, generateTransitHTML(page));
  written += 1;
});

console.log(`\n🌐 ${written} transit pages → /pages/transit/`);

module.exports = { generateTransitHTML };
