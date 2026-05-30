#!/usr/bin/env python3
"""Replace all visible Chinese text on the website with English equivalents.
Keeps JS code comments and backend logic intact."""

import os
import re

SITE_ROOT = '/Users/yihua/.openclaw/workspace/my-website'

replacements = {
    # Popup seal
    '免费': 'FREE',
    # Nav
    '观澜能量 · 东方五行': 'Five Elements · Wu Xing Energy',
    'EASTERN FIVE ELEMENTS · 东方五行能量 · ©': 'GUANLAN ENERGY · Five Elements Wisdom · ©',
    # About page
    'Guanlan · 观澜': 'Guanlan · Observe the Ripples',
    '观水观山观自在 · 澜生万象': 'Stillness observes the surface. Wisdom reads the depth.',
    'Guanlan (观澜) bridges': 'Guanlan bridges',
    # Scan page
    '天地有正气 · 空间有能量': 'Heaven and Earth have a righteous energy — your space holds its own.',
    # Hero
    'GUANLAN · 观澜': 'GUANLAN · Observe the Ripples',
    # Section labels
    'FULL READING · 完整解盘': 'FULL READING · Your Cosmic Blueprint',
    'YOUR FIVE ELEMENT BALANCE · 五行能量图': 'YOUR FIVE ELEMENT BALANCE',
    'FASHION ENERGY · 穿搭能量': 'FASHION ENERGY · Dress Your Element',
    'CRYSTALS & METALS · 首饰能量': 'CRYSTALS & METALS · Wear Your Power',
    'HAIR ENERGY · 发型能量': 'HAIR ENERGY · Your Aura Frame',
    'LOVE ENERGY · 恋爱能量': 'LOVE ENERGY · Heart & Elements',
    "TODAY'S ENERGY MESSAGE · 今日能量": "TODAY'S ENERGY MESSAGE",
    'LATEST STORIES · 精选文章': 'LATEST STORIES',
    # Footer
    'Ancient Chinese wisdom reimagined for the modern soul': 'Ancient wisdom reimagined for the modern soul',
    # SEO descriptions
    'Guanlan (观澜) bridges ancient Eastern wisdom and modern aesthetics.': 'Guanlan bridges ancient Eastern wisdom and modern aesthetics.',
}

def clean_file(path):
    with open(path, 'r') as f:
        content = f.read()
    
    original = content
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    # Also handle Chinese in visible text (but NOT in JS comments or code)
    # Remove Chinese for time selectors (亥时 → Hai时辰, etc.)
    hour_map = {
        '子时 · 11pm – 1am': 'Zi (11pm – 1am)',
        '丑时 · 1am – 3am': 'Chou (1am – 3am)',
        '寅时 · 3am – 5am': 'Yin (3am – 5am)',
        '卯时 · 5am – 7am': 'Mao (5am – 7am)',
        '辰时 · 7am – 9am': 'Chen (7am – 9am)',
        '巳时 · 9am – 11am': 'Si (9am – 11am)',
        '午时 · 11am – 1pm': 'Wu (11am – 1pm)',
        '未时 · 1pm – 3pm': 'Wei (1pm – 3pm)',
        '申时 · 3pm – 5pm': 'Shen (3pm – 5pm)',
        '酉时 · 5pm – 7pm': 'You (5pm – 7pm)',
        '戌时 · 7pm – 9pm': 'Xu (7pm – 9pm)',
        '亥时 · 9pm – 11pm': 'Hai (9pm – 11pm)',
    }
    for old, new in hour_map.items():
        content = content.replace(old, new)
    
    # Esoteric background text
    content = content.replace('道 法 自 然 太 极 無 極', 'T A O · N A T U R E · C O S M O S')
    content = content.replace('天 地 玄 黄 宇 宙 洪 荒', 'H E A V E N · E A R T H · U N I V E R S E')
    content = content.replace('风 水 能 量 天 地 人', 'F E N G · S H U I · E N E R G Y')
    
    if content != original:
        with open(path, 'w') as f:
            f.write(content)
        return True
    return False

# Process all HTML files
count = 0
for dirpath, dirnames, files in os.walk(SITE_ROOT):
    for f in sorted(files):
        if f.endswith('.html'):
            path = os.path.join(dirpath, f)
            if clean_file(path):
                print(f"✓ {os.path.relpath(path, SITE_ROOT)}")
                count += 1

print(f"\n✅ {count} files cleaned of Chinese text")
