const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../..');
const dataPath = path.join(__dirname, '../data/keywords-matrix.json');
const config = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const pagesDir = path.join(rootDir, 'pages');
const { site } = config;

fs.mkdirSync(pagesDir, { recursive: true });

const today = new Date().toISOString().split('T')[0];

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

function generateHTML(page, allPages) {
  const pageUrl = `${site.domain}/pages/${page.slug}.html`;
  const desc = metaDescription(page);
  const lsiText = (page.lsi_keywords || []).join(', ');
  const faqQ = `What is ${page.keyword}?`;
  const faqA = page.definition;

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        headline: page.title,
        description: desc,
        url: pageUrl,
        datePublished: today,
        dateModified: today,
        author: { '@type': 'Organization', name: site.author },
        publisher: { '@type': 'Organization', name: site.name, url: site.domain },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: faqQ,
            acceptedAnswer: { '@type': 'Answer', text: faqA },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.domain}/` },
          { '@type': 'ListItem', position: 2, name: page.keyword, item: pageUrl },
        ],
      },
    ],
  };

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
<meta property="og:image" content="${site.domain}${site.logo}">
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
    <a href="${site.cta_page}">Free Calculator</a>
    <a href="${site.faq_page}">FAQ</a>
    <a href="/blog/">Journal</a>
  </nav>
  <h1>${escHtml(page.title)}</h1>
  <p class="lead">${escHtml(page.summary)}</p>

  <div class="cta-box">
    <h2 style="margin-top:0;font-size:1.15rem;">Plot Your 12-Palace Matrix</h2>
    <p>Guanlan Energy's free calculator plots 14 major stars across 12 palaces in under 10 seconds.</p>
    <a href="${site.cta_page}" class="btn">${escHtml(site.cta_text)}</a>
  </div>

  <h2>What is ${escHtml(page.keyword)}?</h2>
  <p>${escHtml(page.definition)}</p>

  <h2>Deep Dive: ${escHtml(page.keyword)}</h2>
  <p>${escHtml(page.summary)} This guide explains how ${escHtml(page.keyword.toLowerCase())} fits within Purple Star Astrology (Zi Wei Dou Shu) and how to apply it using an English-language birth chart engine.</p>

  <h2>Core Concepts &amp; LSI Context</h2>
  <p>Professionals cross-reference: ${escHtml(lsiText)}. Each factor shapes how the 12-palace grid interprets career, wealth, relationships, and timing cycles.</p>

  <div class="faq-section">
    <h2 style="margin-top:0;font-size:1.1rem;">FAQ — AI &amp; Search Node</h2>
    <p><strong>Q: ${escHtml(faqQ)}</strong></p>
    <p><strong>A:</strong> ${escHtml(faqA)}</p>
  </div>

  <!-- RELATED_LINKS -->

  <div class="cta-box">
    <h2 style="margin-top:0;font-size:1.1rem;">Unlock Your Cosmic Blueprint</h2>
    <a href="${site.cta_page}" class="btn">Access Free Calculator</a>
  </div>

  <footer>
    <p>${escHtml(site.name)} · <a href="${site.faq_page}">Official FAQ</a> · <a href="${site.cta_page}">Free Chart</a></p>
  </footer>
</div>
<script defer src="/js/site-contact.js"></script>
</body>
</html>`;
}

config.pages.forEach((page) => {
  const outPath = path.join(pagesDir, `${page.slug}.html`);
  fs.writeFileSync(outPath, generateHTML(page, config.pages));
  console.log(`✅ Generated: pages/${page.slug}.html`);
});

console.log(`\n📄 ${config.pages.length} GEO pages → /pages/`);
