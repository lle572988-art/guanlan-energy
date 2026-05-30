#!/usr/bin/env python3
"""
玄学长尾词内容轰炸引擎 v1.0
50篇 SEO 长尾文章 · 全自动生成 + 内链注入 + 归档

使用:
  python3 longtail_content_blitz.py           # 自动模式（需 Gemini Key）
  python3 longtail_content_blitz.py --dry-run  # 仅展示关键词，不生成
  python3 longtail_content_blitz.py --key YOUR_KEY  # 直接传 Key
"""

import os
import sys
import json
import time
import random
import hashlib
import warnings
from datetime import datetime, timezone, timedelta
from pathlib import Path

warnings.filterwarnings("ignore")
os.environ["PYTHONWARNINGS"] = "ignore"

# ============ 配置 ============
BASE_DIR = os.path.expanduser("~/.openclaw/workspace/my-website")
OUTPUT_DIR = os.path.join(BASE_DIR, "longtail_pages")
KEY_FILE = os.path.expanduser("~/.openclaw/scripts/gemini_key.json")
SCRIPT_PATH = os.path.abspath(__file__)

# 确保输出目录存在
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============ 50 个神级长尾词 ============
LONGTAIL_KEYWORDS = [
    # === 职场逆袭 (Career Breakthrough) ===
    ("Bazi chart reading for 1099 independent contractors",
     "Learn how Bazi chart reading helps 1099 independent contractors identify their wealth sectors and optimal career timing."),
    ("Zi Wei Dou Shu career prediction for freelancers 2026",
     "Discover how Zi Wei Dou Shu can predict career breakthroughs and financial shifts for freelancers in 2026."),
    ("Five elements career change timing for self-employed",
     "Use the five elements cycle to find the exact right moment for a career change as a self-employed professional."),
    ("Wood element career growth strategies for remote workers",
     "Remote workers can harness Wood element energy for career advancement — practical feng shui for your home office."),
    ("Fire element burnout recovery Bazi reading",
     "A Bazi reading reveals whether your Fire element is overactive and how to recover from burnout naturally."),
    ("Earth element financial stability through Chinese astrology",
     "Earth element personalities can build lasting financial stability by aligning with their Chinese astrology chart."),
    ("Metal element negotiation power in business Bazi",
     "How Metal element traits in your Bazi chart give you natural advantage in business negotiations."),
    ("Water element strategic career planning with Zi Wei Dou Shu",
     "Learn Water element strategic thinking for long-term career planning using Zi Wei Dou Shu palace analysis."),
    ("Best feng shui home office layout for freelance income growth",
     "Position your desk and decor to attract financial abundance — the feng shui layout proven for freelancers."),
    ("Career luck prediction: Bazi vs Zi Wei Dou Shu for entrepreneurs",
     "Compare Bazi and Zi Wei Dou Shu methods for predicting entrepreneurial career luck in the coming year."),

    # === 流年规避 (Annual Bazi / Tai Sui) ===
    ("2026 Bing Wu year feng shui adjustments for home office",
     "Essential feng shui adjustments for your home office during the 2026 Bing Wu (Fire Horse) year."),
    ("Tai Sui remedies for small business owners 2026",
     "How small business owners can apply Tai Sui remedies to protect their ventures in 2026."),
    ("Annual Bazi fortune reading for side hustle success",
     "Get your annual Bazi fortune reading to identify the best months for side hustle growth."),
    ("Five elements balance during Mercury retrograde for remote workers",
     "Practical five elements adjustments to maintain energy balance during Mercury retrograde periods."),
    ("How to clear office negative energy with Zi Wei Dou Shu in 2026",
     "Step-by-step Zi Wei Dou Shu method to identify and clear stagnant negative energy in your workspace."),
    ("Bazi conflict resolution for co-working spaces",
     "Resolve interpersonal conflicts in co-working spaces by understanding the five elements in your Bazi chart."),
    ("2026 fire horse year taboo directions for home office",
     "Which directions to avoid in your home office during 2026 Fire Horse year — and where to place your desk instead."),
    ("Protect freelance income during annual Bazi clash periods",
     "Identify when your Bazi clashes with the annual pillar — and how to shield your freelance income during those windows."),
    ("Water element saving strategies during economic uncertainty",
     "Bazi-based water element saving strategies that help you preserve capital during market volatility."),
    ("Prenatal Bazi chart vs current annual luck reading",
     "Compare your prenatal Bazi destiny with current annual luck to spot upcoming career challenges before they hit."),

    # === 催旺财运 (Wealth Activation) ===
    ("Chinese astrology wealth palace activation for digital nomads",
     "Activate your Bazi wealth palace with targeted feng shui adjustments designed for location-independent workers."),
    ("Flying star feng shui wealth corner for 2026 remote office",
     "Find your 2026 flying star wealth corner and optimize it for maximum remote office prosperity."),
    ("Five elements wealth ritual for quarterly estimated tax season",
     "A grounding five elements ritual to perform before paying quarterly estimated taxes — transforms anxiety into abundance."),
    ("Bazi financial planning for 1099 workers without retirement 401k",
     "How 1099 workers can use Bazi-based financial planning to build retirement security without employer 401k plans."),
    ("Zi Wei Dou Shu wealth prediction for gig economy professionals",
     "Predict your wealth cycles with Zi Wei Dou Shu — built specifically for gig economy professionals."),
    ("Water element passive income streams according to Chinese astrology",
     "Discover which passive income streams match your Bazi chart's Water element configuration."),
    ("Best feng shui crystals for freelance client attraction",
     "Which crystals amplify which element — a practical guide for freelancers who want to attract more clients."),
    ("Earth element wealth storage in feng shui for digital businesses",
     "Earth element rules wealth storage — digital business owners can optimize their site and server as 'wealth vaults'."),
    ("Metal element pricing strategy alignment with Bazi",
     "How Metal element Bazi traits influence pricing psychology — and how to set rates that attract ideal clients."),
    ("Fire element marketing energy Chinese astrology approach",
     "Channel Fire element energy into your marketing strategy using ancient Chinese astrology timing techniques."),

    # === 生活 & 事业融合 ===
    ("Feng shui bedroom arrangement for solo entrepreneur sleep quality",
     "Optimize your bedroom feng shui to restore sleep quality when you're a solo entrepreneur running on adrenaline."),
    ("Bazi compatibility with co-founder or business partner",
     "Read the Bazi compatibility between you and a potential co-founder before signing any partnership agreement."),
    ("Dining room feng shui for networking dinner hosting",
     "Arrange your dining room feng shui to create a powerful networking energy when hosting business dinners at home."),
    ("Kitchen feng shui wealth nourishment for home-based business",
     "The kitchen represents nourishment — how to activate it for wealth in your home-based business."),
    ("Children room feng shui when parent works from home",
     "Balance kids' room energy with your home office energy — both benefit from adjusted five elements placement."),
    ("Feng shui garden layout creativity boost for content creators",
     "Design your garden using feng shui principles to stimulate creative energy for content creators and writers."),
    ("Bazi study room setup for exam-based professional certifications",
     "Set up your study room according to your Bazi element to maximize focus during professional certification exams."),
    ("Entryway feng shui opportunity activation for solo professionals",
     "Your entryway is the 'mouth of Chi' — how solo professionals can activate it for unexpected opportunities."),
    ("Bathroom feng shui wealth drain prevention for entrepreneurs",
     "Why bathrooms are wealth drains in feng shui — and how entrepreneurs can minimize the effect."),
    ("Living room energy for client entertaining as a home-based pro",
     "Turn your living room into a client-entertaining space aligned with your Bazi chart for maximum rapport."),

    # === 进阶命理 ===
    ("Ba Zi ten gods interpretation for freelancer income forecasting",
     "Decode the Ten Gods in your Bazi chart to forecast income peaks and valleys as a freelancer."),
    ("Zi Wei Dou Shu 12 palaces analysis for location independence",
     "A full 12-palace analysis for those seeking location independence — which palaces show travel and freedom."),
    ("Combined Bazi and human design chart for career direction",
     "Cross-reference your Bazi element with your Human Design type for a career direction that truly fits."),
    ("Stem and branch forecasting for quarterly tax payment timing",
     "Use Heavenly Stem and Earthly Branch cycles to choose the best dates for major tax payments and financial moves."),
    ("Hidden trunk stars feng shui adjustment for unexpected income",
     "Activate hidden trunk stars in your home to trigger unexpected income — the advanced feng shui technique."),
    ("Yearly Moth (Liu Yue) prediction for freelancer project flow",
     "Track the Monthly Moth (Liu Yue) energy to predict when your freelance project pipeline will peak or dip."),
    ("Five elements deficiency test for home-based business owners",
     "Take a five elements deficiency test tailored for home-based business owners — then fix gaps with decor."),
    ("Nobleman star activation for career mentor attraction",
     "Activate your Nobleman Star in Bazi to naturally attract mentors and career sponsors."),
    ("Academic star in Bazi for continuous learning professionals",
     "How your Bazi Academic Star influences your appetite for certifications and upskilling."),
    ("Feng shui travel compass Lu Ban directions for business trips",
     "Use the Lu Ban feng shui compass to choose favorable travel directions for client meetings and conferences."),
]

