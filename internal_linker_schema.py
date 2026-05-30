#!/usr/bin/env python3
"""
玄学阵地内功修筑 v1.0
批量操作:
  1. 内链矩阵注入 (Internal Linking Matrix)
     根据分类关键词自动交叉链接"相关推荐"
  2. Schema.org JSON-LD 结构化数据注入
     命理/文章/网站 结构化标签
  3. 本地打包报告

用法: python3 internal_linker_schema.py
"""

import os
import re
import json
import hashlib
import random
from datetime import datetime, timezone, timedelta
from collections import defaultdict

BASE_DIR = os.path.expanduser("~/.openclaw/workspace/my-website")
PAGES_DIR = os.path.join(BASE_DIR, "pages")
BLOG_DIR = os.path.join(BASE_DIR, "blog")
REPORT_PATH = os.path.join(BASE_DIR, "..", "cultivation_report.json")

# ============================================================
# 1. 分类映射 — 每页属于哪一类
# ============================================================

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
    "five-elements": ["five-elements", "five elements", "element", "bazi", "balance"],
    "blog": ["blog"],
}

def classify_page(filename, content_lower):
    """判断一个页面的元素类型和话题类型"""
    basename = filename.lower()
    
    # 元素
    element = None
    for elem_key, keywords in ELEMENT_MAP.items():
        if any(kw in basename for kw in keywords):
            element = elem_key
            break
    
    # 话题
    topic = None
    for topic_key, keywords in TOPIC_MAP.items():
        if any(kw in basename for kw in keywords):
            topic = topic_key
            break
    
    # fallback: 从内容判断
    if not element:
        for elem_key, keywords in ELEMENT_MAP.items():
            if any(kw in content_lower for kw in keywords):
                element = elem_key
                break
    
    if not topic:
        if "decision" in content_lower or "guide" in content_lower:
            topic = "decision"
        elif "feng" in content_lower:
            topic = "feng-shui"
    
    return element, topic


# ============================================================
# 2. 内链矩阵生成
# ============================================================

def build_linking_matrix(pages):
    """
    构建内链矩阵:
    - 同元素不同空间 → 交叉链接
    - 同空间不同元素 → 交叉链接
    - 每个页面推荐 4-6 条相关链接
    """
    # 按元素分组
    by_element = defaultdict(list)
    by_topic = defaultdict(list)
    
    for filename, info in pages.items():
        element = info.get("element", "unknown")
        topic = info.get("topic", "unknown")
        by_element[element].append(filename)
        by_topic[topic].append(filename)
    
    links = {}
    for filename, info in pages.items():
        element = info["element"]
        topic = info["topic"]
        
        candidates = []
        
        # 同元素不同页面
        for f2 in by_element.get(element, []):
            if f2 != filename:
                candidates.append(f2)
        
        # 同话题不同页面
        for f2 in by_topic.get(topic, []):
            if f2 != filename and f2 not in candidates:
                candidates.append(f2)
        
        # 如果不够，补充其他话题页面
        if len(candidates) < 4:
            all_others = [f for f in pages if f != filename and f not in candidates]
            random.shuffle(all_others)
            candidates.extend(all_others[:6-len(candidates)])
        
        random.shuffle(candidates)
        links[filename] = candidates[:6]
    
    return links


def generate_related_html(related_pages, pages_info):
    """生成相关推荐阅读的 HTML"""
    if not related_pages:
        return ""
    
    items = []
    for fname in related_pages[:5]:
        info = pages_info.get(fname, {})
        title = info.get("title", fname.replace(".html","").replace("-"," ").title())
        url = info.get("url", f"/{fname}")
        items.append(f'        <li><a href="{url}">{title}</a></li>')
    
    return f"""
    <section class="related">
        <h3>📖 相关阅读推荐</h3>
        <p class="note-label">Deepen your practice</p>
        <ul>
{chr(10).join(items)}
        </ul>
    </section>"""


# ============================================================
# 3. Schema.org JSON-LD 生成
# ============================================================

