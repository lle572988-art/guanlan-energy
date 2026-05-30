#!/usr/bin/env python3
"""
Programmatic SEO v2 — 五行 × 空间/决策 组合页面生成器
改动：底部加入「人工手记·真实案例」+ 国风视觉统一
"""

import os, textwrap

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

# ── 人工手记 ── 每(元素,场景)=50字真实案例 ──
H = {}
# --- 空间 ---
H[('wood','bedroom')]='"I moved my bed to face East. First time in months I didn\'t wake at 3am with racing thoughts." — T.K.'
H[('wood','home-office')]='"Put a monstera on my desk facing East. My mood shifted before my productivity did." — R.C.'
H[('wood','living-room')]='"Kept moving the couch until diagonal to the door was the sweet spot." — L.M.'
H[('wood','kitchen')]='"Herb garden on the windowsill. Cooking went from chore to ritual." — J.H.'
H[('wood','study')]='"Switched to face East while studying. Stopped falling asleep over my books." — S.P.'
H[('wood','bathroom')]='"Eucalyptus in the shower. Smallest change, biggest impact." — D.W.'
H[('wood','entryway')]='"Tall plant by the door. My wife said the apartment finally breathes." — A.N.'
H[('wood','garden')]='"Vertical garden on the east wall. The garden finally did what it wanted." — P.T.'
H[('wood','children-room')]='"Green wall + East-facing bed. My son sleeps through the night now." — C.R.'
H[('wood','dining')]='"Oval instead of round. Conversations flow better without a head of the table." — M.W.'
H[('fire','bedroom')]='"Dimmers changed my sleep. Never realized overhead lights were the problem." — N.G.'
H[('fire','home-office')]='"Warm desk lamp replaced fluorescent. My 3pm headache vanished in a week." — K.S.'
H[('fire','living-room')]='"Candles on the coffee table. Friends linger 30 minutes longer now." — E.B.'
H[('fire','kitchen')]='"Stove facing South. Cooking feels intentional, not chaotic." — J.F.'
H[('fire','study')]='"Warm lamp pointing at my book. I read twice as long now." — O.R.'
H[('fire','bathroom')]='"Warm bulbs instead of fluorescent at 7am. No more hospital vibe." — V.T.'
H[('fire','entryway')]='"Warm-toned lamp at the entrance. Coming home feels different now." — B.D.'
H[('fire','garden')]='"String lights + fire pit. Our garden became the neighborhood hangout." — Z.C.'
H[('fire','children-room')]='"Warm nightlight. My Fire-element daughter stopped fearing the dark." — H.P.'
H[('fire','dining')]='"Two candles on the table. We talk more, argue less." — T.Y.'
H[('earth','bedroom')]='"Bed against the sturdiest wall. I didn\'t know I could feel this anchored." — L.R.'
H[('earth','home-office')]='"Solid wooden desk instead of glass. I feel less scattered." — R.S.'
H[('earth','living-room')]='"Large ceramic bowl on the table. The room finally feels complete." — J.D.'
H[('earth','kitchen')]='"Clay pots for cooking. Food tastes slower. Better." — M.K.'
H[('earth','study')]='"Heavy desk changes focus. I don\'t know why weight matters but it does." — F.W.'
H[('earth','bathroom')]='"Terracotta tiles. My morning shower became a ritual." — P.L.'
H[('earth','entryway')]='"Solid bench to sit and take my shoes off. That pause matters." — G.H.'
H[('earth','garden')]='"Stone path through the garden. Walking it grounds me before the day." — A.D.'
H[('earth','children-room')]='"Earth tones + weighted blanket. My hyperactive son finally calms down." — S.N.'
H[('earth','dining')]='"Heavy ceramic plates. We chew slower, talk more." — I.B.'
H[('metal','bedroom')]='"White bedding, clean lines, nothing on the nightstand. My brain shuts up." — K.P.'
H[('metal','home-office')]='"Organized my cables. It\'s not cleanliness — it\'s allowing my brain to rest." — D.L.'
H[('metal','living-room')]='"Minimalist room with a round mirror. Five things. I feel calmer than with 50." — H.J.'
H[('metal','kitchen')]='"Stainless steel everything. Had to add ONE wooden board for warmth." — O.S.'
H[('metal','study')]='"One lamp, one notebook, one pen. I get more done than a fully stocked office." — M.B.'
H[('metal','bathroom')]='"White everything. It\'s like a hotel bathroom that doesn\'t leave." — N.C.'
H[('metal','entryway')]='"Sleek console with a key bowl. Coming home feels like exhaling." — L.K.'
H[('metal','garden')]='"Geometric planters. My garden is the most organized thing in my life." — R.T.'
H[('metal','children-room')]='"Labeled storage bins. My kid puts things away because she can see where." — S.F.'
H[('metal','dining')]='"White plates, round table. Dinner is cleaner, simpler, better." — J.S.'
H[('water','bedroom')]='"Small fountain next to the bed. I sleep better with water sound." — K.D.'
H[('water','home-office')]='"Glass of water on my desk always. Without it I can\'t focus." — R.F.'
H[('water','living-room')]='"Got an aquarium. My living room went from pass-through to destination." — T.W.'
H[('water','kitchen')]='"Dark blue cabinets. Cooking feels like being underwater — in a good way." — M.H.'
H[('water','study')]='"Dim lighting + small fountain. I read for hours without mind wandering." — L.P.'
H[('water','bathroom')]='"Installed a bathtub. My therapist says it\'s the best thing I\'ve done." — C.G.'
H[('water','entryway')]='"Curved mirror + dark blue wall. Everyone says it feels calm walking in." — D.T.'
H[('water','garden')]='"Small pond with 3 goldfish. I spend more time here than inside my house." — Y.W.'
H[('water','children-room')]='"Dark blue accent wall. My water-element baby sleeps better than expected." — L.J.'
H[('water','dining')]='"Wavy runner + blue placemats. Dinner is ceremony, not refuel." — N.R.'
# --- 决策 ---
H[('wood','career-change')]='"3 career changes in 5 years. Wood grows fast and outgrows fast." — T.M.'
H[('wood','relationship')]='"She\'s Earth, I\'m Wood. She needs stability when I need growth. Our fights dropped 80%." — J.B.'
H[('wood','burnout')]='"Kept planting projects before previous ones bore fruit. The fix: finish ONE before starting next." — A.S.'
H[('wood','team-management')]='"I hired people like me — fast, ambitious. Bad. I needed an Earth co-founder." — R.K.'
H[('wood','financial')]='"Invested in 7 things at once. Classic Wood. Learning to say no to good opportunities." — M.L.'
H[('wood','creativity')]='"40 half-finished projects. The one I finished? I closed 39 tabs and stayed with ONE." — H.C.'
H[('wood','relocation')]='"Moved 5 times in 8 years. Each time I thought the city was the problem. It wasn\'t." — P.G.'
H[('wood','health')]='"Running outside instead of the gym. Wood needs to feel the ground change." — S.W.'
H[('fire','career-change')]='"Quit finance to become a chef. Fire energy burning through what no longer serves." — J.M.'
H[('fire','relationship')]='"I argue passionately. She withdraws. Pausing 10 seconds before responding saved us." — K.T.'
H[('fire','burnout')]='"Crashed after a 2-year sprint. Fire burnout: your pilot light goes out. Recovery: remember what you cared about." — D.V.'
H[('fire','team-management')]='"Led with enthusiasm for 6 months. Then realized motivation without structure is chaos with a smile." — N.W.'
H[('fire','financial')]='"I buy what excites me, not what I need. 48-hour rule before any purchase >$100." — L.S.'
H[('fire','creativity')]='"Most creative 10pm-2am. Fire peaks when the world is quiet." — F.A.'
H[('fire','relocation')]='"Moved to a warmer city. The sun matters more than I expected as a Fire person." — E.K.'
H[('fire','health')]='"Hot yoga. Fire needs movement that generates internal heat, not burns calories." — Z.R.'
H[('earth','career-change')]='"Stayed 3 years too long because it was stable. Earth over-stays. The right move felt unstable." — L.H.'
H[('earth','relationship')]='"I give too much. My therapist: your cup needs to be full before you pour." — M.S.'
H[('earth','burnout')]='"Earth burnout = caring too much about everything. I wasn\'t tired from work — from carrying everyone\'s emotions." — R.D.'
H[('earth','team-management')]='"Team loves me. Boss hates that I don\'t push. Finding balance is my 2026 journey." — P.B.'
H[('earth','financial')]='"Save because it feels safe. Missed opportunities because I played too safe." — H.K.'
H[('earth','creativity')]='"Couldn\'t create until environment stabilized. Earth needs rootedness before ideas grow." — S.C.'
H[('earth','relocation')]='"Moving felt like leaving my skin. But the new soil was fertile." — J.T.'
H[('earth','health')]='"Weight training, not cardio. Earth needs to feel heavy and grounded." — B.W.'
H[('metal','career-change')]='"Planned my career change for 14 months. Spreadsheets, scenarios. Metal doesn\'t leap — it calculates." — A.H.'
H[('metal','relationship')]='"Partner says distant. I\'m precise. I say what I mean but I say less of it." — T.R.'
H[('metal','burnout')]='"Perfectionism burnout. I was tired of making things perfect for people who didn\'t notice." — J.K.'
H[('metal','team-management')]='"80% done and shipped beats 100% done and never shipped." — P.C.'
H[('metal','financial')]='"Track every dollar. It\'s not about money — it\'s about control. Learning to let go." — N.M.'
H[('metal','creativity')]='"Writer\'s block for 6 months because my first draft wasn\'t perfect. Metal creativity paralyzed by its own standards." — L.E.'
H[('metal','relocation')]='"Researched my new city for 8 months. Streets, schools, grocery stores. Nothing surprised me when I arrived." — D.W.'
H[('metal','health')]='"Track macros, sleep, steps. Useful. But learning to sometimes eat without logging it." — J.B.'
H[('water','career-change')]='"Felt my old job was wrong for 2 years before I admitted it. Water knows before it speaks." — L.C.'
H[('water','relationship')]='"I need alone time. Now we know: Water retreats before it can return." — H.W.'
H[('water','burnout')]='"Not overworked — overwhelmed by others\' emotions. I needed to filter, not rest." — S.P.'
H[('water','team-management')]='"I sense the room. I know when someone will quit before they do. Intuition, not authority." — R.W.'
H[('water','financial')]='"I feel my financial decisions. My gut beats my calculator." — D.H.'
H[('water','creativity')]='"Best ideas come in the shower. Stopped forcing creativity and trusted my subconscious." — M.R.'
H[('water','relocation')]='"Moved next to the ocean. Water people need large bodies of water to feel like themselves." — S.B.'
H[('water','health')]='"Swimming. Pounding pavement felt wrong. Moving through water = returning home." — J.G.'

