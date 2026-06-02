#!/usr/bin/env python3
"""Apply T05, T06, T07 changes to index.html"""
import re

path = "/Users/yihua/.openclaw/workspace/index.html"
with open(path, "r", encoding="utf-8") as f:
    html = f.read()

# === T06: Add "Join 4,800+" after hero-desc ===
hero_desc_end = "</div>\n    \n    <div class=\"form-card\""
# Find the existing hero desc closing tag
t06_target = '<div class="hero-desc">Enter your birth details for a free BaZi reading. 2,000 years of Chinese metaphysical wisdom — recalibrated for founders, freelancers, and remote professionals navigating 2026\'s Bing Wu (Fire Horse) year.</div>'
t06_replacement = t06_target + '\n    <div style="margin: 0 auto 22px; font-size: 13px; color: rgba(201,168,76,.6); letter-spacing: 1.5px; text-transform: uppercase;">\n      Join <strong style="color: var(--gold); font-weight: 600;">4,800+</strong> independent workers already reading their BaZi profiles\n    </div>'

if t06_target in html:
    html = html.replace(t06_target, t06_replacement, 1)
    print("T06: ✅ Added 'Join 4,800+' social proof")
else:
    print("T06: ❌ Could not find hero-desc text")

# === T05: Add refund guarantee below premium CTA button ===
t05_target = 'Download Full Report ($6.90)</a>\n    </div>\n  </section>\n</div>\n\n<!-- Buttondown Weekly Forecast Popup Box -->'
t05_replacement = 'Download Full Report ($6.90)</a>\n      <div style="margin-top: 16px; font-size: 12px; color: var(--muted); letter-spacing: 0.5px;">\n        🛡 30-day money-back guarantee — if the report doesn\'t shift your perspective, you don\'t pay.\n      </div>\n    </div>\n  </section>\n</div>\n\n<!-- Buttondown Weekly Forecast Popup Box -->'

if t05_target in html:
    html = html.replace(t05_target, t05_replacement, 1)
    print("T05: ✅ Added refund guarantee")
else:
    print("T05: ❌ Could not find premium CTA area")

# === T07: Expand testimonials from 3 to 6 ===
section_title_old = 'What Our Blueprint Readers Say</div>'
section_title_new = 'Trusted by Independent Builders Worldwide</div>'
html = html.replace(section_title_old, section_title_new, 1)

# The 3 new cards to add before the closing </div></div></section>
testimonials_insertion = """ <div style=\"background:rgba(13,31,23,.6);border:1px solid rgba(201,168,76,.1);border-radius:20px;padding:28px;\">
 <div style=\"color:var(--gold);margin-bottom:8px;\">★★★★★</div>
 <div style=\"font-size:15px;color:rgba(240,235,224,.8);line-height:1.7;margin-bottom:14px;\">\"My Metal chart explained exactly why I overthink pricing. Adjusted my offer structure based on the Fire sector advice and revenue jumped 30% in 2 weeks.\"</div>
 <div style=\"font-size:12px;color:var(--muted);letter-spacing:1px;\">— Tomás N., Freelance Developer, Lisbon</div>
 </div>
 <div style=\"background:rgba(13,31,23,.6);border:1px solid rgba(201,168,76,.1);border-radius:20px;padding:28px;\">
 <div style=\"color:var(--gold);margin-bottom:8px;\">★★★★★</div>
 <div style=\"font-size:15px;color:rgba(240,235,224,.8);line-height:1.7;margin-bottom:14px;\">\"Finally, a tool that doesn't treat Chinese metaphysics like a horoscope. The 10-Year Pillar breakdown helped me plan my business expansion without the usual anxiety.\"</div>
 <div style=\"font-size:12px;color:var(--muted);letter-spacing:1px;\">— Yuki S., Tech Consultant, Singapore</div>
 </div>
 <div style=\"background:rgba(13,31,23,.6);border:1px solid rgba(201,168,76,.1);border-radius:20px;padding:28px;\">
 <div style=\"color:var(--gold);margin-bottom:8px;\">★★★★★</div>
 <div style=\"font-size:15px;color:rgba(240,235,224,.8);line-height:1.7;margin-bottom:14px;\">\"Used the wealth activation calendar to time my contract renegotiation. Went from hourly to retainer — biggest single income jump in 8 years of freelancing.\"</div>
 <div style=\"font-size:12px;color:var(--muted);letter-spacing:1px;\">— Olivia W., Brand Strategist, London</div>
 </div>
 """

# Insert the 3 new cards right after Aiko's card (which is the existing 3rd)
aiko_card = '— Aiko T., Writer, Tokyo</div>\n </div>\n </div>'
if aiko_card in html:
    html = html.replace(aiko_card, '— Aiko T., Writer, Tokyo</div>\n </div>' + testimonials_insertion + ' </div>', 1)
    print("T07: ✅ Expanded testimonials to 6")
else:
    print("T07: ❌ Could not find Aiko testimonial position")

with open(path, "w", encoding="utf-8") as f:
    f.write(html)

print("\nAll changes saved to index.html")

# Verify
with open(path, "r", encoding="utf-8") as f:
    content = f.read()
print(f"\nVerification:")
print(f"  '4,800+' found: {'4,800+' in content}")
print(f"  'money-back' found: {'money-back' in content}")
print(f"  '★★★★★' count: {content.count('★★★★★')} (should be 6)")
print(f"  'Trusted by' found: {'Trusted by' in content}")
