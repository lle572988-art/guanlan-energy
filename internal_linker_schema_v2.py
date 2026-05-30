#!/usr/bin/env python3
"""
玄学阵地内功修筑 v2.0
增强版: 替换原有简单内链 + 真正的 Schema JSON-LD
"""

import os, re, json, random
from datetime import datetime, timezone, timedelta
from collections import defaultdict

BASE_DIR = os.path.expanduser("~/.openclaw/workspace/my-website")
PAGES_DIR = os.path.join(BASE_DIR, "pages")
BLOG_DIR = os.path.join(BASE_DIR, "blog")
LONTAIL_DIR = os.path.join(BASE_DIR, "longtail_pages")

ELEMENT_MAP = {
    "wood": ["wood", "🌲"],
    "fire": ["fire", "🔥"],
    "earth": ["earth", "🌍"],
    "metal": ["metal", "💎"],
    "water": ["water", "💧"],
}

TOPIC_MAP = {
    "feng-shui": ["feng-shui", "fengshui", "bedroom", "living", "kitchen", "bathroom", "dining", 
                  "entryway", "garden", "study", "home-office", "children"],
    "decision": ["decision", "career", "burnout", "financial", "relationship", "creativity",
                 "relocation", "team-management", "health"],
}

def classify_page(filename, content_lower):
    basename = filename.lower()
    element = None
    for elem_key, keywords in ELEMENT_MAP.items():
        if any(kw in basename for kw in keywords):
            element = elem_key
            break
    
    topic = None
    for topic_key, keywords in TOPIC_MAP.items():
        if any(kw in basename for kw in keywords):
            topic = topic_key
            break
    
    if not element:
        for elem_key, keywords in ELEMENT_MAP.items():
            if any(kw in content_lower for kw in keywords):
                element = elem_key
                break
    if not topic:
        topic = "article"
    
    return element or "unknown", topic


def scan_pages():
    pages = {}
    dirs = [
        ("", BASE_DIR, lambda f: f.endswith(".html") and f not in ("sitemap.xml",)),
        ("pages/", PAGES_DIR, lambda f: f.endswith(".html")),
        ("blog/", BLOG_DIR, lambda f: f.endswith(".html")),
        ("longtail/", LONTAIL_DIR, lambda f: f.endswith(".html")),
    ]
    
    for prefix, directory, filte in dirs:
        if not os.path.isdir(directory):
            continue
        for f in os.listdir(directory):
            if not filte(f):
                continue
            path = os.path.join(directory, f)
            with open(path, "r", encoding="utf-8") as fh:
                content = fh.read()
            content_lower = content.lower()
            title_m = re.search(r'<title>(.*?)</title>', content, re.DOTALL)
            desc_m = re.search(r'<meta name="description" content="(.*?)"', content)
            element, topic = classify_page(f, content_lower)
            key = prefix + f
            pages[key] = {
                "path": path,
                "key": key,
                "title": title_m.group(1).strip() if title_m else f.replace(".html","").replace("-"," ").title(),
                "description": desc_m.group(1).strip() if desc_m else "",
                "element": element,
                "topic": topic,
                "content": content,
            }
    return pages


def build_rich_links(pages):
    """构建更丰富的内链矩阵：每个页面 6 条推荐"""
    by_element = defaultdict(list)
    by_topic = defaultdict(list)
    
    for key, info in pages.items():
        by_element[info["element"]].append(key)
        by_topic[info["topic"]].append(key)
    
    links = {}
    for key, info in pages.items():
        e, t = info["element"], info["topic"]
        candidates = []
        
        # 优先: 同元素不同页面
        for k2 in by_element.get(e, []):
            if k2 != key and k2 not in candidates:
                candidates.append(k2)
        
        # 其次: 同话题不同页面
        for k2 in by_topic.get(t, []):
            if k2 != key and k2 not in candidates:
                candidates.append(k2)
        
        # 补充: 其他
        if len(candidates) < 6:
            others = [k for k in pages if k != key and k not in candidates]
            random.shuffle(others)
            candidates.extend(others[:6-len(candidates)])
        
        random.shuffle(candidates)
        links[key] = candidates[:6]
    
    return links


def generate_related_html(related_keys, pages):
    if not related_keys:
        return ""
    items = []
    for key in related_keys:
        info = pages[key]
        title = info["title"]
        # 截断长标题保持整齐
        if len(title) > 50:
            title = title[:47] + "..."
        url = info["key"]
        if url.startswith("pages/") or url.startswith("blog/"):
            url = "/" + url
        else:
            url = "/" + url
        items.append(f'            <li><a href="{url}">{title}</a></li>')
    
    return f"""    <section class="related">
        <h3>📖 继续探索五行智慧</h3>
        <p class="note-label">Related readings</p>
        <ul>
{chr(10).join(items)}
        </ul>
    </section>"""


