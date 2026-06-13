#!/usr/bin/env python3
"""
MetaphysicFlow.com — Social Monitor & Reply Draft Engine (Phase 3, static HTML stack)

Scans Reddit for ZWDS threads, drafts replies via DeepSeek (AI_API_KEY).
Quora targets are manual — Quora blocks scrapers.

Usage:
  python3 social_monitor.py --mode scan
  python3 social_monitor.py --mode draft
  python3 social_monitor.py --mode full
  python3 social_monitor.py --mode quora-only
"""

from __future__ import annotations

import argparse
import json
import os
import time
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

try:
    import requests

    REQUESTS_OK = True
except ImportError:
    REQUESTS_OK = False

SITE_URL = "https://metaphysicflow.com"
BRAND = "MetaphysicFlow"
DEEPSEEK_API = "https://api.deepseek.com/chat/completions"
MODEL = os.environ.get("AI_KARMA_MODEL", "deepseek-chat")
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "output" / "social-monitor"

REDDIT_TARGETS = {
    "subreddits": [
        "ChineseAstrology",
        "astrology",
        "spirituality",
        "taoism",
    ],
    "search_terms": [
        "zi wei dou shu",
        "purple star astrology",
        "ZWDS",
        "Chinese astrology chart",
        "bazi chart",
    ],
}

QUORA_TARGETS = [
    "What is Zi Wei Dou Shu and is it accurate?",
    "How does Zi Wei Dou Shu compare to BaZi?",
    "Can Purple Star Astrology predict career success?",
    "What does the Emperor Star mean in a ZWDS chart?",
    "How do I read my Zi Wei Dou Shu chart for beginners?",
    "What is the Wealth Palace in Zi Wei Dou Shu?",
    "How accurate is a ZWDS reading?",
    "What is the difference between BaZi and Zi Wei Dou Shu?",
]

SYSTEM_PROMPT = """You are a knowledgeable Zi Wei Dou Shu practitioner answering online.
You may reference MetaphysicFlow.com sparingly when it helps. Lead with value, not links.
Sound like a real expert — no "Great question!" openers. Reddit: casual. Quora: warm but structured."""


def score_thread(thread: dict) -> float:
    score = 0.0
    upvotes = thread.get("upvotes", 0)
    if upvotes > 100:
        score += 30
    elif upvotes > 50:
        score += 20
    elif upvotes > 10:
        score += 10

    age_hours = thread.get("age_hours", 999)
    if 2 <= age_hours <= 24:
        score += 25
    elif 25 <= age_hours <= 72:
        score += 15
    elif age_hours < 2:
        score += 10
    else:
        score += 5

    replies = thread.get("reply_count", 0)
    if replies == 0:
        score += 25
    elif replies <= 2:
        score += 20
    elif replies <= 5:
        score += 10
    else:
        score += 5

    text = (thread.get("title", "") + " " + thread.get("body", "")).lower()
    if any(t in text for t in ["zi wei", "zwds", "purple star", "dou shu"]):
        score += 15
    elif "chinese astrology" in text:
        score += 8

    if "?" in thread.get("title", ""):
        score += 5

    return min(score, 100)


def search_reddit_pullpush(query: str, subreddit: str | None = None, limit: int = 10) -> list[dict]:
    """Fallback when reddit.com JSON returns 403 — uses pullpush.io archive."""
    if not REQUESTS_OK:
        return []
    params = {
        "q": f'"{query}"' if " " in query else query,
        "size": limit,
        "sort": "desc",
        "sort_type": "created_utc",
    }
    if subreddit:
        params["subreddit"] = subreddit.replace("r/", "")
    url = "https://api.pullpush.io/reddit/search/submission/?" + urllib.parse.urlencode(params)
    try:
        resp = requests.get(url, timeout=20, headers={"User-Agent": "MetaphysicFlowSEOBot/1.0"})
        resp.raise_for_status()
        data = resp.json()
        threads = []
        for p in data.get("data", []):
            created_raw = p.get("created_utc", 0)
            try:
                created = float(created_raw or 0)
            except (TypeError, ValueError):
                created = 0
            age_hours = (time.time() - created) / 3600 if created else 999
            permalink = p.get("permalink") or ""
            if permalink and not permalink.startswith("http"):
                permalink = f"https://reddit.com{permalink}"
            threads.append(
                {
                    "platform": "reddit",
                    "subreddit": f"r/{p.get('subreddit', subreddit or 'unknown')}",
                    "title": p.get("title", ""),
                    "body": (p.get("selftext") or "")[:500],
                    "url": permalink or p.get("url", ""),
                    "upvotes": p.get("score", p.get("ups", 0)),
                    "reply_count": p.get("num_comments", 0),
                    "age_hours": round(age_hours, 1),
                    "post_id": p.get("id", ""),
                    "source": "pullpush",
                }
            )
        return threads
    except Exception as e:
        print(f"   ⚠️  PullPush search failed ('{query}'): {e}")
        return []


