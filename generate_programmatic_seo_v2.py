#!/usr/bin/env python3
"""
Programmatic SEO — 五行 × 空间场景 组合页面生成器

逻辑：5种元素 × 10个空间 + 5种元素 × 8个决策场景 = ~90个页面
每页：300字定制建议 + 五行工具嵌入 + Newsletter订阅

用法：python3 generate_programmatic_seo.py
"""

import os

OUTPUT_DIR = '/Users/yihua/.openclaw/workspace/my-website/pages'

ELEMENTS = {
    'wood': {'name': 'Wood', 'symbol': '🌲', 'season': 'Spring', 'color': 'Green, teal',
             'shape': 'Rectangular', 'motto': 'Growth, expansion, upward momentum',
             'shadow': 'Restlessness, overexpansion', 'balance_need': 'Metal + Earth'},
    'fire': {'name': 'Fire', 'symbol': '🔥', 'season': 'Summer', 'color': 'Red, orange, purple',
             'shape': 'Triangular', 'motto': 'Passion, visibility, transformation',
             'shadow': 'Burnout, aggression', 'balance_need': 'Water + Earth'},
    'earth': {'name': 'Earth', 'symbol': '🌍', 'season': 'Late Summer', 'color': 'Yellow, beige, brown',
              'shape': 'Square', 'motto': 'Nurture, stability, connection',
              'shadow': 'Stagnation, over-giving', 'balance_need': 'Wood + Metal'},
    'metal': {'name': 'Metal', 'symbol': '💎', 'season': 'Autumn', 'color': 'White, gray, silver',
              'shape': 'Round', 'motto': 'Precision, structure, refinement',
              'shadow': 'Rigidity, perfectionism', 'balance_need': 'Fire + Water'},
    'water': {'name': 'Water', 'symbol': '💧', 'season': 'Winter', 'color': 'Black, dark blue',
              'shape': 'Wavy', 'motto': 'Depth, intuition, strategy',
              'shadow': 'Isolation, overthinking', 'balance_need': 'Earth + Wood'},
}

SCENES = {
    'bedroom': {'name': 'Bedroom', 'kw': 'bedroom feng shui layout'},
    'home-office': {'name': 'Home Office', 'kw': 'home office feng shui productivity'},
    'living-room': {'name': 'Living Room', 'kw': 'living room layout energy'},
    'kitchen': {'name': 'Kitchen', 'kw': 'kitchen feng shui design'},
    'study': {'name': 'Study Room', 'kw': 'study room feng shui deep work'},
    'bathroom': {'name': 'Bathroom', 'kw': 'bathroom feng shui self care'},
    'entryway': {'name': 'Entryway', 'kw': 'entryway feng shui entrance energy'},
    'garden': {'name': 'Garden', 'kw': 'garden feng shui outdoor energy'},
    'children-room': {'name': "Children's Room", 'kw': "children's room feng shui"},
    'dining': {'name': 'Dining Room', 'kw': 'dining room feng shui family energy'},
}

DECISIONS = {
    'career-change': {'name': 'Career Change', 'kw': 'career change decision making'},
    'relationship': {'name': 'Relationship Conflict', 'kw': 'relationship advice conflict'},
    'burnout': {'name': 'Burnout Recovery', 'kw': 'burnout recovery energy management'},
    'team-management': {'name': 'Team Management', 'kw': 'team management leadership'},
    'financial': {'name': 'Financial Decision', 'kw': 'financial decision mindset'},
    'creativity': {'name': 'Creativity Block', 'kw': 'creative block inspiration'},
    'relocation': {'name': 'Relocation Decision', 'kw': 'moving decision guide'},
    'health': {'name': 'Health Routine', 'kw': 'healthy routine wellness habits'},
}

