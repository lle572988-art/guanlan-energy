/**
 * Energy X-Ray prototype — upload + facing + 2026 flying star overlay.
 */
(function (global) {
  'use strict';

  var state = {
    image: null,
    imageUrl: '',
    facing: 'S',
    year: 2026,
    chart: null,
  };

  function track(event, props) {
    if (global.plausible) global.plausible(event, props ? { props: props } : undefined);
    if (global.gtag) global.gtag('event', event, props || {});
  }

  function el(id) { return document.getElementById(id); }

  function drawOverlay() {
    var canvas = el('xrayCanvas');
    var wrap = el('xrayCanvasWrap');
    if (!canvas || !wrap) return;

    var ctx = canvas.getContext('2d');
    var w = wrap.clientWidth;
    var h = Math.round(w * 0.75);
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    if (state.image) {
      ctx.drawImage(state.image, 0, 0, w, h);
      ctx.fillStyle = 'rgba(31,42,38,0.08)';
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#E3E0D7';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(31,42,38,0.35)';
      ctx.font = '15px Hanken Grotesk, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload a room or floor plan photo', w / 2, h / 2);
    }

    if (!state.chart || !global.XuanKong) return;

    var cells = state.chart.cells;
    var cols = 3, rows = 3;
    var pad = 12;
    var gw = w - pad * 2;
    var gh = h - pad * 2;
    var cw = gw / cols;
    var ch = gh / rows;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cell = cells[r][c];
        var x = pad + c * cw;
        var y = pad + r * ch;
        ctx.fillStyle = cell.color;
        ctx.globalAlpha = state.image ? 0.72 : 0.88;
        ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(234,227,223,0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, cw - 4, ch - 4);

        var isFace = cell.direction === state.facing;
        if (isFace) {
          ctx.strokeStyle = '#A88A52';
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 1, y + 1, cw - 2, ch - 2);
        }

        ctx.fillStyle = cell.textColor;
        ctx.textAlign = 'center';
        ctx.font = '600 22px IBM Plex Mono, monospace';
        ctx.fillText(String(cell.star), x + cw / 2, y + ch / 2 - 6);
        ctx.font = '500 10px IBM Plex Mono, monospace';
        ctx.fillText(cell.direction === 'center' ? 'CTR' : cell.direction, x + cw / 2, y + ch / 2 + 14);
      }
    }

    ctx.fillStyle = 'rgba(31,42,38,0.75)';
    ctx.font = '11px IBM Plex Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('N ↑', pad + 4, pad + 14);
    ctx.textAlign = 'right';
    ctx.fillText('Facing: ' + state.facing, w - pad - 4, h - pad - 6);
  }

  function renderInsights() {
    if (!state.chart || !global.XuanKong) return;
    var ins = global.XuanKong.insightsForFacing(state.chart, state.facing);
    var headline = el('xrayHeadline');
    var list = el('xrayInsightList');
    var lock = el('xrayLock');

    if (headline) headline.textContent = ins.headline;

    if (list) {
      var html = '';
      ins.highlights.forEach(function (h) {
        html += '<li class="xray-insight xray-insight--good"><strong>' + h.dirLabel + ' · ' + h.star + '</strong> ' + h.label + '</li>';
      });
      ins.cautions.forEach(function (c) {
        html += '<li class="xray-insight xray-insight--caution"><strong>' + c.dirLabel + ' · ' + c.star + '</strong> ' + c.label + '</li>';
      });
      list.innerHTML = html;
    }

    if (lock) lock.hidden = false;

    if (global.CompassIntake) {
      global.CompassIntake.save({
        facing: state.facing,
        year: state.year,
        hasImage: !!state.image,
      });
    }
  }

  function runScan() {
    if (!global.XuanKong) return;
    state.facing = (el('xrayFacing') && el('xrayFacing').value) || 'S';
    state.year = parseInt((el('xrayYear') && el('xrayYear').value) || '2026', 10);
    state.chart = global.XuanKong.buildAnnualChart(state.year);

    drawOverlay();
    renderInsights();

    var results = el('xrayResults');
    if (results) {
      results.hidden = false;
      results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    track('compass_xray_scan', { facing: state.facing, year: state.year, has_image: !!state.image });
  }

  function downloadPreview() {
    if (!state.chart || !global.CompassReport || !global.XuanKong) return;
    var intake = (global.CompassIntake && global.CompassIntake.load()) || {
      facing: state.facing,
      year: state.year,
    };
    var data = global.CompassReport.buildReportData(intake, state.chart, global.XuanKong.insightsForFacing(state.chart, state.facing));
    global.CompassReport.openPrintable(data, 'preview');
    track('compass_xray_preview_pdf', { year: state.year });
  }

  function bindUpload() {
    var zone = el('xrayUpload');
    var input = el('xrayFile');
    if (!zone || !input) return;

    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('drag'); });
    zone.addEventListener('dragleave', function () { zone.classList.remove('drag'); });
    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      zone.classList.remove('drag');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) loadFile(input.files[0]);
    });
  }

  function loadFile(file) {
    if (!file.type.match(/^image\//)) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        state.image = img;
        state.imageUrl = e.target.result;
        var preview = el('xrayUploadPreview');
        if (preview) {
          preview.textContent = file.name;
          preview.hidden = false;
        }
        if (state.chart) drawOverlay();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    track('compass_xray_upload');
  }

  function init() {
    bindUpload();
    var btn = el('xrayScanBtn');
    if (btn) btn.addEventListener('click', runScan);

    var previewBtn = el('xrayPreviewBtn');
    if (previewBtn) previewBtn.addEventListener('click', downloadPreview);

    window.addEventListener('resize', function () {
      if (state.chart) drawOverlay();
    });

    track('compass_xray_landing');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.CompassXRay = { runScan: runScan, getState: function () { return state; }, downloadPreview: downloadPreview };
})(window);
