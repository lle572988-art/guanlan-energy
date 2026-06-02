#!/usr/bin/env python3
"""
R01: Wrap 5 bare-content blog pages in full HTML templates.
Also handle R07 (stagger dates) inline.
"""
import os, re

ROOT = "/Users/yihua/.openclaw/workspace"

BLOG_MD = {
    "workspace-command-position": "blog/workspace-command-position.md",
    "bedroom-layout-for-deep-sleep": "blog/bedroom-layout-for-deep-sleep.md",
    "digital-clutter-and-mind-flow": "blog/digital-clutter-and-mind-flow.md",
    "office-plant-myth-busting": "blog/office-plant-myth-busting.md",
    "the-psychology-of-minimalist-spaces": "blog/the-psychology-of-minimalist-spaces.md",
}

# Staggered dates per R07 (excluding original 2026-05-26)
STAGGER_DATES = {
    "workspace-command-position": "2026-04-12",
    "bedroom-layout-for-deep-sleep": "2026-04-26",
    "digital-clutter-and-mind-flow": "2026-05-03",
    "office-plant-myth-busting": "2026-05-10",
    "the-psychology-of-minimalist-spaces": "2026-05-17",
}

# Slug → display title mapping
SLUG_TITLES = {
    "workspace-command-position": "The Command Position: Why Your Desk Orientation Controls Your Flow State",
    "bedroom-layout-for-deep-sleep": "The Geometry of Deep Sleep: How Bed Placement Changes Your Recovery",
    "digital-clutter-and-mind-flow": "Digital Clutter Is Spatial Pollution: Why 46 Open Tabs Destroy Your Flow State",
    "office-plant-myth-busting": "The Office Plant Paradox: Which Plants Actually Energize Your Workspace — and Which Ones Drain It",
    "the-psychology-of-minimalist-spaces": "The Anxiety-Productivity Curve: Why Minimalism Actually Rewires Your Brain",
}

SLUG_DESCRIPTIONS = {
    "workspace-command-position": "Most remote workers optimize for ergonomics but ignore a deeper variable: spatial command. Here's why facing the door isn't superstition—it's neurobiology.",
    "bedroom-layout-for-deep-sleep": "Your mattress matters less than where you put it. New research shows bed orientation can alter sleep architecture by up to 25%. Here's the protocol.",
    "digital-clutter-and-mind-flow": "Physical clutter drains focus. But digital clutter hijacks your attentional field through mechanisms most people never see. Here's how to clean it.",
    "office-plant-myth-busting": "Not all plants improve your workspace. Some create more energetic problems than they solve. Here's the evidence-based guide to biophilic optimization.",
    "the-psychology-of-minimalist-spaces": "Minimalism isn't aesthetic preference. It's an intervention on your brain's attentional system. The neuroscience behind why empty spaces make you calmer and sharper.",
}