PLACEMENT = {
    ('wood','bedroom'):'Position your bed facing East. Avoid clutter under the bed.',
    ('wood','home-office'):'Face East or Southeast. Keep plants visible from your desk.',
    ('wood','living-room'):'L-shaped seating opening East. Keep center clear.',
    ('wood','kitchen'):'Stove facing East. Open shelving supports growth energy.',
    ('wood','study'):'Face East with a plant on your left. Books visible, not hidden.',
    ('wood','bathroom'):'Tall plant in corner. Keep drains covered.',
    ('wood','entryway'):'Tall plant by entrance. Vertical storage.',
    ('wood','garden'):'Vertical planting — trellises, tall grasses, bamboo.',
    ('wood','children-room'):'Bed facing East. Climbing/growth space. Green accents.',
    ('wood','dining'):'Oval or rectangular table. Fresh flowers centerpiece.',
    ('fire','bedroom'):'Bed facing South. No red walls — dimmers essential.',
    ('fire','home-office'):'Face South. Warm task lighting. No fluorescents.',
    ('fire','living-room'):'Candles or fireplace as focal point. U-shaped seating.',
    ('fire','kitchen'):'Stove in South. Open flame aligns with Fire nature.',
    ('fire','study'):'Warm task light pointed at work surface. No blue-white light.',
    ('fire','bathroom'):'Warm-toned lighting. No cold blue light.',
    ('fire','entryway'):'Warm lamp or candle. Red/orange accent piece.',
    ('fire','garden'):'Fire pit in South section. Red/purple flowering plants.',
    ('fire','children-room'):'Bed facing South. Small red accents only.',
    ('fire','dining'):'Round table. Warm lighting. Candle centerpiece.',
    ('earth','bedroom'):'Bed against solid wall. Center of room is power position.',
    ('earth','home-office'):'Desk in center or against solid wall. Heavy desk.',
    ('earth','living-room'):'Large central coffee table. Heavy curtains.',
    ('earth','kitchen'):'Earthenware cookware. Earth-tone walls. Sturdy table.',
    ('earth','study'):'Heavy wooden desk center. Comfortable armchair.',
    ('earth','bathroom'):'Terracotta tiles. Natural stone. Plants in clay pots.',
    ('earth','entryway'):'Solid bench. Ceramic piece. Warm amber lighting.',
    ('earth','garden'):'Stone pathways. Ceramic pots. Solid earth underfoot.',
    ('earth','children-room'):'Bed against sturdiest wall. Earth-tone rug.',
    ('earth','dining'):'Square or round sturdy table. Ceramic serveware.',
    ('metal','bedroom'):'Solid headboard. Minimal decor. White or gray bedding.',
    ('metal','home-office'):'Clean metal desk. Precise cable management.',
    ('metal','living-room'):'Geometric shapes. Round coffee table. Minimal.',
    ('metal','kitchen'):'Stainless steel. Clean counters. Organized drawers.',
    ('metal','study'):'Minimalist desk. Everything has a drawer.',
    ('metal','bathroom'):'White tiles. Minimal products. Polished fixtures.',
    ('metal','entryway'):'Sleek console table. Round mirror. Nothing on floor.',
    ('metal','garden'):'Geometric planters. Structured landscaping.',
    ('metal','children-room'):'Clean organized storage. White base with accents.',
    ('metal','dining'):'Round or oval table. Clean lines. White tableware.',
    ('water','bedroom'):'Bed against North wall. Dark curtains. Small water feature.',
    ('water','home-office'):'Face North. Water element on desk (glass, fountain).',
    ('water','living-room'):'Dimmable lighting. Curved furniture. Aquarium focal.',
    ('water','kitchen'):'Dark cabinetry. Curved island. Water filter station.',
    ('water','study'):'Face North. Dim lighting. Fountain. Comfortable chair.',
    ('water','bathroom'):'Bathtub essential. Dark tiles. Candlelight.',
    ('water','entryway'):'Curved mirror. Dark blue accent. Soft indirect light.',
    ('water','garden'):'Pond or water feature. Wavy pathways. Curved beds.',
    ('water','children-room'):'Dark blue accent. Curved furniture. Tabletop fountain.',
    ('water','dining'):'Curved or wavy table. Dark blue accents. Dimmable light.',
}

