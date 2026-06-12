# Playbook 执行状态报告

> 站点：metaphysicflow.com（静态 HTML + Vercel）  
> 执行日期：2026-06-12  
> 来源：`/Users/yihua/Downloads/CURSOR_PLAYBOOK.md`（仅 Markdown，无 Python 包）  
> 适配策略：保留现有 `seo-engine/`，不迁移 Next.js

---

## 总览

| 步骤 | 状态 | 说明 |
|------|------|------|
| STEP 1 初始化结构 | ✅ | `data/stars.json`、`config/seo_config.json`、`lib/structured-data.js`、`scripts/playbook-qc.js` |
| STEP 2 Next.js 结构 | ❌ 跳过 | 已记录 URL 映射（见下） |
| STEP 3 页面生成 | ✅ | 168 星宫页已存在于 `pages/`，sitemap 已覆盖 |
| STEP 4 Claude API 增强 | ⏳ 延期 | 无脚本/API Key，需手动 |
| STEP 5 Sitemap | ✅ | `sitemap.xml` 含 168 矩阵 URL；`seo-submit.sh` 已更新 |
| STEP 6 结构化数据 | ✅ | `lib/structured-data.js` + `generate-pages.js` 已接入 |
| STEP 7 技术 SEO 审计 | ✅ 部分 | 核心页通过；矩阵页有字数缺口 |
| STEP 8 GSC / 关键词 | ⏳ 手动 | 见下方清单 |
| STEP 9 90 天日历 | ⏳ 部分 | 见下方进度表 |
| QC 质检 | ⚠️ 83.3% | 168 页中 140 通过，28 页差 1–3 词 |

---

## STEP 2 — Next.js → 静态站点 URL 映射

| Playbook 路径 | 静态站点等价物 | 状态 |
|---------------|----------------|------|
| `/calculator` | `/free-chart.html` | ✅ 已上线（本地） |
| `/calculator/[variant]` | `/pages/zi-wei-dou-shu-calculator-english.html`、`/pages/purple-star-astrology-calculator.html` | ✅ |
| `/stars` | `/blog/` + 14 篇 star meaning 文章 | ✅ 14/14 |
| `/stars/[starSlug]` | `/blog/zi-wei-dou-shu-{star}-star-meaning.html` | ✅ |
| `/stars/[star]/in-[palace]` | `/pages/{star}-in-{palace}.html`（168 页） | ✅ 本地已生成 |
| `/palaces` | 无独立 index；关键词页 `/pages/what-is-ming-gong-life-palace.html` 等 | ⏳ 部分 |
| `/palaces/[palaceSlug]` | 8 个 GEO 关键词页 + 168 矩阵按宫位 silo | ⏳ 无 12 独立 palace guide |
| `/compare/[slug]` | `/blog/bazi-vs-zi-wei-dou-shu.html` | ✅ |
| `/horoscope/[forecast]` | 不存在 | ❌ 待建 |
| `/life/[domain]` | 不存在 | ❌ 待建 |

**建议 Vercel 301（未实施，需用户确认）：**
- `/calculator` → `/free-chart.html`
- `/stars/zi-wei-emperor-star` → `/blog/zi-wei-dou-shu-zi-wei-star-meaning.html`

---

## STEP 3 — 页面生成验证

```
pages/*.html 总数：266
星宫矩阵页（*-in-*）：168
infinite-matrix.json 条目：168
sitemap.xml 覆盖：168/168 ✅
```

**无需重新运行 `npm run seo:blast`** — 页面与 sitemap 已同步。如需刷新 silo 链接或模板，可手动执行：

```bash
npm run seo:blast
```

---

## STEP 4 — AI 内容增强（延期）

| 任务 | 状态 |
|------|------|
| Top 5 星深度内容 Claude batch | ⏳ 需 `ANTHROPIC_API_KEY` + Python 脚本（包不存在） |
| 2026 十二生肖 forecast | ❌ 未建 |
| ZWDS vs BaZi 对比 AI 增强 | ⏳ 已有 blog 页，可手动扩写 |

