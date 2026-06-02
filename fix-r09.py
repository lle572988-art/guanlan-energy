#!/usr/bin/env python3
"""R09: Apply unique meta descriptions to all 44 longtail pages."""
import os, re

ROOT = "/Users/yihua/.openclaw/workspace"
LONGTAIL = os.path.join(ROOT, "longtail_pages")

# The descriptions from the subagent
DESCRIPTIONS = {
    "academic-star-bazi-continuous-learning.html": "Is the Academic Star active in your 2026 chart? Discover how Bazi reveals your best months for upskilling and exam success as a lifelong learner. Start your reading now.",
    "annual-bazi-fortune-side-hustle.html": "Your annual Bazi fortune holds clues for side-hustle success. Pinpoint which months bring extra income and which need caution. Get your personalized 2026 reading today.",
    "ba-zi-ten-gods-freelancer-income-forecasting.html": "Map your 10 Gods to predict freelance income peaks and valleys. Stop guessing when to hustle hard or pull back. Get your Ba Zi income forecast now.",
    "bathroom-feng-shui-wealth-drain-prevention.html": "Does your bathroom location drain your hard-earned cash? Learn feng shui cures to stop wealth leakage at home. Apply these fixes this weekend.",
    "bazi-chart-reading-1099-independent-contractors.html": "Your 1099 income deserves a chart-matched strategy. See exactly which Bazi pillars boost or block your freelance earnings. Book your reading today.",
    "bazi-compatibility-co-founder-business-partner.html": "Thinking of going into business together? Use Bazi compatibility to spot hidden tensions before you sign. Protect your partnership with this ancient tool.",
    "bazi-conflict-resolution-co-working-spaces.html": "Co-working clashes draining your productivity? Bazi conflict mapping reveals why some desk neighbors drain you. Find your ideal workspace energy now.",
    "bazi-financial-planning-1099-no-401k.html": "No 401k and no safety net? Your Bazi chart shows natural wealth-saving patterns you never knew. Build your freelance financial plan today.",
    "bazi-study-room-professional-certifications.html": "The right study room setup can amplify your certification exam success. Apply Bazi-aligned desk direction for focused study sessions. Set up yours now.",
    "children-room-feng-shui-when-parent-works-from-home.html": "Working from home with kids? Balance their room energy so your workspace stays productive. Feng shui that benefits everyone in the house. Learn how.",
    "clear-office-negative-energy-zi-wei-dou-shu.html": "Is stagnant Zi Wei energy blocking your home-office flow? Clear negative Qi with palace-specific remedies for sharper focus. Start your energy reset here.",
    "combined-bazi-human-design-career.html": "Bazi meets Human Design for the ultimate career roadmap. Combine both systems to find work that actually fits your nature. Discover your true path now.",
    "dining-room-feng-shui-networking-dinners.html": "Host networking dinners that actually convert. Arrange your dining table using feng shui to attract ideal clients and collaborations. Transform your next dinner.",
    "earth-element-wealth-storage-digital-businesses.html": "Digital businesses need Earth element stability to retain wealth. Learn where to activate storage energy in your virtual workspace. Build lasting income now.",
    "entryway-feng-shui-opportunity-activation.html": "Is your front door inviting new opportunities or blocking them? Activate your entryway with feng shui to attract ideal projects. Transform your entrance today.",
    "feng-shui-bedroom-solo-entrepreneur-sleep.html": "Sleep quality is your startup's secret weapon. Apply these solo-entrepreneur bedroom feng shui tweaks for deeper rest and sharper decisions. Upgrade your sleep now.",
    "feng-shui-crystals-freelance-client-attraction.html": "Attract high-paying clients with the right feng shui crystals for your desk and entryway. Which stones boost your specific industry? Find out here.",
    "feng-shui-garden-creativity-content-creators.html": "Stuck on your next big idea? Your garden's Five Element layout sparks creative flow for content pros. Step outside and start growing inspiration today.",
    "fire-element-marketing-energy-chinese-astrology.html": "Fire element drives bold marketing moves. Learn when your chart's fire peaks for launches, pitches, and viral content creation. Time your next campaign.",
    "fire-horse-2026-feng-shui-adjustments.html": "2026's Fire Horse year brings explosive energy but also burnout risk. Must-know feng shui adjustments for your home office. Prepare your space now.",
    "fire-horse-year-taboo-directions-home-office.html": "Sitting in a Fire Horse taboo direction could sabotage your 2026 productivity. Check which desk orientations to avoid this year. Find your safe direction.",
    "five-elements-career-change-timing-self-employed.html": "Thinking of pivoting your freelance career? The Five Elements reveal your ideal timing for a smooth transition. Don't leap without checking your chart first.",
    "five-elements-deficiency-test-home-business.html": "Which element is missing from your home business? Take the Five Elements deficiency quiz to fix cash flow, client attraction, and energy. Test yourself now.",
    "five-elements-wealth-ritual-quarterly-taxes.html": "Transform quarterly tax dread into a wealth-activation ritual. Align the Five Elements to keep more of what you earn. Do this before your next payment.",
    "flying-star-feng-shui-wealth-corner-2026.html": "2026's flying stars shift your wealth corner location. Is your home office sitting in an auspicious or harmful sector? Get the updated map now.",
    "hidden-trunk-stars-unexpected-income.html": "Unexpected tax refund? Freelance bonus? Hidden Trunk Stars reveal surprise income timing in your Bazi chart. Find out when luck strikes for you.",
    "kitchen-feng-shui-wealth-nourishment-home-business.html": "Your kitchen is the wealth center of your home business. Nourish your income with these feng shui adjustments for stove and pantry. Upgrade today.",
    "living-room-energy-client-entertaining.html": "First impressions start in your living room. Arrange furniture to build trust with home-visit clients using feng shui principles. Host with confidence now.",
    "lu-ban-feng-shui-compass-business-trips.html": "Maximize every business trip with Lu Ban compass direction planning. Choose auspicious hotel rooms and meeting spots for better deals. Plan your next trip.",
    "mercury-retrograde-five-elements-balance.html": "Mercury retrograde chaos is real for remote workers. Balance the Five Elements to stay focused when communication breaks down. Prep your space today.",
    "metal-element-pricing-strategy-bazi.html": "Metal element rules precision and value. Align your freelance pricing strategy with your Bazi chart's metal strength. Stop undervaluing your work.",
    "nobleman-star-activation-career-mentor.html": "Need the right mentor to open doors? Activate your Nobleman Star and attract career-changing guidance into your life. Try this activation ritual now.",
    "prenatal-bazi-vs-annual-luck-reading.html": "What you were born with vs what 2026 brings — two different stories. Compare your prenatal chart against this year's luck pillars for clarity. Read both.",
    "protect-freelance-income-bazi-clash.html": "When Bazi clashes threaten your cash flow, act fast. Learn which clash types hit freelancers hardest and how to shield your income. Protect yourself today.",
    "stem-branch-forecasting-tax-payment-timing.html": "Timing your quarterly tax payments with Stem and Branch cycles reduces financial pressure. Schedule payments when your chart says yes. Forecast your year now.",
    "tai-sui-remedies-small-business-owners-2026.html": "2026's Tai Sui deity sits in the South — is your business affected? Small-business owners need these specific remedies to avoid obstacles. Check your sector.",
    "water-element-passive-income-chinese-astrology.html": "Water element governs residual income in Chinese astrology. Discover which chart placements predict the strongest passive income streams. Tap into yours now.",
    "water-element-saving-strategies-economic-uncertainty.html": "When the economy shakes, Water element saving instincts kick in. Use your chart's water strength to build a recession-proof cash reserve. Start saving smarter.",
    "wealth-palace-activation-digital-nomads.html": "Digital nomads need portable wealth energy. Activate your Wealth Palace for income that flows wherever you go. Set your remote business up for abundance.",
    "wood-element-career-growth-strategies-remote-workers.html": "Wood element remote workers grow through expansion — not hustle. Learn career strategies aligned with your natural growth rhythm. Start your upward climb now.",
    "yearly-moth-prediction-freelancer-project-flow.html": "Project flow predictions for freelancers using yearly Moth (monthly) analysis. Know exactly which months to launch, rest, or pivot. Plan your year with precision.",
    "zi-wei-dou-shu-12-palaces-location-independence.html": "Your 12 Palaces reveal the ideal locations for remote work success. Zi Wei Dou Shu maps prosperity zones worldwide. Find your power location now.",
    "zi-wei-dou-shu-career-prediction-freelancers-2026.html": "2026 Zi Wei Dou Shu career forecast for freelancers. See exactly which palaces influence your income, reputation, and project flow. Get your cosmic career map.",
    "zi-wei-dou-shu-wealth-prediction-gig-economy.html": "The gig economy demands fast wealth timing. Zi Wei Dou Shu predicts your income peaks and dry spells by month. Stay ahead of the curve with this reading.",
}

