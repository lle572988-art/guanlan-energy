const fs = require('fs');
const path = require('path');
const { getHoroscopeSchema } = require('../../lib/structured-data');

const rootDir = path.join(__dirname, '../..');
const dataPath = path.join(__dirname, '../data/horoscope-matrix.json');

if (!fs.existsSync(dataPath)) {
  console.error('❌ Missing data/horoscope-matrix.json — run npm run seo:horoscope first');
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

function hubLinksHtml(page) {
  if (!page.hub_links || !page.hub_links.length) return '';
  const items = page.hub_links
    .map((l) => `<li><a href="${escHtml(l.href)}" style="color:#C9A96E;">${escHtml(l.label)}</a></li>`)
    .join('\n      ');
  return `
  <h2>${page.year} Forecasts by Birth Year</h2>
  <ul style="margin:0 0 1.5rem 1.25rem;line-height:1.9;">
      ${items}
  </ul>`;
}

function generateHoroscopeHTML(page) {
  const pageUrl = `${site.domain}/pages/${page.slug}.html`;
  const desc = page.description || '';
  const lsiText = (page.lsi_keywords || []).join(', ');
  const schemaGraph = getHoroscopeSchema(
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
    <a href="/pages/horoscope/${page.year}-annual-forecast.html">All ${page.year} Forecasts</a>
  </nav>
  <p class="year-badge">${escHtml(page.year_name || String(page.year))} · ZWDS Annual</p>
  <h1>${escHtml(page.title)}</h1>
  <p class="lead">${escHtml(page.summary)}</p>

  <div class="cta-box">
    <h2 style="margin-top:0;font-size:1.15rem;">Personalize This Forecast</h2>
    <p>See where ${page.year} Si Hua stars activate your natal palaces — free English chart in 30 seconds.</p>
    <a href="${ctaHref}" class="btn">${escHtml(site.cta_text || 'Get Your Free Chart Reading')}</a>
  </div>

  ${hubLinksHtml(page)}

  <h2>${page.year} Overview</h2>
  <p>${escHtml(page.content_block.replace(/\*\*/g, ''))}</p>

  <h2>Career &amp; Status</h2>
  <p>${escHtml(page.career_block)}</p>

  <h2>Wealth &amp; Resources</h2>
  <p>${escHtml(page.wealth_block)}</p>

  <h2>Love &amp; Relationships</h2>
  <p>${escHtml(page.love_block)}</p>

  <h2>Health &amp; Vitality</h2>
  <p>${escHtml(page.health_block)}</p>

  <h2>Cross-Reference Keywords</h2>
  <p>Analysts also track: ${escHtml(lsiText)} against decadal luck and palace overlays for ${page.year}.</p>

  <div class="faq-section">
    <h2 style="margin-top:0;font-size:1.1rem;">Structured FAQ</h2>
    <p><strong>Q: ${escHtml(page.faq_question)}</strong></p>
    <p><strong>A:</strong> ${escHtml(page.faq_answer)}</p>
  </div>

  <div class="cta-box">
    <h2 style="margin-top:0;font-size:1.15rem;">Unlock Your ${page.year} Cosmic Blueprint</h2>
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

console.log('📂 Data source: horoscope-matrix.json');
let written = 0;
config.pages.forEach((page) => {
  const outPath = path.join(pagesDir, `${page.slug}.html`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, generateHoroscopeHTML(page));
  written += 1;
});

console.log(`\n🐴 ${written} horoscope pages → /pages/horoscope/`);

module.exports = { generateHoroscopeHTML };