---

## STEP 5 — Sitemap & IndexNow

- **`sitemap.xml`**：已包含 168 矩阵 URL + 8 关键词页 + blog/longtail 等
- **`seo-submit.sh`**：已从仅 8 关键词页扩展为 **181 URLs**（core + keywords + matrix）
- **IndexNow 限制**：单次提交 URL 上限约 10,000，当前 181 条在安全范围内

提交命令（需用户手动执行，非本次自动部署）：

```bash
bash seo-submit.sh
```

---

## STEP 6 — 结构化数据

新建 **`lib/structured-data.js`**，提供：

- `getOrganizationSchema()` / `getWebsiteSchema()`
- `getStarSchema()` — Article + FAQPage + BreadcrumbList
- `getCalculatorSchema()` — WebApplication
- `getFAQSchema()` / `getBreadcrumbSchema()`

**已接入：** `seo-engine/scripts/generate-pages.js` 通过 `require('../../lib/structured-data')` 生成 JSON-LD。

**现有页审计（抽样）：**

| 页面 | canonical | og: | JSON-LD | breadcrumb |
|------|-----------|-----|---------|------------|
| `index.html` | ✅ | ✅ | ✅ Organization/WebSite/FAQ | nav |
| `free-chart.html` | ✅ | ✅ | ✅ WebApplication + FAQPage | — |
| `faq.html` | ✅ | ✅ | ✅ FAQPage | — |
| `pages/zi-wei-in-ming-gong.html` | ✅ | ✅ | ✅ Article+FAQ+Breadcrumb | nav + JSON-LD |
| `pages/zi-wei-dou-shu-calculator-english.html` | ✅ | ✅ | ✅ | nav |

**缺口：**
- `free-chart.html` 未使用共享 `lib/structured-data.js`（内联 schema 已足够，低优先级）
- 矩阵页无 `h3`（仅 h1/h2/h4）— 层级可接受，非 blocker

---

## STEP 7 — 技术 SEO 审计

| 检查项 | 结果 | 建议 |
|--------|------|------|
| `robots.txt` | ✅ 存在，含 sitemap + IndexNow | — |
| canonical | ✅ 抽样全通过 | — |
| og: tags | ✅ 抽样全通过 | — |
| JSON-LD | ✅ 抽样全通过 | — |
| breadcrumb | ✅ nav + BreadcrumbList | — |
| 301 redirects | ⏳ 部分旧 URL 已在 `vercel.json` | 可加 `/calculator` redirect |
| hreflang | ❌ 未配置 | 英文单语站点，暂不需要 |
| ISR | N/A | 静态站点无 ISR |
| 图片 alt | ⏳ 未全站扫描 | 矩阵页几乎无图片，低优先级 |
| Core Web Vitals | ⏳ 未实测 | 可用 PageSpeed 手动测 |

---

## STEP 8 — GSC & 关键词追踪（手动）

### Google Search Console
- [ ] 验证 metaphysicflow.com 所有权
- [ ] 提交 `https://metaphysicflow.com/sitemap.xml`
- [ ] 追踪 Cluster 1（Calculator）：`Zi Wei Dou Shu calculator`、`Purple Star Astrology chart free`、`ZWDS birth chart online`
- [ ] 追踪 Cluster 2（Stars）：`{star} meaning ZWDS`
- [ ] 追踪 Cluster 3（Forecast）：`Zi Wei Dou Shu 2026 forecast`

### 外链 / Parasite SEO
- Quora：参考 [`docs/quora-parasite-answers.md`](quora-parasite-answers.md)
- Reddit：参考 [`reddit_engagement_strategy.md`](../reddit_engagement_strategy.md)
- GEO 目录：参考 [`docs/directory-listings-pack.md`](directory-listings-pack.md)
- Product Hunt：参考 [`docs/product-hunt-launch-pack.md`](product-hunt-launch-pack.md)

