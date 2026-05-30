#!/usr/bin/env python3
"""观澜·留资名册本地拉取 — 一键看数据"""
import json, sys, urllib.request, os, warnings
from pathlib import Path
warnings.filterwarnings("ignore")

API = "https://metaphysicflow.com/api/collect-lead"
CACHE = Path.home() / ".openclaw" / "output" / "leads_cache.json"

def fetch():
    # Vercel Blob private store 需要 token → 通过 api/collect-lead 函数转发（公有 endpoint）
    # 所以不需要传额外 header — 函数内部用 SDK 读 Blob
    try:
        r = urllib.request.urlopen(urllib.request.Request(API, method="GET"), timeout=10)
        d = json.loads(r.read().decode())
        return d.get("leads", [])
    except Exception as e:
        print(f"  ⚠️ 线上拉取失败: {e}")
        return []

def show(leads, limit=50, flt=None):
    if not leads:
        print("  📭 蓄水池为空")
        return
    if flt:
        leads = [l for l in leads if flt.lower() in l.get('email','').lower()]
    now = os.popen('date').read().strip()[:19]
    print(f"\n{'='*60}")
    print(f"  📋 观澜·留资名册 ({len(leads)} 条)")
    print(f"  {now}")
    print(f"{'='*60}")
    print(f"  #    EMAIL{' ':<33} 页面{' ':<22} 时间")
    print(f"  {'─'*58}")
    for i, l in enumerate(leads[:limit], 1):
        e = l.get('email','?')
        p = (l.get('page','?').split('/')[-1] or '?')[:25]
        t = (l.get('captured_at','?') or '?')[:19]
        print(f"  {i:>3}. {e:35s} | {p:25s} | {t}")
    if len(leads) > limit:
        print(f"  ... 还有 {len(leads)-limit} 条")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    limit, flt = 50, None
    for a in sys.argv[1:]:
        if a.startswith("--limit="): limit = int(a.split("=")[1])
        elif a.startswith("--email="): flt = a.split("=")[1]
        elif a in ("--help","-h"): print("用法: python3 get_leads.py [--limit=N] [--email=xxx]\n"); exit()
    ls = fetch()
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    CACHE.write_text(json.dumps(ls, indent=2, ensure_ascii=False))
    show(ls, limit, flt)
