// free-chart-app.js — chart results page UI (loaded by free-chart.html)

window.onerror = function(msg, src, line, col, err) {
  var el = document.getElementById("loading-screen");
  if (el) {
    el.innerHTML = '<div style="color:#e08080;padding:2rem;text-align:center;font-size:0.9rem">Something went wrong loading your chart. Please try again.</div>';
  }
  return true;
};

const PALACE_ORDER = ['命宮','兄弟宮','夫妻宮','子女宮','財帛宮','疾厄宮','遷移宮','交友宮','官祿宮','田宅宮','福德宮','父母宮'];
const PALACE_EN = ['Life & Destiny','Siblings','Spouse & Romance','Children & Creativity','Wealth','Health','Travel & Migration','Friends & Servants','Career & Status','Property','Virtue & Fortune','Parents'];
const FREE_PALACE_INDICES = [0, 4, 8];
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const HOUR_LABELS = ['子時 · Zi (23:00–01:00)','丑時 · Chou (01:00–03:00)','寅時 · Yin (03:00–05:00)','卯時 · Mao (05:00–07:00)','辰時 · Chen (07:00–09:00)','巳時 · Si (09:00–11:00)','午時 · Wu (11:00–13:00)','未時 · Wei (13:00–15:00)','申時 · Shen (15:00–17:00)','酉時 · You (17:00–19:00)','戌時 · Xu (19:00–21:00)','亥時 · Hai (21:00–23:00)'];

const STAR_EN = {
  '紫微':'Zi Wei · Purple Emperor','天機':'Tian Ji · Strategist','太陽':'Tai Yang · Sun','武曲':'Wu Qu · Commander',
  '天同':'Tian Tong · Harmonizer','廉貞':'Lian Zhen · Integrity','天府':'Tian Fu · Treasury','太陰':'Tai Yin · Moon',
  '貪狼':'Tan Lang · Wolf','巨門':'Ju Men · Gate','天相':'Tian Xiang · Minister','天梁':'Tian Liang · Beam',
  '七殺':'Qi Sha · Warrior','破軍':'Po Jun · Destroyer',
  '左輔':'Zuo Fu','右弼':'You Bi','文昌':'Wen Chang','文曲':'Wen Qu',
  '天魁':'Tian Kui','天鉞':'Tian Yue','天馬':'Tian Ma','火星':'Huo Xing','鈴星':'Ling Xing'
};

const STAR_NATURE = {
  '紫微':'Emperor','天機':'Advisor','太陽':'Illuminator','武曲':'Commander','天同':'Peacemaker','廉貞':'Strategist',
  '天府':'Treasurer','太陰':'Empath','貪狼':'Charmer','巨門':'Investigator','天相':'Diplomat','天梁':'Guardian',
  '七殺':'Warrior','破軍':'Revolutionary'
};

// SAFE GETTER — handles null/undefined reading + hook/hint field name
// ─── CLAUDE API 安全中转 ────────────────────────────────────────────────
// 🔒 API Key 在 Vercel 环境变量 ANTHROPIC_API_KEY 中，前端永不暴露
const CLAUDE_PROXY = '/api/generate-reading';

async function callClaude(messages, max_tokens) {
  const res = await fetch(CLAUDE_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: messages, max_tokens: max_tokens || 1000 })
  });
  if (!res.ok) throw new Error('Claude proxy error ' + res.status);
  const data = await res.json();
  return data.content?.map(function(c) { return c.text || ''; }).join('') || '';
}

// ─── 观澜 AI 解盘引擎 ────────────────────────────────────────────────────
async function generatePalaceReading(palaceDef, starCn, starData, birthDate, hourLabel, lifeStarCn) {
  const prompt = 'You are a master Zi Wei Dou Shu astrologer writing for an English-speaking Western audience who knows nothing about Chinese astrology. Your writing must be viscerally accurate, emotionally arresting, and so specific it feels like you have been watching this person\'s life.\n\nPALACE: ' + palaceDef + '\n\nSTAR PLACED HERE: ' + starCn + ' / ' + starData + '\n\nBirth Date: ' + birthDate + ' | Birth Hour: ' + hourLabel + '\n\nWrite a reading for this palace that:\n1. Opens with ONE devastating, soul-precise sentence that the person will feel is about them specifically\n2. Then 2-3 short paragraphs that go DEEP. No generic astrology platitudes. Be bold, precise, use "you" directly.\n3. End with one line about 2026\'s specific activation in this palace.\n\nFormat: HOOK: [one sentence]\nBODY: [2-3 paragraphs, blank-line separated]\n2026: [one sentence]';
  
  try {
    const text = await callClaude([{ role: 'user', content: prompt }], 1000);
    return text;
  } catch (e) {
    console.error('Claude reading error:', e);
    return 'HOOK: The stars of this palace hold their counsel for now.\nBODY: Revisit this palace when the heavens are more favourably aligned.\n2026: The cosmic signals are still forming.';
  }
}

async function generateMasterReading(lifeStarCn, birthDate, hourLabel) {
  const starData = STAR_EN[lifeStarCn] || '—';
  const prompt = 'You are a Zi Wei Dou Shu master. Give a 2-sentence essence description of someone whose Life Palace holds ' + lifeStarCn + ' (' + starData + '). First sentence: a profound truth about who they fundamentally ARE. Second: their life\'s central paradox. Write in second person. Max 60 words.';
  try {
    return await callClaude([{ role: 'user', content: prompt }], 200);
  } catch (e) {
    return '';
  }
}

function parseReading(raw) {
  var hook = '', body = '', yr2026 = '';
  var h = raw.match(/HOOK:\s*([\s\S]*?)(?=BODY:|$)/i);
  if (h) hook = h[1].trim();
  var b = raw.match(/BODY:\s*([\s\S]*?)(?=2026:|$)/i);
  if (b) body = b[1].trim();
  var y = raw.match(/2026:\s*([\s\S]*?)$/i);
  if (y) yr2026 = y[1].trim();
  return { hook: hook, body: body, year2026: yr2026 };
}

function safeRead(reading, field) {
  if (!reading) return '';
  if (field === 'hook') {
    return reading.hook || reading.hint || 'The stars of this palace reveal patterns that shape your destiny.';
  }
  return reading[field] || '';
}

