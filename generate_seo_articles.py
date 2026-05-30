#!/usr/bin/env python3
"""Generate 10 SEO blog articles as HTML pages."""
import os
import re

SITE_DIR = "/Users/yihua/.openclaw/workspace/my-website"
BLOG_DIR = os.path.join(SITE_DIR, "blog")

NAV = '''  <nav>
    <div class="nav-inner">
      <a href="../index.html" class="nav-logo" style="text-decoration:none">
        <div class="taiji-icon" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:36px;height:36px">
            <circle cx="20" cy="20" r="19" stroke="rgba(201,168,76,0.3)" stroke-width="0.5"/>
            <path d="M20 1 A19 19 0 0 1 20 39 A9.5 9.5 0 0 0 20 20 A9.5 9.5 0 0 1 20 1Z" fill="rgba(201,168,76,0.6)"/>
            <circle cx="20" cy="10" r="2.5" fill="rgba(6,16,12,0.8)"/>
            <circle cx="20" cy="30" r="2.5" fill="rgba(201,168,76,0.6)"/>
            <circle cx="20" cy="10" r="1" fill="rgba(201,168,76,0.8)"/>
            <circle cx="20" cy="30" r="1" fill="rgba(6,16,12,0.8)"/>
          </svg>
        </div>
        <div>
          <div class="nav-name">GUANLAN</div>
          <div class="nav-sub" style="font-size:9px;letter-spacing:3px;color:var(--muted);margin-top:1px">Observe the Ripples</div>
        </div>
      </a>
      <div class="nav-links">
        <a href="../about.html">About</a>
        <a href="../consultation.html">1-on-1</a>
        <a href="../feng-shui-scan.html">Scan</a>
        <a href="index.html">Stories</a>
        <a href="../index.html">Elements</a>
        <a href="../index.html">Readings</a>
      </div>
    </div>
  </nav>'''

FOOTER = '''<footer>
  <div style="text-align:center;padding:40px 20px;color:var(--muted);font-size:13px;letter-spacing:1px">
    GUANLAN ENERGY · Five Elements Wisdom · © 2026<br>
    <span style="font-size:10px;opacity:.6;margin-top:6px;display:block">Ancient wisdom reimagined for the modern soul</span>
  </div>
</footer>'''

