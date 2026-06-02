#!/usr/bin/env python3
"""Add interlinks to all 90 pages/ files — show 5 related pages of same element."""
import os, re

ROOT = "/Users/yihua/.openclaw/workspace/pages"

# Map elements to their files
ELEMENTS = {"wood": [], "fire": [], "earth": [], "metal": [], "water": []}

# Scan all files
for f in os.listdir(ROOT):
    if not f.endswith(".html"):
        continue
    for elem in ELEMENTS:
        if f.startswith(elem + "-"):
            ELEMENTS[elem].append(f)
            break

# Titles map for display
TITLES = {}
for elem, files in ELEMENTS.items():
    for f in files:
        fpath = os.path.join(ROOT, f)
        with open(fpath, "r", encoding="utf-8", errors="replace") as fh:
            content = fh.read()
        t = re.search(r'<title>([^<]+)', content)
        if t:
            TITLES[f] = t.group(1).replace(" | Guanlan Energy", "").strip()
        else:
            TITLES[f] = f.replace(".html", "").replace("-", " ").title()

INTERLINK_HTML = """<!-- Related pages -->
<div class="related-pages">
<div class="block-title" style="margin-bottom:24px;">📖 More Five Elements Guides</div>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
__LINKS__
</div>
</div>"""

count = 0
for elem, files in ELEMENTS.items():
    for f in files:
        fpath = os.path.join(ROOT, f)
        with open(fpath, "r", encoding="utf-8", errors="replace") as fh:
            content = fh.read()
        
        # Skip if already has interlinks
        if 'class="related-pages"' in content:
            continue
        
        # Pick 5 related files from same element (excluding self)
        same_elem = [x for x in files if x != f]
        import random
        random.seed(f)  # Deterministic seed
        selected = random.sample(same_elem, min(5, len(same_elem)))
        
        links_html = ""
        for sf in selected:
            title = TITLES.get(sf, sf.replace(".html", "").replace("-", " ").title())
            links_html += f'<a href="{sf}" style="display:block;padding:10px 14px;background:rgba(13,31,23,.6);border:1px solid rgba(201,168,76,.1);border-radius:8px;text-decoration:none;color:rgba(240,235,224,.8);font-size:14px;">{title}</a>\n'
        
        link_section = INTERLINK_HTML.replace("__LINKS__", links_html)
        
        # Insert before </body> or before footer
        markers = ["</body>", "</html>"]
        for m in markers:
            if m in content:
                content = content.replace(m, link_section + "\n" + m, 1)
                break
        
        with open(fpath, "w", encoding="utf-8") as fh:
            fh.write(content)
        count += 1
        
        if count <= 5:
            print(f"  ✅ {f}: {len(selected)} related links")

print(f"\n✅ Added interlinks to {count}/{sum(len(v) for v in ELEMENTS.values())} pages/ files")

# Verify count
total = sum(len(v) for v in ELEMENTS.values())
print(f"Total pages/ files: {total}")
