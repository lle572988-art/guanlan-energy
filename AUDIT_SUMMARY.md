# Guanlan Energy — 全站核心代码与架构审计总包

**生成时间**：2026-05-29 23:00 BJT  
**域名**：https://metaphysicflow.com  
**托管**：Vercel (team_GVZl6)  
**GA4 属性**：Eastern Five Elements (ID: 538304903) · G-T82Z7E5ELB  
**目标受众**：欧美玄学/独立承包商/远程办公人群

---

## 一、目录结构总览

```
my-website/
├── index.html                          # 首页（带生辰测算+Bazi挂件+留资弹窗）
├── about.html                          # 关于页
├── consultation.html                   # 咨询页
├── forecast.html                       # 流年预测
├── feng-shui-scan.html                 # 风水扫描工具
├── article-detail.html                 # 文章详情模板
├── passterra_authority_dictionary.html # 术语词典
├── widget-bazi-wealth.html             # Bazi 留资挂件（独立文件，用于注入）
│
├── pages/               (90 个 HTML)   # pSEO 程序化生成页 — 五行×18 空间/决策
├── blog/                (59 个 HTML)   # 博客文章（含 10 篇 AI SEO 长文）
├── longtail/            (44 个 HTML)   # 长尾玄学文章（5 大主题域）
│
├── api/                 (4 个 JS)      # Vercel Serverless Functions
│   ├── collect-lead.js                 # Email 留资收集
│   ├── consult.js                      # 咨询预约 → Telegram
│   ├── create-payment-intent.js        # Stripe 支付
│   └── subscribe.js                    # Newsletter 订阅
│
├── css/
│   └── subscribe-popup.css
├── images/
│   ├── buddha.jpg
│   ├── calligraphy.jpg
│   └── still-life.jpg
│
├── sitemap.xml                         # Sitemap（当前仅 10 个主站 URL）
├── robots.txt                          # 允许全站索引 + Sitemap
├── package.json                        # Node 依赖（仅 stripe）
├── taiji-pattern.css                   # 太极图案 CSS
├── bagua_css.txt / bagua_tile.txt      # 八卦图参考
└── background_tile.txt                 # 背景纹理参考
```

**总计**：209 个 HTML 页面 + 4 个 API 端点 + 3 张图片 + 1 个 CSS

---

## 二、核心配置

### 2.1 package.json

```json
{
  "name": "guanlan-energy",
  "version": "1.0.0",
  "description": "Guanlan Energy - Five Elements Wisdom",
  "dependencies": {
    "stripe": "^17.0.0"
  }
}
```

无 `vercel.json` — Vercel 自动检测 Next.js/静态文件。

### 2.2 robots.txt

```
User-agent: *
Allow: /

# Sitemap
Sitemap: https://metaphysicflow.com/sitemap.xml
```

### 2.3 sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://metaphysicflow.com/</loc>
    <lastmod>2026-05-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://metaphysicflow.com/blog/</loc>
    <lastmod>2026-05-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://metaphysicflow.com/blog/workspace-command-position.html</loc>
    <lastmod>2026-05-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 共 10 条，仅收录首页 + blog 首页 + 8 篇代表性博客 -->
</urlset>
```

> ⚠️ **注意**：当前 sitemap 仅覆盖 10 个 URL。90 页 pSEO + 44 篇 longtail + 59 篇 blog 均未收录。这是重要的 SEO 优化缺口。

---

## 三、页面架构体系

### 3.1 首页（index.html）— 核心交互入口

**技术栈**：纯静态 HTML + 内联 CSS + 原生 JS  
**大小**：~44 KB

**页面结构流**：

```
Nav Sticky Bar
├── Logo (Guanlan Energy + 太极旋转动画 SVG)
├── Desktop Nav Links: Home · Forecast · About · Contact
└── Hamburger (移动端 → Dropdown 菜单)

Hero Section
├── H1: "Align with Your Elemental Source"
├── 全站核心互动区：生辰四柱输入（年/月/日/时）
│   └── 用户输入 → 点击 → 前端五行算法秒出 Elemental Baseline Report
└── Subtle 动画引导（淡入 + 光标闪烁）

Results Section（id="results"）
├── 动态生成 Cosmic Baseline Report
│   ├── Day Master 元素计算结果
│   ├── 五行平衡分析
│   └── 2026 Fire Horse 年流年提示
└── 报告完成 70% → Email 留资弹窗拦截

Related Section / CTA Box
└── 内链推荐 "继续探索五行智慧"