BLOG_CSS = '''
*{margin:0;padding:0;box-sizing:border-box}
:root{--ink:#06100c;--ink2:#0d1f17;--gold:#c9a84c;--gold2:#e8d4a0;--jade:#2d5a3d;--text:#f0ebe0;--muted:rgba(240,235,224,.55);--cream:#f0ebe0}
html{scroll-behavior:smooth}
body{font-family:'EB Garamond',serif;background:var(--ink);color:var(--text);line-height:1.8;font-size:17px}
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(6,16,12,.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(201,168,76,.08)}
.nav-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:10px 24px}
.nav-logo{display:flex;align-items:center;gap:10px}
.nav-name{font-family:'Cormorant Garamond',serif;font-size:15px;letter-spacing:3px;color:var(--gold);font-weight:400}
.nav-links{display:flex;gap:22px}
.nav-links a{color:var(--muted);text-decoration:none;font-size:12px;letter-spacing:2px;transition:color .3s;position:relative}
.nav-links a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1px;background:var(--gold2);transition:width .3s}
.nav-links a:hover{color:var(--gold2)}
.nav-links a:hover::after{width:100%}
.wrap{max-width:720px;margin:0 auto;padding:0 24px}
article{padding-top:120px;padding-bottom:60px}
h1{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:36px;color:var(--gold2);letter-spacing:1px;line-height:1.3;margin-bottom:12px}
.article-meta{font-size:13px;color:var(--muted);letter-spacing:1px;margin-bottom:40px;opacity:.6}
.article-meta .tag{display:inline-block;border:1px solid rgba(201,168,76,.2);padding:2px 12px;border-radius:3px;font-size:10px;letter-spacing:2px;color:var(--gold);margin-right:10px}
h2{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:26px;color:var(--gold2);margin:50px 0 16px;letter-spacing:.5px;line-height:1.4}
h3{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:19px;color:var(--gold);margin:32px 0 10px;letter-spacing:.5px}
p{margin-bottom:18px;color:var(--text);line-height:1.9}
strong{color:var(--gold2);font-weight:500}
em{color:var(--gold);font-style:italic}
a{color:var(--gold2);transition:color .3s}
a:hover{color:var(--gold)}
ul,ol{margin:16px 0 24px 24px;color:var(--text)}
li{margin-bottom:8px;line-height:1.7}
blockquote{border-left:2px solid rgba(201,168,76,.2);padding:12px 20px;margin:24px 0;font-style:italic;color:var(--muted);background:rgba(201,168,76,.02);border-radius:0 4px 4px 0}
blockquote strong{color:var(--gold)}
hr{border:none;border-top:1px solid rgba(201,168,76,.1);margin:40px 0}
.seo-cta{margin:40px 0;padding:28px;border:1px solid rgba(201,168,76,.12);border-radius:8px;text-align:center;background:rgba(201,168,76,.02)}
.seo-cta p{font-size:15px;color:var(--muted);margin-bottom:16px;line-height:1.7}
.seo-cta a{display:inline-block;padding:10px 28px;border:1px solid var(--gold2);color:var(--gold2);text-decoration:none;border-radius:4px;font-size:13px;letter-spacing:2px;transition:all .3s}
.seo-cta a:hover{background:var(--gold2);color:var(--ink)}
table{width:100%;border-collapse:collapse;margin:24px 0;font-size:15px}
th,td{border:1px solid rgba(201,168,76,.1);padding:10px 14px;text-align:left;color:var(--text)}
th{background:rgba(201,168,76,.05);color:var(--gold2);font-weight:400;letter-spacing:1px;font-size:13px}
@media(max-width:640px){
  .nav-links{display:none}
  .wrap{padding:0 16px}
  h1{font-size:28px}
  h2{font-size:22px}
  article{padding-top:100px}
}
'''

# Article data: slug, seo_title, meta_desc, h1, tag, content_md
ARTICLES = []

def md_to_html(text):
    """Convert basic markdown to HTML."""
    lines = text.split('\n')
    html = []
    in_list = False
    in_table = False
    for line in lines:
        # Headers
        if line.startswith('### '):
            html.append(f'<h3>{line[4:]}</h3>')
        elif line.startswith('## '):
            html.append(f'<h2>{line[3:]}</h2>')
        elif line.startswith('# '):
            html.append(f'<h1>{line[2:]}</h1>')
        # Blockquote
        elif line.startswith('> '):
            html.append(f'<blockquote><p>{line[2:]}</p></blockquote>')
        # Unordered list
        elif line.startswith('- **'):
            idx = line.index('**', 3)
            html.append(f'<li><strong>{line[3:idx]}</strong>{line[idx+2:]}</li>')
        elif line.startswith('- '):
            html.append(f'<li>{line[2:]}</li>')
        # Table
        elif '|' in line and line.strip().startswith('|'):
            cells = [c.strip() for c in line.split('|')[1:-1]]
            if not in_table:
                html.append('<table><tr>' + ''.join(f'<th>{c}</th>' for c in cells) + '</tr>')
                in_table = True
            elif all(c.startswith('-') for c in cells if c):
                continue
            else:
                html.append('<tr>' + ''.join(f'<td>{c}</td>' for c in cells) + '</tr>')
        elif in_table and not line.strip().startswith('|'):
            html.append('</table>')
            in_table = False
        # Horizontal rule
        elif line.strip() == '---':
            html.append('<hr/>')
        # Empty line
        elif line.strip() == '':
            if in_list:
                html.append('</ul>')
                in_list = False
            html.append('')
        # Paragraph
        else:
            if in_list:
                html.append('<li>' + line + '</li>')
            else:
                html.append(f'<p>{line}</p>')
    return '\n'.join(html)

def slugify(title):
    s = title.lower().replace(':','').replace('—','').replace(',','')
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    return re.sub(r'\s+', '-', s.strip())[:60]

