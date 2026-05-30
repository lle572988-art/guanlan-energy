#!/usr/bin/env python3
"""
Cross-linking between blog, birthday calculator, and AI Feng Shui Scan.
"""

import glob
import os

BLOG_DIR = "/Users/yihua/.openclaw/workspace/my-website/blog"
SITE_DIR = "/Users/yihua/.openclaw/workspace/my-website"
SCAN_URL = "/feng-shui-scan.html"
REPORT_URL = "https://lleonard88.gumroad.com/l/wovthw"

SCANNER_CTA = '''    <div class="cross-cta" style="margin:40px 0 30px;padding:24px;border:1px solid rgba(201,168,76,0.15);border-radius:8px;text-align:center;background:rgba(201,168,76,0.03)">
      <p style="font-size:14px;color:var(--gold2);letter-spacing:1px;margin-bottom:2px">✦ FROM INSIGHT TO ACTION</p>
      <p style="font-size:15px;color:var(--muted);line-height:1.7;margin:6px 0 16px">Want to see how this element applies to your own space? Try our <strong>AI Spatial Scanner</strong> for free.</p>
      <a href="/feng-shui-scan.html" class="cta-btn" style="display:inline-block;padding:10px 28px;border:1px solid var(--gold2);color:var(--gold2);text-decoration:none;border-radius:4px;font-size:13px;letter-spacing:2px;transition:all .3s;background:transparent">✦ Scan Your Space</a>
    </div>

'''

RESULT_LINK_BIRTHDAY = '''  <div class="cross-cta" style="margin:30px 0 20px;padding:20px;border:1px solid rgba(201,168,76,0.12);border-radius:6px;text-align:center;background:rgba(201,168,76,0.02)">
    <p style="font-size:13px;color:var(--muted);line-height:1.6">Your birth chart tells your story — but your <strong>living space</strong> shapes your daily energy.<br>
    <a href="/feng-shui-scan.html" style="color:var(--gold2);text-decoration:underline;text-underline-offset:3px">Is your room aligned? Try the AI Spatial Scan →</a></p>
  </div>

'''

RESULT_LINK_SCAN = '''    <p style="font-size:13px;color:var(--muted);line-height:1.6;margin-top:12px">Your space has a voice — and your <strong>birth chart</strong> has the translation key.<br>
    <a href="/#top" onclick="event.preventDefault();window.location.href='/';setTimeout(()=>document.getElementById('dob')?.scrollIntoView({behavior:'smooth'}),200)" style="color:var(--gold2);text-decoration:underline;text-underline-offset:3px">Calculate your Five Element birth blueprint →</a></p>
'''

def add_blog_ctas():
    blog_files = sorted(glob.glob(os.path.join(BLOG_DIR, "blog*.html")))
    updated = 0
    for fpath in blog_files:
        with open(fpath) as f:
            html = f.read()

        # Skip if already has cross-cta
        if 'cross-cta' in html:
            continue

        # Insert before the newsletter section (which has class "newsletter")
        insert_before = '<div class="newsletter">'
        if insert_before not in html:
            continue

        html = html.replace(insert_before, SCANNER_CTA + insert_before)
        with open(fpath, 'w') as f:
            f.write(html)
        updated += 1
        print(f"  ✓ {os.path.basename(fpath)}")

    return updated

def add_birthday_result_link():
    fpath = os.path.join(SITE_DIR, "index.html")
    with open(fpath) as f:
        html = f.read()

    if 'cross-cta' in html:
        print("  - index.html already has cross-cta, skipping")
        return

    # Insert after the result-actions div closes
    marker = '</div>\n\n</div><!-- /results -->'
    if marker not in html:
        # Try alternative
        marker = '</div>\n\n</div>\n\n\n<div class="snake-divider"'
        if marker in html:
            html = html.replace(marker, RESULT_LINK_BIRTHDAY + '</div><!-- /results -->\n\n\n<div class="snake-divider"')
            with open(fpath, 'w') as f:
                f.write(html)
            print("  ✓ index.html (birthday result link added)")
        else:
            print("  ✗ index.html: result section marker not found")
        return

    html = html.replace(marker, RESULT_LINK_BIRTHDAY + marker)
    with open(fpath, 'w') as f:
        f.write(html)
    print("  ✓ index.html (birthday result link added)")

def add_scan_result_link():
    fpath = os.path.join(SITE_DIR, "feng-shui-scan.html")
    with open(fpath) as f:
        html = f.read()

    if 'cross-cta' in html:
        print("  - feng-shui-scan.html already has cross-cta, skipping")
        return

    # Insert in scan-cta div, before the rescan-link
    marker = '<span class="rescan-link"'
    if marker not in html:
        print("  ✗ feng-shui-scan.html: rescan-link not found")
        return

    html = html.replace(marker, RESULT_LINK_SCAN + '    <br>\n    ' + marker)
    with open(fpath, 'w') as f:
        f.write(html)
    print("  ✓ feng-shui-scan.html (scan result link added)")


if __name__ == "__main__":
    print("🔗 Cross-linking...")
    
    print("\n1. Blog articles → Scanner CTA")
    n = add_blog_ctas()
    print(f"   {n} articles updated")
    
    print("\n2. Birthday result → Scan link")
    add_birthday_result_link()
    
    print("\n3. Scan result → Birthday link")
    add_scan_result_link()
    
    print("\n✅ Done")