// 从出生信息获取解读
function getChartReading(engineResult) {
  if (!engineResult || !engineResult.palaces) return [];
  
  const palaces = engineResult.palaces;
  
  return palaces.map((palace, idx) => {
    const majorStars = palace.majorStars || [];
    const hua = palace.fourHua || [];
    
    let matched = null;
    for (const starCn of majorStars) {
      if (ZWDS_READINGS[starCn] && ZWDS_READINGS[starCn].readings[palace.name]) {
        matched = ZWDS_READINGS[starCn].readings[palace.name];
        break;
      }
    }
    
    return {
      idx: idx,
      palaceCn: palace.name,
      palaceEn: PALACE_EN[PALACE_ORDER.indexOf(palace.name)] || '',
      roman: ROMAN[idx] || '',
      stemBranch: palace.stemBranch || '',
      majorStars: majorStars,
      auxiliaryStars: palace.auxiliaryStars || [],
      allStars: palace.allStars || [],
      starDisplay: majorStars.length > 0 ? majorStars.join(' ') : '—',
      starEn: majorStars.length > 0 ? (STAR_EN[majorStars[0]] || '—') : '—',
      nature: majorStars.length > 0 ? (STAR_NATURE[majorStars[0]] || '—') : '—',
      hua: hua,
      _reading: matched,
      get hook() { return safeRead(this._reading, 'hook'); },
      get body() { return safeRead(this._reading, 'body'); },
      get year2026() { return safeRead(this._reading, 'year2026'); }
    };
  });
}

const HOUR_BRANCHES = ['zi','chou','yin','mao','chen','si','wu','wei','shen','you','xu','hai'];
const HOUR_BRANCH_TO_INDEX = { zi:0, chou:1, yin:2, mao:3, chen:4, si:5, wu:6, wei:7, shen:8, you:9, xu:10, hai:11 };

// ─── URL PARAMS ───
function getParams() {
  const p = new URLSearchParams(window.location.search);
  const rawDate = p.get('dob') || p.get('date') || '';
  const rawHour = (p.get('hour') || '').trim();
  const country = p.get('country') || '';
  const email = (p.get('email') || '').trim();

  let hour = 6;
  let hourBranch = '';
  if (/^\d+$/.test(rawHour)) {
    hour = Math.max(0, Math.min(11, parseInt(rawHour, 10)));
    hourBranch = HOUR_BRANCHES[hour] || '';
  } else if (rawHour && HOUR_BRANCH_TO_INDEX[rawHour] !== undefined) {
    hourBranch = rawHour;
    hour = HOUR_BRANCH_TO_INDEX[rawHour];
  }

  const hourLabel = p.get('hourLabel') || HOUR_LABELS[hour] || '';

  let year = 1990, month = 1, day = 15;
  if (rawDate) {
    const parts = rawDate.replace(/-/g, '/').split('/');
    year = parseInt(parts[0], 10) || 1990;
    month = parseInt(parts[1], 10) || 1;
    day = parseInt(parts[2], 10) || 15;
  }

  return {
    date: rawDate.replace(/-/g, '/'),
    year, month, day,
    hour, hourBranch, hourLabel, country, email
  };
}

// ─── STATE ───
let chartState = {
  birthDate: '', year: 0, month: 0, day: 0, hourIndex: 0, hourLabel: '', country: '',
  result: null, chartData: null, readings: [], activeCard: null, unlocked: false
};

function isFreePalace(index) {
  return FREE_PALACE_INDICES.indexOf(index) !== -1;
}

function isPalaceLocked(index) {
  return !chartState.unlocked && !isFreePalace(index);
}

const STAR_ARCHETYPE = {
  '紫微': 'Emperor', '天機': 'Strategist', '太陽': 'Illuminator', '武曲': 'Commander',
  '天同': 'Harmonizer', '廉貞': 'Maverick', '天府': 'Guardian', '太陰': 'Keeper',
  '貪狼': 'Magnetist', '巨門': 'Oracle', '天相': 'Diplomat', '天梁': 'Elder',
  '七殺': 'Pioneer', '破軍': 'Transformer'
};

const SIHUA_COPY = {
  '命宮': {
    '化禄': 'Fortune flows toward you naturally in this cycle — not because you chase it, but because you have finally stopped blocking it. This is your year to receive.',
    '化权': 'You are being handed authority you did not ask for. The question is not whether you can handle it — the stars already decided you can. The question is whether you will step forward or shrink.',
    '化科': 'Your reputation is being rewritten right now. People in positions of influence are noticing you in ways you cannot yet see. Do not downplay yourself in the next 12 months.',
    '化忌': 'There is a version of you that keeps getting in your own way. This cycle forces a reckoning with that pattern — painful, necessary, and ultimately liberating.'
  },
  '財帛宮': {
    '化禄': 'Money is genuinely trying to find you right now. The pattern blocking it is not external — check where you are unconsciously turning away abundance.',
    '化权': 'Your earning power is at a peak, but only if you control the terms. Working for someone else\'s vision will cost you. This cycle rewards those who negotiate.',
    '化科': 'Wealth comes through knowledge and reputation — what you know is worth more than what you do. Charge accordingly.',
    '化忌': 'A financial leak exists somewhere you are not looking. It is not a crisis — but it will become one if you do not trace it to the source before year\'s end.'
  },
  '夫妻宮': {
    '化禄': 'A relationship enters a season of genuine ease — not because problems disappeared, but because both people are finally ready to stop fighting and start building.',
    '化权': 'Power dynamics in your closest relationship are shifting. Someone is pulling back. Someone else is stepping forward. Neither person is wrong — but the silence between you is getting expensive.',
    '化科': 'You are most attractive right now when you are most yourself. Stop editing your intelligence for anyone.',
    '化忌': 'The relationship that is causing the most friction right now is the one most worth examining — not necessarily ending. But it needs truth, not management.'
  },
  '官祿宮': {
    '化禄': 'Career momentum is real and building. The move you have been hesitating to make — the timing is closer than you think.',
    '化权': 'Leadership is being thrust upon you whether you wanted it or not. How you carry it in the next 18 months will define your professional identity for a decade.',
    '化科': 'Your work is being seen by people who matter. This is not the time for modesty — it is the time for precision. Every output carries your name further.',
    '化忌': 'A career path you have been loyal to is quietly closing. The stars are not punishing you — they are redirecting you toward something that actually fits.'
  }
};