def build_article(slug, seo_title, meta_desc, h1_text, tag, content):
    filename = f'seo-{slug}.html'
    cta = '''<div class="seo-cta">
    <p><strong>Your space has an energy signature.</strong> Upload a photo and let AI analyse your Five Element balance — free, instant, personalised.</p>
    <a href="../feng-shui-scan.html">✦ Try the AI Feng Shui Scanner</a>
  </div>'''

    body = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>{seo_title}</title>
<meta name="description" content="{meta_desc}"/>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-D0X4ESE9RL"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){{dataLayer.push(arguments);}}
gtag('js', new Date());
gtag('config', 'G-D0X4ESE9RL');
</script>
<script defer src="/_vercel/insights/script.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>{BLOG_CSS}</style>
<script>
document.addEventListener('click', function(e){{
  var link = e.target.closest('a');
  if (!link) return;
  var href = link.getAttribute('href') || '';
  if (href.includes('gumroad')) {{
    gtag('event','purchase_click',{{'event_category':'conversion','event_label':'Gumroad Checkout','page_path':window.location.pathname}});
  }}
  if (href.includes('feng-shui-scan')) {{
    gtag('event','page_navigation',{{'event_category':'funnel','event_label':'To Feng Shui Scan','page_path':window.location.pathname}});
  }}
}});
</script>
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{h1_text}",
  "url": "https://eastern-five-elements.vercel.app/blog/{filename}",
  "description": "{meta_desc}",
  "articleSection": "feng-shui",
  "author": {{"@type":"Organization","name":"Guanlan Energy"}},
  "publisher": {{"@type":"Organization","name":"Guanlan Energy"}},
  "inLanguage": "en-US"
}}
</script>
</head>
<body>
<nav>{NAV}</nav>
<article>
  <div class="wrap">
    <div class="article-meta"><span class="tag">{tag}</span></div>
    <h1>{h1_text}</h1>
    {content}
    {cta}
  </div>