def search_reddit_json(subreddit: str, query: str, limit: int = 10) -> list[dict]:
    encoded_query = urllib.parse.quote(query)
    sub = subreddit.replace("r/", "")
    url = (
        f"https://www.reddit.com/r/{sub}/search.json"
        f"?q={encoded_query}&sort=new&limit={limit}&restrict_sr=1"
    )
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json",
    }
    try:
        if REQUESTS_OK:
            resp = requests.get(url, headers=headers, timeout=12)
            if resp.status_code == 403:
                raise PermissionError("403 Blocked")
            resp.raise_for_status()
            data = resp.json()
        else:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = json.loads(resp.read().decode("utf-8"))

        threads = []
        for post in data.get("data", {}).get("children", []):
            p = post.get("data", {})
            created = p.get("created_utc", 0)
            age_hours = (time.time() - created) / 3600
            threads.append(
                {
                    "platform": "reddit",
                    "subreddit": f"r/{sub}",
                    "title": p.get("title", ""),
                    "body": p.get("selftext", "")[:500],
                    "url": f"https://reddit.com{p.get('permalink', '')}",
                    "upvotes": p.get("ups", 0),
                    "reply_count": p.get("num_comments", 0),
                    "age_hours": round(age_hours, 1),
                    "post_id": p.get("id", ""),
                    "source": "reddit",
                }
            )
        return threads
    except Exception as e:
        print(f"   ⚠️  Reddit direct failed (r/{sub}, '{query}'): {e} → PullPush")
        return search_reddit_pullpush(query, subreddit=sub, limit=limit)


def scan_reddit() -> list[dict]:
    all_threads = []
    seen_ids = set()

    # Global PullPush queries (works when reddit.com blocks datacenter IPs)
    global_queries = [
        "zi wei dou shu",
        "purple star astrology",
        "ZWDS chart",
        "bazi vs zi wei",
    ]
    print("   PullPush global search…")
    for term in global_queries:
        for t in search_reddit_pullpush(term, subreddit=None, limit=8):
            if t["post_id"] and t["post_id"] not in seen_ids:
                t["score"] = score_thread(t)
                all_threads.append(t)
                seen_ids.add(t["post_id"])
        time.sleep(0.8)

    for sub in REDDIT_TARGETS["subreddits"][:3]:
        for term in REDDIT_TARGETS["search_terms"][:2]:
            print(f"   Scanning r/{sub}: '{term}'...")
            for t in search_reddit_json(sub, term, limit=5):
                if t["post_id"] not in seen_ids:
                    t["score"] = score_thread(t)
                    all_threads.append(t)
                    seen_ids.add(t["post_id"])
            time.sleep(1.0)
    all_threads.sort(key=lambda x: -x["score"])
    return all_threads


def get_quora_targets() -> list[dict]:
    return [
        {
            "platform": "quora",
            "title": q,
            "url": f"https://www.quora.com/search?q={urllib.parse.quote(q)}",
            "body": "",
            "score": 75,
            "reply_count": 0,
            "age_hours": 0,
        }
        for q in QUORA_TARGETS
    ]