SLUG_TAGS = {
    "workspace-command-position": ["Energy Flow", "Biohacking", "Spatial Harmony"],
    "bedroom-layout-for-deep-sleep": ["Energy Flow", "Biohacking", "Spatial Harmony"],
    "digital-clutter-and-mind-flow": ["Energy Flow", "Biohacking", "Spatial Harmony"],
    "office-plant-myth-busting": ["Energy Flow", "Biohacking", "Spatial Harmony"],
    "the-psychology-of-minimalist-spaces": ["Energy Flow", "Biohacking", "Spatial Harmony"],
}

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>__TITLE__ | Guanlan Blog</title>
<meta name="description" content="__DESCRIPTION__"/>
<link rel="canonical" href="https://metaphysicflow.com/blog/__SLUG__.html"/>
<meta property="og:url" content="https://metaphysicflow.com/blog/__SLUG__.html"/>
<meta property="og:type" content="article"/>
<meta property="og:site_name" content="Guanlan Energy"/>
<meta property="og:title" content="__TITLE__"/>
<meta property="og:description" content="__DESCRIPTION__"/>
<meta property="og:image" content="https://metaphysicflow.com/images/calligraphy.jpg"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="__TITLE__"/>
<meta name="twitter:description" content="__DESCRIPTION__"/>
<meta name="twitter:image" content="https://metaphysicflow.com/images/calligraphy.jpg"/>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'EB Garamond',serif;background:#faf8f5;color:#1a1a1a;line-height:1.85;font-size:18px;padding:40px 20px}}
.wrap{{max-width:720px;margin:auto}}
h1{{font-size:30px;font-weight:500;line-height:1.4;margin-bottom:10px}}
.date{{font-size:14px;color:#888;margin-bottom:8px}}
.tag{{display:inline-block;font-size:12px;background:#eae5dd;color:#555;padding:2px 10px;border-radius:12px;margin:0 4px 4px 0}}
h2{{font-size:22px;font-weight:500;margin:36px 0 12px;color:#333}}
p{{margin-bottom:16px;color:#444}}
a{{color:#8b6914;text-decoration:underline}}
a:hover{{color:#5c4710}}
.cta-box{{margin:40px 0;padding:24px;border:1px solid #ddd;border-radius:8px;text-align:center;font-size:16px;background:#f5f2ed}}
.cta-box a{{font-size:14px;font-weight:500}}
ul,ol{{margin:0 0 16px 24px;color:#444}}
li{{margin-bottom:6px}}
strong{{color:#222}}
blockquote{{border-left:3px solid #c9a84c;padding:12px 20px;margin:16px 0;background:#f5f2ed;font-style:italic}}
table{{width:100%;border-collapse:collapse;margin:16px 0;font-size:15px}}
th,td{{border:1px solid #ddd;padding:8px 12px;text-align:left}}
th{{background:#eae5dd;font-weight:500}}
nav{{margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e0dbd3;font-size:14px}}
nav a{{text-decoration:none;color:#8b6914;margin-right:16px}}
footer{{margin-top:40px;padding-top:16px;border-top:1px solid #e0dbd3;font-size:13px;color:#999}}
</style>
<!-- Plausible Analytics -->
<script defer data-domain="metaphysicflow.com" src="https://plausible.io/js/script.js"></script>
<script>
window.plausible = window.plausible || function() {{ (window.plausible.q = window.plausible.q || []).push(arguments) }};
</script>
</head>
<body>
<div class="wrap">
<nav>
<a href="/">Home</a> / <a href="/blog/index.html">Blog</a> / <span>__TITLE__</span>
</nav>
<div class="date">__DATE__</div>
<div>
__TAGS__
</div>
<h1>__TITLE__</h1>

__CONTENT__

<div class="cta-box">
🔮 <strong>Want to see how your workspace scores on the five elements energy map?</strong><br>
Run a free AI Feng Shui scan in under 30 seconds — browser only, nothing to install.<br><br>
<a href="/">Try Guanlan Energy →</a>
</div>

<footer>
<p><a href="/">Home</a> · <a href="/blog/index.html">Blog</a> · <a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a></p>
<p>© 2026 Guanlan Energy — Ancient Chinese wisdom for modern independent workers.</p>
</footer>
</div>
</body>
</html>
"""

# Read md files and extract body content
def extract_body(md_path):
    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove YAML frontmatter (between --- markers)
    # Also remove the extra HTML meta tags that follow
    clean = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)
    # Remove remaining bare meta tags
    clean = re.sub(r'<meta[^>]*>\n?', '', clean)
    # Remove empty lines at start
    clean = clean.strip()
    
    # Convert markdown-style links [text](url) to HTML
    def md_link(m):
        text = m.group(1)
        url = m.group(2)
        return f'<a href="{url}">{text}</a>'
    clean = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', md_link, clean)
    
    # Convert markdown tables to HTML tables
    def convert_table(block):
        lines = block.split('\n')
        if len(lines) < 2:
            return block
        html = '<table>\n<tr>'
        headers = re.findall(r'\|([^|]+)', lines[0])
        for h in headers:
            html += f'<th>{h.strip()}</th>'
        html += '</tr>\n'
        for line in lines[2:]:  # skip separator row
            cells = re.findall(r'\|([^|]+)', line)
            if cells:
                html += '<tr>'
                for c in cells:
                    html += f'<td>{c.strip()}</td>'
                html += '</tr>\n'
        html += '</table>'
        return html
    
    # Find table blocks
    lines = clean.split('\n')
    result = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # Check if this line starts a table
        if line.strip().startswith('|') and '|' in line[1:]:
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                table_lines.append(lines[i])
                i += 1
            result.append(convert_table('\n'.join(table_lines)))
        else:
            result.append(line)
            i += 1
    
    return '\n'.join(result)


count = 0
for slug, md_relpath in BLOG_MD.items():
    md_path = os.path.join(ROOT, md_relpath)
    html_path = os.path.join(ROOT, f"blog/{slug}.html")
    
    if not os.path.exists(md_path):
        print(f"  {slug}: SKIP (no .md)")
        continue
    
    # Extract body from .md
    body = extract_body(md_path)
    
    # Build the HTML
    html = HTML_TEMPLATE
    
    title = SLUG_TITLES[slug]
    description = SLUG_DESCRIPTIONS[slug]
    date = STAGGER_DATES[slug]
    tags = SLUG_TAGS[slug]
    
    # Build tag HTML
    tag_html = " ".join(f'<span class="tag">{t}</span>' for t in tags)
    
    html = html.replace("__TITLE__", title)
    html = html.replace("__DESCRIPTION__", description)
    html = html.replace("__SLUG__", slug)
    html = html.replace("__DATE__", date)
    html = html.replace("__TAGS__", tag_html)
    html = html.replace("__CONTENT__", body)
    
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)
    
    count += 1
    print(f"  ✅ {slug}.html — {title[:50]}... ({date})")

print(f"\n✅ R01+R07: Wrapped {count} blog pages in full HTML templates with staggered dates")
