#!/usr/bin/env python3
"""Clean sitemap.xml — remove all placeholder URLs."""
import re

path = "/Users/yihua/.openclaw/workspace/sitemap.xml"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# URLs to remove from sitemap
remove_patterns = [
    r'<url>\s*<loc>https://metaphysicflow\.com/blog/blog1[^<]*</loc>.*?</url>',
    r'<url>\s*<loc>https://metaphysicflow\.com/blog/blog2[^<]*</loc>.*?</url>',
    r'<url>\s*<loc>https://metaphysicflow\.com/blog/blog3[^<]*</loc>.*?</url>',
    r'<url>\s*<loc>https://metaphysicflow\.com/blog1[^<]*</loc>.*?</url>',
    r'<url>\s*<loc>https://metaphysicflow\.com/widget-bazi-wealth\.html[^<]*</loc>.*?</url>',
    r'<url>\s*<loc>https://metaphysicflow\.com/article-detail\.html[^<]*</loc>.*?</url>',
    r'<url>\s*<loc>https://metaphysicflow\.com/passterra[^<]*</loc>.*?</url>',
]

for pattern in remove_patterns:
    content = re.sub(pattern, '', content, flags=re.DOTALL)

# Clean multiple blank lines
content = re.sub(r'\n{3,}', '\n\n', content)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

# Count URLs remaining
url_count = content.count('<url>')
print(f"Sitemap cleaned: {url_count} URLs remaining")

# Verify no bad URLs
bad = ['blog1', 'blog2', 'blog3', 'widget', 'passterra', 'article-detail']
for b in bad:
    if re.search(f'<loc>[^<]*{b}[^<]*</loc>', content):
        print(f"  ⚠️  {b} still found!")
    else:
        print(f"  ✅ {b} removed")
