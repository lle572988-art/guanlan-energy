# Phase 2 — MetaphysicFlow SEO Engine (Static HTML)

Phase 2 adapts the blueprint’s Next.js modules to **metaphysicflow.com’s existing stack**: static HTML on Vercel, `seo-engine/` Node scripts, DeepSeek via `AI_API_KEY`, and Phase 6 lead capture at `/api/collect-lead`.

## Spec vs this repo

| Phase 2 module | Spec | This repo |
|----------------|------|-----------|
| `automation/` | Full content pipeline | ✅ `phase2/automation/pipeline.js` → reuses `seo:blast` steps |
| `competitor-intel/` | Keyword reverse + gaps | ✅ `phase2/competitor-intel/` reads `config/seo_config.json` |
| `components/` | Next.js React | ⏭️ **Skipped** — use `lib/structured-data.js` + HTML templates in `generate-pages.js` |
| `app-routes/` | Next.js App Router | ⏭️ **Mapped** — see `app-routes/static-url-map.json` + `config/seo_config.json` `url_mapping` |
| `email-engine/` | SEO → email list | ✅ **Exists** — `api/collect-lead.mjs` + widget (`scripts/inject-conversion-widget.js`) |
| `analytics/` | GSC auto analysis | ⏳ Stub — `seo:force-index`, `seo:add-gsc-sa`; full GSC pull needs OAuth |

## Week 1 execution order

Run from **repo root** unless noted.

```bash
# 0. Build 2026 zodiac horoscope hub + 12 animal pages
npm run seo:horoscope --prefix seo-engine
node seo-engine/scripts/generate-horoscope-pages.js

# 1. Competitor gaps (no page writes)
npm run phase2:competitor-intel

# 2. Full content pipeline (same as seo:blast, with orchestrator logging)
npm run phase2:pipeline

# 3. QC matrix pages
npm run phase2:qc

# 4. Optional: full pipeline + QC + competitor intel
npm run phase2:full -- --dry-run   # preview steps first
npm run phase2:full
```

### Equivalent to legacy blast

```bash
npm run seo:blast          # from repo root
# same steps as phase2:pipeline (multiply → transit → generate → inject → silo → parasite → sitemap)
```

## npm scripts (seo-engine)

| Command | What it does |
|---------|----------------|
| `phase2:competitor-intel` | Fetch competitor sitemaps/pages → gap JSON/MD |
| `phase2:pipeline` | Orchestrate matrix → HTML → widget → sitemap |
| `phase2:pipeline:dry` | Print steps without running |
| `phase2:qc` | Matrix-only playbook QC |
| `phase2:full` | Pipeline + QC + competitor intel |
| `seo:blast` | Original v4 all-in-one (unchanged) |

## Outputs

- Gap reports: `seo-engine/phase2/output/competitor-intel/gap-report-YYYY-MM-DD.{json,md}`
- Parasite snippets: `seo-engine/output/parasite-ready-matrix.md` (via `parasite` step)
- Pages: `pages/*.html`, `pages/transit/*.html`
- Sitemap: root `sitemap.xml`

## Config

- **Competitors**: `config/seo_config.json` → `competitors[]` (domains, seed URLs, priority)
- **Phase 2 limits**: `config/seo_config.json` → `phase2.competitor_max_pages`
- **Stars/palaces data**: `data/stars.json` (synced from `build-infinite-matrix.js`)

## User actions required

| Item | Env / setup |
|------|-------------|
| AI content enhancement | `AI_API_KEY` on Vercel (DeepSeek) — manual or future batch script |
| Lead email fulfillment | `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN` (already Phase 6) |
| Google Indexing API | `GOOGLE_APPLICATION_CREDENTIALS` or `service-account.json` |
| GSC Search Analytics pull | OAuth client + property access — not automated yet |
| IndexNow / bulk submit | `bash seo-submit.sh` (manual) |
| Deploy | `vercel --prod` when ready — **not run by these scripts** |

## Static HTML vs Next.js

**Recommendation: stay on static HTML.** You already ship 168 matrix + 240 transit pages, widget injection, and structured data without SSR complexity. Next.js would only help if you need dynamic `/horoscope/[year]` or authenticated dashboards — map those to new static batches via `generate-transit-pages.js` instead.

See `app-routes/static-url-map.json` for playbook route equivalents.
