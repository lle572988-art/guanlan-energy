#!/usr/bin/env python3
"""Handle remaining pages - just insert About after Home"""
import os

BLOG_DIR = '/Users/yihua/.openclaw/workspace/my-website/blog'

for fname in sorted(os.listdir(BLOG_DIR)):
    if not fname.endswith('.html'):
        continue
    path = os.path.join(BLOG_DIR, fname)
    with open(path, 'r') as f:
        content = f.read()
    
    if '../about.html' in content:
        continue
    
    # Pattern: after Home link, insert About
    old = '<a href="../index.html">Home</a>'
    new = '<a href="../index.html">Home</a><a href="../about.html">About</a>'
    
    if old in content:
        content = content.replace(old, new, 1)
        with open(path, 'w') as f:
            f.write(content)
        print(f"  ✓ {fname}")
    
print("Done!")
