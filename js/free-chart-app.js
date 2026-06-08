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

// ─── RENDER ───

function renderPalaceCard(reading, index) {
  if (!reading) return document.createElement('div');

  const locked = isPalaceLocked(index);
  const card = document.createElement('div');
  card.className = 'palace-card' + (locked ? ' palace-locked' : ' palace-free');
  card.id = 'card-' + index;

  const stars = reading.majorStars || [];
  const hua = reading.hua || [];
  const hasStars = stars.length > 0;

  const h = reading.hook || '';
  const body = reading.body || '';
  const previewLimit = locked ? 90 : 220;
  const fullPreview = locked ? h : (h + (body ? ' ' + body : ''));
  const preview = fullPreview
    ? (fullPreview.length > previewLimit ? fullPreview.substring(0, previewLimit) + String.fromCharCode(8230) : fullPreview)
    : '';

  const huaHTML = hua.length > 0
    ? '<span style="display:inline-block;margin-top:4px;font-size:10px;color:#C9A84C;letter-spacing:0.5px">' + String.fromCharCode(10024) + ' ' + hua.join(' · ') + '</span>'
    : '';

  card.innerHTML = ''
    + '<div class="palace-number">PALACE ' + reading.roman + '</div>'
    + '<div class="palace-chinese">' + reading.palaceCn + '</div>'
    + '<div class="palace-english">' + reading.palaceEn + '</div>'
    + (hasStars
        ? '<div class="palace-star">' + reading.starEn.split('·')[0].trim() + '</div><div class="palace-star-chinese">' + stars.join(' · ') + '</div>'
        : '<div class="palace-star" style="color:#8B8070;font-style:italic">No major star</div><div class="palace-star-chinese">' + reading.stemBranch + '</div>')
    + huaHTML
    + '<div class="palace-locked-content">'
    + '<div class="palace-preview">' + preview + '</div>'
    + '<div class="palace-read-more">READ FULL READING'
    + '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="#C9A84C" stroke-width="1" stroke-linecap="round"/></svg></div>'
    + '</div>';

  card.addEventListener('click', function() { toggleCard(index); });
  return card;
}

function renderExpandedPanel(reading, index) {
  if (!reading) return document.createElement('div');

  const locked = isPalaceLocked(index);
  const panel = document.createElement('div');
  panel.className = 'palace-expanded' + (locked ? ' palace-locked' : '');
  panel.id = 'expanded-' + index;
  
  const stars = reading.majorStars || [];
  const aux = reading.auxiliaryStars || [];
  const hasStars = stars.length > 0;
  const hua = reading.hua || [];
  
  const auxHTML = aux.length > 0 
    ? '<div style="font-size:0.85rem;color:#8B8070;margin-top:0.5rem">辅星: ' + aux.join(' · ') + ' | 宫干: ' + reading.stemBranch + '</div>'
    : '<div style="font-size:0.85rem;color:#8B8070;margin-top:0.5rem">宫干: ' + reading.stemBranch + '</div>';
  
  const huaBlock = hua.length > 0
    ? '<p style="margin-top:1rem;color:#C9A84C;font-style:italic;font-size:0.95rem">' + String.fromCharCode(10024) + ' 四化: ' + hua.join(' · ') + '</p>'
    : '';
  
  var hookText = reading.hook || '';
  var bodyText = reading.body || '';
  var yearText = reading.year2026 || '';
  
  panel.innerHTML = ''
    + '<div class="expanded-header">'
    + '<div class="expanded-title-block">'
    + '<div class="palace-chinese">' + reading.palaceCn + '</div>'
    + '<div class="palace-english" style="margin:0.25rem 0 0.5rem">' + reading.palaceEn + '</div>'
    + (hasStars
        ? '<div class="expanded-star-full"><span>' + reading.starEn.split('·')[0].trim() + '</span> · ' + reading.nature + '</div>'
        : '<div class="expanded-star-full" style="color:#8B8070">空宫 · ' + reading.stemBranch + '</div>')
    + auxHTML
    + '</div>'
    + '<button class="close-btn" onclick="closeCard(' + index + ')">CLOSE ' + String.fromCharCode(10005) + '</button>'
    + '</div>'
    + '<div class="expanded-body palace-locked-content">'
    + '<p class="hook">"' + hookText + '"</p>'
    + (bodyText ? '<p>' + bodyText + '</p>' : '')
    + huaBlock
    + (yearText ? '<p style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid rgba(201,168,76,0.15);color:#C9A84C;font-style:italic">' + String.fromCharCode(10024) + ' 2026: ' + yearText + '</p>' : '')
    + '</div>';
  
  return panel;
}