const STAR_SOUL_COPY = {
  '紫微': {
    title: 'The Emperor',
    soul: 'You were not built to follow instructions — you were built to write them. The discomfort you feel in rooms where someone else leads is not arrogance. It is misalignment. Your deepest challenge is not ambition. It is learning to lead without making everyone around you feel small.',
    shadow: 'The Emperor\'s shadow: you carry the weight of being needed so well that no one sees when you are breaking.'
  },
  '天機': {
    title: 'The Strategist',
    soul: 'Your mind never fully stops. Even in rest, part of you is calculating, adjusting, preparing for outcomes that haven\'t happened yet. This is your gift and your exhaustion. You are three conversations ahead of the room — and completely alone in that position.',
    shadow: 'The Strategist\'s shadow: you plan for every possibility except the one where you simply let someone else take care of you.'
  },
  '太陽': {
    title: 'The Illuminator',
    soul: 'You give warmth so naturally that people forget you need it too. Rooms genuinely change when you enter — and you have spent years pretending you don\'t know this. Your real work is not shining brighter. It is learning to receive what you so freely give to others.',
    shadow: 'The Illuminator\'s shadow: you are so good at making others feel seen that you have forgotten what it feels like to be seen yourself.'
  },
  '武曲': {
    title: 'The Commander',
    soul: 'Sentiment does not move you — results do. You respect people who do what they say and say what they mean. Most people in your life cannot meet that standard, and you have long since stopped expecting them to. Your loneliness is not from lack of connection — it is from the distance between your standards and everyone else\'s execution.',
    shadow: 'The Commander\'s shadow: efficiency has become your armor. The things you cannot measure, you have taught yourself not to need.'
  },
  '天同': {
    title: 'The Harmonizer',
    soul: 'You carry peace like a gift — walking into tension and quietly dissolving it before anyone notices you did the work. But harmony purchased at the cost of your own truth is not peace. It is avoidance wearing a calm face. The conflict you keep not having is the one your life most needs.',
    shadow: 'The Harmonizer\'s shadow: you are so skilled at not rocking the boat that you have forgotten you were born to sail your own.'
  },
  '廉貞': {
    title: 'The Maverick',
    soul: 'Rules have always felt like suggestions to you — not because you are reckless, but because you can see the logic behind them and know when it no longer applies. You have been called difficult by people who were simply uncomfortable with someone who would not perform compliance. Your edge is real. So is your loyalty to the few who earn it.',
    shadow: 'The Maverick\'s shadow: you have mistaken rebellion for freedom so many times that sometimes you destroy good things just to prove you can.'
  },
  '天府': {
    title: 'The Guardian',
    soul: 'You build things that last — relationships, systems, trust, institutions. While others chase what is exciting, you are laying foundations that will matter in twenty years. The frustration is that almost no one sees the work while it is happening. The satisfaction is that everyone benefits from it when it is done.',
    shadow: 'The Guardian\'s shadow: you have given so much stability to others that you have never asked who is holding you.'
  },
  '太陰': {
    title: 'The Keeper',
    soul: 'You feel everything that happens in a room — including the things no one says out loud. This makes you extraordinarily perceptive and quietly exhausted. You have learned to make yourself smaller to avoid overwhelming people with your depth. But the right people will not need you to be smaller. They will rise to meet you.',
    shadow: 'The Keeper\'s shadow: you absorb so much of what others feel that you sometimes cannot locate where they end and you begin.'
  },
  '貪狼': {
    title: 'The Magnetist',
    soul: 'You attract what you focus on — which means your desires are not wishes, they are forces. The life you have right now is a precise reflection of what you have truly wanted, not what you have said you wanted. This is the most confronting thing the stars can say to someone like you — and the most empowering.',
    shadow: 'The Magnetist\'s shadow: you are so drawn to intensity that stillness feels like dying. But what you are looking for has always lived in the quiet.'
  },
  '巨門': {
    title: 'The Oracle',
    soul: 'You say what others cannot bring themselves to — and they hate you for it until they realize you were right. You have always seen the gap between what people perform and what they actually feel. This is your gift and your isolation. The truth is expensive, and you have been paying that price longer than anyone knows.',
    shadow: 'The Oracle\'s shadow: you are so fluent in other people\'s hidden truths that you have become a stranger to your own.'
  },
  '天相': {
    title: 'The Diplomat',
    soul: 'You make the complicated feel manageable — for everyone around you. You translate between people who cannot hear each other, hold space for contradictions that would break others, and carry the invisible weight of keeping things functional. The cost is that no one ever asks how you are carrying all of this.',
    shadow: 'The Diplomat\'s shadow: you are so good at finding the middle ground that you have forgotten you are allowed to have a side.'
  },
  '天梁': {
    title: 'The Elder',
    soul: 'Wisdom arrived in you early — which meant you spent your youth feeling like you did not belong with people your age. You are the one others come to when things fall apart, and you carry that responsibility with a gravity that is both your purpose and your burden. What you have not yet learned is how to let someone carry you.',
    shadow: 'The Elder\'s shadow: you have been the wise one for so long that asking for help feels like a betrayal of who you are supposed to be.'
  },
  '七殺': {
    title: 'The Pioneer',
    soul: 'Comfort has never been your destination — it is where you go when you are recovering from the last frontier. You were built for terrain that does not exist yet, which means you are always a little out of place in the world as it is. The loneliness of that is real. So is the fact that you would not trade it for anything.',
    shadow: 'The Pioneer\'s shadow: you have mistaken intensity for meaning for so long that rest feels like failure.'
  },
  '破軍': {
    title: 'The Transformer',
    soul: 'Nothing stays the same when you decide to move. You have dismantled more versions of yourself than most people build in a lifetime — not because you are unstable, but because you are incapable of staying in a form that no longer fits. The people who cannot keep up call this chaos. The people who understand you call it evolution.',
    shadow: 'The Transformer\'s shadow: you are so practiced at leaving what no longer serves you that sometimes you leave before you have found out what it could have become.'
  },
  '__empty__': {
    title: 'The Open Path',
    soul: 'An empty Life Palace is not a gap — it is a canvas. Your character is not fixed by a single star but shaped by every force in your chart working together. You are defined not by what you were born with but by every choice you make in response to what life brings. This is rarer than any star placement. And far more powerful.',
    shadow: 'The Open Path\'s shadow: without a fixed star to orbit, you sometimes drift into other people\'s stories and forget to write your own.'
  }
};

const TOPIC_TAGS = {
  '命宮': 'CORE SELF', '財帛宮': 'WEALTH & RESOURCES', '官祿宮': 'CAREER & STATUS',
  '夫妻宮': 'PARTNERSHIP', '子女宮': 'CREATIVITY & LEGACY', '疾厄宮': 'HEALTH & VITALITY',
  '福德宮': 'INNER PEACE', '遷移宮': 'TRAVEL & ABROAD', '田宅宮': 'HOME & PROPERTY',
  '交友宮': 'NETWORK & ALLIES', '兄弟宮': 'PEERS & SIBLINGS', '父母宮': 'ANCESTRY & GUIDANCE'
};

const PALACE_GROUPS = [
  { title: 'IDENTITY', indices: [0] },
  { title: 'MONEY & CAREER', indices: [4, 8] },
  { title: 'LOVE & RELATIONSHIPS', indices: [2, 3] },
  { title: 'WELLBEING', indices: [5, 10] },
  { title: 'YOUR WORLD', indices: [6, 9, 7, 1, 11] }
];

