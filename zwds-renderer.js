// ===== ZWDS FRONTEND RENDERER — 前端渲染 + 交互逻辑 =====
// 依赖: ziwei-engine.js (全局 window.zwdsEngine)
//        ZWDS_READINGS (14主星×12宫位断语)

const PALACE_ORDER = ['命宮','兄弟宮','夫妻宮','子女宮','財帛宮','疾厄宮','遷移宮','仆役宮','官祿宮','田宅宮','福德宮','父母宮'];
const PALACE_EN = ['Life & Destiny','Siblings','Spouse & Romance','Children & Creativity','Wealth','Health','Travel & Migration','Friends & Servants','Career & Status','Property','Virtue & Fortune','Parents'];
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const HOUR_LABELS = ['子時 · Zi (23:00–01:00)','丑時 · Chou (01:00–03:00)','寅時 · Yin (03:00–05:00)','卯時 · Mao (05:00–07:00)','辰時 · Chen (07:00–09:00)','巳時 · Si (09:00–11:00)','午時 · Wu (11:00–13:00)','未時 · Wei (13:00–15:00)','申時 · Shen (15:00–17:00)','酉時 · You (17:00–19:00)','戌時 · Xu (19:00–21:00)','亥時 · Hai (21:00–23:00)'];

// 紫微斗数星曜名称 → 英文映射
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

// 从出生信息获取解读
function getChartReading(engineResult) {
  if (!engineResult || !engineResult.palaces) return null;
  
  const palaces = engineResult.palaces;
  
  // 对每个宫位，找主星
  const readings = palaces.map((palace, idx) => {
    const majorStars = palace.majorStars;
    const allStars = palace.starsDisplay;
    const hua = palace.fourHua || [];
    
    // 找到第一个主星用于查表
    let reading = null;
    for (const starCn of majorStars) {
      if (ZWDS_READINGS[starCn] && ZWDS_READINGS[starCn].readings[palace.cn]) {
        reading = ZWDS_READINGS[starCn].readings[palace.cn];
        break;
      }
    }
    
    return {
      index: idx,
      palaceCn: palace.cn,
      palaceEn: PALACE_EN[PALACE_ORDER.indexOf(palace.cn)] || palace.en,
      roman: ROMAN[idx],
      stemBranch: palace.stemBranch,
      majorStars: majorStars,
      auxiliaryStars: palace.auxiliaryStars,
      allStars: allStars,
      starDisplay: majorStars.length > 0 ? majorStars.join(' ') : '—',
      starEn: majorStars.length > 0 ? (STAR_EN[majorStars[0]] || '—') : '—',
      nature: majorStars.length > 0 ? (STAR_NATURE[majorStars[0]] || '—') : '—',
      hua: hua,
      hook: reading ? reading.getHook() : 'This palace reveals the subtle patterns of your destiny.',
      body: reading ? reading.body : '',
      year2026: reading ? reading.year2026 : ''
    };
  });
  
  return readings;
}

// ─── URL PARAMS ───
function getParams() {
  const p = new URLSearchParams(window.location.search);
  const rawDate = p.get('date') || '';
  const hour = parseInt(p.get('hour') ?? '6', 10);
  const hourLabel = p.get('hourLabel') || HOUR_LABELS[hour];
  const country = p.get('country') || '';
  
  let year = 1990, month = 1, day = 15;
  if (rawDate) {
    const parts = rawDate.replace(/-/g, '/').split('/');
    year = parseInt(parts[0]) || 1990;
    month = parseInt(parts[1]) || 1;
    day = parseInt(parts[2]) || 15;
  }
  
  return { date: rawDate.replace(/-/g, '/'), year, month, day, hour, hourLabel, country };
}

// ─── STATE ───
let chartState = {
  birthDate: '', year: 0, month: 0, day: 0, hourIndex: 0, hourLabel: '', country: '',
  result: null, readings: [], activeCard: null
};

// ─── RENDER ───

function renderPalaceCard(reading, index) {
  const card = document.createElement('div');
  card.className = 'palace-card';
  card.id = `card-${index}`;
  
  const huaBadge = reading.hua.length > 0 
    ? `<span style="display:inline-block;margin-top:4px;font-size:10px;color:var(--gold);letter-spacing:0.5px">✦ ${reading.hua.join(' · ')}</span>`
    : '';
  
  card.innerHTML = `
    <div class="palace-number">PALACE ${reading.roman}</div>
    <div class="palace-chinese">${reading.palaceCn}</div>
    <div class="palace-english">${reading.palaceEn}</div>
    ${reading.majorStars.length > 0 
      ? `<div class="palace-star">${reading.starEn.split('·')[0].trim()}</div>
         <div class="palace-star-chinese">${reading.majorStars.join(' · ')}</div>`
      : `<div class="palace-star" style="color:var(--text-muted);font-style:italic">No major star</div>
         <div class="palace-star-chinese">${reading.stemBranch}</div>`
    }
    <div class="palace-preview">${reading.getHook().substring(0, 90)}${reading.getHook().length > 90 ? '…' : ''}</div>
    ${huaBadge}
    <div class="palace-read-more">
      READ FULL READING
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6h8M7 3l3 3-3 3" stroke="#C9A84C" stroke-width="1" stroke-linecap="round"/>
      </svg>
    </div>
  `;
  card.addEventListener('click', () => toggleCard(index));
  return card;
}

