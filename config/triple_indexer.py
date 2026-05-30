#!/usr/bin/env python3
"""
🚀 黑客矩阵扩容模式 v2 - 三枪并发 Indexing 推链脚本
架构：3×200=600发/天
切片：SA-01→0:150, SA-02→150:300, SA-03→300:600
熔断：批量切换而非逐个
"""

import os, sys, json, time, threading, argparse, ssl, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = BASE_DIR / "config"
URLS_FILE = CONFIG_DIR / "all_453_urls.json"

SA_FILES = {
    1: CONFIG_DIR / "sa-01.json",
    2: CONFIG_DIR / "sa-02.json",
    3: CONFIG_DIR / "sa-03.json",
}

DAILY_QUOTA = 200


def load_urls():
    with open(URLS_FILE) as f:
        urls = json.load(f)
    print(f"📋 加载 {len(urls)} 个网址")
    return urls


def get_sa_token(sa_index):
    sa_file = SA_FILES[sa_index]
    if not sa_file.exists():
        print(f"  ❌ 未找到 SA-{sa_index:02d} 密钥: {sa_file}")
        return None
    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request
        SCOPES = ["https://www.googleapis.com/auth/indexing"]
        creds = service_account.Credentials.from_service_account_file(
            str(sa_file), scopes=SCOPES)
        creds.refresh(Request())
        return creds.token
    except Exception as e:
        print(f"  ❌ SA-{sa_index:02d} 凭证获取失败: {e}")
        return None