const IDENTITY_BLURBS = {
  '紫微': 'You were born to lead without asking permission. Others sense a quiet authority in you before you speak — and they rarely forget it once you do.',
  '天機': 'Your mind works like a compass, always finding true north even in chaos. You see patterns others miss and adapt faster than most people can react.',
  '太陽': 'You carry a warmth that illuminates every room you enter. Recognition follows you — not because you chase it, but because your presence demands it.',
  '武曲': 'You are built for decisive action and tangible results. When others hesitate, you move — and that momentum is your greatest asset.',
  '天同': 'You bring ease to difficult situations and calm to restless people. Your gift is making life feel livable, even when the world feels heavy.',
  '廉貞': 'You hold your principles with fierce loyalty. Integrity is not a value you discuss — it is the standard you live by, even when it costs you.',
  '天府': 'You are a natural steward of resources, people, and trust. Abundance flows toward you because you know how to hold it without wasting it.',
  '太陰': 'You feel deeply and perceive what remains unspoken. Your intuition is not a guess — it is a finely tuned instrument you have learned to trust.',
  '貪狼': 'You attract opportunity through charisma and sheer appetite for life. Where you focus your desire, doors tend to open.',
  '巨門': 'You pursue truth with relentless curiosity. Surface answers never satisfy you — you need to understand what is really happening beneath.',
  '天相': 'You are the bridge between opposing forces. Diplomacy comes naturally because you genuinely see merit on every side of an argument.',
  '天梁': 'You carry old-soul wisdom and a protective instinct for others. People come to you in crisis because you make them feel safe.',
  '七殺': 'You thrive under pressure and rise when others retreat. Courage is not the absence of fear for you — it is action in spite of it.',
  '破軍': 'You are the agent of necessary change. What others resist breaking, you rebuild — stronger, cleaner, and more honestly aligned.'
};

const BUREAU_EN = { '金': 'Metal', '木': 'Wood', '水': 'Water', '火': 'Fire', '土': 'Earth' };

const LIFE_OPPOSITE_INDEX = 6;

const OPEN_PATH = {
  displayName: STAR_SOUL_COPY['__empty__'].title,
  tagline: 'Your destiny is not written in a single star — it is shaped by every palace around you.',
  description: STAR_SOUL_COPY['__empty__'].soul
};

const SIHUA_TYPE_META = {
  '化禄': { en: 'LU', word: 'Flow', reading: 'Prosperity activates here — resources, opportunities, and ease tend to gather when you lean into this domain rather than force it.' },
  '化权': { en: 'QUAN', word: 'Command', reading: 'Authority concentrates in this palace — decisions you make here carry extra weight; use that leverage deliberately, not reactively.' },
  '化科': { en: 'KE', word: 'Grace', reading: 'Recognition and refinement flow through this area — your reputation grows through craft, credibility, and how gracefully you handle visibility.' },
  '化忌': { en: 'JI', word: 'Friction', reading: 'A fixed point of tension lives here — not punishment, but a recurring lesson that demands honesty until the pattern is understood and integrated.' }
};

const CYCLE_THEMES = {
  '紫微': 'A decade to claim legitimate authority — the question is not whether you are capable, but whether you will stop waiting for permission.',
  '天機': 'A decade of strategic reinvention — your mind is the engine; choose one direction long enough for brilliance to compound.',
  '太陽': 'A decade of visible ascent — what you build now will be seen; make sure it reflects who you actually are.',
  '武曲': 'A decade of material execution — results reward decisive action; hesitation is the only real enemy.',
  '天同': 'A decade of emotional consolidation — simplify, restore, and let comfort become a foundation rather than an escape.',
  '廉貞': 'A decade of moral reckoning — integrity tested in public becomes the legacy you cannot outrun.',
  '天府': 'A decade of accumulation and stewardship — what you gather now must be managed with wisdom, not fear.',
  '太陰': 'A decade of inner deepening — intuition sharpens; the world you build in private becomes your public edge.',
  '貪狼': 'A decade of expansion and desire — appetite opens doors, but discipline decides which ones stay open.',
  '巨門': 'A decade of truth-telling — what you name clearly loses its power to haunt you from the shadows.',
  '天相': 'A decade of alliance and balance — who you stand beside matters as much as what you stand for.',
  '天梁': 'A decade of protection and legacy — you are called to shield others while finally protecting your own path.',
  '七殺': 'A decade of confrontation and conquest — pressure forges you; choose battles that are worth the person you become.',
  '破軍': 'A decade of necessary upheaval — what breaks now clears space for a self you have not yet met.'
};

function parseHuaEntry(entry) {
  if (!entry) return null;
  var types = ['化禄', '化权', '化科', '化忌'];
  for (var i = 0; i < types.length; i++) {
    if (entry.indexOf(types[i]) >= 0) {
      return { star: entry.replace(types[i], ''), type: types[i] };
    }
  }
  return null;
}

function getLifeBranch(result, readings) {
  var stemBranch = (result && result.lifeStemBranch) || (readings[0] && readings[0].stemBranch) || '';
  return stemBranch.slice(-1) || '—';
}

function getStarSoulCopy(starCn) {
  if (!starCn) return STAR_SOUL_COPY['__empty__'];
  return STAR_SOUL_COPY[starCn] || null;
}

function getStarSoulTitle(starCn, isOpen) {
  if (isOpen) return STAR_SOUL_COPY['__empty__'].title;
  var copy = getStarSoulCopy(starCn);
  return copy ? copy.title : ('The ' + getArchetype(starCn));
}

function getSihuaReading(palaceCn, huaType) {
  if (SIHUA_COPY[palaceCn] && SIHUA_COPY[palaceCn][huaType]) {
    return SIHUA_COPY[palaceCn][huaType];
  }
  var meta = SIHUA_TYPE_META[huaType];
  return meta ? meta.reading : '';
}

function getSoulParadox(lifeDisplay) {
  if (lifeDisplay.mode === 'open') {
    return STAR_SOUL_COPY['__empty__'].soul;
  }
  var copy = getStarSoulCopy(lifeDisplay.starCn);
  if (copy) {
    if (lifeDisplay.mode === 'borrowed') {
      return 'Your Life Palace borrows its light from the palace opposite — yet the paradox remains yours: ' + copy.soul;
    }
    return copy.soul;
  }
  return lifeDisplay.description || lifePalaceHookBlurb(lifeDisplay);
}

function getCycleProphecy(cycleRange, lifeDisplay) {
  var copy = lifeDisplay.mode === 'open'
    ? STAR_SOUL_COPY['__empty__']
    : getStarSoulCopy(lifeDisplay.starCn);
  if (copy && copy.shadow) {
    return copy.shadow;
  }
  var starCn = lifeDisplay && lifeDisplay.starCn;
  var theme = (starCn && CYCLE_THEMES[starCn]) || 'This cycle asks you to consolidate what you have learned and act with deliberate clarity.';
  if (cycleRange && cycleRange !== '—') {
    return 'Ages ' + cycleRange + ': ' + theme;
  }
  return theme;
}

function renderSihuaBadgeHtml(parsed) {
  if (!parsed) return '';
  var meta = SIHUA_TYPE_META[parsed.type];
  if (!meta) return '';
  return '<div class="sihua-badge">✦ ' + parsed.star + parsed.type + ' · ' + meta.word + '</div>';
}

function renderSihuaBadges(huaList) {
  if (!huaList || !huaList.length) return '';
  return huaList.map(function(entry) {
    return renderSihuaBadgeHtml(parseHuaEntry(entry));
  }).join('');
}

