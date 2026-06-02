#!/usr/bin/env python3
"""R02: Fix og:url on all longtail/ pages/blog pages — inject OG meta tags."""
import os, re

ROOT = "/Users/yihua/.openclaw/workspace"
EXCLUDE = {"node_modules", ".git", "1099savvy", "passterra", "social-sniper", "images"}

def fix_og_url(fpath):
    """Fix or add og:url for a given file."""
    with open(fpath, "r", encoding="utf-8", errors="replace") as fh:
        content = fh.read()

    # Determine relative path from root
    rel = os.path.relpath(fpath, ROOT)
    
    # Build correct og:url
    base_url = f"https://metaphysicflow.com/{rel}"
    
    changes = []
    
    # R02: Fix existing og:url pointing to wrong URL
    if 'property="og:url"' in content or 'name="og:url"' in content:
        # Replace existing og:url with correct one
        pattern = r'<meta\s+(?:property|name)="og:url"\s+content="[^"]*"\s*/>'
        if re.search(pattern, content):
            content = re.sub(pattern, f'<meta property="og:url" content="{base_url}"/>', content)
            changes.append("fixed og:url")
    else:
        # No og:url exists — add it after canonical
        canonical_end = "</head>"  # fallback position
        if '<link rel="canonical"' in content:
            # Insert after canonical link
            m = re.search(r'<link rel="canonical"[^>]*/>\s*', content)
            if m:
                insert_pos = m.end()
                og_tag = f'<meta property="og:url" content="{base_url}"/>\n'
                content = content[:insert_pos] + og_tag + content[insert_pos:]
                changes.append("added og:url")
    
    # Mop up: also add og:type if missing
    if 'property="og:type"' not in content and 'name="og:type"' not in content:
        og_type = '<meta property="og:type" content="article"/>\n'
        content = content.replace("</head>", og_type + "</head>", 1)
        changes.append("added og:type")
    
    if changes:
        with open(fpath, "w", encoding="utf-8") as fh:
            fh.write(content)
        return True, changes
    return False, []

count = 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in EXCLUDE]
    for f in filenames:
        if not f.endswith(".html"):
            continue
        fpath = os.path.join(dirpath, f)
        rel = os.path.relpath(fpath, ROOT)
        
        # Skip root pages and hubs (they already have OG or different treatment)
        if rel in ("index.html", "about.html", "consultation.html", "forecast.html",
                   "feng-shui-scan.html", "article-detail.html",
                   "privacy.html", "terms.html", "refund.html", "disclaimer.html",
                   "widget-bazi-wealth.html"):
            continue
        
        ok, changes = fix_og_url(fpath)
        if ok:
            count += 1
            if count <= 5:
                print(f"  {rel}: {', '.join(changes)}")

print(f"\n✅ R02: Fixed og:url for {count} files")

# Verify a few
print()
print("=== Verification ===")
for f in ["longtail_pages/bazi-chart-reading-1099-independent-contractors.html",
          "pages/wood-home-office-feng-shui.html",
          "hubs/founders.html",
          "blog/index.html",
          "blog/anxiety-home-five-elements.html"]:
    fpath = os.path.join(ROOT, f)
    if os.path.exists(fpath):
        with open(fpath, "r") as fh:
            c = fh.read()
        og = re.search(r'property="og:url"\s+content="([^"]*)"', c)
        print(f"  {f}: og:url = {og.group(1) if og else 'MISSING'}")