def call_deepseek(user_prompt: str, max_tokens: int = 600) -> str:
    if not REQUESTS_OK:
        return "[Install requests: pip install requests]"
    api_key = os.environ.get("AI_API_KEY") or os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return "[Set AI_API_KEY for DeepSeek drafts]"

    try:
        resp = requests.post(
            DEEPSEEK_API,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            json={
                "model": MODEL,
                "max_tokens": max_tokens,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
            },
            timeout=45,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"[Draft failed: {e}]"


def draft_reddit_reply(thread: dict) -> str:
    include_link = thread.get("score", 0) > 60
    prompt = f"""Draft a Reddit reply for r/{thread.get('subreddit', 'ChineseAstrology')}:

TITLE: {thread['title']}
BODY: {thread.get('body', '(no body)')}
REPLIES: {thread.get('reply_count', 0)}

{'Include one natural metaphysicflow.com link if helpful.' if include_link else 'No links — pure value only.'}
250-400 words unless many replies exist (then 100-200).
Write ONLY the reply text."""

    return call_deepseek(prompt)


def draft_quora_answer(question: str) -> str:
    prompt = f"""Write a Quora answer:

"{question}"

350-500 words. Expert tone. One natural CTA at end (metaphysicflow.com ok).
Write ONLY the answer."""
    return call_deepseek(prompt, max_tokens=800)


def generate_daily_report(reddit_threads: list, quora_questions: list) -> str:
    today = datetime.now().strftime("%Y-%m-%d")
    top_reddit = [t for t in reddit_threads if t["score"] >= 60][:5]
    top_quora = quora_questions[:5]

    lines = [
        f"# MetaphysicFlow Social Monitor — {today}",
        "",
        "## Summary",
        f"- Reddit threads: {len(reddit_threads)}",
        f"- High-priority Reddit (≥60): {len(top_reddit)}",
        f"- Quora targets: {len(quora_questions)}",
        "",
        "---",
        "",
        "## Top Priority: Reddit",
        "",
    ]

    for i, t in enumerate(top_reddit, 1):
        lines += [
            f"### {i}. [{t['title'][:80]}]({t['url']})",
            f"Score {t['score']}/100 | ↑{t.get('upvotes', '?')} | {t.get('reply_count', '?')} replies",
            "",
            "**Draft:**",
            "",
            t.get("draft", "[Run --mode draft]"),
            "",
            "---",
            "",
        ]

    if not top_reddit:
        lines.append("_No high-priority Reddit threads today._")
        lines.append("")

    lines += ["## Quora (manual browse)", ""]
    for i, q in enumerate(top_quora, 1):
        lines += [
            f"### {i}. {q['title']}",
            f"Search: {q['url']}",
            "",
            q.get("draft", "[Run --mode draft]"),
            "",
            "---",
            "",
        ]

    lines.append(f"*Generated {datetime.now().isoformat()}*")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="MetaphysicFlow Social Monitor")
    parser.add_argument("--mode", choices=["scan", "draft", "full", "quora-only"], default="full")
    parser.add_argument("--limit", type=int, default=5)
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    today = datetime.now().strftime("%Y-%m-%d")

    reddit_threads = []
    quora_questions = []

    if args.mode in ("scan", "full"):
        print("🔍 Scanning Reddit...")
        reddit_threads = scan_reddit()
        scan_file = OUTPUT_DIR / f"scan-{today}.json"
        scan_file.write_text(json.dumps(reddit_threads, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"   Found {len(reddit_threads)} threads → {scan_file}")

    if args.mode in ("quora-only", "full"):
        quora_questions = get_quora_targets()

    if args.mode in ("draft", "full"):
        print("\n✍️  Drafting replies (DeepSeek)...")
        top_threads = [t for t in reddit_threads if t["score"] >= 50][: args.limit]
        for i, thread in enumerate(top_threads):
            print(f"   [{i + 1}/{len(top_threads)}] {thread['title'][:50]}...")
            thread["draft"] = draft_reddit_reply(thread)
            time.sleep(1.0)

        for i, q in enumerate(quora_questions[: min(3, args.limit)]):
            print(f"   Quora [{i + 1}]: {q['title'][:50]}...")
            q["draft"] = draft_quora_answer(q["title"])
            time.sleep(1.0)

    report = generate_daily_report(reddit_threads, quora_questions)
    report_file = OUTPUT_DIR / f"daily-report-{today}.md"
    report_file.write_text(report, encoding="utf-8")
    print(f"\n✅ Report: {report_file}")


if __name__ == "__main__":
    main()
