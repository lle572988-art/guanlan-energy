# Email engine — already live (Phase 6)

SEO traffic → email list is **not** rebuilt here. Existing flow:

1. `scripts/inject-conversion-widget.js` — widget on matrix/transit pages
2. `/js/conversion-widget.js` — client capture
3. `api/collect-lead.mjs` — enrich → DeepSeek report → Resend → Vercel Blob

**Env:** `AI_API_KEY`, `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`

Optional follow-up: map high-intent gap keywords from `phase2:competitor-intel` to dedicated landing pages with widget above the fold.
