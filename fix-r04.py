#!/usr/bin/env python3
"""R04+R10+R11: Update og:image to 1200x630 on all key pages + scan/refund/blog/hubs."""
import os, re

ROOT = "/Users/yihua/.openclaw/workspace"

OG_IMAGE = "https://metaphysicflow.com/images/og-image.png"

KEY_PAGES = [
    "index.html",
    "about.html",
    "consultation.html", 
    "forecast.html",
    "blog/index.html",
    "scan/index.html",
    "privacy.html",
    "terms.html",
    "refund.html",
    "disclaimer.html",
    "widget-bazi-wealth.html",
    "article-detail.html",
    "feng-shui-scan.html",
]

# Also fix all hubs
import glob
HUB_PAGES = glob.glob(os.path.join(ROOT, "hubs/*.html"))
for hp in HUB_PAGES:
    KEY_PAGES.append(os.path.relpath(hp, ROOT))

count = 0
for relpath in KEY_PAGES:
    fpath = os.path.join(ROOT, relpath)
    if not os.path.exists(fpath):
        continue
    
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    
    changed = False
    
    # Update og:image
    if 'og:image"' in content or "og:image'" in content:
        # Replace existing og:image
        content = re.sub(
            r'<meta\s+property="og:image"\s+content="[^"]*"\s*/>',
            f'<meta property="og:image" content="{OG_IMAGE}"/>',
            content
        )
        changed = True
        
        # Add width/height if missing
        if 'og:image:width' not in content:
            content = content.replace(
                f'<meta property="og:image" content="{OG_IMAGE}"/>',
                f'<meta property="og:image" content="{OG_IMAGE}"/>\n<meta property="og:image:width" content="1200"/>\n<meta property="og:image:height" content="630"/>',
                1
            )
    else:
        # No og:image at all — add a basic set
        og_block = f'\n<meta property="og:image" content="{OG_IMAGE}"/>\n<meta property="og:image:width" content="1200"/>\n<meta property="og:image:height" content="630"/>'
        content = content.replace("</head>", og_block + "\n</head>", 1)
        changed = True
    
    # Also fix twitter:image
    if 'twitter:image"' in content:
        content = re.sub(
            r'<meta\s+name="twitter:image"\s+content="[^"]*"\s*/>',
            f'<meta name="twitter:image" content="{OG_IMAGE}"/>',
            content
        )
    else:
        content = content.replace("</head>", f'\n<meta name="twitter:image" content="{OG_IMAGE}"/>\n</head>', 1)
    
    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        count += 1
        print(f"  ✅ {relpath}")

print(f"\n✅ R04+R10+R11: Updated OG images on {count} key pages")
