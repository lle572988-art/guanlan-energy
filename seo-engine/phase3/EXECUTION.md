# Phase 3 执行清单 — 2026-06-13

## ✅ 已完成（本地）

1. **Blog JSON-LD** — `npm run seo:blog-schema`（8 篇补 Schema，61 篇已有）
2. **Gap Batch 2 (#6–10)** — 5 页 + sitemap +655 URLs
3. **Gap 报告过滤** — `phase2/competitor-intel/gap-filter.js`
4. **Widget** — 529 pages 含新 Gap 页
5. **Schema 审计** — `phase3:schema-audit`（部署后 blog 样本应显示 Article）

## ✅ 已完成（2026-06-13 续）

6. **Reddit PullPush 备用** — datacenter IP 403 时走 pullpush.io（15 线程）
7. **Gap 重过滤** — 30 → **10** 条有效 gap（`phase2:refilter-gaps`）
8. **内链** — 首页 compare 区 + free-chart 底部 → Gap/Horoscope 页

## ✅ 已完成（2026-06-13 SEO 续）

9. **`/calculator` 301** → `/free-chart.html`（`vercel.json`）
10. **矩阵 QC 字数** — `generate-pages.js` 补 Si Hua 段；168 页重生 + silo 重织
11. **Transit 内链** — 240 页 footer 前加 2026 Lian Zhen / forecast / compare  hub
12. **核心页内链** — `faq.html` · `blog/index.html` · 首页 compare · `free-chart` → GSC 优先 URL

## ✅ 已完成（2026-06-13 SEO 细节批）

13. **Blog dateModified 全量刷新** — 69/69 → `2026-06-13`（`npm run seo:blog-schema`）
14. **首页 SVG `<title>`** — 12 宫全部补全
15. **Locked palace $19 弹窗** — Three-Palace Gumroad 直开（`?unlock=true`）
16. **首页字体** — EB Garamond 移除，Cormorant + Cinzel
17. **Blog 内链 hub** — `npm run seo:blog-links`（69 篇 Related guides）
18. **GSC 优先 URL IndexNow** — `bash seo-priority-ping.sh`（9 条，部署后跑）
19. **首页 #what-is-zwds FAQ** — 内联 FAQPage microdata

## 📋 需你在 GSC 手动做

1. **重复网页（.md）** → 打开问题 → **验证修正情况**（commit `9896bb9` 已 301）
2. **核心 URL 请求编入索引**（每天 5–10 条，勿批量）：
   - `/blog/the-psychology-of-minimalist-spaces.html`
   - `/pages/feng-shui-partner-every-life-stage-vs-zwds.html`
   - `/pages/iching-divination-vs-zi-wei-dou-shu.html`
   - `/free-chart.html`
3. **181 条「已发现未索引」** — 只观察，2–4 周内看是否转为「已抓取」

## ⏰ Cron（可选）

```bash
bash seo-engine/phase3/setup-cron.sh   # 打印模板
export AI_API_KEY='...'                # 与 Vercel 相同
# crontab -e → 粘贴模板
```

## 📣 Social（每周）

```bash
export AI_API_KEY='...'
npm run phase3:social-full --prefix seo-engine
# 审核 daily-report-*.md → 手动发 Reddit/Quora
```

输出：`seo-engine/phase3/output/social-monitor/daily-report-YYYY-MM-DD.md`