Footer
├── Guanlan Branding
├── Footer Nav Links
└── 版权信息
```

**核心交互逻辑**：

```javascript
// 五行元素计算算法（前端纯运算，零 API）
function guanlanCalculate() {
    var y = guanlanGetElem('gw-year').value.trim();
    var m = guanlanGetElem('gw-month').value.trim();
    var d = guanlanGetElem('gw-day').value.trim();
    var h = guanlanGetElem('gw-hour').value.trim();

    // 根据出生年份尾数映射五行（简化版 Bazi Day Master 代理）
    var lastDigit = parseInt(y.slice(-1));
    var elemMap = {
        0:'metal', 1:'metal',
        2:'water', 3:'water',
        4:'wood',  5:'wood',
        6:'fire',  7:'fire',
        8:'earth', 9:'earth'
    };
    var elementKey = elemMap[lastDigit] || 'earth';
    var profile = ELEMENT_PROFILES[elementKey];

    // 2026 流年财运评分（Fire Horse year → fire 加成）
    var score = Math.floor(40 + Math.random() * 40);
    if (elementKey === 'fire') score += 15;

    // 输出五行报告（匹配职业路径 + 财运模式 + 2026 流年指引）
    var reportHTML = '<strong>🔮 Your 2026 Wealth Forecast</strong><br><br>';
    reportHTML += 'Your Element: ' + profile.emoji + ' ' + profile.name + '<br>';
    reportHTML += '2026 Wealth Shift Index: <strong>' + score + '/100</strong><br><br>';
    // ... 详细职业/财运/流年建议 ...

    // 报告展示 → 1.8 秒后触发 Email 拦截弹窗
    setTimeout(function() {
        document.getElementById('gw-email-overlay').style.display = 'flex';
    }, 1800);
}

// 五行元素知识库
var ELEMENT_PROFILES = {
    wood:  { emoji:'🌲', career:'Entrepreneurship, education', wealth:'Multiple income streams', advise:'...' },
    fire:  { emoji:'🔥', career:'Marketing, sales, leadership', wealth:'Brand building', advise:'2026 Fire Horse = YOUR year' },
    earth: { emoji:'🌍', career:'Real estate, healthcare', wealth:'Stable assets', advise:'Ground yourself' },
    metal: { emoji:'💎', career:'Finance, law, tech', wealth:'Structured portfolios', advise:'Cut low-value clients' },
    water: { emoji:'💧', career:'Research, writing, strategy', wealth:'Intellectual property', advise:'Go deep in one area' }
};
```

### 3.2 pSEO 页面（pages/）— 五行×空间/决策矩阵

**生成方式**：程序化批量生成（`generate_programmatic_seo_v2.py`）  
**规模**：90 个独立 HTML

**结构矩阵**：

| \ | 空间类（18） | 决策类（18） |
|---|---|---|
| **Wood** | bathroom/bedroom/children-room/dining/entryway/garden/home-office/kitchen/living-room/study | burnout/career-change/creativity/financial/health/relationship/relocation/team-management |
| **Fire** | 同上 | 同上 |
| **Earth** | 同上 | 同上 |
| **Metal** | 同上 | 同上 |
| **Water** | 同上 | 同上 |

**每页结构**：
- **Schema.org JSON-LD**（三合一：WebSite + WebPage + Article）
- **H1**: `🌍 Earth Element Bedroom — Feng Shui Guide for Earth Personalities`
- **H2 正文段**：Best Layout / Colors / Essential Decor / What to Avoid
- **CTA 引导**：结尾导向首页或关联页面
- **内链矩阵**：6 条交叉链接指向其他元素/空间页
- **Bazi 留资挂件**（通过 `inject_widget.py` 批量注入）
- **Footer**

### 3.3 博客页面（blog/）— 内容营销阵地

**规模**：59 篇（含 10 篇 AI 生成的 SEO 长尾文）  
**风格**：每篇独立 CSS，GA4 追踪，CTA 引导

**结构模板**：
```
Blog Page
├── GA4 Tag (G-D0X4ESE9RL)
├── H1 标题 + 元描述
├── Hot Tag（热文标记，如 +250% Google 趋势）
├── 文章正文（H2/H3 结构化内容）
├── CTA Box
│   └── 等待发现的 CTA / 关联内容推荐
├── Bazi 留资挂件（批量注入）
└── Footer
```

### 3.4 长尾文章（longtail/）— 玄学精准词截流

**规模**：44 篇 | **主题域**：5 个

| 主题域 | 篇数 | 核心关键词 |
|--------|------|------------|
| **职场逆袭** | 4 | Bazi chart for 1099, Zi Wei Dou Shu career, Five Elements career change, Wood element remote work |
| **流年规避** | 10 | 2026 Fire Horse offset, Tai Sui remedies, Mercury retrograde balance, taboo directions |
| **催旺财运** | 10 | Wealth Palace activation, Flying Star wealth corner, Bazi financial planning, passive income |
| **生活事业融合** | 10 | Bedroom feng shui solo entrepreneur, Bazi co-founder compatibility, kitchen wealth |
| **进阶命理** | 10 | Ten Gods Bazi, 12 palaces Zi Wei Dou Shu, combo Human Design, Nobleman star |

**每页结构**：
- Schema.org JSON-LD（三段：WebSite + WebPage + Article）
- H1 长尾标题 + 元描述
- 5× H2 子标题 + 正文段
- CTA Box（随机轮播 5 个 CTA 变体）
- Bazi 留资挂件（批量注入）
- Footer

---

## 四、留资漏斗（Lead Generation Pipeline）

### 4.1 前端挂件（widget-bazi-wealth.html）

**触发流程**：
```
用户浏览页面
    ↓