# ============ 文章模板 ============

ARTICLE_PREAMBLE = """You are an expert Chinese metaphysics consultant writing SEO content for guanlan.energy. Write in warm, authoritative English. Use H1, H2, H3 headings. Explain Chinese terms parenthetically on first use. End with 2-3 sentence CTA linking to tools.

Write a 800-1000 word SEO article titled: """ 

CTA_EXAMPLES = [
    "Ready to discover your Bazi blueprint? Try our free [Five Elements Personality Assessment](https://savvy.metaphysicflow.com) to understand your natural strengths and timing.",
    "Want to go deeper? Book a [Bazi consultation on Guanlan.energy](https://guanlan.energy/consultation) for a personalized reading of your wealth and career sectors.",
    "Explore your elemental profile with our [free five elements guide](https://metaphysicflow.com) — understand which energy patterns drive your career decisions.",
    "For a comprehensive Bazi analysis that includes wealth palace timing, visit [Guanlan Energy](https://guanlan.energy) and discover your 2026 career roadmap.",
    "Not sure which element you are? Take our [free elements quiz](https://metaphysicflow.com) in 3 minutes and get personalized home office feng shui tips.",
]


def get_gemini_key():
    """从配置文件获取 Gemini API Key"""
    alt_path = KEY_FILE
    if os.path.exists(alt_path):
        with open(alt_path) as f:
            data = json.load(f)
        if data.get("api_key"):
            return data["api_key"]
    
    # 也从 reddit_bot_config.json 尝试
    reddit_cfg = os.path.expanduser("~/.openclaw/scripts/reddit_bot_config.json")
    if os.path.exists(reddit_cfg):
        with open(reddit_cfg) as f:
            data = json.load(f)
        if data.get("gemini", {}).get("api_key"):
            return data["gemini"]["api_key"]
    
    return None


