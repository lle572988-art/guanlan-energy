# Static HTML “components” (no Next.js)

Phase 2 spec lists React components; this site uses **shared HTML fragments + JSON-LD**:

| Concern | Location |
|---------|----------|
| Article + FAQ schema | `lib/structured-data.js` → `getStarSchema()` |
| Page shell / CTA | `seo-engine/scripts/generate-pages.js` template |
| Conversion widget | `scripts/inject-conversion-widget.js` + `/js/conversion-widget.js` |
| Silo link blocks | `seo-engine/scripts/silo-link-architect.js` (`<!-- SILO_LINKS -->`) |

To add a new reusable block, edit the template in `generate-pages.js` and re-run `npm run phase2:pipeline`.
