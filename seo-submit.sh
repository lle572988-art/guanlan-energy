#!/bin/bash
# SEO Submission Script: IndexNow + Bing sitemap ping
# Usage: bash seo-submit.sh

SITE="https://metaphysicflow.com"
DOMAIN="metaphysicflow.com"
KEYWORDS="seo-engine/data/keywords-matrix.json"
INFINITE="seo-engine/data/infinite-matrix.json"
TRANSIT="seo-engine/data/transit-matrix.json"
HOROSCOPE="seo-engine/data/horoscope-matrix.json"
GAP_TOP5="seo-engine/data/gap-top5-matrix.json"
GAP_BATCH2="seo-engine/data/gap-batch2-matrix.json"

echo "========================================"
echo "  SEO Submission for $DOMAIN"
echo "========================================"

# Build URL list: core + keyword GEO + matrix + transit + horoscope
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
let transitUrls=[];
if(fs.existsSync('./${TRANSIT}')){
  const tx=JSON.parse(fs.readFileSync('./${TRANSIT}','utf8'));
  transitUrls=tx.pages.map(p=>base+'/pages/'+p.slug+'.html');
}
let horoscopeUrls=[];
if(fs.existsSync('./${HOROSCOPE}')){
  const hz=JSON.parse(fs.readFileSync('./${HOROSCOPE}','utf8'));
  horoscopeUrls=hz.pages.map(p=>base+'/pages/'+p.slug+'.html');
}
let gapUrls=[];
if(fs.existsSync('./${GAP_TOP5}')){
  const gp=JSON.parse(fs.readFileSync('./${GAP_TOP5}','utf8'));
  gapUrls=gp.pages.map(p=>base+'/pages/'+p.slug+'.html');
}
if(fs.existsSync('./${GAP_BATCH2}')){
  const gb=JSON.parse(fs.readFileSync('./${GAP_BATCH2}','utf8'));
  gapUrls=gapUrls.concat(gb.pages.map(p=>base+'/pages/'+p.slug+'.html'));
}
const all=[...new Set([...core,...keywordUrls,...matrixUrls,...transitUrls,...horoscopeUrls,...gapUrls])];
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