def generate_article(keyword, description, model, max_retries=3):
    """用 Gemini 生成一篇完整的文章"""
    prompt = ARTICLE_PREAMBLE + f'"{keyword}"\n\nDescription: {description}\n\nInclude:\n- H1 with the keyword\n- H2 sections with practical advice\n- Explanations of Chinese terms (Bazi, Zi Wei Dou Shu, elements)\n- A natural CTA to guanlan.energy or metaphysicflow.com tools\n- 800-1000 words'
    
    for attempt in range(max_retries):
        try:
            resp = model.generate_content(prompt)
            text = resp.text.strip()
            if len(text) > 300:
                return text, None
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(5)
            else:
                return None, str(e)
    return None, "Max retries exceeded"


def slugify(title):
    """生成文件名友好的 slug"""
    slug = title.lower()
    slug = slug.replace("'", "").replace('"', "")
    for ch in [":", ",", ".", "?", "!", "—", "–", "(", ")"]:
        slug = slug.replace(ch, "")
    slug = slug.replace(" ", "-")
    slug = slug.replace("--", "-")
    slug = slug[:80].strip("-")
    return slug + ".html"


def build_article_html(keyword, content, slug):
    """打包为完整 HTML 页面"""
    title = keyword
    
    cta = random.choice(CTA_EXAMPLES)
    full_content = content.strip()
    
    # 确保有 CTA
    if "savvy.metaphysicflow.com" not in full_content and "guanlan.energy" not in full_content and "metaphysicflow.com" not in full_content:
        full_content += f"\n\n---\n\n{cta}"
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>{title}</title>
<meta name="description" content="Explore {title.lower()} — expert Bazi and feng shui guidance for modern professionals."/>
<link rel="canonical" href="https://metaphysicflow.com/longtail/{slug}"/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=EB+Garamond:wght@400;500&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{background:#06100c;color:#f0ebe0;font-family:'EB Garamond',serif;line-height:1.8;padding:40px 20px}}
.container{{max-width:720px;margin:0 auto}}
h1{{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:32px;letter-spacing:2px;color:#e8d4a0;margin-bottom:8px;border-bottom:1px solid rgba(201,168,76,.1);padding-bottom:16px}}
h2{{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:22px;color:#c9a84c;margin:32px 0 12px;letter-spacing:1px}}
h3{{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:18px;color:#e8d4a0;margin:24px 0 10px}}
p{{font-size:17px;color:rgba(240,235,224,.85);margin-bottom:16px;line-height:1.9}}
a{{color:#c9a84c;text-decoration:none}}
a:hover{{color:#e8d4a0}}
ul{{margin:12px 0 20px 20px}}
li{{margin-bottom:8px;font-size:16px;color:rgba(240,235,224,.75)}}
.cta-box{{margin:40px 0;padding:30px 20px;border:1px solid rgba(201,168,76,.15);text-align:center;background:rgba(240,235,224,.02)}}
.cta-box p{{font-size:15px;color:#e8d4a0;margin-bottom:12px;letter-spacing:1px;text-transform:uppercase}}
.cta-box .sub{{font-size:13px;color:rgba(240,235,224,.55);margin-bottom:18px;text-transform:none;letter-spacing:0}}
.cta-btn{{display:inline-block;padding:10px 28px;background:#c9a84c;color:#06100c;font-weight:600;font-size:13px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;transition:background .3s}}
.cta-btn:hover{{background:#e8d4a0;color:#06100c}}
.related{{margin-top:48px;padding-top:24px;border-top:1px solid rgba(201,168,76,.08)}}
.note-label{{font-size:10px;letter-spacing:3px;color:#c9a84c;margin-bottom:4px;display:block;text-transform:uppercase}}
footer{{text-align:center;padding:30px 0;font-size:12px;color:rgba(240,235,224,.35);border-top:1px solid rgba(201,168,76,.08);margin-top:60px}}
</style>
</head>
<body>
<div class="container">
{full_content}
</div>
<footer>Guanlan — Eastern Five Elements · Discover your blueprint</footer>
</body>
</html>"""
    return html


def build_links_to_existing(new_slug, existing_pages):
    """从已有的 156 页中挑 6 条内链"""
    if not existing_pages:
        return ""
    selected = random.sample(existing_pages, min(6, len(existing_pages)))
    items = []
    for fname in selected:
        # 从文件名推测标题
        name = fname.replace(".html", "").replace("-", " ").title()
        if len(name) > 50:
            name = name[:47] + "..."
        url = f"/longtail/{new_slug}"  # 新页面自己的 URL
        items.append(f'            <li><a href="/{fname if not fname.startswith("/") else fname[1:]}">{name}</a></li>')
    
    return f"""    <section class="related">
        <h3>📖 继续探索五行智慧</h3>
        <p class="note-label">Related readings</p>
        <ul>
{chr(10).join(items)}
        </ul>
    </section>"""


def main():
    dry_run = "--dry-run" in sys.argv
    inline_key = None
    
    for arg in sys.argv:
        if arg.startswith("--key="):
            inline_key = arg.split("=", 1)[1]
    
    bj_now = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S")
    total_kw = len(LONGTAIL_KEYWORDS)
    
    print(f"\n{'='*60}")
    print(f"  🌟 玄学长尾词内容轰炸引擎 v1.0")
    print(f"  {bj_now} (BJ时间)")
    print(f"  目标: {total_kw} 篇 SEO 深度长文")
    print(f"{'='*60}\n")
    
    # 获取 Key
    api_key = inline_key or get_gemini_key()
    
    if dry_run:
        print(f"🔍 [DRY RUN] 长尾词清单:")
        print()
        for i, (kw, desc) in enumerate(LONGTAIL_KEYWORDS, 1):
            slug = slugify(kw)
            print(f"  {i:>2}. [{slug[:40]}] {kw}")
            print(f"      {desc[:80]}...")
        print(f"\n  📊 合计: {total_kw} 个长尾词")
        print(f"  输出目录: {OUTPUT_DIR}")
        print(f"  预计耗时: ~{total_kw * 15 // 60} 分钟 (估算)")
        return
    
    if not api_key:
        print("❌ 未找到 Gemini API Key")
        print()
        print("请用以下方式之一提供:")
        print("  1. 填入 ~/.openclaw/scripts/gemini_key.json")
        print('     { "api_key": "YOUR_KEY" }')
        print("  2. 命令行传入:")
        print(f"     python3 {os.path.basename(SCRIPT_PATH)} --key=YOUR_KEY")
        print()
        print("或者用 --dry-run 仅预览关键词")
        sys.exit(1)
    
    # 初始化 Gemini
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    # 收集已有页面用于内链（直接从目录扫描）
    existing_html = []
    for root, dirs, files in os.walk(BASE_DIR):
        for f in files:
            if f.endswith(".html") and "longtail_pages" not in root:
                rel = os.path.relpath(os.path.join(root, f), BASE_DIR)
                existing_html.append(rel)
    
    print(f"🔗 已有页面用于内链: {len(existing_html)} 页")
    print(f"📁 输出目录: {OUTPUT_DIR}")
    print(f"🧠 Gemini 模型: gemini-2.0-flash")
    print(f"\n{'='*60}")
    print(f"  开始批量生成 50 篇长尾文章...")
    print(f"  (每篇约 15-30 秒，全程约 20 分钟)")
    print(f"{'='*60}\n")
    
    generated = 0
    errors = 0
    error_details = []
    
    for i, (kw, desc) in enumerate(LONGTAIL_KEYWORDS, 1):
        slug = slugify(kw)
        path = os.path.join(OUTPUT_DIR, slug)
        
        # 进度显示
        print(f"  [{i:>2}/{total_kw}] 生成中: {kw[:50]}...", end="", flush=True)
        
        content, err = generate_article(kw, desc, model)
        
        if content:
            html = build_article_html(kw, content, slug)
            with open(path, "w", encoding="utf-8") as f:
                f.write(html)
            generated += 1
            print(f" ✅ ({len(content)} chars)")
        else:
            errors += 1
            error_details.append((kw, err))
            print(f" ❌ {err}")
        
        # Gemini 速率限制，每篇间隔 2-3 秒
        if i < total_kw:
            delay = random.uniform(2.0, 4.0)
            time.sleep(delay)
    
    # ============ 报告 ============
    print(f"\n{'='*60}")
    print(f"  🌟 玄学长尾词轰炸库就绪简报")
    print(f"{'='*60}")
    print(f"")
    print(f"  🕐 完成时间: {datetime.now(timezone(timedelta(hours=8))).strftime('%Y-%m-%d %H:%M:%S')} (BJ)")
    print(f"")
    print(f"  ┌─────────────────────────────────────────────────┐")
    print(f"  │ 📊 长尾词轰炸成果                                │")
    print(f"  ├─────────────────────────────────────────────────┤")
    print(f"  │  目标:          {total_kw:>3} 篇                                    │")
    print(f"  │  成功生成:      {generated:>3} 篇 ✅ ({generated/total_kw*100:.0f}%)                │")
    print(f"  │  失败:          {errors:>3} 篇 {'❌' if errors > 0 else '✅'}                              │")
    print(f"  └─────────────────────────────────────────────────┘")
    print(f"")
    print(f"  ┌─────────────────────────────────────────────────┐")
    print(f"  │ 📁 输出目录                                     │")
    print(f"  ├─────────────────────────────────────────────────┤")
    print(f"  │  {OUTPUT_DIR}  │")
    print(f"  └─────────────────────────────────────────────────┘")
    print(f"")
    print(f"  ┌─────────────────────────────────────────────────┐")
    print(f"  │ 📋 下一步                                        │")
    print(f"  ├─────────────────────────────────────────────────┤")
    print(f"  │  1. 运行内链注入脚本打通 50+156 页矩阵            │")
    print(f"  │     python3 internal_linker_schema_v2.py         │")
    print(f"  │  2. 部署至 Vercel                               │")
    print(f"  │     cd {BASE_DIR} && vercel --prod       │")
    print(f"  └─────────────────────────────────────────────────┘")
    
    if errors > 0:
        print(f"\n  ⚠️  失败详情:")
        for kw, err in error_details:
            print(f"     ❌ {kw[:60]} → {str(err)[:80]}")
    
    print(f"\n{'='*60}\n")


if __name__ == "__main__":
    main()