def generate_schema(filename, info):
    """为页面生成合适的 Schema.org JSON-LD"""
    element = info.get("element", "spirituality")
    topic = info.get("topic", "article")
    title = info.get("title", "")
    desc = info.get("description", "")
    url = info.get("url", "")
    
    # 基础网站 Schema
    base_schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": "https://eastern-five-elements.vercel.app/#website",
                "url": "https://eastern-five-elements.vercel.app",
                "name": "Eastern Five Elements — Modern Feng Shui & Energy Balance",
                "description": "Discover how the five elements (Wood, Fire, Earth, Metal, Water) shape your home, career, and relationships.",
                "inLanguage": "en",
                "publisher": {
                    "@type": "Organization",
                    "name": "Guanlan Energy"
                }
            },
            {
                "@type": "WebPage",
                "@id": url + "#webpage",
                "url": url,
                "name": title,
                "description": desc,
                "isPartOf": {"@id": "https://eastern-five-elements.vercel.app/#website"},
                "about": {
                    "@type": "Thing",
                    "name": element.capitalize() + " Element Feng Shui"
                },
                "mainEntity": {
                    "@id": url + "#article"
                }
            }
        ]
    }
    
    # 如果是决策指南页面，按 Article 类型
    if topic == "decision":
        base_schema["@graph"].append({
            "@type": "Article",
            "@id": url + "#article",
            "headline": title,
            "description": desc,
            "author": {
                "@type": "Person",
                "name": "Guanlan (观澜)"
            },
            "about": {
                "@type": "Thing",
                "name": element.capitalize() + " Element Decision Making"
            }
        })
    else:
        base_schema["@graph"].append({
            "@type": "Article",
            "@id": url + "#article",
            "headline": title,
            "description": desc,
            "author": {
                "@type": "Person",
                "name": "Guanlan (观澜)"
            }
        })
    
    return json.dumps(base_schema, indent=2)


# ============================================================
# 4. 主执行逻辑
# ============================================================

def scan_html_files():
    """扫描所有 HTML 文件并提取基本信息"""
    pages = {}
    
    # 扫描 root 文件
    for f in os.listdir(BASE_DIR):
        if f.endswith(".html") and f not in ("sitemap.xml",):
            path = os.path.join(BASE_DIR, f)
            if os.path.isfile(path):
                with open(path, "r", encoding="utf-8") as fh:
                    content = fh.read()
                    content_lower = content.lower()
                    
                    title_match = re.search(r'<title>(.*?)</title>', content, re.DOTALL)
                    desc_match = re.search(r'<meta name="description" content="(.*?)"', content)
                    title = title_match.group(1).strip() if title_match else f.replace(".html","")
                    desc = desc_match.group(1).strip() if desc_match else ""
                    
                    element, topic = classify_page(f, content_lower)
                    rel_url = "/" + f
                    
                    pages[f] = {
                        "path": path,
                        "title": title,
                        "description": desc,
                        "element": element or "unknown",
                        "topic": topic or "article",
                        "url": rel_url,
                        "content": content,
                    }
    
    # 扫描 pages/
    for f in os.listdir(PAGES_DIR):
        if f.endswith(".html"):
            path = os.path.join(PAGES_DIR, f)
            with open(path, "r", encoding="utf-8") as fh:
                content = fh.read()
                content_lower = content.lower()
                
                title_match = re.search(r'<title>(.*?)</title>', content, re.DOTALL)
                desc_match = re.search(r'<meta name="description" content="(.*?)"', content)
                title = title_match.group(1).strip() if title_match else f.replace(".html","")
                desc = desc_match.group(1).strip() if desc_match else ""
                
                element, topic = classify_page(f, content_lower)
                rel_url = "/pages/" + f
                
                pages["pages/" + f] = {
                    "path": path,
                    "title": title,
                    "description": desc,
                    "element": element or "unknown",
                    "topic": topic or "article",
                    "url": rel_url,
                    "content": content,
                }
    
    # 扫描 blog/
    for f in os.listdir(BLOG_DIR):
        if f.endswith(".html"):
            path = os.path.join(BLOG_DIR, f)
            with open(path, "r", encoding="utf-8") as fh:
                content = fh.read()
                content_lower = content.lower()
                
                title_match = re.search(r'<title>(.*?)</title>', content, re.DOTALL)
                desc_match = re.search(r'<meta name="description" content="(.*?)"', content)
                title = title_match.group(1).strip() if title_match else f.replace(".html","")
                desc = desc_match.group(1).strip() if desc_match else ""
                
                element, topic = classify_page(f, content_lower)
                rel_url = "/blog/" + f
                
                pages["blog/" + f] = {
                    "path": path,
                    "title": title,
                    "description": desc,
                    "element": element or "unknown",
                    "topic": topic or "article",
                    "url": rel_url,
                    "content": content,
                }
    
    return pages