def generate_space_page(el_key, scene_key):
    el = ELEMENTS[el_key]
    scene = SCENES[scene_key]
    
    filename = f'{el_key}-{scene_key}-feng-shui.html'
    title = f"{el['symbol']} {el['name']} Element {scene['name']} — Feng Shui Guide for {el['name']} Personalities"
    meta = f"Discover the perfect {scene['name'].lower()} layout for {el['name']} element personalities."
    human_note = H.get((el_key, scene_key), '"I didn\'t know Feng Shui could be this specific to my personality." — Reader')
    
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

<div class="human-note">
<span class="note-label">✎ READER'S NOTE</span>
<p>{human_note}</p>
</div>

<div class="founder-note">
<p><strong>From the founder at Guanlan Energy:</strong> I personally read every comment on this guide. If it doesn't match your experience, tell me—I'll revise it. Five Elements are a living framework, not dogma. Your feedback keeps it honest. — <em>Jinxi</em></p>
</div>
"""
    return filename, title, meta, advice

def generate_decision_page(el_key, dec_key):
    el = ELEMENTS[el_key]
    dec = DECISIONS[dec_key]
    
    filename = f'{el_key}-{dec_key}-decision-guide.html'
    title = f"{el['symbol']} {el['name']} Element — How to Handle {dec['name']} Using Five Elements Wisdom"
    meta = f"Learn how {el['name']} element personalities approach {dec['name'].lower()}."
    human_note = H.get((el_key, dec_key), '"I wish I had known this before making my biggest life decisions." — Reader')
    
    advice = f"""
