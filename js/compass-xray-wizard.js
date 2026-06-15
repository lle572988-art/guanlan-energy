/**
 * Energy X-Ray — 3-step wizard (upload → facing → overlay).
 */
(function () {
  'use strict';

  var YEAR = 2026;

  var NINE_STARS = {
    1: { cn: '一白', en: 'White Star 1', el: 'Water', nature: 'good', label: 'Wealth & Networking',
      short: 'The money-and-connections star. Activate with metal or moving water.',
      cure: 'Place a small water feature or metal wind chime here.',
      color: '#2E4A5B' },
    2: { cn: '二黑', en: 'Black Star 2', el: 'Earth', nature: 'bad', label: 'Illness & Stagnation',
      short: 'The sickness star. Weakened by metal, worsened by fire.',
      cure: 'Hang a brass Wu Lou gourd or six-coin string. Remove candles and red decor.',
      color: '#4A3B2A' },
    3: { cn: '三碧', en: 'Jade Star 3', el: 'Wood', nature: 'bad', label: 'Conflict & Lawsuits',
      short: 'Arguments and legal trouble pool here. Drain with fire element.',
      cure: 'Add a red accent (lamp, cushion). Avoid green/blue tones in this sector.',
      color: '#3B5B3B' },
    4: { cn: '四綠', en: 'Green Star 4', el: 'Wood', nature: 'mixed', label: 'Romance & Academics',
      short: 'Study luck and new romance — but can bring scandal if misused.',
      cure: 'Great for a study or child\'s desk. Add a small plant; avoid excess water.',
      color: '#5B8C5A' },
    5: { cn: '五黃', en: 'Yellow Star 5', el: 'Earth', nature: 'dangerous', label: 'Catastrophe & Misfortune',
      short: 'The most dangerous annual star. Do NOT disturb this sector — no digging, drilling, or loud renovation.',
      cure: 'Place a heavy metal object (brass bell, copper bowl). Keep area quiet and still.',
      color: '#8B6B2F' },
    6: { cn: '六白', en: 'White Star 6', el: 'Metal', nature: 'good', label: 'Authority & Windfall',
      short: 'Unexpected gains and mentor luck. The heaven star.',
      cure: 'Activate with earth tones (ceramic, crystal) and keep well-lit.',
      color: '#7A7A6E' },
    7: { cn: '七赤', en: 'Red Star 7', el: 'Metal', nature: 'bad', label: 'Robbery & Betrayal',
      short: 'Financial loss, gossip, deception. Be cautious here.',
      cure: 'Add still water (a bowl of water, blue decor). Avoid metal wind chimes here.',
      color: '#8B4B4B' },
    8: { cn: '八白', en: 'White Star 8', el: 'Earth', nature: 'good', label: 'Prosperity & Fortune',
      short: 'The premier wealth star of Period 8 — still powerful. Activate aggressively.',
      cure: 'Keep bright and active. Add a crystal ball or earth-toned ceramics.',
      color: '#A88A52' },
    9: { cn: '九紫', en: 'Purple Star 9', el: 'Fire', nature: 'good', label: 'Future Prosperity & Joy',
      short: 'The reigning star of Period 9 (2024–2043). Celebrations, promotions, happy events.',
      cure: 'Activate with lights, candles, red or purple accents. The luckiest star right now.',
      color: '#7B3F6B' },
  };

  var GRID_POS = {
    SE: { c: 2, r: 0 }, S: { c: 1, r: 0 }, SW: { c: 0, r: 0 },
    E: { c: 2, r: 1 }, C: { c: 1, r: 1 }, W: { c: 0, r: 1 },
    NE: { c: 2, r: 2 }, N: { c: 1, r: 2 }, NW: { c: 0, r: 2 },
  };

  var DIR_LABEL = {
    N: 'North', NE: 'Northeast', E: 'East', SE: 'Southeast',
    S: 'South', SW: 'Southwest', W: 'West', NW: 'Northwest', C: 'Center',
  };

  function annualMap() {
    if (window.XuanKong && window.XuanKong.buildAnnualChart) {
      var chart = window.XuanKong.buildAnnualChart(YEAR).chart;
      return {
        C: chart.center,
        NW: chart.NW, W: chart.W, NE: chart.NE,
        S: chart.S, N: chart.N, SW: chart.SW, E: chart.E, SE: chart.SE,
      };
    }
    return { C: 2, NW: 3, W: 4, NE: 5, S: 6, N: 7, SW: 8, E: 9, SE: 1 };
  }

  function track(event, props) {
    if (window.plausible) window.plausible(event, props ? { props: props } : undefined);
    if (window.gtag) window.gtag('event', event, props || {});
  }

  function saveIntake() {
    if (!window.CompassIntake) return;
    window.CompassIntake.save({
      facing: facing,
      year: YEAR,
      hasImage: !!uploadedImg,
    });
  }

  var uploadedImg = null;
  var facing = null;
  var annualStars = annualMap();

  function goStep(n) {
    [1, 2, 3].forEach(function (i) {
      document.getElementById('p' + i).classList.toggle('show', i === n);
      var s = document.querySelector('.step[data-s="' + i + '"]');
      if (!s) return;
      s.classList.toggle('active', i === n);
      s.classList.toggle('done', i < n);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  var dropZone = document.getElementById('dropZone');
  var fileInput = document.getElementById('fileInput');
  var previewWrap = document.getElementById('uploadPreview');
  var previewImg = document.getElementById('previewImg');
  var toStep2 = document.getElementById('toStep2');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', function () { fileInput.click(); });
    dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropZone.classList.add('drag');
    });
    dropZone.addEventListener('dragleave', function () { dropZone.classList.remove('drag'); });
    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropZone.classList.remove('drag');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', function () {
      if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });
  }

  function handleFile(f) {
    if (!f.type.match(/^image\//) && !/\.(heic|heif|jpg|jpeg|png|webp)$/i.test(f.name || '')) {
      alert('Please upload an image file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      alert('File too large — please use an image under 10 MB.');
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      uploadedImg = new Image();
      uploadedImg.onload = function () {
        previewImg.src = uploadedImg.src;
        previewWrap.style.display = 'block';
        dropZone.style.display = 'none';
        toStep2.disabled = false;
        track('compass_xray_upload');
      };
      uploadedImg.src = e.target.result;
    };
    reader.readAsDataURL(f);
  }

  if (toStep2) toStep2.addEventListener('click', function () { goStep(2); });
  var backTo1 = document.getElementById('backTo1');
  if (backTo1) backTo1.addEventListener('click', function () { goStep(1); });
  var backTo2 = document.getElementById('backTo2');
  if (backTo2) backTo2.addEventListener('click', function () { goStep(2); });

  var facingBtns = document.querySelectorAll('#facingGrid .facing-btn[data-f]');
  var toStep3 = document.getElementById('toStep3');
  facingBtns.forEach(function (b) {
    if (b.dataset.f === 'C') return;
    b.addEventListener('click', function () {
      facing = b.dataset.f;
      facingBtns.forEach(function (x) { x.classList.toggle('sel', x === b); });
      if (toStep3) toStep3.disabled = false;
    });
  });

  if (toStep3) {
    toStep3.addEventListener('click', function () {
      if (!facing || !uploadedImg) return;
      annualStars = annualMap();
      renderXray();
      buildLegend();
      saveIntake();
      goStep(3);
      track('compass_xray_scan', { facing: facing, year: YEAR });
    });
  }

  function renderXray() {
    var canvas = document.getElementById('xrayCanvas');
    if (!canvas || !uploadedImg) return;
    var ctx = canvas.getContext('2d');
    var iw = uploadedImg.naturalWidth;
    var ih = uploadedImg.naturalHeight;
    var maxDim = 1200;
    var scale = Math.min(maxDim / iw, maxDim / ih, 1);
    var cw = Math.round(iw * scale);
    var ch = Math.round(ih * scale);
    canvas.width = cw;
    canvas.height = ch;
    ctx.drawImage(uploadedImg, 0, 0, cw, ch);

    var cellW = cw / 3;
    var cellH = ch / 3;
    var dirs = Object.keys(GRID_POS);

    dirs.forEach(function (d) {
      var gp = GRID_POS[d];
      var x = gp.c * cellW;
      var y = (2 - gp.r) * cellH;
      var star = annualStars[d];
      var si = NINE_STARS[star];

      ctx.fillStyle = si.nature === 'dangerous' ? 'rgba(139,107,47,0.38)'
        : si.nature === 'bad' ? 'rgba(90,60,50,0.28)'
          : si.nature === 'good' ? 'rgba(90,155,110,0.22)'
            : 'rgba(122,155,142,0.18)';
      ctx.fillRect(x, y, cellW, cellH);

      ctx.strokeStyle = 'rgba(31,42,38,0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cellW, cellH);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold ' + Math.round(cellW * 0.22) + 'px "IBM Plex Mono",monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;
      ctx.fillText(star, x + cellW / 2, y + cellH * 0.38);
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '600 ' + Math.round(cellW * 0.07) + 'px "IBM Plex Mono",monospace';
      ctx.fillText(d, x + cellW / 2, y + cellH * 0.58);

      ctx.font = Math.round(cellW * 0.055) + 'px "Hanken Grotesk",sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillText(si.label, x + cellW / 2, y + cellH * 0.72);

      if (d === facing) {
        ctx.save();
        ctx.strokeStyle = '#A88A52';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(x + 4, y + 4, cellW - 8, cellH - 8);
        ctx.setLineDash([]);
        ctx.fillStyle = '#A88A52';
        ctx.font = 'bold ' + Math.round(cellW * 0.06) + 'px "IBM Plex Mono",monospace';
        ctx.fillText('▲ FACING', x + cellW / 2, y + cellH * 0.88);
        ctx.restore();
      }
    });

    canvas._cells = dirs.map(function (d) {
      var gp = GRID_POS[d];
      return {
        dir: d,
        x: gp.c * cellW,
        y: (2 - gp.r) * cellH,
        w: cellW,
        h: cellH,
        star: annualStars[d],
      };
    });
  }

  var xrayCanvas = document.getElementById('xrayCanvas');
  if (xrayCanvas) {
    xrayCanvas.addEventListener('click', function (e) {
      if (!xrayCanvas._cells) return;
      var rect = xrayCanvas.getBoundingClientRect();
      var sx = xrayCanvas.width / rect.width;
      var sy = xrayCanvas.height / rect.height;
      var mx = (e.clientX - rect.left) * sx;
      var my = (e.clientY - rect.top) * sy;
      xrayCanvas._cells.forEach(function (c) {
        if (mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h) {
          highlightStar(c.dir);
        }
      });
    });
  }

  function highlightStar(dir) {
    document.querySelectorAll('.star-row').forEach(function (r) {
      r.classList.toggle('sel', r.dataset.dir === dir);
    });
    var el = document.querySelector('.star-row[data-dir="' + dir + '"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function buildLegend() {
    var container = document.getElementById('starLegend');
    if (!container) return;
    container.innerHTML = '<h3>2026 Star Map — Your Sectors</h3>';

    var order = { dangerous: 0, bad: 1, mixed: 2, good: 3 };
    var dirs = Object.keys(annualStars).filter(function (d) { return d !== 'C'; }).sort(function (a, b) {
      if (a === facing) return -1;
      if (b === facing) return 1;
      return order[NINE_STARS[annualStars[a]].nature] - order[NINE_STARS[annualStars[b]].nature];
    });
    dirs.push('C');

    var freeCount = 0;
    dirs.forEach(function (d) {
      var star = annualStars[d];
      var si = NINE_STARS[star];
      var isFacing = d === facing;
      var locked = freeCount >= 4 && !isFacing;
      if (!locked) freeCount++;

      var row = document.createElement('div');
      row.className = 'star-row' + (locked ? ' locked-row' : '');
      row.dataset.dir = d;
      row.innerHTML =
        '<div class="star-chip" style="background:' + si.color + '">' + star + '</div>' +
        '<div class="star-info">' +
        '<div class="si-name"><span class="han">' + si.cn + '</span>' + si.en + '</div>' +
        '<div class="si-pos">' + (isFacing ? '▲ FACING · ' : '') + DIR_LABEL[d] + '</div>' +
        '<div class="si-short">' + si.short + '</div>' +
        '</div>' +
        (locked ? '<span class="lock-badge">Full report →</span>' : '');

      if (!locked) {
        row.addEventListener('click', function () { highlightStar(d); });
      } else {
        row.style.cursor = 'pointer';
        row.addEventListener('click', function () {
          var card = document.querySelector('.cta-card');
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
      container.appendChild(row);
    });
  }

  var saveXray = document.getElementById('saveXray');
  if (saveXray) {
    saveXray.addEventListener('click', function () {
      var canvas = document.getElementById('xrayCanvas');
      if (!canvas) return;
      try {
        var a = document.createElement('a');
        a.download = 'energy-xray-2026.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
        track('compass_xray_save_png');
      } catch (e) {
        alert('Long-press the image to save it.');
      }
    });
  }

  var orderBtn = document.getElementById('orderBtn');
  if (orderBtn) {
    var orderHref = '/checkout.html?product=compass-home';
    if (window.CompassIntake && CompassIntake.appendCompassParams) {
      orderHref = CompassIntake.appendCompassParams(orderHref);
    }
    orderBtn.href = orderHref;
    orderBtn.addEventListener('click', function () {
      saveIntake();
      track('compass_xray_order_click');
    });
  }

  var intake = window.CompassIntake && window.CompassIntake.load();
  if (intake && intake.facing) {
    facing = intake.facing;
    facingBtns.forEach(function (b) {
      if (b.dataset.f === facing) b.classList.add('sel');
    });
    if (toStep3 && facing) toStep3.disabled = false;
  }

  track('compass_xray_landing');
})();