发现 Bazi 财运测算挂件（视觉：暗金边框 + CTA 按钮）
    ↓
输入生辰 → 点击 "Read My Wealth Forecast"
    ↓
前端纯算法秒出报告（0 API 调用，0 延迟）
    ↓
报告显示到 70% 位置
    ↓
━━━ 🎣 Email 拦截弹窗 ━━━
"核心破局方略已发送至您的邮箱"
↓
用户输入 Email → 点击解锁
    ↓
POST → /api/collect-lead
    ↓
写入 leads_pool.csv
```

### 4.2 后端收集 API（api/collect-lead.js）

```javascript
// Vercel Serverless Function
// POST /api/collect-lead
// Body: { email, page, ts, ref }

export default function handler(req, res) {
    // CORS 放开
    const { email, page, ts, ref } = req.body;

    // 写入 /tmp/leads_pool.csv（Vercel 临时存储）
    const csvLine = [new Date().toISOString(), email, page || '/', ts || '', ref || 'direct'].join(',');

    fs.appendFileSync('/tmp/leads_pool.csv', csvLine, 'utf-8');

    return res.status(200).json({
        success: true,
        message: 'Lead captured',
        total_leads: count
    });
}
```

> ⚠️ **当前限制**：Vercel Serverless 无持久存储。leads_pool.csv 写入 `/tmp/`，函数冷启动时数据不保留。如要做 EDM，需要接入外部存储（Supabase/Buttondown）。

### 4.3 其他 API 端点

| API | 用途 | 状态 |
|-----|------|------|
| `POST /api/consult.js` | 咨询预约 → 通知 Telegram | ✅ 需要 TG_BOT_TOKEN + TG_CHAT_ID env |
| `POST /api/create-payment-intent.js` | Stripe $6.90 支付 | ✅ 需要 STRIPE_SECRET_KEY env |
| `POST /api/subscribe.js` | Newsletter 邮件订阅 | ✅ 带标签分类 |

---

## 五、SEO 技术栈

| 组件 | 状态 | 备注 |
|------|------|------|
| **Schema.org JSON-LD** | ✅ 全站 | WebSite + WebPage + Article 三段 |
| **内链矩阵** | ✅ 200 页 × 6 条 | 1200 条交叉链接 |
| **Google Indexing API** | 🟡 配额限制 | 每日 200 req，今晨已耗尽 |
| **GA4** | ✅ 全站 | G-T82Z7E5ELB |
| **Sitemap** | ⚠️ 仅 10 URL | 未覆盖 200 页，需扩展 |
| **Canonical URL** | ✅ longtail/pSEO | 指向 metaphysicflow.com |
| **Open Graph** | ❌ 未显式配置 | 需 <meta og:...> |
| **Hreflang** | ❌ 未配置 | 如有多语言需求需补充 |

---

## 六、自动化管线（外部脚本，非线上代码）

| 脚本 | 用途 | 位置 |
|------|------|------|
| `internal_linker_schema_v2.py` | 内链矩阵 + Schema 批量注入 | ~/workspace/my-website/ |
| `longtail_content_blitz_v3.py` | 44 篇长尾文章生成器 | ~/workspace/my-website/ |
| `inject_widget.py` | 留资挂件 200 页批量注入 | ~/workspace/my-website/ |
| `indexing_api.py` | Google Indexing API 强推 | ~/openclaw/scripts/ |
| `gsc_key_watcher.py` | Service Account 密钥 → 自动触发 Indexing | ~/openclaw/scripts/ |

---

## 七、关键发现与建议

### 紧急（SEO 层面）

1. **Sitemap 覆盖率严重不足** — 90 pSEO + 44 longtail + 59 blog = 193 页未收录 sitemap。需要扩展 sitemap 覆盖全站 URL。
2. **Open Graph / Twitter Card 缺失** — 社交分享预览无控制。需补充 `<meta property="og:title">`、`<meta name="twitter:card">`。
3. **长尾文章 canonical 指向正确** ✅，但 sitemap 中缺失，Google 可能延迟收录。

### 架构层面

4. **CSS 内联放大了页面体积** — 每页独立 `<style>` 块，无复用。建议提取公共 styles.css。
5. **Vercel Serverless 无持久存储** — `leads_pool.csv` 写入 `/tmp/` 在冷启动后丢失。如需 EDM 自动化，需集成 Supabase / Buttondown / Airtable。
6. **GA4 三个数据流对应三个站，但 console 无 unified dashboard** — 通过 `pass.metaphysicflow.com/admin/dashboard.html` 访问。

截至 2026-05-29 23:00 BJT，线上 209 个 HTML 文件全部正常 200 OK，Schema + 内链 + 留资挂件三项全通。明早 09:00 Indexing API 配额重置等待自动触发。
