#!/usr/bin/env python3
"""
全量站点地图生成器 — 雷霆补天版
遍历 pages/ (90) + blog/ (59) + longtail/ (44) + 根目录(8) = 200+ URL
"""

import os, datetime

BASE_URL = "https://metaphysicflow.com"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TODAY = datetime.date.today().isoformat()

# 目录扫描规则： (子路径, 文件过滤器, 默认频率, 默认优先级)
DIR_RULES = [
    ("", lambda f: f in ("index.html",), "weekly", "1.0"),
    ("", lambda f: f.endswith(".html") and f != "index.html", "monthly", "0.8"),
    ("pages/", lambda f: f.endswith(".html"), "monthly", "0.8"),
    ("blog/", lambda f: f.endswith(".html") and f != "index.html", "monthly", "0.7"),
    ("longtail/", lambda f: f.endswith(".html"), "monthly", "0.6"),
]

def generate():
    urls = []

    for subdir, filte, freq, pri in DIR_RULES:
        full_dir = os.path.join(BASE_DIR, subdir)
        if not os.path.isdir(full_dir):
            continue

        for fname in sorted(os.listdir(full_dir)):
            if not filte(fname):
                continue

            path = subdir + fname
            if path == "index.html":
                loc = BASE_URL + "/"
            elif path.endswith("/index.html"):
                loc = BASE_URL + "/" + path.replace("/index.html", "/")
            else:
                loc = f"{BASE_URL}/{path}"

            urls.append((loc, freq, pri))

    # 输出 sitemap.xml
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    for loc, freq, pri in urls:
        lines.append("  <url>")
        lines.append(f"    <loc>{loc}</loc>")
        lines.append(f"    <lastmod>{TODAY}</lastmod>")
        lines.append(f"    <changefreq>{freq}</changefreq>")
        lines.append(f"    <priority>{pri}</priority>")
        lines.append("  </url>")

    lines.append("</urlset>")

    xml = "\n".join(lines)
    out_path = os.path.join(BASE_DIR, "sitemap.xml")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(xml)

    return len(urls), out_path


if __name__ == "__main__":
    count, path = generate()
    print(f"✅ Sitemap 生成完成: {count} 条 URL → {path}")
    print(f"   相比旧版 10 条，扩容 {count - 10} 条（{'+' if count > 10 else ''}{((count-10)/10*100):.0f}%）")
