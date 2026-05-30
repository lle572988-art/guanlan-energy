#!/usr/bin/env python3
"""
OG 社交标签批量注入 — 雷霆补天版
扫描全站 HTML，在 <head> 中插入 Open Graph + Twitter Card 标签
统一 og:image = /images/calligraphy.jpg
"""

import os, re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OG_IMAGE = "https://metaphysicflow.com/images/calligraphy.jpg"

DIRS = [
    ("root", BASE_DIR, lambda f: f.endswith(".html") and f != "widget-bazi-wealth.html"),
    ("pages", os.path.join(BASE_DIR, "pages"), lambda f: f.endswith(".html")),
    ("blog", os.path.join(BASE_DIR, "blog"), lambda f: f.endswith(".html")),
    ("longtail", os.path.join(BASE_DIR, "longtail"), lambda f: f.endswith(".html")),
]

def inject_og(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 跳过已有 OG 标签的页面
    if 'property="og:title"' in content or 'name="og:title"' in content:
        return False, "已有 OG"

    # 提取 H1 标题作为 og:title
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL)
    if h1_match:
        og_title = re.sub(r'<[^>]+>', '', h1_match.group(1)).strip()
        og_title = og_title[:120]  # 截断过长标题
    else:
        # fallback: 从 <title> 取
        title_match = re.search(r'<title>(.*?)</title>', content)
        og_title = title_match.group(1) if title_match else "Guanlan Energy — Five Elements Wisdom"

    # 提取元描述作为 og:description
    desc_match = re.search(r'<meta name="description" content="(.*?)"', content)
    og_desc = desc_match.group(1)[:200] if desc_match else "Ancient Zi Wei Dou Shu wisdom meets modern cosmic alignment."

    # 构建 OG 块（插在 <title> 或第一个 meta 后面）
    og_block = f"""
<!-- Open Graph / Social Meta — injected by guanlan-bot -->
<meta property="og:title" content="{og_title}"/>
<meta property="og:description" content="{og_desc}"/>
<meta property="og:image" content="{OG_IMAGE}"/>
<meta property="og:url" content="https://metaphysicflow.com/"/>
<meta property="og:type" content="website"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="{og_title}"/>
<meta name="twitter:description" content="{og_desc}"/>
<meta name="twitter:image" content="{OG_IMAGE}"/>
"""

    # 在 </head> 前插入
    if '</head>' in content:
        content = content.replace('</head>', og_block + '\n</head>')
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return True, og_title[:40]

    return False, "无 </head>"


def main():
    bj_now = __import__('datetime').datetime.now(
        __import__('datetime').timezone(__import__('datetime').timedelta(hours=8))
    ).strftime("%Y-%m-%d %H:%M:%S")

    print(f"\n{'='*60}")
    print(f"  🏷️  OG 社交标签批量注入器 — 雷霆补天版")
    print(f"  {bj_now} (BJ时间)")
    print(f"{'='*60}\n")

    injected = 0
    skipped = 0
    errors = 0

    for label, directory, filte in DIRS:
        if not os.path.isdir(directory):
            continue
        files = [f for f in os.listdir(directory) if filte(f)]
        for fname in sorted(files):
            path = os.path.join(directory, fname)
            try:
                success, msg = inject_og(path)
                if success:
                    injected += 1
                    if injected <= 5:
                        print(f"  ✅ [{label}] {fname} → {msg}...")
                else:
                    skipped += 1
            except Exception as e:
                errors += 1
                print(f"  ❌ [{label}] {fname}: {str(e)[:50]}")

    total = injected + skipped
    print(f"\n  {'='*50}")
    print(f"  📊 OG 标签注入成果")
    print(f"  {'='*50}")
    print(f"  扫描页面:    {total} 页")
    print(f"  成功注入:    {injected} 页 ✅")
    print(f"  已有跳过:    {skipped} 页")
    print(f"  错误:        {errors} 页")
    print(f"  覆盖率:      {injected/total*100:.1f}% (新增)")
    print(f"  统一 OG 图:  {OG_IMAGE}")
    print(f"  {'='*50}\n")


if __name__ == "__main__":
    main()