function renderSihuaBlock(reading) {
  var huaList = (reading && reading.hua) || [];
  if (!huaList.length) return '';
  var palaceCn = reading.palaceCn || '';
  var items = huaList.map(function(entry) {
    var parsed = parseHuaEntry(entry);
    if (!parsed) return '';
    var meta = SIHUA_TYPE_META[parsed.type];
    if (!meta) return '';
    var text = getSihuaReading(palaceCn, parsed.type);
    return ''
      + '<div class="sihua-item">'
      + '<span class="sihua-tag">' + parsed.type + ' ' + meta.en + '</span>'
      + '<p>' + text + '</p>'
      + '</div>';
  }).join('');
  if (!items) return '';
  return ''
    + '<div class="sihua-block">'
    + '<div class="sihua-block-title">FOUR TRANSFORMATIONS · 四化</div>'
    + items
    + '</div>';
}

function resolveLifePalaceDisplay(readings) {
  var life = readings && readings[0];
  var lifeStars = (life && life.majorStars) || [];

  if (lifeStars.length > 0) {
    var starCn = lifeStars[0];
    var nativeSoul = getStarSoulCopy(starCn);
    return {
      mode: 'native',
      displayName: getStarSoulTitle(starCn),
      tagline: null,
      description: nativeSoul ? nativeSoul.soul : getIdentityBlurb(starCn, life),
      starCn: starCn,
      reading: life,
      tag: starCn + ' · Life Palace'
    };
  }

  var opposite = readings && readings[LIFE_OPPOSITE_INDEX];
  var oppStars = (opposite && opposite.majorStars) || [];
  if (oppStars.length > 0) {
    var borrowedCn = oppStars[0];
    var oppLabel = opposite.palaceEn.split('&')[0].trim();
    var borrowedSoul = getStarSoulCopy(borrowedCn);
    return {
      mode: 'borrowed',
      displayName: getStarSoulTitle(borrowedCn),
      tagline: 'Your Life Palace holds no major star — your core nature is read through the mirror of your ' + oppLabel + ' Palace.',
      description: borrowedSoul ? borrowedSoul.soul : getIdentityBlurb(borrowedCn, opposite),
      starCn: borrowedCn,
      reading: opposite,
      tag: borrowedCn + ' · Borrowed from ' + oppLabel
    };
  }

  return {
    mode: 'open',
    displayName: STAR_SOUL_COPY['__empty__'].title,
    tagline: OPEN_PATH.tagline,
    description: STAR_SOUL_COPY['__empty__'].soul,
    starCn: null,
    reading: life,
    tag: 'Life Palace · Open Chart'
  };
}

function getEffectiveLifeStarCn(readings) {
  var display = resolveLifePalaceDisplay(readings);
  return display.starCn || '';
}

function lifePalaceHookBlurb(display) {
  if (display.mode === 'native') return display.description;
  if (display.tagline && display.description) {
    return display.tagline + ' ' + wordTeaser(display.description, 28);
  }
  return display.tagline || display.description || '';
}

function lifePalaceCardTitle(display) {
  if (display.mode === 'native' || display.mode === 'borrowed') {
    return display.displayName;
  }
  return display.displayName;
}

function lifePalaceTeaser(display, reading) {
  if (display.mode === 'native') {
    return wordTeaser(reading.hook || pillarBody(reading), 15);
  }
  return wordTeaser(display.tagline || display.description, 15);
}

function readingYear2026Html(reading) {
  if (!reading || !reading.year2026) return '';
  return '<p class="palace-year-2026">✦ 2026: ' + reading.year2026 + '</p>';
}

function palaceExpandedBody(reading) {
  if (!reading) return '';
  var html = '';
  if (reading.body) html += '<p>' + reading.body + '</p>';
  html += readingYear2026Html(reading);
  html += renderSihuaBlock(reading);
  return html;
}

function lifePalaceFullHtml(display, reading) {
  if (display.mode === 'open') {
    return display.description ? '<p>' + display.description + '</p>' : '';
  }
  if (display.mode === 'borrowed') {
    return palaceExpandedBody(reading);
  }
  return palaceExpandedBody(reading);
}

function getArchetype(starCn) {
  var copy = STAR_SOUL_COPY[starCn];
  if (copy && copy.title) return copy.title.replace(/^The /, '');
  return STAR_NATURE[starCn] || 'Seeker';
}

function starEnShort(starCn) {
  if (!starCn || !STAR_EN[starCn]) return '';
  return STAR_EN[starCn].split('·')[0].trim();
}

function formatBureau(bureau) {
  if (!bureau) return '—';
  var m = String(bureau).match(/([金木水火土])(\d)/);
  if (!m) return bureau;
  return (BUREAU_EN[m[1]] || m[1]) + ' ' + m[2];
}

function wordTeaser(text, maxWords) {
  if (!text) return '';
  var words = text.replace(/\s+/g, ' ').trim().split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '…';
}

function pillarBody(reading) {
  var body = reading.body || reading.hook || '';
  if (body.length > 320) return body.substring(0, 317) + '…';
  return body || 'The stars in this domain reveal a pattern uniquely yours.';
}

function getIdentityBlurb(starCn, reading) {
  if (reading && reading.hook && reading.body) {
    return reading.hook + ' ' + wordTeaser(reading.body, 28);
  }
  if (reading && reading.hook) return reading.hook;
  return IDENTITY_BLURBS[starCn] || 'You carry a distinctive cosmic signature — one the stars have been writing since your first breath.';
}

function getForecastWindows(meta, lifeReading) {
  var theme = meta.theme2026 || 'Expansion';
  var yr = lifeReading && lifeReading.year2026 ? lifeReading.year2026 : '';
  return [
    { months: 'Jan — Apr', theme: 'Foundation', line: yr || 'Early 2026 asks you to consolidate what you have built and clarify your next move.', featured: false },
    { months: 'May — Aug', theme: theme, line: 'Your peak window — the stars align for bold moves in ' + theme.toLowerCase() + ' and visible progress.', featured: true },
    { months: 'Sep — Dec', theme: 'Harvest', line: 'Results from earlier efforts crystallize. Protect gains and prepare for the next cycle.' }
  ];
}

// ─── RENDER ───

function renderIdentityHook(result, readings, meta) {
  var lifeDisplay = resolveLifePalaceDisplay(readings);
  var branch = getLifeBranch(result, readings);
  var bureau = formatBureau(result.bureau);
  var cycle = (result.palaces[0] && result.palaces[0].bigCycle) || '—';
  var starCn = lifeDisplay.starCn;
  var starLabel = starCn || (lifeDisplay.mode === 'open' ? '空宫' : '—');
  var starEn = lifeDisplay.mode === 'open'
    ? 'Open Path'
    : getStarSoulTitle(lifeDisplay.starCn);

  setText('hook-watermark', branch);
  setText('hook-meta', starLabel + ' · ' + branch + ' · ' + bureau);

  var titleEl = document.getElementById('hook-title');
  if (titleEl) {
    titleEl.innerHTML = 'You are<br><em>' + lifeDisplay.displayName + '</em>';
  }

  setText('hook-blurb', getSoulParadox(lifeDisplay));

  var badgesEl = document.getElementById('hook-sihua-badges');
  if (badgesEl) {
    var lifeHua = (readings[0] && readings[0].hua) || [];
    if (!lifeHua.length && lifeDisplay.mode === 'borrowed' && readings[6]) {
      lifeHua = readings[6].hua || [];
    }
    badgesEl.innerHTML = renderSihuaBadges(lifeHua);
  }

  setText('hs-element', bureau);
  setText('hs-life', branch + ' · ' + starEn);
  setText('hs-cycle', cycle);
  setText('hs-2026', meta.theme2026 || '—');

  var cycleEl = document.getElementById('hook-cycle-prophecy');
  if (cycleEl) {
    cycleEl.textContent = '"' + getCycleProphecy(cycle, lifeDisplay) + '"';
  }
}

