/**
 * Living Compass app — form, results, share flow.
 */
(function (global) {
  'use strict';

  var state = { result: null };

  function track(event, props) {
    if (global.plausible) global.plausible(event, props ? { props: props } : undefined);
    if (global.gtag) global.gtag('event', event, props || {});
  }

  function parseQuery() {
    var p = new URLSearchParams(global.location.search);
    var date = p.get('date');
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      var parts = date.split('-');
      return {
        year: parts[0],
        month: parts[1],
        day: parts[2],
        gender: p.get('gender') || '',
        houseFacing: p.get('facing') || '',
        auto: p.get('auto') === '1',
      };
    }
    return null;
  }

  function show(el, on) {
    if (!el) return;
    el.hidden = !on;
    el.style.display = on ? '' : 'none';
  }

  function formatDirectionList(positions) {
    return positions.map(function (p) {
      return '<span class="dir-chip dir-chip--' + p.kind + '">' +
        '<span class="dir-chip__mark">' + (p.kind === 'auspicious' ? '◉' : '◌') + '</span>' +
        '<span class="dir-chip__cn">' + p.cn + '</span>' +
        '<span class="dir-chip__label">' + p.short + '</span>' +
        '<span class="dir-chip__dir">' + p.direction + '</span>' +
        '</span>';
    }).join('');
  }

  function populateResults(result) {
    var kuaNum = document.getElementById('lc-kua-num');
    var kuaTitle = document.getElementById('lc-kua-title');
    var kuaGroup = document.getElementById('lc-kua-group');
    var auspiciousList = document.getElementById('lc-auspicious-list');
    var inauspiciousList = document.getElementById('lc-inauspicious-list');
    var actionsList = document.getElementById('lc-actions-list');

    if (kuaNum) kuaNum.textContent = 'KUA ' + result.kua;
    if (kuaTitle) kuaTitle.textContent = result.archetype + ' ' + result.cn;
    if (kuaGroup) kuaGroup.textContent = result.groupLabel;

    if (auspiciousList) {
      auspiciousList.innerHTML = result.auspicious.map(function (p) {
        return '<li class="pos-row pos-row--good">' +
          '<span class="pos-row__dir">' + p.direction + '</span>' +
          '<div class="pos-row__body">' +
          '<strong>' + p.cn + ' · ' + p.short + '</strong>' +
          '<span>' + p.label + '</span>' +
          '</div></li>';
      }).join('');
    }

    if (inauspiciousList) {
      inauspiciousList.innerHTML = result.inauspicious.map(function (p) {
        return '<li class="pos-row pos-row--caution">' +
          '<span class="pos-row__dir">' + p.direction + '</span>' +
          '<div class="pos-row__body">' +
          '<strong>' + p.cn + ' · ' + p.short + '</strong>' +
          '<span>' + p.tip + '</span>' +
          '</div></li>';
      }).join('');
    }

    if (actionsList) {
      actionsList.innerHTML = result.actions.map(function (a) {
        return '<li>' + a + '</li>';
      }).join('');
    }
  }

  function revealResults(result) {
    state.result = result;
    populateResults(result);

    var hero = document.getElementById('lc-hero');
    var formSection = document.getElementById('lc-form-section');
    var results = document.getElementById('lc-results');
    show(hero, false);
    show(formSection, false);
    show(results, true);

    var canvas = document.getElementById('lc-compass-canvas');
    if (canvas && global.LivingCompassCanvas) {
      global.LivingCompassCanvas.render(canvas, result, result.houseFacing);
    }

    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    track('living_compass_calculate', { kua: result.kua, group: result.group });
  }

  function calculateFromForm() {
    if (!global.BaZhai) return;

    var dateInput = document.getElementById('lc-birth-date');
    var genderInput = document.querySelector('input[name="lc-gender"]:checked');
    var facingSelect = document.getElementById('lc-house-facing');

    if (!dateInput || !dateInput.value) {
      dateInput && dateInput.focus();
      return;
    }

    var parts = dateInput.value.split('-');
    var result = global.BaZhai.calculate({
      year: parts[0],
      month: parts[1],
      day: parts[2],
      gender: genderInput ? genderInput.value : 'female',
      houseFacing: facingSelect ? facingSelect.value : '',
    });

    if (!result) return;
    revealResults(result);
  }

  function resetToForm() {
    state.result = null;
    var hero = document.getElementById('lc-hero');
    var formSection = document.getElementById('lc-form-section');
    var results = document.getElementById('lc-results');
    show(hero, true);
    show(formSection, true);
    show(results, false);

    var canvas = document.getElementById('lc-hero-canvas');
    if (canvas && global.LivingCompassCanvas) {
      global.LivingCompassCanvas.startHero(canvas);
    }
  }

  function bindEvents() {
    var form = document.getElementById('lc-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        calculateFromForm();
      });
    }

    var saveBtn = document.getElementById('lc-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        if (state.result && global.LivingCompassCanvas) {
          global.LivingCompassCanvas.download(state.result);
        }
      });
    }

    var copyBtn = document.getElementById('lc-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (state.result && global.LivingCompassCanvas) {
          global.LivingCompassCanvas.copy(state.result);
        }
      });
    }

    var againBtn = document.getElementById('lc-again-btn');
    if (againBtn) {
      againBtn.addEventListener('click', resetToForm);
    }

    var homeCta = document.getElementById('lc-home-cta');
    if (homeCta) {
      homeCta.addEventListener('click', function () {
        track('living_compass_home_cta', { kua: state.result ? state.result.kua : '' });
      });
    }
  }

  function init() {
    bindEvents();

    var heroCanvas = document.getElementById('lc-hero-canvas');
    if (heroCanvas && global.LivingCompassCanvas) {
      global.LivingCompassCanvas.startHero(heroCanvas);
    }

    var q = parseQuery();
    if (q) {
      var dateEl = document.getElementById('lc-birth-date');
      if (dateEl && q.year) dateEl.value = q.year + '-' + q.month + '-' + q.day;
      if (q.gender) {
        var g = document.querySelector('input[name="lc-gender"][value="' + q.gender + '"]');
        if (g) g.checked = true;
      }
      if (q.houseFacing) {
        var f = document.getElementById('lc-house-facing');
        if (f) f.value = q.houseFacing;
      }
      if (q.auto) calculateFromForm();
    }

    track('living_compass_landing');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.LivingCompassApp = {
    calculate: calculateFromForm,
    reset: resetToForm,
    getResult: function () { return state.result; },
  };
})(window);