count = 0
for filename, description in DESCRIPTIONS.items():
    fpath = os.path.join(LONGTAIL, filename)
    if not os.path.exists(fpath):
        print(f"  ⚠️ {filename}: file not found")
        continue
    
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    
    # Replace the meta description (first occurrence)
    old = f'<meta name="description" content="'
    # Find the current description
    start = content.find(old)
    if start == -1:
        print(f"  ⚠️ {filename}: no meta description tag")
        continue
    
    end = content.find('"', start + len(old))
    rest = content[end+1:]
    
    # Check if it's closed by />
    if rest.startswith('/>') or rest.startswith('"'):
        close_pos = end
        if rest.startswith('"'):
            close_pos = end + 1
        # It's already "/>" closing
        pass
    
    # Build new description tag
    new_tag = f'{old}{description}"/>'
    
    # Find end of current tag  
    end_of_tag = content.find('/>', start)
    if end_of_tag == -1:
        end_of_tag = content.find('>', content.find('"', start + len(old)))
    
    # Replace
    old_tag = content[start:end_of_tag+2]
    content = content.replace(old_tag, new_tag, 1)
    
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
    
    count += 1

print(f"✅ R09: Updated {count}/44 longtail page descriptions")

# Verify
print()
print("=== Verification (sample) ===")
for f in ["bazi-chart-reading-1099-independent-contractors.html",
          "fire-horse-2026-feng-shui-adjustments.html",
          "metal-element-pricing-strategy-bazi.html",
          "water-element-passive-income-chinese-astrology.html"]:
    fpath = os.path.join(LONGTAIL, f)
    with open(fpath, "r") as fh:
        c = fh.read()
    t = re.search(r'<title>([^<]+)', c)
    d = re.search(r'name="description"\s+content="([^"]+)', c)
    if t and d:
        same = "❌ SAME!" if t.group(1) == d.group(1) else "✅ DIFFERENT"
        print(f"  {f}: {same}")
        print(f"    Title: {t.group(1)[:50]}...")
        print(f"    Desc:  {d.group(1)[:50]}...")