DECOR = {
    ('wood','bedroom'):'Tall plants, wooden headboard, green textiles, vertical art',
    ('wood','home-office'):'Desk plant, vertical shelving, wooden accessories, vision board',
    ('wood','living-room'):'Large potted plant, wooden coffee table, nature prints',
    ('wood','kitchen'):'Wooden cutting boards, herb garden, bamboo accessories',
    ('wood','study'):'Bookshelf (open), wooden desk, plant, nature photography',
    ('wood','bathroom'):'Bamboo mat, eucalyptus plant, wooden storage',
    ('wood','entryway'):'Tall branches in vase, wooden shoe bench, plant',
    ('wood','garden'):'Vertical garden, bamboo, climbing roses, wooden pergola',
    ('wood','children-room'):'Wooden toys, plant-shaped lamp, green storage bins',
    ('wood','dining'):'Fresh flowers, wooden platters, bamboo placemats',
    ('fire','bedroom'):'Dimmer lamp, warm-toned art, one red accent, candles',
    ('fire','home-office'):'Warm desk lamp, inspirational frames, red mousepad',
    ('fire','living-room'):'Candles, warm throws, sun imagery art, warm lighting',
    ('fire','kitchen'):'Red kettle, warm tea set, copper cookware',
    ('fire','study'):'Warm desk lamp, amber glass, inspiring art',
    ('fire','bathroom'):'Scented candles, warm towels, copper fixtures',
    ('fire','entryway'):'Warm-toned lamp, red/orange vase, sun art',
    ('fire','garden'):'String lights, fire pit, red flowering plants',
    ('fire','children-room'):'Warm nightlight, red storage, sun decals',
    ('fire','dining'):'Candles, warm tablecloth, copper serveware',
    ('earth','bedroom'):'Ceramic lamp, terracotta vase, heavy curtains, earth bedding',
    ('earth','home-office'):'Ceramic mug, stone paperweight, earth desk mat',
    ('earth','living-room'):'Ceramic decor, square coffee table, earth-tone rug',
    ('earth','kitchen'):'Clay cookware, ceramic plates, stone mortar',
    ('earth','study'):'Ceramic pen holder, stone bookends, earthenware tea set',
    ('earth','bathroom'):'Terracotta planters, stone dispenser, ceramic jars',
    ('earth','entryway'):'Ceramic bowl for keys, stone sculpture, terracotta pot',
    ('earth','garden'):'Terracotta pots, stone pathway, ceramic bird bath',
    ('earth','children-room'):'Ceramic bank, earth-tone storage, plush rug',
    ('earth','dining'):'Ceramic serveware, stone coasters, earthenware pitcher',
    ('metal','bedroom'):'Metal mirror, glass lamp, cream linen, streamlined nightstand',
    ('metal','home-office'):'Metal desk lamp, glass stand, whiteboard, organizer',
    ('metal','living-room'):'Metal sculpture, glass table, round mirror',
    ('metal','kitchen'):'Stainless cookware, glass storage, utensil organizer',
    ('metal','study'):'Metal lamp, glass paperweight, document organizer',
    ('metal','bathroom'):'Metal towel rack, glass shelf, chrome fixtures, round mirror',
    ('metal','entryway'):'Round mirror, metal key hook, minimalist stand',
    ('metal','garden'):'Metal planters, geometric trellis, glass ornaments',
    ('metal','children-room'):'Metal-framed bed, organized storage, simple lamp',
    ('metal','dining'):'Metal flatware, glassware, round white plates',
    ('water','bedroom'):'Tabletop fountain, dark linens, curved mirror, dimmable sconces',
    ('water','home-office'):'Desk fountain, curved monitor riser, blue accessories',
    ('water','living-room'):'Aquarium or fountain, curved sofa, dark blue decor',
    ('water','kitchen'):'Glass water dispenser, curved island, blue accents',
    ('water','study'):'Small fountain, curved lamp, wavy bookends, blue ink',
    ('water','bathroom'):'Bathtub caddy, waterfall shower, dark towels, curved mirror',
    ('water','entryway'):'Curved table, wave rug, dark blue accent, flow art',
    ('water','garden'):'Koi pond, wavy pathways, flowing grasses, blue flowers',
    ('water','children-room'):'Wave decals, blue nightlight, curved bookshelf',
    ('water','dining'):'Wavy table runner, blue glassware, curved platters',
}

