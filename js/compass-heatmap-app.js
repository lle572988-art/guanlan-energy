/**
 * 2026 monthly flying star heatmap — retention engine preview.
 */
(function (global) {
  'use strict';

  var state = {
    year: 2026,
    month: new Date().getMonth() + 1,
    facing: 'S',
    chart: null,
    sectors: { bedroom: 'NW', office: 'NE', kitchen: 'SE', living: 'SW' },
  };

  var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function el(id) { return document.getElementById(id); }

  function track(event, props) {
    if (global.plausible) global.plausible(event, props ? { props: props } : undefined);
    if (global.gtag) global.gtag('event', event, props || {});
  }

  function drawGrid() {
    var canvas = el('hmCanvas');
    var wrap = el('hmCanvasWrap');
    if (!canvas || !wrap || !state.chart || !global.XuanKong) return;

    var ctx = canvas.getContext('2d');
    var w = wrap.clientWidth;
    var h = Math.round(w * 0.72);
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#E3E0D7';
    ctx.fillRect(0, 0, w, h);

    var cells = state.chart.cells;
    var pad = 14;
    var gw = w - pad * 2;
    var gh = h - pad * 2;
    var cw = gw / 3;
    var ch = gh / 3;

    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        var cell = cells[r][c];
        var x = pad + c * cw;
        var y = pad + r * ch;
        ctx.fillStyle = cell.color;
        ctx.globalAlpha = 0.92;
        ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(31,42,38,0.12)';
        ctx.strokeRect(x + 2, y + 2, cw - 4, ch - 4);

        if (cell.direction === state.facing) {
          ctx.strokeStyle = '#A88A52';
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 1, y + 1, cw - 2, ch - 2);
          ctx.lineWidth = 1;
        }

        Object.keys(state.sectors).forEach(function (room) {
          if (state.sectors[room] === cell.direction) {
            ctx.strokeStyle = '#7A9B8E';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(x + 5, y + 5, cw - 10, ch - 10);
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
          }
        });

        ctx.fillStyle = cell.textColor;
        ctx.textAlign = 'center';
        ctx.font = '600 24px IBM Plex Mono, monospace';
        ctx.fillText(String(cell.star), x + cw / 2, y + ch / 2 - 4);
        ctx.font = '500 10px IBM Plex Mono, monospace';
        ctx.fillText(cell.direction === 'center' ? 'CTR' : cell.direction, x + cw / 2, y + ch / 2 + 16);
      }
    }

    ctx.fillStyle = 'rgba(31,42,38,0.7)';
    ctx.font = '11px IBM Plex Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('N ↑', pad + 4, pad + 14);
    ctx.textAlign = 'right';
    var title = state.chart.month
      ? MONTH_NAMES[state.chart.month - 1] + ' ' + state.year
      : String(state.year);
    ctx.fillText(title + ' · facing ' + state.facing, w - pad - 4, h - pad - 6);
  }

  function renderTimeline() {
    var row = el('hmTimeline');
    if (!row || !global.XuanKong) return;
    var timeline = global.XuanKong.monthlyTimeline(state.year);
    var html = '';
    timeline.forEach(function (t) {
      var active = t.month === state.month;
      var bad = t.nature === 'bad';
      html += '<button type="button" class="hm-month' + (active ? ' active' : '') + (bad ? ' caution' : '') + '" data-month="' + t.month + '">' +
        '<span class="m">' + t.label + '</span><span class="s">' + t.center + '</span></button>';
    });
    row.innerHTML = html;
    row.querySelectorAll('.hm-month').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.month = parseInt(btn.getAttribute('data-month'), 10);
        refresh();
        track('compass_heatmap_month', { month: state.month, year: state.year });
      });
    });
  }

  function renderAlerts() {
    var list = el('hmAlerts');
    if (!list || !global.XuanKong) return;
    var alerts = global.XuanKong.sectorAlerts(state.chart, state.sectors);
    if (!alerts.length) {
      list.innerHTML = '<li class="hm-alert hm-alert--ok">No major caution stars in your mapped rooms this month — still check the full 9-sector grid.</li>';
      return;
    }
    var html = '';
    alerts.forEach(function (a) {
      html += '<li class="hm-alert hm-alert--' + a.severity + '"><strong>' + a.room + ' (' + a.dirLabel + ')</strong> · star ' + a.star + ' — ' + a.label + '</li>';
    });
    list.innerHTML = html;
  }

  function renderHeadline() {
    var node = el('hmHeadline');
    if (!node || !global.XuanKong) return;
    var ins = global.XuanKong.insightsForFacing(state.chart, state.facing);
    var monthLabel = MONTH_NAMES[state.month - 1];
    node.textContent = monthLabel + ' ' + state.year + ': ' + ins.headline.replace('in ' + state.year, 'at your door sector');
  }

  function refresh() {
    if (!global.XuanKong) return;
    state.chart = global.XuanKong.buildMonthlyChart(state.year, state.month);
    renderTimeline();
    drawGrid();
    renderHeadline();
    renderAlerts();

    if (global.CompassIntake) {
      global.CompassIntake.save({
        facing: state.facing,
        year: state.year,
        heatmapMonth: state.month,
        sectors: state.sectors,
      });
    }
  }

  function bindControls() {
    var facing = el('hmFacing');
    if (facing) {
      facing.addEventListener('change', function () {
        state.facing = facing.value;
        refresh();
      });
    }
    ['hmBed', 'hmOffice', 'hmKitchen', 'hmLiving'].forEach(function (id) {
      var node = el(id);
      if (!node) return;
      node.addEventListener('change', function () {
        var map = { hmBed: 'bedroom', hmOffice: 'office', hmKitchen: 'kitchen', hmLiving: 'living' };
        state.sectors[map[id]] = node.value;
        refresh();
      });
    });
  }

  function applyIntake() {
    var intake = global.CompassIntake && global.CompassIntake.load();
    if (!intake) return;
    if (intake.facing && el('hmFacing')) el('hmFacing').value = intake.facing;
    if (intake.year) state.year = intake.year;
    if (intake.heatmapMonth) state.month = intake.heatmapMonth;
    if (intake.sectors) state.sectors = Object.assign(state.sectors, intake.sectors);
    state.facing = intake.facing || state.facing;
    if (intake.sectors) {
      if (intake.sectors.bedroom && el('hmBed')) el('hmBed').value = intake.sectors.bedroom;
      if (intake.sectors.office && el('hmOffice')) el('hmOffice').value = intake.sectors.office;
      if (intake.sectors.kitchen && el('hmKitchen')) el('hmKitchen').value = intake.sectors.kitchen;
      if (intake.sectors.living && el('hmLiving')) el('hmLiving').value = intake.sectors.living;
    }
  }

  function init() {
    applyIntake();
    bindControls();
    refresh();
    window.addEventListener('resize', drawGrid);
    track('compass_heatmap_landing');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.CompassHeatmap = { refresh: refresh, getState: function () { return state; } };
})(window);
