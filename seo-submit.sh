#!/bin/bash
# SEO Submission Script: ping Google, Bing (IndexNow), and build sitemap
# Usage: bash seo-submit.sh

SITE="https://metaphysicflow.com"
DOMAIN="metaphysicflow.com"

echo "========================================"
echo "  SEO Submission for $DOMAIN"
echo "========================================"

# 1. IndexNow for Bing (fastest — no auth needed)
echo ""
echo "[1/4] IndexNow → Bing..."
curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "'"$DOMAIN"'",
    "key": "seo-indexnow-key",
    "keyLocation": "'"$SITE"'/seo-indexnow-key.txt",
    "urlList": [
      "'"$SITE"'/",
      "'"$SITE"'/faq.html",
      "'"$SITE"'/free-chart.html",
      "'"$SITE"'/llms.txt",
      "'"$SITE"'/blog/",
      "'"$SITE"'/about.html",
      "'"$SITE"'/consultation.html",
      "'"$SITE"'/feng-shui-scan.html",
      "'"$SITE"'/forecast.html",
      "'"$SITE"'/checkout.html",
      "'"$SITE"'/privacy.html",
      "'"$SITE"'/terms.html",
      "'"$SITE"'/disclaimer.html",
      "'"$SITE"'/refund.html"
    ]
  }' | head -5
echo ""

# 2. Google Indexing API (via search console ping)
echo ""
echo "[2/4] Google ping (indexing API)..."
curl -s "https://www.google.com/ping?sitemap=${SITE}/sitemap.xml" | head -3
echo ""

# 3. Bing webmaster ping
echo ""
echo "[3/4] Bing webmaster ping..."
curl -s "https://www.bing.com/ping?siteMap=${SITE}/sitemap.xml" | head -3
echo ""

# 4. Check current index status
echo ""
echo "[4/4] Index check..."
echo "  Google: https://www.google.com/search?q=site%3A${DOMAIN}"
echo "  Bing:   https://www.bing.com/search?q=site%3A${DOMAIN}"
echo ""
echo "========================================"
echo "  ✅ Done — wait 24-48h for results"
echo "  📋 GSC: https://search.google.com/search-console?resource_id=sc-set:${SITE}"
echo "========================================"