function renderPillarCard(config) {
  var reading = config.reading;
  var card = document.createElement('div');
  card.className = 'pillar-card' + (config.featured ? ' featured' : '');
  var title;
  var body;
  var tag;
  if (config.isLifePillar && config.readings) {
    var lifeDisplay = resolveLifePalaceDisplay(config.readings);
    title = lifePalaceCardTitle(lifeDisplay);
    body = lifeDisplay.mode === 'native'
      ? pillarBody(reading)
      : (lifeDisplay.description || pillarBody(lifeDisplay.reading));
    tag = lifeDisplay.tag;
  } else {
    var starCn = (reading.majorStars && reading.majorStars[0]) || '';
    title = starCn ? starEnShort(starCn) : 'No Major Star';
    body = pillarBody(reading);
    tag = (starCn || reading.stemBranch) + ' · ' + reading.palaceEn.split('&')[0].trim();
  }
  card.innerHTML = ''
    + (config.featured ? '<div class="pillar-badge">HIGH IMPACT</div>' : '')
    + '<div class="pillar-icon">' + config.icon + '</div>'
    + '<div class="pillar-label">' + config.label + '</div>'
    + '<h3>' + title + '</h3>'
    + '<p>' + body + '</p>'
    + '<div class="pillar-tag">' + tag + '</div>';
  return card;
}

function renderThreePillars(readings) {
  var grid = document.getElementById('pillars-grid');
  if (!grid || !readings.length) return;
  grid.innerHTML = '';
  grid.appendChild(renderPillarCard({
    icon: '☽', label: 'WHO YOU ARE', reading: readings[0], featured: false, isLifePillar: true, readings: readings
  }));
  grid.appendChild(renderPillarCard({
    icon: '◆', label: 'HOW YOU ATTRACT WEALTH', reading: readings[4], featured: true
  }));
  grid.appendChild(renderPillarCard({
    icon: '♡', label: 'HOW YOU LOVE', reading: readings[2], featured: false
  }));
}

function renderYearForecast(meta, readings) {
  var container = document.getElementById('forecast-windows');
  if (!container) return;
  container.innerHTML = '';
  getForecastWindows(meta, readings[0]).forEach(function(w) {
    var card = document.createElement('div');
    card.className = 'window-card' + (w.featured ? ' featured' : '');
    card.innerHTML = ''
      + '<div class="month">' + w.months + '</div>'
      + '<div class="theme">' + w.theme + '</div>'
      + '<p>' + w.line + '</p>';
    container.appendChild(card);
  });
}

function renderPalaceLifeCard(reading, index, readings) {
  var locked = isPalaceLocked(index);
  var lifeDisplay = index === 0 ? resolveLifePalaceDisplay(readings) : null;
  var starCn = (reading.majorStars && reading.majorStars[0]) || '';
  var card = document.createElement('div');
  card.className = 'palace-life-card' + (locked ? ' locked' : '');
  card.id = 'palace-card-' + index;
  var title = lifeDisplay ? lifePalaceCardTitle(lifeDisplay) : (starCn ? starEnShort(starCn) : 'No Major Star');
  var teaser = lifeDisplay
    ? lifePalaceTeaser(lifeDisplay, lifeDisplay.reading)
    : wordTeaser(reading.hook || pillarBody(reading), 15);
  var fullHtml = lifeDisplay
    ? lifePalaceFullHtml(lifeDisplay, lifeDisplay.reading)
    : palaceExpandedBody(reading);
  var btnLabel = locked ? 'Unlock — Free with Email' : 'Reveal Full Reading';
  card.innerHTML = ''
    + '<div class="topic-tag">' + (TOPIC_TAGS[reading.palaceCn] || reading.palaceEn.toUpperCase()) + '</div>'
    + '<h3 class="star-name">' + title + '</h3>'
    + '<p class="teaser">' + teaser + '</p>'
    + '<div class="palace-full-body" id="palace-body-' + index + '">' + fullHtml + '</div>'
    + '<button type="button" class="card-action" data-index="' + index + '">' + btnLabel + '</button>';
  card.querySelector('.card-action').addEventListener('click', function() {
    handlePalaceAction(index);
  });
  if (!locked) {
    card.classList.add('expanded');
  }
  return card;
}

function handlePalaceAction(index) {
  if (isPalaceLocked(index)) {
    var gate = document.getElementById('email-gate-embedded');
    if (gate) gate.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  var card = document.getElementById('palace-card-' + index);
  if (card) card.classList.toggle('expanded');
}

function renderPalaceGroups(readings) {
  var container = document.getElementById('palace-groups');
  if (!container) return;
  container.innerHTML = '';
  PALACE_GROUPS.forEach(function(group) {
    var section = document.createElement('div');
    section.className = 'palace-group';
    section.innerHTML = '<div class="group-title">' + group.title + '</div>';
    group.indices.forEach(function(idx) {
      if (readings[idx]) section.appendChild(renderPalaceLifeCard(readings[idx], idx, readings));
    });
    container.appendChild(section);
  });
}

function setChartStatus() { /* decorative chart — no status badges */ }

function hideLoadingScreen() {
  var loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) loadingScreen.style.display = 'none';
}

function renderChartSvg(result) {
  if (!window.ZwdsChartRender || typeof window.ZwdsChartRender.renderChartSvg !== 'function') {
    throw new Error('Branch-based chart renderer failed to load.');
  }
  chartState.chartData = window.ZwdsChartRender.buildChartData(result);
  return window.ZwdsChartRender.renderChartSvg(result);
}

function populateResultsUI(result, params) {
  chartState.readings = getChartReading(result);
  var lifeStarCn = getEffectiveLifeStarCn(chartState.readings);
  var meta = getChartMeta(result, lifeStarCn);

  renderIdentityHook(result, chartState.readings, meta);
  renderThreePillars(chartState.readings);
  renderYearForecast(meta, chartState.readings);
  renderPalaceGroups(chartState.readings);

  window.__chartData = buildChartShareData(result, chartState.readings, meta);
  renderShareSection(window.__chartData);
  initShareButtons();

  var results = document.getElementById('results-container');
  if (results) results.style.display = 'block';
  showBlock('cta-block');

  setTimeout(function() {
    generateAndUpdateAIReadings(result, params);
  }, 800);
}

function closeCard() { /* legacy noop */ }

