# Phase 3 — Schema + Social (Static HTML)

Phase 3 adapts the blueprint’s Next.js modules to **metaphysicflow.com’s stack**:

| Blueprint module | Next.js spec | This repo |
|------------------|--------------|-----------|
| `schema_engine.py` | Inject into App Router | ✅ `phase3/schema-engine/audit-schema.js` + existing `lib/structured-data.js` |
| `social_monitor.py` | Claude API drafts | ✅ `phase3/social-monitor/social_monitor.py` → **DeepSeek** via `AI_API_KEY` |
| `chart-reading/route.ts` | Next API route | ⏭️ **Already exists** — `api/generate-reading.js` + `api/collect-lead.mjs` |
| `calculator.css` | React calculator | ⏭️ **Already exists** — `free-chart.html` + `js/free-chart-app.js` |
| `setup_cron.sh` | Cron templates | ✅ `phase3/setup-cron.sh` (paths for this repo) |

## Do not copy blindly from the blueprint

- **No fake `aggregateRating`** in Schema — Google penalizes fabricated review counts.
- **No Anthropic-only routes** — production uses `AI_API_KEY` (DeepSeek).
- **No `/calculator` or `/stars/[slug]`** — use `/free-chart.html` and `/pages/*.html`.

## Quick start

```bash
# Schema audit (5 live sample URLs)
npm run phase3:schema-audit --prefix seo-engine

# Social monitor (scan Reddit; drafts need AI_API_KEY)
export AI_API_KEY='...'
npm run phase3:social-full --prefix seo-engine

# Cron templates
bash seo-engine/phase3/setup-cron.sh
```

## npm scripts

| Command | Action |
|---------|--------|
| `phase3:schema-audit` | Audit free-chart, gap, horoscope, blog samples |
| `phase3:social-scan` | Reddit scan only → `output/social-monitor/scan-*.json` |
| `phase3:social-full` | Scan + DeepSeek drafts → `daily-report-*.md` |

## Outputs

- `phase3/output/schema-audit/audit-YYYY-MM-DD.json`
- `phase3/output/social-monitor/daily-report-YYYY-MM-DD.md`

## Schema coverage today

| Page | JSON-LD |
|------|---------|
| `free-chart.html` | WebApplication + FAQPage ✅ |
| Matrix / transit / horoscope generators | Article + FAQ + Breadcrumb via `lib/structured-data.js` ✅ |
| Gap Top 5 | Article + FAQ + Breadcrumb in generator ✅ |
| Blog posts | Article + canonical ✅ |

Run `phase3:schema-audit` after major page batches to find gaps (e.g. missing FAQPage on blog posts).

## User actions

| Task | How |
|------|-----|
| Publish Reddit/Quora replies | Review `daily-report-*.md` manually — never auto-post |
| Validate schema fixes | GSC → Enhancements → FAQ / Rich results |
| Deploy schema HTML changes | Say **「上线」** — commit + `vercel --prod` |
