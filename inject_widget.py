#!/usr/bin/env python3
"""
流量陷阱合围器 v1.0
把 Bazi 留资挂件注入到 200 页的页脚附近
"""

import os, re

BASE_DIR = os.path.expanduser("~/.openclaw/workspace/my-website")
WIDGET_PATH = os.path.join(BASE_DIR, "widget-bazi-wealth.html")

# 读取挂件 HTML
with open(WIDGET_PATH, "r", encoding="utf-8") as f:
    WIDGET_HTML = f.read()

# 需要注入的目录
DIRS = [
    ("root", BASE_DIR, lambda f: f.endswith(".html") and f not in ("sitemap.xml", "widget-bazi-wealth.html")),
    ("pages", os.path.join(BASE_DIR, "pages"), lambda f: f.endswith(".html")),
    ("blog", os.path.join(BASE_DIR, "blog"), lambda f: f.endswith(".html")),
    ("longtail", os.path.join(BASE_DIR, "longtail"), lambda f: f.endswith(".html")),
]

def inject_into_file(path):
    """注入挂件到文件"""
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 如果已有挂件，跳过
    if 'guanlan-bazi-widget' in content:
        return False, "已有挂件"
    
    # 在 </footer> 前插入
    if '</footer>' in content:
        content = content.replace('</footer>', WIDGET_HTML + '\n</footer>')
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return True, "注入成功"
    
    return False, "无 footer 标签"


def main():
    bj_now = __import__('datetime').datetime.now(__import__('datetime').timezone(__import__('datetime').timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S")
    
    print(f"\n{'='*60}")
    print(f"  🎣 流量陷阱合围器 v1.0")
    print(f"  {bj_now} (BJ时间)")
    print(f"{'='*60}\n")
    
    injected = 0
    skipped = 0
    errors = 0
    
    for label, directory, filte in DIRS:
        if not os.path.isdir(directory):
            continue
        files = [f for f in os.listdir(directory) if filte(f)]
        
        for fname in files:
            path = os.path.join(directory, fname)
            try:
                success, msg = inject_into_file(path)
                if success:
                    injected += 1
                    print(f"  ✅ [{label}] {fname}")
                else:
                    skipped += 1
            except Exception as e:
                errors += 1
                print(f"  ❌ [{label}] {fname}: {str(e)[:50]}")
    
    total_pages = 200
    coverage = injected / total_pages * 100 if total_pages > 0 else 0
    
    print(f"\n{'='*60}")
    print(f"  🎯 全自动流量陷阱合围报告")
    print(f"{'='*60}")
    print(f"")
    print(f"  ┌─────────────────────────────────────────────────┐")
    print(f"  │ 📊 挂件注入成果                                  │")
    print(f"  ├─────────────────────────────────────────────────┤")
    print(f"  │  总页数:          {total_pages:>4}                                    │")
    print(f"  │  成功注入:        {injected:>4} 页 ✅                             │")
    print(f"  │  已有跳过:        {skipped:>4} 页                                 │")
    print(f"  │  错误:            {errors:>4}                                        │")
    print(f"  │  覆盖率:          {coverage:>5.1f}%                                    │")
    print(f"  └─────────────────────────────────────────────────┘")
    print(f"")
    print(f"  ┌─────────────────────────────────────────────────┐")
    print(f"  │ 📋 留资蓄水池                                    │")
    print(f"  ├─────────────────────────────────────────────────┤")
    print(f"  │  后端 API:       /api/collect-lead               │")
    print(f"  │  存储路径:       ~/.openclaw/output/leads_pool.csv │")
    print(f"  │  触发机制:       用户输入 Email 后实时写入        │")
    print(f"  └─────────────────────────────────────────────────┘")
    print(f"")
    print(f"  🕷️  用户转化路径: 浏览文章 → 测算互动 → 70%弹窗 → Email留资")
    print(f"  ➡ 即刻部署: vercel --prod")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
