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
  '天同': 'Harmonizer', '廉貞': 'Integrity Keeper', '天府': 'Steward', '太陰': 'Keeper',
  '貪狼': 'Magnet', '巨門': 'Truth-Seeker', '天相': 'Mediator', '天梁': 'Sage',
  '七殺': 'Warrior', '破軍': 'Renegade'
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

function getArchetype(starCn) {
  return STAR_ARCHETYPE[starCn] || STAR_NATURE[starCn] || 'Seeker';
}

function starEnShort(starCn) {
  if (!starCn || !STAR_EN[starCn]) return 'Open Palace';
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
  var lifeStar = (readings[0] && readings[0].majorStars[0]) || '';
  var archetype = getArchetype(lifeStar);
  var titleEl = document.getElementById('hook-title');
  if (titleEl) {
    titleEl.innerHTML = 'You are<br><em>The ' + archetype + '</em>';
  }
  setText('hook-blurb', getIdentityBlurb(lifeStar, readings[0]));
  setText('hs-element', formatBureau(result.bureau));
  setText('hs-life', result.lifeStemBranch || (readings[0] && readings[0].stemBranch) || '—');
  var cycle = (result.palaces[0] && result.palaces[0].bigCycle) || '—';
  setText('hs-cycle', cycle);
  setText('hs-2026', meta.theme2026 || '—');
}

function renderPillarCard(config) {
  var reading = config.reading;
  var card = document.createElement('div');
  card.className = 'pillar-card' + (config.featured ? ' featured' : '');
  var starCn = (reading.majorStars && reading.majorStars[0]) || '';
  card.innerHTML = ''
    + (config.featured ? '<div class="pillar-badge">HIGH IMPACT</div>' : '')
    + '<div class="pillar-icon">' + config.icon + '</div>'
    + '<div class="pillar-label">' + config.label + '</div>'
    + '<h3>' + (starCn ? starEnShort(starCn) : 'Open Palace') + '</h3>'
    + '<p>' + pillarBody(reading) + '</p>'
    + '<div class="pillar-tag">' + (starCn || reading.stemBranch) + ' · ' + reading.palaceEn.split('&')[0].trim() + '</div>';
  return card;
}

function renderThreePillars(readings) {
  var grid = document.getElementById('pillars-grid');
  if (!grid || !readings.length) return;
  grid.innerHTML = '';
  grid.appendChild(renderPillarCard({
    icon: '☽', label: 'WHO YOU ARE', reading: readings[0], featured: false
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

function renderPalaceLifeCard(reading, index) {
  var locked = isPalaceLocked(index);
  var starCn = (reading.majorStars && reading.majorStars[0]) || '';
  var card = document.createElement('div');
  card.className = 'palace-life-card' + (locked ? ' locked' : '');
  card.id = 'palace-card-' + index;
  var teaser = wordTeaser(reading.hook || pillarBody(reading), 15);
  var fullHtml = ''
    + (reading.hook ? '<p><em>"' + reading.hook + '"</em></p>' : '')
    + (reading.body ? '<p>' + reading.body + '</p>' : '')
    + (reading.year2026 ? '<p style="color:var(--gold-light);font-style:italic;margin-top:1rem">✦ 2026: ' + reading.year2026 + '</p>' : '');
  var btnLabel = locked ? 'Unlock — Free with Email' : 'Reveal Full Reading';
  card.innerHTML = ''
    + '<div class="topic-tag">' + (TOPIC_TAGS[reading.palaceCn] || reading.palaceEn.toUpperCase()) + '</div>'
    + '<h3 class="star-name">' + (starCn ? starEnShort(starCn) : 'Open Palace') + '</h3>'
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
      if (readings[idx]) section.appendChild(renderPalaceLifeCard(readings[idx], idx));
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
  var lifeStarCn = result.palaces[0] && result.palaces[0].majorStars && result.palaces[0].majorStars[0];
  var meta = getChartMeta(result, lifeStarCn);

  renderIdentityHook(result, chartState.readings, meta);
  renderThreePillars(chartState.readings);
  renderYearForecast(meta, chartState.readings);
  renderPalaceGroups(chartState.readings);

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
  var reading = chartState.readings && chartState.readings[index];
  if (!reading) return;
  var card = document.getElementById('palace-card-' + index);
  if (!card) return;
  var teaserEl = card.querySelector('.teaser');
  if (teaserEl) teaserEl.textContent = wordTeaser(reading.hook || pillarBody(reading), 15);
  var bodyEl = document.getElementById('palace-body-' + index);
  if (bodyEl) {
    bodyEl.innerHTML = ''
      + (reading.hook ? '<p><em>"' + reading.hook + '"</em></p>' : '')
      + (reading.body ? '<p>' + reading.body + '</p>' : '')
      + (reading.year2026 ? '<p style="color:var(--gold-light);font-style:italic;margin-top:1rem">✦ 2026: ' + reading.year2026 + '</p>' : '');
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

  var lifeStarCn =
    chartState.result &&
    chartState.result.palaces[0] &&
    chartState.result.palaces[0].majorStars &&
    chartState.result.palaces[0].majorStars[0];
  var mainStarEn = lifeStarCn && STAR_EN[lifeStarCn]
    ? STAR_EN[lifeStarCn].split('·')[0].trim()
    : '';
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

  var lifeStarCn = (result.palaces[0] && result.palaces[0].majorStars && result.palaces[0].majorStars[0]) || '紫微';

  var blurbEl = document.getElementById('hook-blurb');
  var currentBlurb = blurbEl ? blurbEl.textContent : '';
  if (!currentBlurb || currentBlurb.indexOf('being calculated') !== -1) {
    generateMasterReading(lifeStarCn, params.date, params.hourLabel).then(function(text) {
      if (text && blurbEl) blurbEl.textContent = text;
    });
  }

  for (var i = 0; i < result.palaces.length; i++) {
    (function(idx) {
      setTimeout(async function() {
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
            lifeStarCn
          );
          var parsed = parseReading(raw);

          if (chartState.readings && chartState.readings[idx]) {
            chartState.readings[idx].hook = parsed.hook;
            chartState.readings[idx].body = parsed.body;
            chartState.readings[idx].year2026 = parsed.year2026;
          }

          if (idx === 0) {
            var lifeStar = (chartState.readings[0] && chartState.readings[0].majorStars[0]) || '';
            setText('hook-blurb', getIdentityBlurb(lifeStar, chartState.readings[0]));
          }
          if (idx === 0 || idx === 4 || idx === 2) {
            renderThreePillars(chartState.readings);
          }
          refreshPalaceCard(idx);
        } catch (e) {
          /* keep static readings */
        }
      }, idx * 1200);
    })(i);
  }
}

// Start on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

