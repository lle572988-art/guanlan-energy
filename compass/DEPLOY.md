# Living Compass · Deploy & launch checklist

Auto-deploy: push to `main` → Vercel builds `metaphysicflow.com`.

## Live funnel (Quiet Power subpath)

| Step | URL |
|------|-----|
| Wow #1 · 活罗盘 | https://metaphysicflow.com/compass/ |
| Wow #2 · X-Ray | https://metaphysicflow.com/compass/xray/ |
| Wow #3 · AI cure | X-Ray → Generate cure preview |
| 留存 · Heatmap | https://metaphysicflow.com/compass/heatmap/ |
| 第3幕 · Pricing | https://metaphysicflow.com/compass/order/ |
| pSEO hub | https://metaphysicflow.com/compass/guides/ |

Regenerate SEO: `node scripts/generate-compass-seo.mjs`

## Vercel environment variables

| Variable | Required for |
|----------|----------------|
| `STRIPE_SECRET_KEY` | Stripe checkout fallback |
| `STRIPE_WEBHOOK_SECRET` | Auto HTML report after Stripe pay |
| `BLOB_READ_WRITE_TOKEN` or Blob OIDC | Reports + cure hosting — link **guanlan-leads** store to project in Vercel **Storage** (auto-injects `BLOB_STORE_ID` + OIDC) |
| `RESEND_API_KEY` | Buyer email with report link |
| `RESEND_FROM_EMAIL` | Optional sender override |
| `FAL_API_KEY` or `FAL_KEY` | AI cure Before/After (`/api/compass-cure-image`) |
| `CRON_SECRET` | Monthly briefs for `compass-annual` pass |

Stripe webhook URL: `https://metaphysicflow.com/api/stripe-webhook`  
Event: `checkout.session.completed`

Gumroad Ping: `https://metaphysicflow.com/api/gumroad-ping`

## Gumroad products (create in dashboard)

| Slug | Price | SKU in `js/gumroad-products.js` |
|------|-------|----------------------------------|
| `compassrm` | $19 | `COMPASS_ROOM_SKU` |
| `compasshm` | $39 | `COMPASS_HOME_SKU` |
| `compassyr` | $49 | `COMPASS_YEAR_SKU` |
| `compassann` | $79 | `COMPASS_ANNUAL_SKU` |

Until products exist on Gumroad, empty SKUs force Stripe checkout.

## Progress vs 顶层策划案

| Module | Status |
|--------|--------|
| Wow #1 活罗盘 + Save PNG | ✅ |
| Wow #2 Energy X-Ray + paid reports | ✅ |
| Wow #3 AI cure staging | ✅ (needs `FAL_API_KEY`) |
| 流年热力图 + annual pass | ✅ |
| 黄金漏斗 $19 / $39 / $49 | ✅ |
| pSEO 矩阵 (347+ URLs) | ✅ |
| 主站导流 | ✅ nav → `/compass/` |
| 伴侣/家庭 LTV | ✅ `/compass/family/` tool + guide |
| 搬家择日 | ✅ `/compass/moving/` + guide |
| 工具枢纽 + 传播模板 | ✅ `/compass/tools/` · `/compass/share/` |
| 社群雷达 | 🔶 `compass/OUTREACH.md` + `npm run reddit:radar` |

## Manual smoke test after deploy

1. `/compass/` → birth date → compass resolves → Save my compass downloads PNG
2. `/compass/xray/` → upload photo → grid appears → insights below
   - iPhone HEIC: should show "Converting HEIC…" then overlay
   - If stuck: hard refresh (`?v=` on scripts bypasses old CDN cache)
3. `/checkout.html?product=compass-home` → Stripe or Gumroad
4. `/api/cron/compass-monthly` with `Authorization: Bearer $CRON_SECRET` (after first annual sale)

### Upload not working?

- Use **https://metaphysicflow.com/compass/xray/** (not `/feng-shui-scan` — that page is a demo scanner)
- Upload maps **flying stars on your photo** — it does not AI-label furniture
- HEIC needs `heic2any` (loaded on xray page) or export JPG from iPhone
- **Generate cure preview** needs `FAL_API_KEY` on Vercel (overlay works without it)
