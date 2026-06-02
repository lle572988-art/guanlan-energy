#!/usr/bin/env python3
"""R06: Add interlinks between the 5 blog posts + link back to blog index."""
import os

ROOT = "/Users/yihua/.openclaw/workspace"

BLOGS = [
    "workspace-command-position",
    "bedroom-layout-for-deep-sleep",
    "digital-clutter-and-mind-flow",
    "office-plant-myth-busting",
    "the-psychology-of-minimalist-spaces",
]

INTERLINKS = {
    "workspace-command-position": [
        '<p><strong>Related:</strong> Your digital workspace matters too — read <a href="digital-clutter-and-mind-flow.html">Digital Clutter Is Spatial Pollution</a> for the complete attentional field protocol.</p>',
        '<p><strong>Related:</strong> Learn how <a href="the-psychology-of-minimalist-spaces.html">The Anxiety-Productivity Curve</a> explains why a clean desk alone isn\'t enough.</p>',
    ],
    "bedroom-layout-for-deep-sleep": [
        '<p><strong>Related:</strong> Poor sleep starts with poor desk setup — see <a href="workspace-command-position.html">Why Your Desk Orientation Controls Your Flow State</a>.</p>',
        '<p><strong>Related:</strong> Your bedroom energy also affects your <a href="office-plant-myth-busting.html">plant placement strategy</a> — the two spaces work together.</p>',
    ],
    "digital-clutter-and-mind-flow": [
        '<p><strong>Related:</strong> Physical clutter is just as damaging — read <a href="the-psychology-of-minimalist-spaces.html">Why Minimalism Rewires Your Brain</a>.</p>',
        '<p><strong>Related:</strong> Your digital focus starts with <a href="workspace-command-position.html">how your desk is oriented</a> — the command position applies online too.</p>',
    ],
    "office-plant-myth-busting": [
        '<p><strong>Related:</strong> Your plant placement should match your <a href="bedroom-layout-for-deep-sleep.html">bedroom geometry</a> for optimal recovery.</p>',
        '<p><strong>Related:</strong> A minimal workspace amplifies biophilic benefits — see <a href="the-psychology-of-minimalist-spaces.html">The Anxiety-Productivity Curve</a>.</p>',
    ],
    "the-psychology-of-minimalist-spaces": [
        '<p><strong>Related:</strong> Minimalism starts where <a href="digital-clutter-and-mind-flow.html">digital clutter ends</a> — clear both for maximum cognitive bandwidth.</p>',
        '<p><strong>Related:</strong> Spatial command and minimalism work together — see <a href="workspace-command-position.html">The Command Position</a>.</p>',
    ],
}

BACK_LINK = '<p><a href="/blog/index.html">← Back to all articles</a></p>'

count = 0
for slug in BLOGS:
    fpath = os.path.join(ROOT, f"blog/{slug}.html")
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Add back link before footer
    if "Back to all articles" not in content:
        # Add before <footer>
        content = content.replace("<footer>", f"{BACK_LINK}\n<footer>", 1)
    
    # Add interlinks before the CTA box
    links = INTERLINKS[slug]
    link_html = "\n".join(links)
    
    cta_marker = '<div class="cta-box">'
    if cta_marker in content:
        content = content.replace(cta_marker, link_html + "\n\n" + cta_marker, 1)
    
    # Fix dates in blog index (they still show May 26)
    # Fix inside each article too — replace May 26 with staggered date
    from datetime import datetime
    date_map = {
        "workspace-command-position": "April 12, 2026",
        "bedroom-layout-for-deep-sleep": "April 26, 2026",
        "digital-clutter-and-mind-flow": "May 3, 2026",
        "office-plant-myth-busting": "May 10, 2026",
        "the-psychology-of-minimalist-spaces": "May 17, 2026",
    }
    content = content.replace("May 26, 2026", date_map[slug])
    
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
    
    count += 1
    print(f"  ✅ {slug}.html: backlink + interlinks + date fixed")

print(f"\n✅ R06: Interlinks added to {count} blog pages")
