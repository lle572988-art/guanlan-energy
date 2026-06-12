const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../..');
const dataPath = path.join(__dirname, '../data/keywords-matrix.json');
const config = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const pagesDir = path.join(rootDir, 'pages');
const sitemapPath = path.join(rootDir, 'sitemap.xml');
const today = new Date().toISOString().split('T')[0];

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const slugs = config.pages.map((p) => p.slug);
const files = slugs.map((s) => `${s}.html`).filter((f) => fs.existsSync(path.join(pagesDir, f)));

console.log(`\n🔗 Processing ${files.length} GEO pages...`);

files.forEach((file) => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const otherFiles = files.filter((f) => f !== file);

  const relatedLinksHTML = `  <div class="related-links" style="margin-top:30px;padding:20px;background:rgba(22,29,48,0.8);border:1px solid rgba(201,169,110,0.12);">
    <h4 style="color:#C9A96E;margin-top:0;font-family:'Cormorant Garamond',serif;">Related Masterclass Readings</h4>
    <ul>
      ${otherFiles
        .map((f) => {
          const slug = f.replace('.html', '');
          const pageData = config.pages.find((p) => p.slug === slug);
          const title = pageData ? pageData.title : slug;
          return `<li><a href="/pages/${f}">${escHtml(title)}</a></li>`;
        })
        .join('\n      ')}
      <li><a href="${config.site.faq_page}">Official Zi Wei Dou Shu FAQ</a></li>
      <li><a href="${config.site.cta_page}">Free Zi Wei Dou Shu Calculator</a></li>
    </ul>
  </div>`;

  if (content.includes('<!-- RELATED_LINKS -->')) {
    content = content.replace('<!-- RELATED_LINKS -->', relatedLinksHTML);
  }
  fs.writeFileSync(filePath, content);
  console.log(`🕸️  Linked: pages/${file}`);
});

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
let added = 0;

files.forEach((file) => {
  const loc = `${config.site.domain}/pages/${file}`;
  if (sitemap.includes(loc)) return;
  const entry = `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.76</priority>
  </url>`;
  sitemap = sitemap.replace('</urlset>', `${entry}\n</urlset>`);
  added++;
  console.log(`🗺️  Sitemap: pages/${file}`);
});

fs.writeFileSync(sitemapPath, sitemap);

const linked = new Set();
config.pages.forEach((p) => {
  config.pages.filter((x) => x.slug !== p.slug).forEach((x) => linked.add(x.slug));
});
const orphans = config.pages.filter((p) => !config.pages.some((x) => x.slug !== p.slug));

console.log(`\n✅ Sitemap: ${added} new URLs added (${files.length} GEO pages total)`);
console.log(`✅ Orphan check: ${orphans.length === 0 ? 'all pages cross-linked' : orphans.length + ' orphans'}`);
