#!/usr/bin/env python3
"""Redesign index.html: bigger fonts, stronger Chinese aesthetics, more esoteric elements"""

import re

path = '/Users/yihua/.openclaw/workspace/my-website/index.html'
with open(path, 'r') as f:
    html = f.read()

# === 1. ADD ESOTERIC CSS VARIABLES + ENHANCED STYLES ===
insertion_point = 'html{scroll-behavior:smooth}'
new_css = '''html{scroll-behavior:smooth}
/* ── ESOTERIC ENHANCEMENTS ── */
@font-face{font-family:'SealScript';src:local('STKaiti'),local('KaiTi'),local('Noto Serif SC');}
:root{
  --seal:#c23a2b; --seal-dim:rgba(194,58,43,.15);
  --gold:#c9a84c; --gold2:#e8d4a0; --gold3:rgba(201,168,76,.12);
  --ink:#06100c; --ink2:#0d1f17;
  --jade:#2d5a3d; --cream:#f0ebe0;
  --text:#f0ebe0; --muted:rgba(240,235,224,.55);
}
.esoteric-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.esoteric-bg .ba-gua{
  position:absolute;top:8%;left:5%;font-size:80px;opacity:.04;
  animation:rotateSlow 60s linear infinite;font-family:serif;
}
.esoteric-bg .ba-gua-2{top:auto;bottom:10%;right:6%;left:auto;animation-direction:reverse}
.esoteric-bg .cloud-line{
  position:absolute;font-size:6px;letter-spacing:20px;color:var(--gold);opacity:.03;
  writing-mode:vertical-rl;font-family:'Noto Serif SC',serif;
}
.esoteric-bg .cloud-line-1{top:15%;right:3%;line-height:3}
.esoteric-bg .cloud-line-2{bottom:20%;left:2%;top:auto;line-height:2.5;opacity:.02}
@keyframes rotateSlow{to{transform:rotate(360deg)}}

/* ── SEAL STAMP ── */
.seal-stamp{
  display:inline-flex;align-items:center;justify-content:center;
  width:44px;height:44px;
  border:2px solid var(--seal);color:var(--seal);
  font-family:'Noto Serif SC',serif;
  font-size:16px;letter-spacing:0;line-height:1;
  transform:rotate(-3deg);opacity:.7;
  flex-shrink:0;
}

/* ── ENHANCED NAV ── */
.nav-links a{position:relative}
.nav-links a::after{
  content:'';position:absolute;bottom:-4px;left:50%;width:0;height:1px;
  background:var(--gold);transition:all .3s;transform:translateX(-50%);
}
.nav-links a:hover::after{width:70%}

/* ── HERO ENHANCEMENTS ── */
.hero-trigram{font-size:14px;letter-spacing:8px;color:var(--gold);opacity:.3;margin-bottom:12px}
.hero-chinese-sub{
  font-family:'Noto Serif SC',serif;font-size:14px;color:var(--muted);
  letter-spacing:4px;margin-bottom:20px;font-weight:300;
}

/* ── BIGGER FONTS ── */
body{font-size:17px;line-height:1.85}
.section-label{font-size:11px;letter-spacing:3px}
.section-title{font-size:clamp(22px,3vw,30px)}
.article p{font-size:17px;line-height:1.9}
.article h1{font-size:clamp(36px,6vw,56px)}
.article h2{font-size:clamp(24px,3.5vw,32px)}
.article h3{font-size:21px}

/* ── CHINESE DIVIDER ── */
.cn-divider{
  display:flex;align-items:center;gap:12px;margin:30px auto;justify-content:center;
}
.cn-divider::before,.cn-divider::after{
  content:'';width:30px;height:1px;background:var(--gold);opacity:.2;
}
.cn-divider span{font-size:14px;color:var(--gold);opacity:.3;letter-spacing:4px}

/* ── PULL QUOTE ENHANCED ── */
.pull-quote-cn{
  position:relative;padding:28px 32px 28px 48px;margin:40px 0;
  font-family:'Cormorant Garamond',serif;font-size:20px;font-style:italic;
  line-height:1.6;color:var(--gold2);
  border-left:2px solid var(--gold);background:rgba(201,168,76,.04);
}
.pull-quote-cn::before{
  content:'「';position:absolute;top:4px;left:14px;
  font-size:28px;color:var(--gold);opacity:.3;font-style:normal;
}

/* ── SNAKE / BIOMORPHIC DIVIDER ── */
.snake-divider{text-align:center;font-size:18px;color:var(--gold);opacity:.12;letter-spacing:12px;margin:30px 0}'''

