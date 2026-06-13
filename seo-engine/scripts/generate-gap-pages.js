const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../..');
const seoEngineDir = path.join(__dirname, '..');
let dataPath = path.join(seoEngineDir, 'data/gap-top5-matrix.json');
const matrixArg = process.argv.find((a) => a.startsWith('--matrix='));
if (matrixArg) {
  dataPath = path.resolve(__dirname, matrixArg.split('=')[1]);
} else if (process.env.GAP_MATRIX) {
  dataPath = path.resolve(seoEngineDir, process.env.GAP_MATRIX.replace(/^\.\.\//, ''));
}

if (!fs.existsSync(dataPath)) {
  console.error('❌ Missing gap-top5-matrix.json');
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

function buildSchema(page) {
  const pageUrl = `${site.domain}/pages/${page.slug}.html`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        headline: page.title,
        description: page.description,
        url: pageUrl,
        datePublished: today,
        dateModified: today,
        author: { '@type': 'Organization', name: site.author || site.brand_name },
        publisher: { '@type': 'Organization', name: site.brand_name, url: site.domain },
        about: {
          '@type': 'Thing',
          name: page.gap_phrase,
          description: `Competitor gap intercept — ${page.competitor}`,
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: page.faq_q,
            acceptedAnswer: { '@type': 'Answer', text: page.faq_a },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: site.domain + '/' },
          {
            '@type': 'ListItem',
            position: 2,
            name: page.page_type === 'compare' ? 'Compare' : 'Guides',
            item: site.domain + '/pages/',
          },
          { '@type': 'ListItem', position: 3, name: page.title, item: pageUrl },
        ],
      },
    ],
  };
}

function relatedHtml(page) {
  const links = page.related || [
    { href: '/pages/bazi-vs-zi-wei-dou-shu-difference.html', label: 'BaZi vs ZWDS' },
    { href: ctaHref, label: 'Free chart calculator' },
    { href: '/pages/horoscope/2026-annual-forecast.html', label: '2026 forecast hub' },
  ];
  return `
  <div class="related-links">
    <h2>Related Guides</h2>
    <ul>
      ${links.map((l) => `<li><a href="${escHtml(l.href)}">${escHtml(l.label)}</a></li>`).join('\n      ')}
    </ul>
  </div>`;
}

function generateGapHTML(page) {
  const pageUrl = `${site.domain}/pages/${page.slug}.html`;
  const badge =
    page.page_type === 'compare' ? 'Compare · Gap Top 5' : 'Landing · Gap Top 5';
  const sections = (page.sections || [])
    .map((s) => `<h2>${escHtml(s.h2)}</h2>\n  <p>${escHtml(s.body)}</p>`)
    .join('\n\n  ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(page.title)}</title>
<meta name="description" content="${escHtml(page.description)}">
<link rel="canonical" href="${escHtml(pageUrl)}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta property="og:title" content="${escHtml(page.title)}">
<meta property="og:description" content="${escHtml(page.description)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${escHtml(pageUrl)}">
<meta property="og:image" content="${site.domain}${site.logo || '/images/og-chart.jpg'}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Cormorant+Garamond&display=swap" rel="stylesheet">
<script type="application/ld+json">
${JSON.stringify(buildSchema(page), null, 2)}
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
  .gap-badge { display: inline-block; border: 1px solid rgba(201,169,110,0.35); padding: 4px 12px; font-size: 0.75rem; letter-spacing: 0.12em; margin-bottom: 1rem; color: #C9A96E; }
  .gap-meta { font-size: 0.85rem; color: rgba(255,255,255,0.45); margin-bottom: 1.25rem; }
  .cta-box { border: 1px solid rgba(201,169,110,0.25); padding: 2rem; text-align: center; margin: 2.5rem 0; background: rgba(22,29,48,0.8); }
  .btn { background: #C9A96E; color: #0B0F1A; padding: 12px 28px; text-decoration: none; font-weight: 600; letter-spacing: 0.05em; display: inline-block; margin-top: 0.5rem; }
  .faq-section { background: rgba(22,29,48,0.6); padding: 1.25rem 1.5rem; border-left: 3px solid #C9A96E; margin-top: 1.5rem; }
  .related-links ul { margin: 0.75rem 0 0 1.25rem; }
  .related-links li { margin-bottom: 0.5rem; }
  .related-links a { color: #C9A96E; }
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
  <p class="gap-badge">${escHtml(badge)} · #${page.gap_rank}</p>
  <h1>${escHtml(page.title)}</h1>
  <p class="lead">${escHtml(page.lead)}</p>
  <p class="gap-meta">Targets competitor gap: “${escHtml(page.gap_phrase.replace(/&amp;/g, '&').replace(/&#039;/g, "'"))}”</p>

  <div class="cta-box">
    <h2 style="margin-top:0;font-size:1.15rem;">Plot Your 12-Palace Matrix</h2>
    <p>Free English Purple Star chart — Life, Wealth &amp; Career highlights in under 30 seconds.</p>
    <a href="${ctaHref}" class="btn">${escHtml(site.cta_text || 'Get Your Free Chart Reading')}</a>
  </div>

  ${sections}

  <div class="faq-section">
    <h2 style="margin-top:0;font-size:1.1rem;">Structured FAQ</h2>
    <p><strong>Q: ${escHtml(page.faq_q)}</strong></p>
    <p><strong>A:</strong> ${escHtml(page.faq_a)}</p>
  </div>

  ${relatedHtml(page)}

  <div class="cta-box">
    <h2 style="margin-top:0;font-size:1.15rem;">Ready for Your Chart?</h2>
    <a href="${ctaHref}" class="btn">Access Free Calculator</a>
  </div>

  <footer>
    <p>${escHtml(site.brand_name)} · <a href="${faqHref}">Official FAQ</a> · <a href="${ctaHref}">Free Chart</a></p>
  </footer>
</div>
<script defer src="/js/site-contact.js"></script>
</body>
</html>`;
}

console.log('📂 Gap Top 5 matrix → static HTML');
let written = 0;
config.pages.forEach((page) => {
  const outPath = path.join(pagesDir, `${page.slug}.html`);
  fs.writeFileSync(outPath, generateGapHTML(page));
  written += 1;
  console.log(`   ✓ #${page.gap_rank} ${page.slug}.html`);
});

console.log(`\n🎯 ${written} gap intercept pages → /pages/`);

module.exports = { generateGapHTML };
