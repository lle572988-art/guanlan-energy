#!/bin/bash
# SEO Submission Script: IndexNow + Bing sitemap ping
# Usage: bash seo-submit.sh

SITE="https://metaphysicflow.com"
DOMAIN="metaphysicflow.com"
MATRIX="seo-engine/data/keywords-matrix.json"

echo "========================================"
echo "  SEO Submission for $DOMAIN"
echo "========================================"

# Build URL list from keywords matrix + core pages
PAGE_URLS=$(node -e "
const c=require('./${MATRIX}');
const base=c.site.domain;
const core=[base+'/',base+'/faq.html',base+'/free-chart.html',base+'/llms.txt',base+'/blog/'];
const geo=c.pages.map(p=>base+'/pages/'+p.slug+'.html');
console.log(JSON.stringify([...core,...geo]));
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