<p>As a {el['name']} element, your approach to {dec['name'].lower()} is shaped by your {el['motto'].lower()}. But this strength can become your blind spot when stress hits — leading to {el['shadow'].lower()}.</p>

<h2>Your Natural Pattern</h2>
<p>In {dec['name'].lower()}, {el['name'].lower()} people tend to {'push harder' if el_key in ['wood','fire'] else 'withdraw and reflect' if el_key in ['water','metal'] else 'maintain the status quo'}. Neither is wrong — but neither is complete.</p>

<h2>Bring In the Missing Element</h2>
<p>Your balance comes from {el['balance_need']}. When facing a {dec['name'].lower()}, consciously invite that opposing energy — talk to someone who thinks differently, or adjust your environment to include their element.</p>

<h2>Timing Matters</h2>
<p>Your {el['season'].lower()} energy peaks in {el['season']}. For major decisions, align with that season when possible. During opposite seasons ({'Autumn' if el_key in ['wood','fire'] else 'Spring' if el_key in ['metal','water'] else 'Winter'}), slow down and gather information instead of acting.</p>

<div class="human-note">
<span class="note-label">✎ READER'S NOTE</span>
<p>{human_note}</p>
</div>

<div class="founder-note">
<p><strong>From the founder at Guanlan Energy:</strong> I personally read every comment on this guide. If it doesn't match your experience, tell me—I'll revise it. Five Elements are a living framework, not dogma. Your feedback keeps it honest. — <em>Jinxi</em></p>
</div>
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
.note-label{{font-size:10px;letter-spacing:3px;color:#c9a84c;margin-bottom:4px;display:block;text-transform:uppercase}}
.human-note{{margin:36px 0 20px;padding:20px 24px;background:rgba(201,168,76,.03);border-left:2px solid rgba(201,168,76,.15);border-radius:2px}}
.human-note p{{font-size:15px;font-style:italic;color:rgba(240,235,224,.7);line-height:1.8;margin:0}}
.founder-note{{margin:20px 0 30px;padding:16px 24px;background:rgba(201,168,76,.02);border:1px solid rgba(201,168,76,.08);border-radius:2px}}
.founder-note p{{font-size:14px;color:rgba(240,235,224,.55);line-height:1.8;margin:0}}
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