function toggleCard(index) {
  if (chartState.activeCard === index) {
    closeCard(index);
    return;
  }
  if (chartState.activeCard !== null) {
    closeCard(chartState.activeCard, false);
  }
  chartState.activeCard = index;
  
  const card = document.getElementById('card-' + index);
  if (card) card.classList.add('active');
  
  const oldExpanded = document.getElementById('expanded-' + index);
  if (oldExpanded) oldExpanded.remove();
  
  const panel = renderExpandedPanel(chartState.readings[index], index);
  panel.classList.add('open');
  
  if (card) {
    card.after(panel);
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  updatePalaceTocActive(index);
}

function closeCard(index, updateState) {
  if (updateState === undefined) updateState = true;
  const card = document.getElementById('card-' + index);
  if (card) card.classList.remove('active');
  const panel = document.getElementById('expanded-' + index);
  if (panel) panel.remove();
  if (updateState) chartState.activeCard = null;
  updatePalaceTocActive(null);
}

function updatePalaceTocActive(index) {
  var toc = document.getElementById('palace-toc');
  if (!toc) return;
  var links = toc.querySelectorAll('a');
  for (var i = 0; i < links.length; i++) {
    links[i].classList.toggle('active', index !== null && i === index);
  }
}

function renderPalaceToc() {
  var toc = document.getElementById('palace-toc');
  if (!toc || !chartState.readings) return;

  toc.innerHTML = '<div class="palace-toc-label">Palace Index</div>';

  chartState.readings.forEach(function(reading, index) {
    var a = document.createElement('a');
    a.href = '#card-' + index;
    a.textContent = reading.roman + '. ' + reading.palaceEn.split('&')[0].trim();
    if (isPalaceLocked(index)) a.classList.add('locked');
    a.addEventListener('click', function(e) {
      e.preventDefault();
      var card = document.getElementById('card-' + index);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toggleCard(index);
      }
    });
    toc.appendChild(a);
  });

  toc.classList.add('visible');
}

function setChartStatus(loadingVisible, readyVisible) {
  var loadingEl = document.getElementById('chart-loading');
  var readyEl = document.getElementById('chart-ready');
  if (loadingEl) loadingEl.style.display = loadingVisible ? 'block' : 'none';
  if (readyEl) readyEl.style.display = readyVisible ? 'block' : 'none';
}

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
  var ds = document.getElementById('disp-star');
  if (ds) ds.textContent = (lifeStarCn && STAR_EN[lifeStarCn]) ? STAR_EN[lifeStarCn].split('·')[0].trim() : 'Zi Wei';

  var ftMeta = getChartMeta(result, lifeStarCn);
  setText('ft-element', ftMeta.element);
  setText('ft-cycle', result.yearStemBranch || '');
  setText('ft-2026', ftMeta.theme2026);
  setText('ft-strength', ftMeta.strength);
  showFlex('fortune-strip');

  var starData = lifeStarCn && STAR_EN[lifeStarCn] ? STAR_EN[lifeStarCn] : 'Zi Wei';
  setText('mb-name', starData.split('·')[0].trim());
  setText('mb-chinese', (lifeStarCn || '紫微') + ' · ' + (result.bureau || '') + ' · 命宫' + (result.lifeStemBranch || ''));

  if (chartState.readings && chartState.readings[0]) {
    setText('mb-essence', chartState.readings[0].hook || 'Your destiny is written in the stars.');
  } else {
    setText('mb-essence', 'Your destiny is written in the stars.');
  }
  showBlock('master-banner');
  showFlex('grid-label');

  var grid = document.getElementById('palace-grid');
  if (grid) {
    grid.innerHTML = '';
    if (chartState.readings) {
      for (var i = 0; i < chartState.readings.length; i++) {
        grid.appendChild(renderPalaceCard(chartState.readings[i], i));
      }
    }
  }

  renderPalaceToc();
  showBlock('cta-block');

  var results = document.getElementById('results-container');
  if (results) results.style.display = 'block';

  // 🦞 小龙虾：异步触发 Claude AI 解盘补全，不阻塞页面
  setTimeout(function() {
    generateAndUpdateAIReadings(result, params);
  }, 800);
}

