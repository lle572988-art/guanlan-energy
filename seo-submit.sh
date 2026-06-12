#!/bin/bash
# SEO Submission Script: IndexNow + Bing sitemap ping
# Usage: bash seo-submit.sh

SITE="https://metaphysicflow.com"
DOMAIN="metaphysicflow.com"
KEYWORDS="seo-engine/data/keywords-matrix.json"
INFINITE="seo-engine/data/infinite-matrix.json"

echo "========================================"
echo "  SEO Submission for $DOMAIN"
echo "========================================"

# Build URL list: core pages + keyword GEO pages + 168 star-palace matrix
PAGE_URLS=$(node -e "
const fs=require('fs');
const kw=require('./${KEYWORDS}');
const base=kw.site.domain;
const core=[base+'/',base+'/faq.html',base+'/free-chart.html',base+'/llms.txt',base+'/blog/'];
const keywordUrls=kw.pages.map(p=>base+'/pages/'+p.slug+'.html');
let matrixUrls=[];
if(fs.existsSync('./${INFINITE}')){
  const mx=JSON.parse(fs.readFileSync('./${INFINITE}','utf8'));
  matrixUrls=mx.pages.map(p=>base+'/pages/'+p.slug+'.html');
}
const all=[...new Set([...core,...keywordUrls,...matrixUrls])];
process.stderr.write('URLs to ping: '+all.length+'\\n');
console.log(JSON.stringify(all));
")

echo ""
echo "[1/3] IndexNow → Bing..."
curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d "{
    \"host\": \"${DOMAIN}\",
    \"key\": \"seo-indexnow-key\",
    \"keyLocation\": \"${SITE}/seo-indexnow-key.txt\",
    \"urlList\": ${PAGE_URLS}
  }"
echo ""

echo ""
echo "[2/3] Bing sitemap ping..."
curl -s "https://www.bing.com/ping?siteMap=${SITE}/sitemap.xml" | head -3
echo ""

echo ""
echo "[3/3] Index check..."
echo "  Google: https://www.google.com/search?q=site%3A${DOMAIN}+pages"
echo "  Bing:   https://www.bing.com/search?q=site%3A${DOMAIN}+pages"
echo ""
echo "========================================"
echo "  Done — GEO pages pinged via IndexNow"
echo "========================================"