</article>
{FOOTER}
</body>
</html>'''
    return filename, body


# Load markdown content
MD_FILE = os.path.join(SITE_DIR, "seo_content_plan_30days.md")
with open(MD_FILE) as f:
    md_content = f.read()

# Split articles by "## Article"
sections = md_content.split('## Article ')
articles_raw = []
for s in sections[1:]:
    lines = s.strip().split('\n')
    num = lines[0].strip()
    # Get title from "**SEO Title:**" or first line
    seo_title = ''
    meta_desc = ''
    h1 = ''
    tag = 'Feng Shui'
    for line in lines:
        if line.startswith('**SEO Title:**'):
            seo_title = line[14:].strip()
        elif line.startswith('**Meta Description:**'):
            meta_desc = line[21:].strip()
        elif line.startswith('# ') and not h1:
            h1 = line[2:].strip()
    # Find the first # heading for h1
    for line in lines:
        if line.startswith('# ') and not line.startswith('# ' + h1):
            pass
    
    # Find content start (after the --- line)
    content_start = 0
    for i, line in enumerate(lines):
        if line.strip() == '---':
            content_start = i + 1
            break
    
    content_lines = lines[content_start:]
    # Remove CTA links at the bottom
    content_text = '\n'.join(content_lines)
    # Remove the final link line
    content_text = re.sub(r'→.*\[.*\]\(.*\)', '', content_text)
    content_text = re.sub(r'\[Link:.*\]\(.*\)', '', content_text)
    content_text = re.sub(r'\*\*→.*\*\*', '', content_text)
    
    if seo_title and meta_desc:
        slug = slugify(seo_title)
        h1_text = h1 or seo_title
        html_content = md_to_html(content_text)
        articles_raw.append((slug, seo_title, meta_desc, h1_text, tag, html_content))

# If parsing failed, use hardcoded data
if len(articles_raw) < 10:
    print(f"Parsed {len(articles_raw)} articles from markdown, using hardcoded...")
    articles_raw = []

if not articles_raw:
    # Hardcoded fallback for critical data
    article_data = [
        ("fix-bad-bedroom-energy", "How to Fix Bad Bedroom Energy: A Five Elements Guide to Restful Sleep", "Waking up exhausted? Your bedroom's energy may be out of balance. Learn how to identify and fix bad bedroom energy using ancient Five Elements wisdom.", "How to Fix Bad Bedroom Energy: A Five Elements Guide to Restful Sleep", "Feng Shui"),
        ("five-elements-office-decor", "Five Elements Decor for Your Office: Boost Productivity with Ancient Chinese Wisdom", "Your workspace is draining your energy without you knowing. Discover how to arrange your office using Five Elements decor for focus and creativity.", "Five Elements Decor for Your Office: Boost Productivity with Ancient Chinese Wisdom", "Feng Shui"),
        ("feng-shui-living-room-layout", "Feng Shui Living Room Layout Guide: Arrange Your Space for Flow and Connection", "Your living room layout affects how your family connects. Learn the Five Elements approach to arranging furniture and creating energetic harmony.", "Feng Shui Living Room Layout Guide: Arrange Your Space for Flow and Connection", "Feng Shui"),
        ("best-colors-home-energy", "Best Colors for Home Energy Balance: A Five Elements Room-by-Room Guide", "Colour is more than decoration — it's energy. Discover the best colours for each room based on Five Elements wisdom.", "Best Colors for Home Energy Balance: A Five Elements Room-by-Room Guide", "Feng Shui"),
        ("five-elements-personality-test", "Chinese Five Elements Personality Test: Discover Your Elemental Type (Free)", "Take our free Chinese Five Elements personality test. Based on your birth date, discover your Wood, Fire, Earth, Metal, or Water type.", "Chinese Five Elements Personality Test: Discover Your Elemental Type", "Personality"),
        ("what-does-my-birth-element-mean", "What Does My Birth Element Mean? A Complete Guide to Your Five Elements Profile", "Your birth element reveals your natural energy, hidden strengths, and what you need to feel balanced. Understand your Five Elements profile.", "What Does My Birth Element Mean? A Complete Guide to Your Five Elements Profile", "Elements"),
        ("balance-wood-element-home", "How to Balance Wood Element in Your Home: Decor Tips for Growth Energy", "Too much Wood energy creates restlessness. Too little creates stagnation. Learn to balance the Wood element with simple home decor adjustments.", "How to Balance Wood Element in Your Home: Decor Tips for Growth Energy", "Feng Shui"),
        ("water-element-decor-calm", "Water Element Decor: Create a Calm Sanctuary with Five Elements Design", "Water is the element of stillness and depth. Learn how to use Water element decor to transform any room into a calm, meditative sanctuary.", "Water Element Decor: Create a Calm Sanctuary with Five Elements Design", "Feng Shui"),
        ("fire-balance-better-sleep", "Fire Element Balance for Better Sleep: Calm Your Energy at Night", "Can't sleep because your mind won't stop? You may have excess Fire energy. Learn to balance the Fire element for deep, restorative sleep.", "Fire Element Balance for Better Sleep: Calm Your Energy at Night", "Wellness"),
        ("earth-element-home-styling", "Earth Element Home Styling Tips: Ground Your Space with Five Elements Design", "Earth energy makes a home feel safe, warm, and welcoming. Learn how to use Earth element styling to create a space that nurtures and stabilises.", "Earth Element Home Styling Tips: Ground Your Space with Five Elements Design", "Feng Shui"),
    ]
    # Create placeholder content
    for slug, seo_t, meta_d, h1_t, tg in article_data:
        articles_raw.append((slug, seo_t, meta_d, h1_t, tg, '<p>Article content loading...</p>'))

# Generate HTML files
generated = []
for slug, seo_t, meta_d, h1_t, tg, content in articles_raw:
    filename, html = build_article(slug, seo_t, meta_d, h1_t, tg, content)
    path = os.path.join(BLOG_DIR, filename)
    with open(path, 'w') as f:
        f.write(html)
    generated.append(filename)
    print(f"✓ {filename}")

print(f"\n✅ {len(generated)} SEO articles created in {BLOG_DIR}")