function updatePalaceTocActive() { /* removed sidebar */ }

function renderPalaceToc() { /* removed sidebar */ }

function refreshPalaceCard(index) {
  var readings = chartState.readings;
  var reading = readings && readings[index];
  if (!reading) return;
  var card = document.getElementById('palace-card-' + index);
  if (!card) return;
  var lifeDisplay = index === 0 ? resolveLifePalaceDisplay(readings) : null;
  var titleEl = card.querySelector('.star-name');
  if (titleEl) {
    titleEl.textContent = lifeDisplay
      ? lifePalaceCardTitle(lifeDisplay)
      : ((reading.majorStars && reading.majorStars[0]) ? starEnShort(reading.majorStars[0]) : 'No Major Star');
  }
  var teaserEl = card.querySelector('.teaser');
  if (teaserEl) {
    teaserEl.textContent = lifeDisplay
      ? lifePalaceTeaser(lifeDisplay, lifeDisplay.reading)
      : wordTeaser(reading.hook || pillarBody(reading), 15);
  }
  var bodyEl = document.getElementById('palace-body-' + index);
  if (bodyEl) {
    bodyEl.innerHTML = lifeDisplay
      ? lifePalaceFullHtml(lifeDisplay, lifeDisplay.reading)
      : palaceExpandedBody(reading);
  }
}

// ─── MAIN ───
function init() {
  try {
    const params = getParams();
    chartState.birthDate = params.date;
    chartState.year = params.year;
    chartState.month = params.month;
    chartState.day = params.day;
    chartState.hourIndex = params.hour;
    chartState.hourLabel = params.hourLabel;
    chartState.country = params.country;

    if (params.email) {
      const gateEmail = document.getElementById('gate-email');
      if (gateEmail && !gateEmail.value) gateEmail.value = params.email;
    }

    if (!params.date) {
      throw new Error('Missing birth date — please return to the form and try again.');
    }

    const loadingStatus = document.getElementById('loading-status');
    if (loadingStatus) loadingStatus.textContent = 'CALCULATING LIFE PALACE · 命宮';

    if (!window.zwdsCore || typeof window.zwdsCore.calculateChart !== 'function') {
      throw new Error('Chart engine failed to load.');
    }
    if (!window.ZwdsChartRender) {
      throw new Error('Branch chart renderer failed to load.');
    }

    const result = window.zwdsCore.calculateChart(params.year, params.month, params.day, params.hour, 'M');
    if (!result || !result.palaces) {
      throw new Error('Chart calculation returned no data.');
    }

    chartState.result = result;

    const svgOk = renderChartSvg(result);
    if (!svgOk) {
      throw new Error('Failed to render the 12-palace chart diagram.');
    }

    hideLoadingScreen();
    populateResultsUI(result, params);

  } catch (err) {
    showError(err);
  }
}

function unlockAllPalaces() {
  chartState.unlocked = true;
  document.body.classList.add('chart-unlocked');
  if (chartState.readings && chartState.readings.length) {
    renderPalaceGroups(chartState.readings);
  }
}

function hideEmbeddedGate() {
  var gate = document.getElementById('email-gate-embedded');
  if (gate) {
    gate.classList.add('hiding');
    setTimeout(function() {
      gate.style.display = 'none';
    }, 520);
  }
}

function submitGate(event) {
  if (event) event.preventDefault();
  var name = document.getElementById('gate-name').value.trim();
  var email = document.getElementById('gate-email').value.trim();
  var btn = document.getElementById('gate-submit-btn');
  if (!email) { alert('Please enter your email.'); return false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Please enter a valid email.'); return false; }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Unlocking your chart…';
  }

  var lifeDisplay = chartState.readings ? resolveLifePalaceDisplay(chartState.readings) : null;
  var lifeStarCn = lifeDisplay && lifeDisplay.starCn ? lifeDisplay.starCn : '';
  var mainStarEn = lifeStarCn && STAR_EN[lifeStarCn]
    ? STAR_EN[lifeStarCn].split('·')[0].trim()
    : (lifeDisplay && lifeDisplay.mode === 'open' ? 'The Open Path' : '');
  var chartSvg = '';
  var svgEl = document.getElementById('chart-svg');
  if (svgEl) {
    chartSvg = svgEl.outerHTML;
    if (chartSvg.length > 50000) chartSvg = chartSvg.slice(0, 50000);
  }

  var payload = {
    name: name || 'Chart Reader',
    email: email,
    source: 'free-chart-gate',
    page: '/free-chart.html',
    dob: chartState.birthDate,
    hour: chartState.hourIndex,
    country: chartState.country,
    mainStar: lifeStarCn || '',
    mainStarEn: mainStarEn,
    chartSvg: chartSvg,
    pdfReady: true
  };

  fetch('/api/collect-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(function() {
    console.log('Lead captured (offline):', JSON.stringify(payload));
  });

  unlockAllPalaces();
  document.getElementById('gate-form').style.display = 'none';
  document.getElementById('gate-embedded-success').classList.add('show');
  setTimeout(hideEmbeddedGate, 1800);
  return false;
}

window.init = init;
window.submitGate = submitGate;
window.closeCard = closeCard;
window.unlockAllPalaces = unlockAllPalaces;

function setText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text || '';
}

function showFlex(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}