function renderExpandedPanel(reading, index) {
  const panel = document.createElement('div');
  panel.className = 'palace-expanded';
  panel.id = `expanded-${index}`;
  
  const auxStars = reading.auxiliaryStars.length > 0 
    ? `<div style="font-size:0.85rem;color:var(--text-muted);margin-top:0.5rem">辅星: ${reading.auxiliaryStars.map(s => `${s}`).join(' · ')} | 宫干: ${reading.stemBranch}</div>`
    : `<div style="font-size:0.85rem;color:var(--text-muted);margin-top:0.5rem">宫干: ${reading.stemBranch}</div>`;
  
  const huaBlock = reading.hua.length > 0
    ? `<p style="margin-top:1rem;color:var(--gold);font-style:italic;font-size:0.95rem">✦ 四化: ${reading.hua.join(' · ')}</p>`
    : '';
  
  panel.innerHTML = `
    <div class="expanded-header">
      <div class="expanded-title-block">
        <div class="palace-chinese">${reading.palaceCn}</div>
        <div class="palace-english" style="margin:0.25rem 0 0.5rem">${reading.palaceEn}</div>
        ${reading.majorStars.length > 0 
          ? `<div class="expanded-star-full"><span>${reading.starEn.split('·')[0].trim()}</span> · ${reading.nature}</div>`
          : `<div class="expanded-star-full" style="color:var(--text-muted)">空宫 · ${reading.stemBranch}</div>`
        }
        ${auxStars}
      </div>
      <button class="close-btn" onclick="closeCard(${index})">CLOSE ✕</button>
    </div>
    <div class="expanded-body">
      <p class="hook">"${reading.hook}"</p>
      ${reading.body ? reading.body.split('\n\n').filter(p=>p.trim()).map(p => `<p>${p}</p>`).join('') : '<p>The stars of this palace speak through the patterns of your life. Consider how its themes manifest in your experience.</p>'}
      ${huaBlock}
      ${reading.year2026 ? `<p style="margin-top:1.5rem; padding-top:1.5rem; border-top:1px solid rgba(201,168,76,0.15); color:var(--gold); font-style:italic;">✦ 2026: ${reading.year2026}</p>` : ''}
    </div>
  `;
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
  
  const card = document.getElementById(`card-${index}`);
  if (card) card.classList.add('active');
  
  const oldExpanded = document.getElementById(`expanded-${index}`);
  if (oldExpanded) oldExpanded.remove();
  
  const panel = renderExpandedPanel(chartState.readings[index], index);
  panel.classList.add('open');
  
  if (card) {
    card.after(panel);
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function closeCard(index, updateState = true) {
  const card = document.getElementById(`card-${index}`);
  if (card) card.classList.remove('active');
  const panel = document.getElementById(`expanded-${index}`);
  if (panel) panel.remove();
  if (updateState) chartState.activeCard = null;
}

// ─── MAIN ───
function init() {
  const params = getParams();
  chartState.birthDate = params.date;
  chartState.year = params.year;
  chartState.month = params.month;
  chartState.day = params.day;
  chartState.hourIndex = params.hour;
  chartState.hourLabel = params.hourLabel;
  chartState.country = params.country;
  
  // Loading messages
  const loadingStatus = document.getElementById('loading-status');
  const statusMessages = [
    'CALCULATING LIFE PALACE · 命宮',
    'MAPPING WEALTH DESTINY · 財帛宮',
    'READING CAREER STARS · 官祿宮',
    'CONSULTING FORTUNE PALACE · 福德宮',
    'ASSEMBLING YOUR CONSTELLATION · 十二宮'
  ];
  let statusIdx = 0;
  const statusInterval = setInterval(() => {
    statusIdx = (statusIdx + 1) % statusMessages.length;
    if (loadingStatus) loadingStatus.textContent = statusMessages[statusIdx];
  }, 1200);
  
  // Display birth info
  document.getElementById('disp-date').textContent = params.date;
  document.getElementById('disp-hour').textContent = HOUR_LABELS[params.hour].split('·')[0].trim();
  
  if (params.country) {
    const badge = document.querySelector('.birth-badge');
    if (badge) {
      const divider = document.createElement('div'); divider.className = 'birth-divider';
      const item = document.createElement('div'); item.className = 'birth-item';
      item.innerHTML = `<div class="birth-label">PLACE OF BIRTH</div><div class="birth-value">${params.country}</div>`;
      badge.appendChild(divider);
      badge.appendChild(item);
    }
  }
  
  // Calculate chart using engine
  setTimeout(() => {
    try {
      const result = window.zwdsEngine.calculateChart(params.year, params.month, params.day, params.hour, 'M');
      chartState.result = result;
      chartState.readings = getChartReading(result);
      
      const lifeStarCn = result.palaces[0]?.majorStars?.[0] || '紫微';
      document.getElementById('disp-star').textContent = STAR_EN[lifeStarCn]?.split('·')[0]?.trim() || lifeStarCn;
      
      // Hide loading
      clearInterval(statusInterval);
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) loadingScreen.style.display = 'none';
      document.getElementById('results-container').style.display = 'block';
      
      // Fortune strip
      const meta = getChartMeta(result, lifeStarCn);
      document.getElementById('ft-element').textContent = meta.element;
      document.getElementById('ft-cycle').textContent = result.birthInfo.yearStemBranch;
      document.getElementById('ft-2026').textContent = meta.theme2026;
      document.getElementById('ft-strength').textContent = meta.strength;
      document.getElementById('fortune-strip').style.display = 'flex';
      
      // Master banner
      const starData = STAR_EN[lifeStarCn] || lifeStarCn;
      document.getElementById('mb-name').textContent = starData.split('·')[0]?.trim() || lifeStarCn;
      document.getElementById('mb-chinese').textContent = `${lifeStarCn} · ${result.bureau} · 命宫${result.lifePalace}`;
      
      const reading = ZWDS_READINGS[lifeStarCn]?.readings?.命宮;
      document.getElementById('mb-essence').textContent = reading?.hook || 'Your destiny is written in the stars — this chart reveals the patterns that shape your life.';
      document.getElementById('master-banner').style.display = 'block';
      
      // Grid
      document.getElementById('grid-label').style.display = 'flex';
      const grid = document.getElementById('palace-grid');
      grid.innerHTML = '';
      
      chartState.readings.forEach((reading, i) => {
        grid.appendChild(renderPalaceCard(reading, i));
      });
      
      // CTA
      document.getElementById('cta-block').style.display = 'block';
      
    } catch(err) {
      clearInterval(statusInterval);
      showError(err);
    }
  }, 600);
}

function getChartMeta(result, lifeStarCn) {
  const elements = { '紫微':'Earth','天機':'Wood','太陽':'Fire','武曲':'Metal','天同':'Water','廉貞':'Fire',
                     '天府':'Earth','太陰':'Water','貪狼':'Wood','巨門':'Water','天相':'Water','天梁':'Earth',
                     '七殺':'Metal','破軍':'Water' };
  const strengths = { '紫微':'Authority','天機':'Intellect','太陽':'Radiance','武曲':'Command','天同':'Harmony',
                      '廉貞':'Resilience','天府':'Abundance','太陰':'Intuition','貪狼':'Magnetism','巨門':'Perception',
                      '天相':'Diplomacy','天梁':'Wisdom','七殺':'Courage','破軍':'Transformation' };
  const themes2026 = { '紫微':'Power','天機':'Revelation','太陽':'Recognition','武曲':'Harvest','天同':'Peace',
                       '廉貞':'Breakthrough','天府':'Accumulation','太陰':'Deepening','貪狼':'Expansion','巨門':'Truth',
                       '天相':'Alliance','天梁':'Protection','七殺':'Purge','破軍':'Rebirth' };
  return {
    element: elements[lifeStarCn] || 'Earth',
    strength: strengths[lifeStarCn] || 'Authority',
    theme2026: themes2026[lifeStarCn] || 'Expansion'
  };
}

function showError(err) {
  const screen = document.getElementById('loading-screen');
  if (screen) {
    screen.innerHTML = `
      <div style="color:#c97474;font-style:italic;font-size:1.05rem;line-height:1.8;max-width:480px;margin:0 auto;">
        <div style="font-family:'Cinzel',serif;font-size:0.65rem;letter-spacing:0.2em;color:#8B6E2E;margin-bottom:1rem;">CALCULATION ERROR</div>
        <p>The stars could not be calculated: <strong style="color:#e08080">${err.message}</strong></p>
        <p style="margin-top:1.5rem"><a href="index.html" style="color:#C9A84C;text-decoration:none;font-family:'Cinzel',serif;font-size:0.65rem;letter-spacing:0.15em">← RETURN TO CHART FORM</a></p>
      </div>`;
  }
}

// Start on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