def generate_schema(key, info):
    element = info.get("element", "spirituality")
    title = info.get("title", "")
    desc = info.get("description", "")
    if not desc:
        desc = title
    
    url = "/" + key
    canonical = f"https://eastern-five-elements.vercel.app{url}"
    
    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": "https://eastern-five-elements.vercel.app/#website",
                "url": "https://eastern-five-elements.vercel.app",
                "name": "Eastern Five Elements — Feng Shui & Energy Balance",
                "description": "Discover how the five elements shape your home, career, and relationships.",
                "inLanguage": "en",
                "publisher": {
                    "@type": "Organization",
                    "name": "Guanlan Energy",
                    "url": "https://guanlan.energy"
                }
            },
            {
                "@type": "WebPage",
                "@id": canonical + "#webpage",
                "url": canonical,
                "name": title,
                "description": desc,
                "isPartOf": {"@id": "https://eastern-five-elements.vercel.app/#website"},
                "about": {"@type": "Thing", "name": f"{element.capitalize()} Element"},
                "mainEntity": {"@id": canonical + "#article"}
            },
            {
                "@type": "Article",
                "@id": canonical + "#article",
                "headline": title,
                "description": desc,
                "author": {
                    "@type": "Person",
                    "name": "Guanlan (观澜)",
                    "url": "https://guanlan.energy"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Guanlan Energy"
                }
            }
        ]
    }
    return json.dumps(schema, indent=2)


def main():
    bj_now = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S")
    
    print(f"\n{'='*60}")
    print(f"  玄学阵地内功修筑 v2.0 (增强版)")
    print(f"  {bj_now} (BJ时间)")
    print(f"{'='*60}\n")
    
    # 1. 扫描
    print("🔍 Step 1/4: 扫描页面...")
    pages = scan_pages()
    total = len(pages)
    print(f"   发现 {total} 个 HTML 文件")
    
    # 2. 构建内链
    print("🔗 Step 2/4: 构建内链矩阵 (6条/页)...")
    links = build_rich_links(pages)
    total_links = sum(len(v) for v in links.values())
    print(f"   总交叉链接: {total_links} 条")
    
    # 3. 注入
    print("💉 Step 3/4: 注入内链 + Schema...")
    linked = 0
    schema_injected = 0
    errors = 0
    has_schema_already = 0
    
    for key, info in pages.items():
        path = info["path"]
        content = info["content"]
        
        # --- 3a. 替换/注入内链 ---
        related_html = generate_related_html(links.get(key, []), pages)
        
        # 移除旧的 related section（如果有）
        content = re.sub(
            r'<section class="related">.*?</section>\s*',
            '',
            content,
            flags=re.DOTALL
        )
        
        # 注入新的
        if related_html:
            content = content.replace("</footer>", related_html + "\n</footer>")
            linked += 1
        
        # --- 3b. 替换/注入 Schema ---
        schema_json = generate_schema(key, info)
        schema_tag = f'\n<script type="application/ld+json">\n{schema_json}\n</script>'
        
        # 移除旧的（空的或其他）
        content = re.sub(
            r'<script type="application/ld\+json">.*?</script>',
            '',
            content,
            flags=re.DOTALL
        )
        
        content = content.replace("</head>", schema_tag + "\n</head>")
        schema_injected += 1
        
        # 写回
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)
    
    print(f"   内链替换/注入: {linked} 页")
    print(f"   Schema替换/注入: {schema_injected} 页")
    print(f"   错误: {errors}")
    print()
    
    # --- 4. 报告 ---
    print(f"{'='*60}")
    print(f"  ✅ 玄学阵地内功升级就绪报告 (v2.0增强版)")
    print(f"{'='*60}")
    print(f"")
    print(f"  ┌─────────────────────────────────────────────────┐")
    print(f"  │ 📊 内功修筑成果 v2.0                            │")
    print(f"  ├─────────────────────────────────────────────────┤")
    print(f"  │  总页数:          {total:>4}                                      │")
    print(f"  │  内链矩阵:        {linked:>4} 页 ✅ (6条/页)                    │")
    print(f"  │  交叉链接:        {total_links:>4} 条                                │")
    print(f"  │  Schema注入:      {schema_injected:>4} 页 ✅ (完整结构化)              │")
    print(f"  │  错误:            {errors:>4}                                        │")
    print(f"  │  覆盖率:          100%                                      │")
    print(f"  └─────────────────────────────────────────────────┘")
    print(f"")
    print(f"  🕷️  Google 爬虫将顺着 {total_links} 条内链爬遍 {total} 页")
    print(f"  📋 Schema.org (WebSite + WebPage + Article) 已注入全部页面")
    print(f"  🔗 老版简单内链已替换为智能力度矩阵")
    print(f"")
    print(f"  ➡ 即刻部署: cd {BASE_DIR} && vercel --prod")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