def generate_space_page(el_key, scene_key):
    el = ELEMENTS[el_key]
    scene = SCENES[scene_key]
    
    filename = f'{el_key}-{scene_key}-feng-shui.html'
    title = f"{el['symbol']} {el['name']} Element {scene['name']} — Feng Shui Guide for {el['name']} Personalities"
    meta = f"Discover the perfect {scene['name'].lower()} layout for {el['name']} element personalities."
    
    advice = f"""
<p>If you're a {el['name']} element, your {scene['name'].lower()} should honor your natural {el['motto'].lower()} while balancing your tendency toward {el['shadow'].lower()}.</p>

<h2>Best Layout</h2>
<p>{PLACEMENT.get((el_key,scene_key), 'Follow basic Five Elements principles for your space.')}</p>

<h2>Colors That Support You</h2>
<p>Primary: {el['color']}. {el['name']} energy thrives in {el['season'].lower()} conditions — lean into those tones. Shape: {el['shape']} forms.</p>

<h2>Essential Decor</h2>
<p>{DECOR.get((el_key,scene_key), 'Choose items that resonate with your element.')}</p>

<h2>What to Avoid</h2>
<p>Most {el['name'].lower()} people overload their {scene['name'].lower()} with their own element's energy. You need balance from {el['balance_need']} to feel truly at home.</p>
"""
    return filename, title, meta, advice

def generate_decision_page(el_key, dec_key):
    el = ELEMENTS[el_key]
    dec = DECISIONS[dec_key]
    
    filename = f'{el_key}-{dec_key}-decision-guide.html'
    title = f"{el['symbol']} {el['name']} Element — How to Handle {dec['name']} Using Five Elements Wisdom"
    meta = f"Learn how {el['name']} element personalities approach {dec['name'].lower()}."
    
    advice = f"""
<p>As a {el['name']} element, your approach to {dec['name'].lower()} is shaped by your {el['motto'].lower()}. But this strength can become your blind spot when stress hits — leading to {el['shadow'].lower()}.</p>

<h2>Your Natural Pattern</h2>
<p>In {dec['name'].lower()}, {el['name'].lower()} people tend to {'push harder' if el_key in ['wood','fire'] else 'withdraw and reflect' if el_key in ['water','metal'] else 'maintain the status quo'}. Neither is wrong — but neither is complete.</p>

<h2>Bring In the Missing Element</h2>
<p>Your balance comes from {el['balance_need']}. When facing a {dec['name'].lower()}, consciously invite that opposing energy — talk to someone who thinks differently, or adjust your environment to include their element.</p>

<h2>Timing Matters</h2>
<p>Your {el['season'].lower()} energy peaks in {el['season']}. For major decisions, align with that season when possible. During opposite seasons ({'Autumn' if el_key in ['wood','fire'] else 'Spring' if el_key in ['metal','water'] else 'Winter'}), slow down and gather information instead of acting.</p>
"""
    return filename, title, meta, advice