// ─── MAIN ───
function init() {
  setChartStatus(true, false);

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

    const dd = document.getElementById('disp-date');
    if (dd) dd.textContent = params.date;
    const dh = document.getElementById('disp-hour');
    if (dh) {
      dh.textContent = params.hourLabel
        ? params.hourLabel.split('·')[0].trim()
        : (HOUR_LABELS[params.hour] ? HOUR_LABELS[params.hour].split('·')[0].trim() : '午时');
    }

    if (params.country) {
      const badge = document.getElementById('birth-display');
      if (badge && !document.getElementById('disp-country')) {
        const divider = document.createElement('div');
        divider.className = 'birth-divider';
        const item = document.createElement('div');
        item.className = 'birth-item';
        item.innerHTML = '<div class="birth-label">BIRTH LOCATION</div><div class="birth-value" id="disp-country">' + params.country + '</div>';
        badge.appendChild(divider);
        badge.appendChild(item);
      }
    }

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

    setChartStatus(false, true);
    hideLoadingScreen();
    populateResultsUI(result, params);

    setTimeout(function() {
      setChartStatus(false, false);
    }, 400);

  } catch (err) {
    setChartStatus(false, false);
    showError(err);
  }
}

function unlockAllPalaces() {
  chartState.unlocked = true;
  document.body.classList.add('chart-unlocked');
  document.querySelectorAll('.palace-locked').forEach(function(el) {
    el.classList.remove('palace-locked');
    el.classList.add('unlocked');
  });
  renderPalaceToc();
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
  setChartStatus(false, false);
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
  
  // 为主星生成 essence（如果还没内容）
  var mbEl = document.getElementById('mb-essence');
  var currentEssence = mbEl ? mbEl.textContent : '';
  if (!currentEssence || currentEssence === 'Your destiny is written in the stars.') {
    generateMasterReading(lifeStarCn, params.date, params.hourLabel).then(function(text) {
      if (text && mbEl) {
        mbEl.textContent = text;
      }
    });
  }
  
  // 逐个宫位生成 AI 深度解读
  for (var i = 0; i < result.palaces.length; i++) {
    (function(idx) {
      setTimeout(async function() {
        var palace = result.palaces[idx];
        var majorStars = palace.majorStars || [];
        var starCn = majorStars.length > 0 ? majorStars[0] : '—';
        var starData = STAR_EN[starCn] || starCn;
        var palaceName = palace.name || '';
        
        // 只有静态库没有深度 body 时才触发 AI
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
          
          // 更新 chartState
          if (chartState.readings && chartState.readings[idx]) {
            chartState.readings[idx].hook = parsed.hook;
            chartState.readings[idx].body = parsed.body;
            chartState.readings[idx].year2026 = parsed.year2026;
          }
          
          // 更新卡片预览
          var previewEl = document.querySelector('#card-' + idx + ' .palace-preview');
          if (previewEl && parsed.hook) {
            previewEl.textContent = parsed.hook.length > 90
              ? parsed.hook.substring(0, 87) + '...'
              : parsed.hook;
          }
          
          // 如果该宫位当前是展开状态，刷新展开面板
          if (chartState.activeCard === idx) {
            var oldPanel = document.getElementById('expanded-' + idx);
            if (oldPanel) {
              var newPanel = renderExpandedPanel(chartState.readings[idx], idx);
              newPanel.classList.add('open');
              oldPanel.replaceWith(newPanel);
            }
          }
        } catch (e) {
          // 静默失败，保持静态数据
        }
      }, idx * 1200); // 每个间隔1.2秒，避免并发限流
    })(i);
  }
}

// Start on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