def submit_url(token, url, timeout=10):
    endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish"
    payload = json.dumps({"url": url.strip(), "type": "URL_UPDATED"}).encode()
    req = urllib.request.Request(
        endpoint, data=payload,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST")
    try:
        ctx = ssl.create_default_context()
        resp = urllib.request.urlopen(req, context=ctx, timeout=timeout)
        return resp.status, None
    except urllib.request.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")[:150]
    except Exception as e:
        return 0, str(e)


def process_batch(sa_index, urls_slice, results, results_lock, use_quota, live):
    """批量处理一个 SA 的 URL 切片"""
    slot = f"SA-{sa_index:02d}"
    if not urls_slice:
        return []

    token = get_sa_token(sa_index)
    if not token:
        print(f"\n  🔴 [{slot}] 无法获取凭证，跳过 {len(urls_slice)} 个")
        return urls_slice  # 全部 failover

    quota = min(use_quota, DAILY_QUOTA)
    to_process = urls_slice[:quota]
    remaining = urls_slice[quota:]
    
    print(f"\n  🔵 [{slot}] 推送 {len(to_process)} 个 (配额 {quota})")
    
    for i, url in enumerate(to_process):
        if not live:
            with results_lock:
                results.append({"url": url, "status": "DRY", "sa": slot})
            if i % 25 == 0 or i == len(to_process)-1:
                print(f"  [{slot}] 🟡 DRY [{i+1}/{len(to_process)}] {url[:80]}")
            continue
        
        code, body = submit_url(token, url)
        with results_lock:
            if code == 200:
                results.append({"url": url, "status": "OK", "sa": slot})
            elif code in (429, 403):
                results.append({"url": url, "status": "QUOTA", "sa": slot, "code": code})
                # 配额满，剩余全部 failover
                remaining += to_process[i+1:]
                print(f"  [{slot}] ⚠️ 配额满({code}) → 剩余 {len(remaining)} 个切账号")
                return remaining
            else:
                results.append({"url": url, "status": f"FAIL_{code}", "sa": slot, "body": body})
                print(f"  [{slot}] ❌ {code} {url[:60]}")
        
        if live:
            time.sleep(0.5)
    
    print(f"  [{slot}] ✅ 完成 {len(to_process)} 个")
    return remaining


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true", help="真实推送")
    parser.add_argument("--workers", type=int, default=3)
    args = parser.parse_args()
    live = args.live

    print("=" * 70)
    print("  🚀 黑客矩阵扩容 · 三枪 Indexing 调度器 v2")
    print(f"  🕒 {datetime.now().isoformat()}")
    print(f"  📡 模式: {'🔴 LIVE' if live else '🟡 DRY RUN'}")
    print(f"  💣 弹药: 3 × {DAILY_QUOTA} = {3*DAILY_QUOTA} 发/天")
    print("=" * 70)

    urls = load_urls()
    
    # 三路切片: SA-01=0:150, SA-02=150:300, SA-03=300:600
    slices = {1: urls[0:150], 2: urls[150:300], 3: urls[300:600]}
    remaining_after_first = urls[600:]
    
    print(f"\n📊 批次:")
    for sa, u in slices.items():
        print(f"  SA-{sa:02d}: {len(u)} URLs")
    if remaining_after_first:
        print(f"  剩余: {len(remaining_after_first)} (第三枪覆盖)")

    results = []
    rl = threading.Lock()

    # ====== 第一阶段：三枪齐射 ======
    print("\n🔫 第一阶段：三枪齐射")
    failover_pool = []
    with ThreadPoolExecutor(max_workers=3) as ex:
        fut_map = {ex.submit(process_batch, sa, u, results, rl, DAILY_QUOTA, live): sa
                   for sa, u in slices.items()}
        for fut in as_completed(fut_map):
            try:
                remaining = fut.result()
                if remaining:
                    failover_pool.extend(remaining)
            except Exception as e:
                print(f"  🔴 线程异常: {e}")

    # 如果有初始第 600 条之后的 URL，加入 failover
    failover_pool.extend(remaining_after_first)

    # ====== 第二阶段：熔断切换 ======
    if failover_pool:
        print(f"\n🔫 第二阶段：熔断切换（{len(failover_pool)} 个）")
        # 统计各 SA 实际使用量（含失败不退的情况）
        used = {1: 0, 2: 0, 3: 0}
        for r in results:
            sa_str = r.get("sa", "")
            for k in used:
                if sa_str == f"SA-{k:02d}":
                    used[k] += 1
        available = {k: DAILY_QUOTA - used[k] for k in [1, 2, 3] if DAILY_QUOTA - used[k] > 0}
        
        # SA-01 如果是 429 配额满，它的配额会在北京时间 15:00 重置
        # 检查是否接近 15:00（配额刷新时间）
        now_hour = datetime.now().hour
        now_min = datetime.now().minute
        near_reset = (now_hour == 14 and now_min >= 55) or (now_hour == 15 and now_min <= 5)
        
        # 如果是 429（配额满），在 15:00 附近的窗口中标记为待重置
        for r in results:
            if r.get("status") == "QUOTA" and r.get("sa") == "SA-01" and near_reset:
                # 15:00 后 SA-01 配额重置，恢复到可用池
                pass  # 下面重新计算
        
        if not available and not near_reset:
            print("  所有账号配额耗尽!")
        else:
            # 15:00 窗口期：SA-01 强制重置可用
            if near_reset:
                print(f"  ⏰ 15:00 配额刷新窗口期，强制重置 SA-01 可用")
                available[1] = DAILY_QUOTA
            
            total_avail = sum(available.values())
            print(f"  可用余量: {available} (总计 {total_avail})")
            
            remaining = failover_pool
            for sa, quota in sorted(available.items()):
                take = min(quota, len(remaining))
                if take <= 0:
                    continue
                batch = remaining[:take]
                remaining = remaining[take:]
                leftover = process_batch(sa, batch, results, rl, quota, live)
                if leftover:
                    remaining.extend(leftover)
            
            if remaining:
                print(f"  ⚠️ 仍有 {len(remaining)} 个未推送（所有账号配额耗尽）")
                for r in remaining:
                    with rl:
                        results.append({"url": r, "status": "QUOTA_EXCEEDED", "sa": "NONE"})

    # ====== 统计 ======
    dry = len([r for r in results if r.get("status") == "DRY"])
    ok = len([r for r in results if r.get("status") == "OK"])
    fail = len([r for r in results if r.get("status", "").startswith("FAIL")])
    quota_fail = len([r for r in results if r.get("status") == "QUOTA_EXCEEDED"])
    
    print("\n" + "=" * 70)
    print(f"  📊 最终结果:")
    print(f"     🟡 DRY: {dry}")
    print(f"     ✅ 成功: {ok}")
    print(f"     ❌ 失败: {fail}")
    print(f"     ⏭️  超配额: {quota_fail}")
    print(f"     📈 总计: {len(results)}")
    
    if live:
        from collections import Counter
        sa_ct = Counter(r.get("sa") for r in results if r.get("status") == "OK")
        print(f"\n  🔑 各账号:")
        for k in sorted(sa_ct):
            print(f"     {k}: {sa_ct[k]}")
    
    print(f"\n  {'🔴 LIVE' if live else '🟡 DRY RUN'} | {datetime.now().isoformat()}")
    print("=" * 70)


if __name__ == "__main__":
    main()
