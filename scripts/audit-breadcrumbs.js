#!/usr/bin/env node
/**
 * Ensure blog posts have BreadcrumbList with Journal label + live breadcrumb URLs.
 * Usage:
 *   node scripts/audit-breadcrumbs.js
 *   node scripts/audit-breadcrumbs.js --fix
 *   node scripts/audit-breadcrumbs.js --skip-url-check
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const blogDir = path.join(root, 'blog');
const fix = process.argv.includes('--fix');
const skipUrlCheck = process.argv.includes('--skip-url-check');

const BREADCRUMB_BLOCK = (title, url) => `    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://metaphysicflow.com/" },
        { "@type": "ListItem", "position": 2, "name": "Journal", "item": "https://metaphysicflow.com/blog/" },
        { "@type": "ListItem", "position": 3, "name": ${JSON.stringify(title)}, "item": ${JSON.stringify(url)} }
      ]
    }`;

function extractTitle(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return h1[1].replace(/<[^>]+>/g, '').trim();
  const og = html.match(/property="og:title"\s+content="([^"]+)"/);
  if (og) return og[1];
  return path.basename(html).replace('.html', '');
}

function collectBreadcrumbUrls(html) {
  const urls = [];
  const re = /"item"\s*:\s*"(https:\/\/metaphysicflow\.com[^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (html.slice(Math.max(0, m.index - 120), m.index).includes('BreadcrumbList') ||
        html.slice(Math.max(0, m.index - 400), m.index + 50).includes('ListItem')) {
      urls.push(m[1]);
    }
  }
  return [...new Set(urls)];
}

async function checkUrlLiveness(urls) {
  if (skipUrlCheck || !urls.length) return [];
  const failures = [];
  await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(8000),
        });
        if (res.status !== 200) failures.push({ url, status: res.status });
      } catch (err) {
        failures.push({ url, status: err.message });
      }
    })
  );
  return failures;
}

const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html');

let missing = 0;
let fixed = 0;
const allUrls = new Set();

files.forEach((file) => {
  const rel = `blog/${file}`;
  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const url = `https://metaphysicflow.com/${rel}`;

  collectBreadcrumbUrls(html).forEach((u) => allUrls.add(u));

  if (!html.includes('BreadcrumbList')) {
    missing += 1;
    if (fix && html.includes('"@graph"')) {
      const title = extractTitle(html);
      html = html.replace(/(\n\s*\]\s*\n\s*\}\s*\n<\/script>)/, `,\n${BREADCRUMB_BLOCK(title, url)}$1`);
      fs.writeFileSync(filePath, html);
      fixed += 1;
      collectBreadcrumbUrls(html).forEach((u) => allUrls.add(u));
    }
    return;
  }

  if (fix && html.includes('"name": "Blog"')) {
    html = html.replace(
      /"name": "Blog",\s*\n\s*"item": "https:\/\/metaphysicflow\.com\/blog\/index\.html"/g,
      '"name": "Journal",\n          "item": "https://metaphysicflow.com/blog/"'
    );
    fs.writeFileSync(filePath, html);
    fixed += 1;
  }
});

(async function main() {
  console.log(`🍞 Breadcrumb audit — ${files.length} posts`);
  if (missing === 0) {
    console.log('✅ All posts include BreadcrumbList');
  } else {
    console.log(`⚠️  ${missing} posts missing BreadcrumbList${fix ? ` (${fixed} fixed)` : ''}`);
  }
  if (fix && fixed) console.log(`✅ Updated ${fixed} file(s)`);

  const urlFailures = await checkUrlLiveness([...allUrls]);
  if (urlFailures.length) {
    console.log(`\n❌ ${urlFailures.length} breadcrumb URL(s) not HTTP 200:`);
    urlFailures.forEach(({ url, status }) => console.log(`   - ${url} → ${status}`));
    process.exit(1);
  }
  if (!skipUrlCheck) console.log(`✅ ${allUrls.size} breadcrumb URL(s) liveness OK`);

  process.exit(missing && !fix ? 1 : 0);
})();
