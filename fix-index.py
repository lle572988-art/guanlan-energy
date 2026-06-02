#!/usr/bin/env python3
"""Fix index.html: add By Element section, clean placeholder links, add longtail links."""
import os, re

path = "/Users/yihua/.openclaw/workspace/index.html"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix the "Continue Your Journey" section — remove blog2-4 link
content = content.replace(
    '<li><a href="/blog/blog2-4.html">The 14 Stars Career Guide: Finding Your Profess...</a></li>\n',
    ''
)

# 2. Add "By Element" section before the testimonials
by_element_section = """<section style="padding:60px 0;">
 <div class="block-title" style="margin-bottom:32px;">🔥 Explore by Your Dominant Element</div>
 <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;">
 <a href="/pages/wood-home-office-feng-shui.html" style="display:flex;flex-direction:column;align-items:center;padding:28px 12px;background:rgba(13,31,23,.6);border:1px solid rgba(76,141,96,.2);border-radius:16px;text-decoration:none;">
 <div style="font-size:32px;margin-bottom:8px;">🌳</div>
 <div style="font-size:14px;color:var(--gold);letter-spacing:1px;margin-bottom:4px;">Wood</div>
 <div style="font-size:11px;color:var(--muted);text-align:center;">Growth · Vision · Decision Flow</div>
 </a>
 <a href="/pages/fire-home-office-feng-shui.html" style="display:flex;flex-direction:column;align-items:center;padding:28px 12px;background:rgba(13,31,23,.6);border:1px solid rgba(230,92,58,.2);border-radius:16px;text-decoration:none;">
 <div style="font-size:32px;margin-bottom:8px;">🔥</div>
 <div style="font-size:14px;color:var(--gold);letter-spacing:1px;margin-bottom:4px;">Fire</div>
 <div style="font-size:11px;color:var(--muted);text-align:center;">Action · Visibility · Marketing Energy</div>
 </a>
 <a href="/pages/earth-home-office-feng-shui.html" style="display:flex;flex-direction:column;align-items:center;padding:28px 12px;background:rgba(13,31,23,.6);border:1px solid rgba(201,168,76,.2);border-radius:16px;text-decoration:none;">
 <div style="font-size:32px;margin-bottom:8px;">🪨</div>
 <div style="font-size:14px;color:var(--gold);letter-spacing:1px;margin-bottom:4px;">Earth</div>
 <div style="font-size:11px;color:var(--muted);text-align:center;">Stability · Wealth Storage · Grounding</div>
 </a>
 <a href="/pages/metal-home-office-feng-shui.html" style="display:flex;flex-direction:column;align-items:center;padding:28px 12px;background:rgba(13,31,23,.6);border:1px solid rgba(200,200,210,.2);border-radius:16px;text-decoration:none;">
 <div style="font-size:32px;margin-bottom:8px;">⚔️</div>
 <div style="font-size:14px;color:var(--gold);letter-spacing:1px;margin-bottom:4px;">Metal</div>
 <div style="font-size:11px;color:var(--muted);text-align:center;">Precision · Pricing · Value Clarity</div>
 </a>
 <a href="/pages/water-home-office-feng-shui.html" style="display:flex;flex-direction:column;align-items:center;padding:28px 12px;background:rgba(13,31,23,.6);border:1px solid rgba(62,130,180,.2);border-radius:16px;text-decoration:none;">
 <div style="font-size:32px;margin-bottom:8px;">💧</div>
 <div style="font-size:14px;color:var(--gold);letter-spacing:1px;margin-bottom:4px;">Water</div>
 <div style="font-size:11px;color:var(--muted);text-align:center;">Passive Income · Flow · Economic Timing</div>
 </a>
 </div>
 <div style="text-align:center;margin-top:24px;">
 <a href="/blog/index.html" style="color:var(--gold);font-size:13px;letter-spacing:2px;">→ Browse all 90+ room &amp; element guides</a>
 </div>
</section>

"""

# Insert before testimonials
testimonials_marker = '<section style="padding:60px 0;">\n <div class="block-title" style="margin-bottom:32px;">Trusted by Independent Builders Worldwide</div>'
if testimonials_marker in content:
    content = content.replace(testimonials_marker, by_element_section + testimonials_marker, 1)
    print("✅ By Element section added before testimonials")
else:
    print("⚠️ Could not find testimonials section")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

# Verify
with open(path, "r") as f:
    c = f.read()
print(f"By Element blocks: {c.count('Explore by Your Dominant Element')}")
print(f"blog2-4 links: {c.count('blog2-4')}")
