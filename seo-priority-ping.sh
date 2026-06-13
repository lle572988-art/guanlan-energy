#!/bin/bash
# Ping GSC high-priority URLs via IndexNow (small batch — run after deploy)
# Usage: bash seo-priority-ping.sh

SITE="https://metaphysicflow.com"
DOMAIN="metaphysicflow.com"

URLS='[
  "https://metaphysicflow.com/",
  "https://metaphysicflow.com/free-chart.html",
  "https://metaphysicflow.com/faq.html",
  "https://metaphysicflow.com/blog/the-psychology-of-minimalist-spaces.html",
  "https://metaphysicflow.com/pages/feng-shui-partner-every-life-stage-vs-zwds.html",
  "https://metaphysicflow.com/pages/iching-divination-vs-zi-wei-dou-shu.html",
  "https://metaphysicflow.com/pages/transit/2026-lian-zhen-hua-ji-in-career-palace.html",
  "https://metaphysicflow.com/pages/horoscope/2026-annual-forecast.html",
  "https://metaphysicflow.com/blog/2026-zi-wei-dou-shu-annual-forecast.html"
]'

echo "IndexNow priority ping (${DOMAIN}) — 9 URLs"
curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d "{
    \"host\": \"${DOMAIN}\",
    \"key\": \"seo-indexnow-key\",
    \"keyLocation\": \"${SITE}/seo-indexnow-key.txt\",
    \"urlList\": ${URLS}
  }"
echo ""
echo "Done."
