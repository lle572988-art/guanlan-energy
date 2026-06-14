/**
 * Moving day feng shui — score dates by annual + monthly flying stars at facing.
 */
(function (global) {
  'use strict';

  function el(id) { return document.getElementById(id); }

  function track(event, props) {
    if (global.plausible) global.plausible(event, props ? { props: props } : undefined);
    if (global.gtag) global.gtag('event', event, props || {});
  }

  function scoreDay(y, m, d, facing) {
    if (!global.XuanKong) return null;
    var annual = global.XuanKong.buildAnnualChart(y);
    var monthly = global.XuanKong.buildMonthlyChart(y, m);
    var annualStar = annual.chart[facing];
    var monthlyStar = monthly.chart[facing];
    var score = 55;
    var notes = [];

    if (annualStar === 5 || annualStar === 2) {
      score -= 25;
      notes.push('Annual caution star at facing');
    }
    if (annualStar === 8 || annualStar === 6) {
      score += 12;
      notes.push('Annual wealth/authority at facing');
    }
    if (monthlyStar === 5) {
      score -= 35;
      notes.push('Five Yellow at facing — avoid renovation/drilling');
    } else if (monthlyStar === 2) {
      score -= 12;
      notes.push('Two Black at facing — keep move calm');
    } else if (monthlyStar === 8) {
      score += 18;
      notes.push('Monthly wealth star at facing');
    } else if (monthlyStar === 6 || monthlyStar === 9) {
      score += 8;
    }

    var dt = new Date(y, m - 1, d);
    var dow = dt.getDay();
    if (dow === 0 || dow === 6) score += 4;

    var grade = score >= 72 ? 'best' : score >= 50 ? 'ok' : 'avoid';
    var info = global.XuanKong.STAR_INFO[monthlyStar];
    return {
      date: dt,
      y: y,
      m: m,
      d: d,
      score: score,
      grade: grade,
      annualStar: annualStar,
      monthlyStar: monthlyStar,
      monthlyLabel: info ? info.en : '',
      notes: notes,
    };
  }

  function formatDate(row) {
    return row.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderLists(rows) {
    var best = rows.filter(function (r) { return r.grade === 'best'; }).slice(0, 8);
    var avoid = rows.filter(function (r) { return r.grade === 'avoid'; }).slice(0, 6);
    var ok = rows.filter(function (r) { return r.grade === 'ok'; }).slice(0, 5);

    var bestEl = el('movBest');
    var avoidEl = el('movAvoid');
    var okEl = el('movOk');

    if (bestEl) {
      bestEl.innerHTML = best.length
        ? best.map(function (r) {
          return '<li><strong>' + formatDate(r) + '</strong> · monthly ' + r.monthlyLabel +
            (r.notes[0] ? ' — ' + r.notes[0] : '') + '</li>';
        }).join('')
        : '<li>No standout dates in this window — see moderate picks below.</li>';
    }
    if (okEl) {
      okEl.innerHTML = ok.map(function (r) {
        return '<li>' + formatDate(r) + ' · star ' + r.monthlyStar + '</li>';
      }).join('');
    }
    if (avoidEl) {
      avoidEl.innerHTML = avoid.length
        ? avoid.map(function (r) {
          return '<li><strong>' + formatDate(r) + '</strong> · star ' + r.monthlyStar + ' — ' +
            (r.notes.join('; ') || 'caution at facing') + '</li>';
        }).join('')
        : '<li>No strong avoid dates — still layer personal Kua before signing a lease.</li>';
    }
  }

  function runScan() {
    if (!global.XuanKong) return;
    var facing = (el('movFacing') && el('movFacing').value) || 'S';
    var startStr = (el('movStart') && el('movStart').value) || '';
    var days = parseInt((el('movDays') && el('movDays').value) || '90', 10);
    days = Math.min(120, Math.max(30, days));

    var start = startStr ? new Date(startStr + 'T12:00:00') : new Date();
    var rows = [];
    for (var i = 0; i < days; i++) {
      var dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      var row = scoreDay(dt.getFullYear(), dt.getMonth() + 1, dt.getDate(), facing);
      if (row) rows.push(row);
    }
    rows.sort(function (a, b) { return b.score - a.score; });

    var results = el('movResults');
    if (results) results.hidden = false;

    var headline = el('movHeadline');
    if (headline) {
      var dirLabel = global.XuanKong.DIR_LABEL[facing] || facing;
      headline.textContent = 'Next ' + days + ' days · home faces ' + dirLabel +
        ' — ranked by monthly + annual stars at your front door sector.';
    }

    renderLists(rows);
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    track('compass_moving_scan', { facing: facing, days: days });
  }

  function init() {
    var start = el('movStart');
    if (start && !start.value) {
      var t = new Date();
      start.value = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    }
    var btn = el('movBtn');
    if (btn) btn.addEventListener('click', runScan);
    track('compass_moving_landing');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.CompassMoving = { runScan: runScan };
})(window);