html = html.replace(insertion_point, new_css)

# === 2. ADD ESOTERIC BACKGROUND ELEMENTS ===
# Insert after <div class="bg-layer"> 
old_bg = '<div class="bg-layer">'
new_bg = '''<div class="esoteric-bg">
  <div class="ba-gua">☰</div>
  <div class="ba-gua ba-gua-2">☷</div>
  <div class="cloud-line cloud-line-1">道 法 自 然 太 极 無 極</div>
  <div class="cloud-line cloud-line-2">天 地 玄 黄 宇 宙 洪 荒</div>
</div>
<div class="bg-layer">'''
html = html.replace(old_bg, new_bg)

# === 3. ADD SEAL TO NAV LOGO ===
old_nav_logo = '''<a href="#top" class="nav-logo"><div class="logo-symbol"><svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="19" cy="19" r="18" stroke="rgba(201,168,76,0.4)" stroke-width="1"/><circle cx="19" cy="19" r="12" stroke="rgba(201,168,76,0.2)" stroke-width="1"/><circle cx="19" cy="10" r="2" fill="rgba(201,168,76,0.6)"/><circle cx="27.6" cy="24" r="2" fill="rgba(201,168,76,0.4)"/><circle cx="10.4" cy="24" r="2" fill="rgba(201,168,76,0.4)"/><line x1="19" y1="19" x2="19" y2="10" stroke="rgba(201,168,76,0.3)" stroke-width="1"/><line x1="19" y1="19" x2="27.6" y2="24" stroke="rgba(201,168,76,0.3)" stroke-width="1"/><line x1="19" y1="19" x2="10.4" y2="24" stroke="rgba(201,168,76,0.3)" stroke-width="1"/></svg></div><div><div class="nav-name">EASTERN FIVE ELEMENTS</div><div class="nav-sub">东方五行能量</div></div></a>'''

new_nav_logo = '''<a href="#top" class="nav-logo"><div class="seal-stamp">观澜</div><div><div class="nav-name">GUANLAN</div><div class="nav-sub">观澜能量 · 东方五行</div></div></a>'''
html = html.replace(old_nav_logo, new_nav_logo)

# === 4. REPLACE HERO TRIGRAM + CHINESE SUBTITLE ===
old_hero_sub = '<div class="hero-chinese" style="margin-bottom:20px">'
# Find the "ANCIENT WISDOM" badge and add trigram + chinese sub
old_badge = 'ANCIENT WISDOM · MODERN DISCOVERY'
new_badge = 'ANCIENT WISDOM · 观澜'

# Replace the hero subtitle section
old_hero_greeting = '''<div class="hero-greeting">
    <div class="hero-line"></div>
    ANCIENT WISDOM · MODERN DISCOVERY
  </div>
  <h1>Know Your <br><span class="gradient">True Energy</span></h1>
  <div class="hero-chinese" style="margin-bottom:20px">木 火 土 金 水</div>'''

new_hero_greeting = '''<div class="hero-greeting">
    <div class="hero-line"></div>
    ANCIENT WISDOM · 观澜
  </div>
  <div class="hero-trigram">☰ ☷ ☵ ☲ ☱</div>
  <h1>Know Your <br><span class="gradient">True Energy</span></h1>
  <div class="hero-chinese-sub">天命之谓性 · 率性之谓道</div>
  <div class="hero-chinese" style="margin-bottom:20px">木 火 土 金 水</div>'''

html = html.replace(old_hero_greeting, new_hero_greeting)

# === 5. ADD CHINESE DIVIDER BEFORE SECTION LABELS ===
# Add cn-divider before the Readings section
old_readings_section = '<div class="report-banner">'
new_readings_section = '<div class="cn-divider"><span>✦ ✦ ✦</span></div>\n\n<div class="report-banner">'
html = html.replace(old_readings_section, new_readings_section)

# === 6. ADD SNAKE DIVIDER BEFORE FOOTER NEWSLETTER ===
old_newsletter_start = '<div class="newsletter">'
new_newsletter_start = '<div class="snake-divider">☰ ☷ ☵ ☲ ☱ ☴ ☶ ☳</div>\n\n<div class="newsletter">'
html = html.replace(old_newsletter_start, new_newsletter_start)

with open(path, 'w') as f:
    f.write(html)

print("✅ index.html redesigned!")
print("Changes: bigger fonts, seal stamp, trigram decorations, Chinese dividers, esoteric background")
