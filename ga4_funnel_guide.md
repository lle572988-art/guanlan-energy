# GA4 Conversion Funnel 设置指南

## 前提
GA4 已添加了增强事件追踪脚本 — 现在三个关键漏斗事件会自动记录：
- `purchase_click` — 点击 Gumroad 购买
- `page_navigation` — 在页面间跳转（含 label: "To Feng Shui Scan" / "To Consultation"）
- `scroll_depth` — 滚动深度（25%/50%/75%/90%）
- `outbound_click` — 点击外链

## 步骤 1：打开 GA4 漏斗工具

1. 打开 https://analytics.google.com → 选择 **Guanlan Energy** 账号
2. 左侧菜单 → **Explore**（探索）
3. 选择 **Funnel exploration**（漏斗探索）

## 步骤 2：配置博客→扫描→购买的漏斗

在 Funnel exploration 中设置：

**Step 1：博客页面**
- 步骤名称：`Blog Visit`
- 事件：`page_view`
- 页面路径条件：`page_location` contains `/blog/`

**Step 2：点击扫描链接**
- 步骤名称：`Click Scan`
- 事件：`page_navigation`
- 事件标签条件：`event_label` = `To Feng Shui Scan`

**Step 3：扫描页访问**
- 步骤名称：`Scan Page`
- 事件：`page_view`
- 页面路径条件：`page_location` contains `feng-shui-scan`

**Step 4：购买点击**
- 步骤名称：`Purchase Click`
- 事件：`purchase_click`

## 步骤 3：查看每个步骤的流失率

漏斗图会显示每个步骤的转化人数和流失百分比：
- Blog → Scan 点击：看内容引流效果
- Scan → 购买：看扫描页转化率
- 如果某步流失 > 80%，需要优化对应页面

## 步骤 4：跳出率监控

1. 左侧菜单 → **Reports** → **Engagement** → **Pages and Screens**
2. 按 **Bounce rate** 降序排序
3. 超过 80% 跳出率的页面需要优化：
   - 首页跳出率高 → Hero 文案不够吸引
   - 博客跳出率高 → 开篇太慢或缺少内链
   - 扫描页跳出率高 → 没有引导用户点击"开始扫描"

## 每日简报

每天 9:00 AM 的 GA4 简报会自动包含：
- 各页面跳出率排名
- 停留时间最长的页面
- 优化建议
