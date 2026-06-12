const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../..');
const dataFile = process.env.SEO_DATA
  ? path.resolve(__dirname, process.env.SEO_DATA)
  : fs.existsSync(path.join(__dirname, '../data/infinite-matrix.json'))
    ? path.join(__dirname, '../data/infinite-matrix.json')
    : path.join(__dirname, '../data/keywords-matrix.json');

const config = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const pagesDir = path.join(rootDir, 'pages');
const sitemapPath = path.join(rootDir, 'sitemap.xml');
const today = new Date().toISOString().split('T')[0];

const slugs = config.pages.map((p) => p.slug);
const files = slugs.map((s) => `${s}.html`).filter((f) => fs.existsSync(path.join(pagesDir, f)));

const isTransit = dataFile.includes('transit-matrix');
const urlPriority = isTransit ? '0.78' : '0.72';

console.log(`\n🗺️  Sitemap merge for ${files.length} pages from ${path.basename(dataFile)}`);

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
let added = 0;

files.forEach((file) => {
  const loc = `${config.site.domain}/pages/${file}`;
  if (sitemap.includes(loc)) return;
  const entry = `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${isTransit ? 'weekly' : 'monthly'}</changefreq>
    <priority>${urlPriority}</priority>
  </url>`;
  sitemap = sitemap.replace('</urlset>', `${entry}\n</urlset>`);
  added++;
});

fs.writeFileSync(sitemapPath, sitemap);

if (!process.env.SEO_DATA?.includes('infinite-matrix') && files.length <= 20) {
  files.forEach((file) => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const otherFiles = files.filter((f) => f !== file);
    const relatedLinksHTML = `  <div class="related-links" style="margin-top:30px;padding:20px;background:rgba(22,29,48,0.8);border:1px solid rgba(201,169,110,0.12);">
    <h4 style="color:#C9A96E;margin-top:0;">Related Readings</h4>
    <ul style="margin:12px 0 0 20px;">
      ${otherFiles
        .slice(0, 7)
        .map((f) => {
          const slug = f.replace('.html', '');
          const pageData = config.pages.find((p) => p.slug === slug);
          const title = pageData ? pageData.title : slug;
          return `<li style="margin-bottom:8px;"><a href="/pages/${f}" style="color:#C9A96E;">${title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</a></li>`;
        })
        .join('\n      ')}
      <li><a href="${config.site.faq_page || '/faq.html'}" style="color:#C9A96E;">Official FAQ</a></li>
    </ul>
  </div>`;
    if (content.includes('<!-- RELATED_LINKS -->')) {
      content = content.replace('<!-- RELATED_LINKS -->', relatedLinksHTML);
      fs.writeFileSync(filePath, content);
    }
  });
}

console.log(`✅ Added ${added} new URLs to sitemap.xml (${files.length} total in batch)`);
