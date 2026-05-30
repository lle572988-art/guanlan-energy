#!/usr/bin/env python3
"""Update nav in all blog pages - handle inline HTML navigation"""
import os
import re

BLOG_DIR = '/Users/yihua/.openclaw/workspace/my-website/blog'
count = 0

for fname in sorted(os.listdir(BLOG_DIR)):
    if not fname.endswith('.html'):
        continue
    path = os.path.join(BLOG_DIR, fname)
    with open(path, 'r') as f:
        content = f.read()
    
    # Pattern: Home followed by Reading link (inline, no newlines)
    # <a href="../index.html">Home</a><a href="../index.html#top">Reading</a>
    old = '<a href="../index.html">Home</a><a href="../index.html#top">Reading</a>'
    new = '<a href="../index.html">Home</a><a href="../about.html">About</a><a href="../index.html#top">Reading</a>'
    
    if old in content:
        content = content.replace(old, new)
        with open(path, 'w') as f:
            f.write(content)
        print(f"  ✓ {fname}")
        count += 1
        continue
    
    # Also check multi-line version
    old2 = '<a href="../index.html">Home</a>\n      <a href="../index.html#top">Reading</a>'
    new2 = '<a href="../index.html">Home</a>\n      <a href="../about.html">About</a>\n      <a href="../index.html#top">Reading</a>'
    
    if old2 in content:
        content = content.replace(old2, new2)
        with open(path, 'w') as f:
            f.write(content)
        print(f"  ✓ {fname} (multiline)")
        count += 1
        continue
    
    # Check if already has About
    if '../about.html' in content:
        print(f"  ~ {fname} (already has About)")
        continue
    
    print(f"  ⚠️  Skipped {fname}")

print(f"\n✅ Updated {count} blog pages")
