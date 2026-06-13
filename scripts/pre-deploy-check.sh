#!/usr/bin/env bash
# Pre-deploy verification — run before vercel --prod
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Pre-deploy checks ==="
GUMROAD=$(grep -c 'gumroad.com/l' index.html || true)
CHECKOUT=$(grep 'checkout.html' index.html || true)
STAR5=$(grep -c 'STAR5' index.html || true)

echo "gumroad.com/l count in index.html: $GUMROAD (target: 6)"
echo "checkout.html in index.html: $(echo "$CHECKOUT" | grep -c . || echo 0) lines (target: 0)"
echo "STAR5 mentions: $STAR5 (target: ≥1)"

node scripts/audit-schema.js
npm run seo:audit-breadcrumbs:live

if [[ -n "${PDF_URL:-}" ]]; then
  echo "Checking PDF_URL: $PDF_URL"
  HTTP_CODE=$(curl -sI -o /dev/null -w "%{http_code}" "$PDF_URL" || echo "000")
  if [[ ! "$HTTP_CODE" =~ ^(200|301|302)$ ]]; then
    echo "⚠️  PDF_URL not reachable (HTTP $HTTP_CODE): $PDF_URL"
    exit 1
  fi
  echo "✅ PDF_URL reachable (HTTP $HTTP_CODE)"
fi

if [[ "$GUMROAD" -lt 6 ]]; then
  echo "⚠️  PARTNER_SKU / ANNUAL_SKU missing in js/gumroad-products.js"
  exit 1
fi

if [[ -n "$CHECKOUT" ]]; then
  echo "⚠️  checkout.html still referenced in index.html"
  exit 1
fi

echo "✅ Local pre-deploy checks passed"