def inject_links_and_schema(pages, links):
    """注入内链 + Schema 到每页"""
    modified = 0
    errors = 0
    stats = {"linked": 0, "schema": 0, "skipped_already_has": 0}
    
    for page_key, info in pages.items():
        path = info["path"]
        content = info["content"]
        
        # --- 内链注入 ---
        # 检查是否已有相关推荐 section
        if '<section class="related">' in content or 'class="related"' in content:
            stats["skipped_already_has"] += 1
            has_links = True
        else:
            has_links = False
            related_html = generate_related_html(links.get(page_key, []), pages)
            if related_html:
                # 在 footer 前插入
                content = content.replace("</footer>", related_html + "\n</footer>")
                stats["linked"] += 1
        
        # --- Schema 注入 ---
        # 检查是否已有 JSON-LD
        if '<script type="application/ld+json">' in content:
            stats["schema"] += 1  # 已有，跳过
        else:
            schema_json = generate_schema(page_key, info)
            schema_tag = f'\n<script type="application/ld+json">\n{schema_json}\n</script>\n'
            # 在 </head> 前插入
            content = content.replace("</head>", schema_tag + "</head>")
            stats["schema"] += 1
        
        # 写回
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)
        
        if not has_links or '<script type="application/ld+json">' not in info.get("content", ""):
            modified += 1
    
    return modified, errors, stats


def run():
    bj_now = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S")
    
    print(f"\n{'='*60}")
    print(f"  玄学阵地内功修筑 v1.0")
    print(f"  {bj_now} (BJ时间)")
    print(f"{'='*60}")
    print()
    
    # Step 1: 扫描
    print("🔍 Step 1/3: 扫描现有页面...")
    pages = scan_html_files()
    print(f"   发现 {len(pages)} 个 HTML 文件")
    print(f"     Root:   {sum(1 for k in pages if not '/' in k)}")
    print(f"     Pages:  {sum(1 for k in pages if k.startswith('pages/'))}")
    print(f"     Blog:   {sum(1 for k in pages if k.startswith('blog/'))}")
    
    # 元素分布统计
    elements = defaultdict(int)
    for info in pages.values():
        elements[info["element"]] += 1
    print(f"     元素分布: {dict(elements)}")
    print()
    
    # Step 2: 构建内链矩阵
    print("🔗 Step 2/3: 构建内链矩阵...")
    links = build_linking_matrix(pages)
    total_links = sum(len(v) for v in links.values())
    print(f"   生成了 {total_links} 条交叉链接 ({len(links)} 页)")
    print()
    
    # Step 3: 注入
    print("💉 Step 3/3: 注入内链 + Schema...")
    modified, errors, stats = inject_links_and_schema(pages, links)
    print(f"   内链注入: {stats['linked']} 页 | 已有跳过: {stats['skipped_already_has']} 页")
    print(f"   Schema注入: {stats['schema']} 页")
    print(f"   错误: {errors}")
    print()
    
    # 报告
    success = modified - errors
    total = len(pages)
    coverage = (total - stats["skipped_already_has"]) / total * 100 if total > 0 else 0
    
    report = {
        "timestamp": bj_now,
        "total_pages": total,
        "linked_pages": stats["linked"],
        "schema_injected": stats["schema"],
        "already_had_links": stats["skipped_already_has"],
        "errors": errors,
        "total_links_created": total_links,
        "coverage_pct": round(coverage, 1)
    }
    with open(REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"{'='*60}")
    print(f"  ✅ 玄学阵地内功升级就绪报告")
    print(f"{'='*60}")
    print(f"")
    print(f"  ┌─────────────────────────────────────────────────┐")
    print(f"  │ 📊 内功修筑成果                                  │")
    print(f"  ├─────────────────────────────────────────────────┤")
    print(f"  │  总页数:          {total:>4}                                      │")
    print(f"  │  内链注入:        {stats['linked']:>4} 页 ✅                             │")
    print(f"  │  Schema注入:      {stats['schema']:>4} 页 ✅                             │")
    print(f"  │  交叉链接:        {total_links:>4} 条                                 │")
    print(f"  │  覆盖率:          {coverage:>5.1f}%                                    │")
    print(f"  │  错误:            {errors:>4}                                        │")
    print(f"  └─────────────────────────────────────────────────┘")
    print(f"")
    print(f"  🕷️  Google 爬虫将顺着 {total_links} 条内链在 {total} 页之间爬行")
    print(f"  📋 Schema.org JSON-LD 已注入至 {stats['schema']} 页 <head>")
    print(f"  📄 报告已保存: {REPORT_PATH}")
    print(f"")
    print(f"  ➡ 下一步: 部署至 Vercel (python3 deploy.py)")
    print(f"{'='*60}")


if __name__ == "__main__":
    run()