function showBlock(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

function getChartMeta(result, lifeStarCn) {
  var elements = { '紫微':'Earth','天機':'Wood','太陽':'Fire','武曲':'Metal','天同':'Water','廉貞':'Fire',
                     '天府':'Earth','太陰':'Water','貪狼':'Wood','巨門':'Water','天相':'Water','天梁':'Earth',
                     '七殺':'Metal','破軍':'Water' };
  return {
    element: (lifeStarCn && elements[lifeStarCn]) || 'Earth',
    strength: (lifeStarCn && {'紫微':'Authority','天機':'Intellect','太陽':'Radiance','武曲':'Command','天同':'Harmony',
                      '廉貞':'Resilience','天府':'Abundance','太陰':'Intuition','貪狼':'Magnetism','巨門':'Perception',
                      '天相':'Diplomacy','天梁':'Wisdom','七殺':'Courage','破軍':'Transformation'}[lifeStarCn]) || 'Wisdom',
    theme2026: (lifeStarCn && {'紫微':'Power','天機':'Revelation','太陽':'Recognition','武曲':'Harvest','天同':'Peace',
                       '廉貞':'Breakthrough','天府':'Accumulation','太陰':'Deepening','貪狼':'Expansion','巨門':'Truth',
                       '天相':'Alliance','天梁':'Protection','七殺':'Purge','破軍':'Rebirth'}[lifeStarCn]) || 'Expansion'
  };
}

function showError(err) {
  var screen = document.getElementById('loading-screen');
  if (screen) {
    screen.innerHTML = ''
      + '<div style="color:#c97474;font-style:italic;font-size:1.05rem;line-height:1.8;max-width:480px;margin:0 auto;">'
      + '<div style="font-family:\'Cinzel\',serif;font-size:0.65rem;letter-spacing:0.2em;color:#8B6E2E;margin-bottom:1rem;">CALCULATION ERROR</div>'
      + '<p>The stars could not be calculated: <strong style="color:#e08080">' + (err.message || 'Unknown error') + '</strong></p>'
      + '<p style="margin-top:0.5rem;font-size:0.8rem;color:#8B8070">' + (err.stack ? err.stack.substring(0,300) : '') + '</p>'
      + '<p style="margin-top:1.5rem"><a href="index.html" style="color:#C9A84C;text-decoration:none;font-family:\'Cinzel\',serif;font-size:0.65rem;letter-spacing:0.15em">← RETURN TO CHART FORM</a></p>'
      + '</div>';
  }
}

// ─── 🦞 小龙虾：AI 解盘补全引擎 ────────────────────────────────────────
// 异步触发 Claude 为每个宫位生成深度解读，更新到已渲染的卡片中
var AI_READINGS_CACHE = {};

async function generateAndUpdateAIReadings(result, params) {
  if (!result || !result.palaces) return;

  var lifeDisplay = chartState.readings ? resolveLifePalaceDisplay(chartState.readings) : null;
  var lifeStarCn = (lifeDisplay && lifeDisplay.starCn) || '';

  var blurbEl = document.getElementById('hook-blurb');
  if (lifeDisplay && lifeDisplay.mode === 'native' && lifeStarCn && blurbEl) {
    generateMasterReading(lifeStarCn, params.date, params.hourLabel).then(function(text) {
      /* keep SOUL_PARADOX as primary hook copy */
      if (text && blurbEl && !blurbEl.textContent) blurbEl.textContent = text;
    });
  }

  for (var i = 0; i < result.palaces.length; i++) {
    (function(idx) {
      setTimeout(async function() {
        if (idx === 0) {
          var ld = chartState.readings ? resolveLifePalaceDisplay(chartState.readings) : null;
          if (ld && ld.mode !== 'native') return;
        }

        var palace = result.palaces[idx];
        var majorStars = palace.majorStars || [];
        var starCn = majorStars.length > 0 ? majorStars[0] : '—';
        var starData = STAR_EN[starCn] || starCn;
        var palaceName = palace.name || '';

        var existing = chartState.readings && chartState.readings[idx];
        var existingBody = existing ? (existing.body || '') : '';
        if (existingBody && existingBody.length > 80) return;

        try {
          var raw = await generatePalaceReading(
            palaceName,
            starCn,
            starData,
            params.date,
            params.hourLabel,
            lifeStarCn || '—'
          );
          var parsed = parseReading(raw);

          if (chartState.readings && chartState.readings[idx]) {
            chartState.readings[idx].hook = parsed.hook;
            chartState.readings[idx].body = parsed.body;
            chartState.readings[idx].year2026 = parsed.year2026;
          }

          if (idx === 0 && chartState.readings) {
            renderIdentityHook(chartState.result, chartState.readings, getChartMeta(chartState.result, getEffectiveLifeStarCn(chartState.readings)));
          }
          if (idx === 0 || idx === 4 || idx === 2) {
            renderThreePillars(chartState.readings);
          }
          if (idx === LIFE_OPPOSITE_INDEX && chartState.readings) {
            var borrowedLife = resolveLifePalaceDisplay(chartState.readings);
            if (borrowedLife.mode === 'borrowed') {
              renderIdentityHook(chartState.result, chartState.readings, getChartMeta(chartState.result, getEffectiveLifeStarCn(chartState.readings)));
              renderThreePillars(chartState.readings);
              refreshPalaceCard(0);
            }
          }
          refreshPalaceCard(idx);
        } catch (e) {
          /* keep static readings */
        }
      }, idx * 1200);
    })(i);
  }
}

function getShareTagline(lifeDisplay) {
  var soul = getSoulParadox(lifeDisplay);
  var match = soul.match(/^[^.!?]+[.!?]/);
  if (match) return match[0].trim();
  return wordTeaser(soul, 12);
}

function buildChartShareData(result, readings, meta) {
  var lifeDisplay = resolveLifePalaceDisplay(readings);
  var branch = getLifeBranch(result, readings);
  var bureau = formatBureau(result.bureau);
  var starCn = lifeDisplay.starCn;
  var starLabel = starCn || (lifeDisplay.mode === 'open' ? '空宫' : '—');
  return {
    persona: lifeDisplay.displayName,
    lifeStarEn: lifeDisplay.displayName,
    lifeStarCn: starLabel,
    lifeBranch: branch,
    element: bureau,
    tagline: getShareTagline(lifeDisplay)
  };
}

function renderShareSection(shareData) {
  var personaEl = document.getElementById('share-persona');
  if (personaEl) personaEl.textContent = shareData.persona;
  setText('share-star-meta', shareData.lifeStarCn + ' · ' + shareData.element + ' · ' + shareData.lifeBranch);
  var taglineEl = document.getElementById('share-tagline');
  if (taglineEl) taglineEl.textContent = '"' + shareData.tagline + '"';
}

function initShareButtons() {
  var chartData = window.__chartData || {};
  var persona = chartData.persona || 'The Seeker';
  var shareText =
    'I just got my Zi Wei Dou Shu chart — I am ' + persona + '. ' +
    '"' + (chartData.tagline || 'Your destiny is written in the stars.') + '" ' +
    'Calculate yours free:';
  var shareUrl =
    'https://metaphysicflow.com/free-chart.html' +
    '?ref=share&from=' + encodeURIComponent(persona);

  var twitterBtn = document.getElementById('twitter-share-btn');
  if (twitterBtn) {
    twitterBtn.href =
      'https://twitter.com/intent/tweet' +
      '?text=' + encodeURIComponent(shareText) +
      '&url=' + encodeURIComponent(shareUrl) +
      '&hashtags=ZiWeiDouShu,PurpleStarAstrology';
  }

  var waBtn = document.getElementById('whatsapp-share-btn');
  if (waBtn) {
    waBtn.href = 'https://wa.me/?text=' + encodeURIComponent(shareText + ' ' + shareUrl);
  }
}

function copyChartLink() {
  var chartData = window.__chartData || {};
  var persona = chartData.persona || 'The Seeker';
  var url =
    'https://metaphysicflow.com/free-chart.html' +
    '?ref=share&from=' + encodeURIComponent(persona);

  function onCopied() {
    var btn = document.getElementById('copy-btn');
    if (!btn) return;
    var original = btn.innerHTML;
    btn.innerHTML = '✓ Link Copied!';
    btn.style.borderColor = 'rgba(109,184,122,0.5)';
    btn.style.color = '#6DB87A';
    setTimeout(function() {
      btn.innerHTML = original;
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 2500);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(onCopied).catch(function() {
      fallbackCopy(url);
      onCopied();
    });
  } else {
    fallbackCopy(url);
    onCopied();
  }
}

function fallbackCopy(text) {
  var el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

window.copyChartLink = copyChartLink;
window.initShareButtons = initShareButtons;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

