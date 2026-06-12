# Optional Python scripts (spec port)

The Phase 2 blueprint references Python utilities for star/palace matrices and Claude batch enhancement. **This repo already implements the matrix in Node:**

| Spec (Python) | Node equivalent |
|---------------|-----------------|
| `stars.json` / palace combinator | `seo-engine/scripts/build-infinite-matrix.js` → `data/stars.json` + `infinite-matrix.json` |
| Transit forecast matrix | `seo-engine/scripts/build-transit-matrix.js` |
| Page HTML generation | `seo-engine/scripts/generate-pages.js` |
| AI content batch | Not ported — use Vercel `api/generate-reading.js` + DeepSeek (`AI_API_KEY`) |

If you prefer Python for offline analysis, copy competitor gap logic from `phase2/competitor-intel/analyze-competitors.js` or call:

```bash
npm run phase2:competitor-intel
```

No Python runtime required for Week 1 deliverables.
