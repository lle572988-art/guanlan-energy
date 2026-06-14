/**
 * Partner & family Kua comparison — two charts, one home.
 */
(function (global) {
  'use strict';

  var POS_GOOD = ['shengqi', 'tianyi', 'yannian', 'fuwei'];
  var POS_BAD = ['huohai', 'wugui', 'liusha', 'jueming'];

  function el(id) { return document.getElementById(id); }

  function track(event, props) {
    if (global.plausible) global.plausible(event, props ? { props: props } : undefined);
    if (global.gtag) global.gtag('event', event, props || {});
  }

  function parseDob(str) {
    if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
    var p = str.split('-');
    return { year: parseInt(p[0], 10), month: parseInt(p[1], 10), day: parseInt(p[2], 10) };
  }

  function dirLabel(dir) {
    if (global.BaZhai && global.XuanKong && global.XuanKong.DIR_LABEL[dir]) {
      return global.XuanKong.DIR_LABEL[dir];
    }
    return dir;
  }

  function analyzePair(a, b, labelA, labelB) {
    var sameGroup = a.group === b.group;
    var groupNote = sameGroup
      ? 'Same East/West group — personal directions harmonize more easily in one home.'
      : 'Different groups — shared rooms follow flying stars; sleep and desk stay personal.';

    var bedA = a.directions.tianyi;
    var bedB = b.directions.tianyi;
    var bedNote = bedA === bedB
      ? 'Headboard on the ' + dirLabel(bedA) + ' wall supports Tian Yi (health) for both.'
      : labelA + ': headboard ' + dirLabel(bedA) + ' · ' + labelB + ': headboard ' + dirLabel(bedB) + '.';

    var deskNote = a.directions.shengqi === b.directions.shengqi
      ? 'Shared desk zone: face ' + dirLabel(a.directions.shengqi) + ' (Sheng Qi for both).'
      : labelA + ' desk faces ' + dirLabel(a.directions.shengqi) + ' · ' +
        labelB + ' faces ' + dirLabel(b.directions.shengqi) + '.';

    var talkDir = a.directions.yannian === b.directions.yannian
      ? dirLabel(a.directions.yannian)
      : labelA + ' ' + dirLabel(a.directions.yannian) + ', ' + labelB + ' ' + dirLabel(b.directions.yannian);

    var conflicts = [];
    POS_GOOD.forEach(function (key) {
      var dir = a.directions[key];
      var meta = global.BaZhai.POSITION_META[key];
      if (b.directions.jueming === dir) {
        conflicts.push(labelA + '\'s ' + meta.short + ' (' + dirLabel(dir) + ') sits in ' + labelB + '\'s Jue Ming — avoid shared bed/desk there.');
      }
      if (b.directions.liusha === dir || b.directions.wugui === dir) {
        conflicts.push(labelA + '\'s ' + meta.short + ' overlaps ' + labelB + '\'s caution sector at ' + dirLabel(dir) + '.');
      }
    });
    POS_GOOD.forEach(function (key) {
      var dir = b.directions[key];
      var meta = global.BaZhai.POSITION_META[key];
      if (a.directions.jueming === dir) {
        conflicts.push(labelB + '\'s ' + meta.short + ' (' + dirLabel(dir) + ') sits in ' + labelA + '\'s Jue Ming.');
      }
      if (a.directions.liusha === dir || a.directions.wugui === dir) {
        conflicts.push(labelB + '\'s ' + meta.short + ' overlaps ' + labelA + '\'s caution sector at ' + dirLabel(dir) + '.');
      }
    });

    return {
      sameGroup: sameGroup,
      groupNote: groupNote,
      bedNote: bedNote,
      deskNote: deskNote,
      talkNote: 'Important conversations: ' + talkDir + ' (Yan Nian).',
      conflicts: conflicts,
      a: a,
      b: b,
    };
  }

  function renderKuaCard(container, result, label) {
    if (!container) return;
    container.innerHTML =
      '<p class="kua-label">' + label + '</p>' +
      '<p class="kua-num">' + result.kua + '</p>' +
      '<p class="kua-meta">' + result.trigram + ' · ' + result.groupLabel + '</p>' +
      '<ul class="kua-dirs">' +
      '<li><strong>Wealth</strong> ' + dirLabel(result.directions.shengqi) + '</li>' +
      '<li><strong>Health</strong> ' + dirLabel(result.directions.tianyi) + '</li>' +
      '<li><strong>Love</strong> ' + dirLabel(result.directions.yannian) + '</li>' +
      '<li><strong>Avoid</strong> ' + dirLabel(result.directions.jueming) + '</li>' +
      '</ul>';
  }

  function render(analysis, labelA, labelB) {
    var results = el('famResults');
    if (results) results.hidden = false;

    renderKuaCard(el('famCardA'), analysis.a, labelA + ' · Kua ' + analysis.a.kua);
    renderKuaCard(el('famCardB'), analysis.b, labelB + ' · Kua ' + analysis.b.kua);

    var plan = el('famPlan');
    if (plan) {
      var html = '<li>' + analysis.groupNote + '</li>' +
        '<li>' + analysis.bedNote + '</li>' +
        '<li>' + analysis.deskNote + '</li>' +
        '<li>' + analysis.talkNote + '</li>';
      if (analysis.conflicts.length) {
        analysis.conflicts.forEach(function (c) {
          html += '<li class="fam-warn">' + c + '</li>';
        });
      } else {
        html += '<li class="fam-ok">No major direction clashes between your four auspicious bearings.</li>';
      }
      plan.innerHTML = html;
    }

    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    track('compass_family_compare', { kua_a: analysis.a.kua, kua_b: analysis.b.kua, same_group: analysis.sameGroup });
  }

  function runCompare() {
    if (!global.BaZhai) return;
    var dobA = parseDob(el('famDobA') && el('famDobA').value);
    var dobB = parseDob(el('famDobB') && el('famDobB').value);
    var gA = (el('famGenderA') && el('famGenderA').value) || 'female';
    var gB = (el('famGenderB') && el('famGenderB').value) || 'female';
    var labelA = (el('famLabelA') && el('famLabelA').value.trim()) || 'Partner A';
    var labelB = (el('famLabelB') && el('famLabelB').value.trim()) || 'Partner B';
    var err = el('famErr');

    if (!dobA || !dobB) {
      if (err) {
        err.textContent = 'Enter a valid birth date for both people.';
        err.hidden = false;
      }
      return;
    }
    if (err) err.hidden = true;

    var a = global.BaZhai.calculate({ year: dobA.year, month: dobA.month, day: dobA.day, gender: gA });
    var b = global.BaZhai.calculate({ year: dobB.year, month: dobB.month, day: dobB.day, gender: gB });
    if (!a || !b) {
      if (err) {
        err.textContent = 'Could not calculate — check dates.';
        err.hidden = false;
      }
      return;
    }

    render(analyzePair(a, b, labelA, labelB), labelA, labelB);

    if (global.CompassIntake) {
      global.CompassIntake.save({
        family: { labelA: labelA, labelB: labelB, kuaA: a.kua, kuaB: b.kua },
      });
    }
  }

  function init() {
    var btn = el('famBtn');
    if (btn) btn.addEventListener('click', runCompare);
    track('compass_family_landing');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.CompassFamily = { runCompare: runCompare };
})(window);
