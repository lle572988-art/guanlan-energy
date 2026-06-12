const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../..');
const matrixPath = path.join(__dirname, '../data/infinite-matrix.json');
const pagesDir = path.join(rootDir, 'pages');

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

if (!fs.existsSync(matrixPath)) {
  console.error('❌ Missing data/infinite-matrix.json — run npm run seo:multiply first');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const silos = {};

config.pages.forEach((page) => {
  if (!silos[page.category]) silos[page.category] = [];
  silos[page.category].push(page);
});

let woven = 0;

Object.keys(silos).forEach((siloName) => {
  const siloPages = silos[siloName];
  console.log(`🕸️  Silo ring [${siloName}]: ${siloPages.length} nodes`);

  siloPages.forEach((page, index) => {
    const filePath = path.join(pagesDir, `${page.slug}.html`);
    if (!fs.existsSync(filePath)) return;

    const nextPage = siloPages[(index + 1) % siloPages.length];
    const prevPage = siloPages[(index - 1 + siloPages.length) % siloPages.length];

    const siloLinksHTML = `  <div class="silo-network" style="margin-top:40px;padding:25px;background:rgba(17,22,37,0.9);border-left:3px solid #C9A96E;">
    <h4 style="color:#C9A96E;margin-top:0;font-family:'Cormorant Garamond',serif;">${escHtml(siloName)} Matrix — Adjacent Nodes</h4>
    <p style="color:rgba(255,255,255,0.65);">Ring navigation within the ${escHtml(page.palace_label || siloName)} silo:</p>
    <ul style="margin:12px 0 0 20px;">
      <li style="margin-bottom:8px;"><strong>Next:</strong> <a href="/pages/${escHtml(nextPage.slug)}.html" style="color:#C9A96E;">${escHtml(nextPage.title)}</a></li>
      <li style="margin-bottom:8px;"><strong>Previous:</strong> <a href="/pages/${escHtml(prevPage.slug)}.html" style="color:#C9A96E;">${escHtml(prevPage.title)}</a></li>
    </ul>
    <p style="margin-top:16px;font-size:0.9rem;"><a href="${config.site.faq_page || '/faq.html'}" style="color:#C9A96E;">Official FAQ</a> · <a href="${config.site.cta_page || '/free-chart.html'}" style="color:#C9A96E;">Free Chart Calculator</a></p>
  </div>`;

    let html = fs.readFileSync(filePath, 'utf8');
    if (html.includes('<!-- SILO_LINKS -->')) {
      html = html.replace('<!-- SILO_LINKS -->', siloLinksHTML);
    } else {
      html = html.replace(/<div class="silo-network"[\s\S]*?<\/div>\s*(?=\n  <div class="cta-box")/, `${siloLinksHTML}\n\n`);
    }

    fs.writeFileSync(filePath, html);
    woven++;
  });
});

console.log(`\n💎 Silo ring complete — ${woven} pages woven`);
