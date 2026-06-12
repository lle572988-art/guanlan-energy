# Analytics — GSC (partial)

| Capability | Script | Status |
|------------|--------|--------|
| Add service account to GSC | `npm run seo:add-gsc-sa` | Manual one-time |
| Push URLs to Indexing API | `npm run seo:force-index` | Needs `service-account.json` |
| Search Analytics export | — | **Not implemented** — requires OAuth + `googleapis` query |

Future Week 2+ work: add `analytics/gsc-pull.js` using stored OAuth refresh token to emit weekly CTR/impression CSV under `phase2/output/analytics/`.

For now run GSC UI exports manually and compare against `phase2:competitor-intel` gap reports.
