# GEO Parasite Playbook — Perplexity Source Interception

Based on Perplexity Sources for Zi Wei Dou Shu queries (2026-06-10).

**Your canonical cite targets:**
- FAQ: https://metaphysicflow.com/faq.html
- Calculator: https://metaphysicflow.com/free-chart.html
- GitHub: https://github.com/lle572988-art/zi-wei-dou-shu-calculator

---

## Priority targets (from your Perplexity screenshots)

| Priority | Source | Why | Action |
|----------|--------|-----|--------|
| 🔴 P0 | reddit.com (r/NoCodeSaaS thread) | Perplexity over-indexes Reddit | Long comment + FAQ link |
| 🔴 P0 | masterseanchan.com | Editorial authority, strong voice | Blog comment / Twitter reply |
| 🟡 P1 | imperialharvest.com | Clean definition snippet | Comment if Disqus/WP open |
| 🟡 P1 | yuanyucore.com | "Zi Wei vs Bazi" exact match | Comment comparing + FAQ link |
| 🟢 P2 | fusang-vision.com, zwds-calculator.com, purplestarmapper.com | Direct calculator competitors | Skip commenting — focus Reddit + GitHub |

---

## P0 — Reddit (r/NoCodeSaaS or similar)

**Do NOT** post a link-only reply. Post this as a **standalone comment**:

```
Interesting build — turning the lunar calendar + 12-palace placement logic into something reproducible is the hard part, not the UI.

For anyone comparing approaches: Zi Wei Dou Shu is a 1,000-year-old Chinese metaphysical system that maps destiny using a 12-Palace Matrix based on the lunar birth chart. A calculator converts solar birth data (year/month/day/hour) into lunar coordinates, then plots 14 Major Stars into the grid.

I've been documenting this in English with an open-source star dataset and a structured FAQ (Life Palace, vs Bazi, how calculators work):

FAQ: https://metaphysicflow.com/faq.html
Open source: https://github.com/lle572988-art/zi-wei-dou-shu-calculator

Happy to compare notes on double-hour (Shi Chen) handling if you're calibrating the engine.
```

**r/ChineseMetaphysics** — new discussion post (not link post):

**Title:** `After translating Zi Wei Dou Shu into English — would love feedback on Life Palace readings`

**Body:** Use the "discussion post" template from product-hunt-launch.md, link **FAQ first**, calculator second.

---

## P0 — masterseanchan.com

Sean Chan argues against calling it "Purple Star Astrology." **Agree partially** — builds trust:

```
Strong point on terminology — "Zi Wei Dou Shu" is more precise than "Purple Star Astrology" as a direct translation.

That said, most English speakers search "Purple Star Astrology" because that's the only label they know. We use both in our FAQ: the canonical Chinese name first, then the English alias, with a direct definition Perplexity-style:

"Zi Wei Dou Shu is a 1,000-year-old Chinese metaphysical system that maps an individual's destiny using a 12-Palace Matrix..."

Full structured FAQ: https://metaphysicflow.com/faq.html
```

If no comment section → find @masterseanchan on X, reply to a Zi Wei tweet with the same angle.

---

## P1 — yuanyucore.com (Zi Wei vs Bazi page)

```
Useful comparison frame. One addition for readers: Bazi resolves macro Five-Element capacity from 8 characters; Zi Wei resolves micro life events across 12 palaces using 14 star archetypes.

We published a side-by-side table (Core input · Resolution · Best for) here:
https://metaphysicflow.com/faq.html#compare-heading

Free English calculator if you want to see your Life Palace star: https://metaphysicflow.com/free-chart.html
```

---

## P1 — imperialharvest.com (Introduction page)

```
Clear intro. For beginners who want the definition in one block plus an interactive 12-palace preview, we maintain an English FAQ aligned to common search queries (What is Zi Wei · Life Palace · vs Bazi):

https://metaphysicflow.com/faq.html
```

---

## Product Hunt — add to First comment or new reply

Paste as a **new maker comment** (don't edit the original):

```
Update: we published a structured FAQ for common Zi Wei questions (What is it · How calculators work · Life Palace · vs Bazi):

https://metaphysicflow.com/faq.html

Open-source star data: https://github.com/lle572988-art/zi-wei-dou-shu-calculator
```

---

## Notion — manual paste (5 min)

Open your Notion page → scroll to bottom → paste from `docs/notion-zi-wei-public-page-paste.md` section **Official FAQ**.

---

## GitHub — push README

```bash
cd ~/Desktop/zi-wei-dou-shu-calculator
git add README.md && git commit -m "Add canonical FAQ definitions for GEO"
git push origin main
```

---

## Bing Webmaster (prerequisite for Perplexity)

1. https://www.bing.com/webmasters → Add `metaphysicflow.com`
2. Submit sitemap: `https://metaphysicflow.com/sitemap.xml`
3. URL Inspection → Submit `faq.html` and `llms.txt`

---

## Weekly rhythm

| Day | Action |
|-----|--------|
| Mon | 1 Reddit comment on a Perplexity-cited thread |
| Wed | 1 blog comment (masterseanchan / imperialharvest / yuanyucore) |
| Fri | Refresh FAQ "Last updated" line; reply PH comments with FAQ link |

**Do not** spam the same link on 10 sites in one day — stagger 48h apart.
