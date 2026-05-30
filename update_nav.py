#!/usr/bin/env python3
"""Update navigation bar in all blog pages: add About link"""

import os

BLOG_DIR = '/Users/yihua/.openclaw/workspace/my-website/blog'

for fname in sorted(os.listdir(BLOG_DIR)):
    if not fname.endswith('.html'):
        continue
    path = os.path.join(BLOG_DIR, fname)
    with open(path, 'r') as f:
        content = f.read()
    
    old_nav = '''      <a href="../index.html">Home</a>
      <a href="../index.html#top">Reading</a>'''
    
    new_nav = '''      <a href="../index.html">Home</a>
      <a href="../about.html">About</a>
      <a href="../index.html#top">Reading</a>'''
    
    if old_nav in content:
        content = content.replace(old_nav, new_nav)
        with open(path, 'w') as f:
            f.write(content)
        print(f"  Updated: {fname}")
    else:
        # Check if already updated
        if '<a href="../about.html">About</a>' in content:
            print(f"  Already done: {fname}")
        else:
            print(f"  ⚠️  Pattern not found in {fname}")

print("\nDone!")