def write_page(filename, title, meta, advice, el_key, scene_key, is_decision=False):
    tool_link = (f'https://eastern-five-elements.vercel.app'
                 f'?utm_source=seo_{"decision" if is_decision else "space"}'
                 f'&utm_medium=page&utm_campaign={el_key}_{scene_key}')
    
    # Build related links
    related = '<ul>'
    for other in ELEMENTS:
        if other != el_key:
            prefix = f'{other}-{scene_key}'
            suffix = '-decision-guide' if is_decision else '-feng-shui'
            url = f'/pages/{prefix}{suffix}.html'
            label = f"{ELEMENTS[other]['symbol']} {ELEMENTS[other]['name']}" if not is_decision else f"{ELEMENTS[other]['symbol']} {ELEMENTS[other]['name']} — {SCENES.get(scene_key, DECISIONS.get(scene_key,{'name':''}))['name']}"
            related += f'<li><a href="{url}">{label}</a></li>'
    related += '</ul>'
    
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>{title}</title>
<meta name="description" content="{meta}"/>
<link rel="canonical" href="https://eastern-five-elements.vercel.app/pages/{filename}"/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=EB+Garamond:wght@400;500&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{background:#06100c;color:#f0ebe0;font-family:'EB Garamond',serif;line-height:1.8;padding:40px 20px}}
.container{{max-width:720px;margin:0 auto}}
h1{{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:32px;letter-spacing:2px;color:#e8d4a0;margin-bottom:8px;border-bottom:1px solid rgba(201,168,76,.1);padding-bottom:16px}}
h2{{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:22px;color:#c9a84c;margin:32px 0 12px;letter-spacing:1px}}
h3{{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:18px;color:#e8d4a0;margin:24px 0 10px}}
p{{font-size:17px;color:rgba(240,235,224,.85);margin-bottom:16px;line-height:1.9}}
a{{color:#c9a84c;text-decoration:none}}
a:hover{{color:#e8d4a0}}
ul{{margin:12px 0 20px 20px}}
li{{margin-bottom:8px;font-size:16px;color:rgba(240,235,224,.75)}}
.cta-box{{margin:40px 0;padding:30px 20px;border:1px solid rgba(201,168,76,.15);text-align:center;background:rgba(240,235,224,.02)}}
.cta-box p{{font-size:15px;color:#e8d4a0;margin-bottom:12px;letter-spacing:1px;text-transform:uppercase}}
.cta-box .sub{{font-size:13px;color:rgba(240,235,224,.55);margin-bottom:18px;text-transform:none;letter-spacing:0}}
.cta-btn{{display:inline-block;padding:10px 28px;background:#c9a84c;color:#06100c;font-weight:600;font-size:13px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;transition:background .3s}}
.cta-btn:hover{{background:#e8d4a0;color:#06100c}}
.related{{margin-top:48px;padding-top:24px;border-top:1px solid rgba(201,168,76,.08)}}
.related h3{{font-size:16px;color:#c9a84c;margin-bottom:12px}}
footer{{text-align:center;padding:30px 0;font-size:12px;color:rgba(240,235,224,.35);border-top:1px solid rgba(201,168,76,.08);margin-top:60px}}
</style>
</head>
<body>
<div class="container">
<h1>{title}</h1>
{advice}
<div class="cta-box">
<p>Not sure if you're {ELEMENTS[el_key]['name']}?</p>
<p class="sub">Take the free 2-minute assessment to discover your dominant element and get personalized advice for your {SCENES.get(scene_key, DECISIONS.get(scene_key,{'name':''}))['name'].lower()}.</p>
<a class="cta-btn" href="{tool_link}">Find Your Element →</a>
</div>
<div class="related">
<h3>Explore Other Elements</h3>
{related}
</div>
</div>
<footer>Guanlan — Eastern Five Elements · Discover your blueprint</footer>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-D0X4ESE9RL"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){{dataLayer.push(arguments);}}
gtag('js', new Date());
gtag('config', 'G-D0X4ESE9RL');
</script>
</body>
</html>'''
    
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, 'w') as f:
        f.write(html)
    print(f'  ✓ {filename}')
    return filename


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    total = 0
    
    # Space pages: 5 × 10 = 50
    for el_key in ELEMENTS:
        for scene_key in SCENES:
            filename, title, meta, advice = generate_space_page(el_key, scene_key)
            write_page(filename, title, meta, advice, el_key, scene_key, is_decision=False)
            total += 1
    
    # Decision pages: 5 × 8 = 40
    for el_key in ELEMENTS:
        for dec_key in DECISIONS:
            filename, title, meta, advice = generate_decision_page(el_key, dec_key)
            write_page(filename, title, meta, advice, el_key, dec_key, is_decision=True)
            total += 1
    
    print(f'\n✅ Generated {total} pages to {OUTPUT_DIR}')
    return total


if __name__ == '__main__':
    main()