---

## STEP 9 — 90 天内容日历

### Week 1–2：Foundation
| 任务 | 状态 |
|------|------|
| 14 星 profile 页 | ✅ `/blog/zi-wei-dou-shu-*-star-meaning.html` |
| 12 palace guide 页 | ⏳ 仅 8 GEO 关键词页 + 168 矩阵，无独立 12 palace index |
| Calculator 页 | ✅ `free-chart.html` |
| GSC 提交 sitemap | ⏳ 手动 |

### Week 3–4：Star-Palace Matrix
| 任务 | 状态 |
|------|------|
| 168 star-in-palace 页 | ✅ 本地已生成，**未确认已部署** |
| AI 增强 top 30 | ⏳ 延期 |
| Reddit 5 条高质量回答 | ⏳ 手动 |

### Week 5–8：Forecast + Compare
| 任务 | 状态 |
|------|------|
| 2026 十二生肖 forecast | ❌ |
| ZWDS vs BaZi | ✅ blog 已有 |
| ZWDS vs Western | ❌ |
| Quora 2 条/周 | ⏳ 手动 |

### Week 9–12：Life Domain + Pillar
| 任务 | 状态 |
|------|------|
| `/life/career` 等 | ❌ |
| 4 篇 pillar blog (1000+ 词) | ⏳ 部分 longtail/blog 存在 |
| Medium 交叉发布 | ⏳ 手动 |
| Pinterest boards | ⏳ 手动 |

---

## QC 质检结果（2026-06-12）

命令：`npm run seo:qc` 或 `node scripts/playbook-qc.js`

```
Pages scanned: 168（infinite-matrix 星宫页）
✅ Pass: 140 (83.3%)
❌ Fail: 28 (16.7%)
```

**唯一失败原因：** 正文字数 297–299 词，低于 300 词阈值。

| 问题 | 数量 |
|------|------|
| `words=299<300` | 24 |
| `words=297<300` | 4 |

**已通过项（全部 168 页）：** 唯一 title/description、≥3 内链、silo 链接、calculator CTA、breadcrumb、FAQ JSON-LD、h1/h2 层级。

**修复建议（低优先级）：** 在 `generate-pages.js` 模板中增加 1 句 palace 解读文案，重新 `npm run seo:blast` 即可消除 28 个 fail。

---

## 新建/修改文件清单

| 文件 | 操作 |
|------|------|
| `data/stars.json` | 新建 — 14 星 + 12 宫元数据 |
| `config/seo_config.json` | 新建 — 优先级、关键词簇、QC 阈值 |
| `lib/structured-data.js` | 新建 — 可复用 JSON-LD builders |
| `scripts/playbook-qc.js` | 新建 — Playbook QC 脚本 |
| `docs/playbook-execution-status.md` | 新建 — 本报告 |
| `seo-submit.sh` | 更新 — 含 168 矩阵 URL |
| `package.json` | 更新 — 添加 `"seo:qc"` |
| `seo-engine/scripts/generate-pages.js` | 更新 — 引用 `lib/structured-data.js` |

---

## 部署说明 ⚠️

**168 星宫页 + 本 playbook 改动均未 commit / deploy。**

如需上线，请明确说 **「上线」**，然后：

1. 审查 `git status` 与 QC 报告
2. `git add` 相关文件并 commit
3. `git push` 触发 Vercel 自动部署
4. 部署后运行 `bash seo-submit.sh` 提交 IndexNow
5. GSC 手动提交 sitemap

---

## 用户待办（按优先级）

1. **说「上线」** — 若确认部署 168 页 + playbook 文件
2. **GSC** — 验证站点 + 提交 sitemap
3. **修复 28 页字数** — 可选，改模板后 re-blast
4. **Vercel redirect** — `/calculator` → `/free-chart.html`
5. **2026 forecast 页** — playbook STEP 4/9 缺口
6. **Quora/Reddit** — 按现有 docs 手动执行
