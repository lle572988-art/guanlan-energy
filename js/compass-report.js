/**
 * Build HTML Energy X-Ray report from scan + Ba Zhai context (client or server).
 */
(function (root) {
  'use strict';

  var STAR_TIPS = {
    1: 'Activate with water features or career-focused work here.',
    2: 'Keep clean, quiet, and well-lit; add metal objects if this is a bedroom.',
    3: 'Reduce noise; avoid red decor; use green plants sparingly.',
    4: 'Good for study and romance; keep fresh flowers or books.',
    5: 'No renovation. Add metal (brass, white/grey). Avoid red and fire.',
    6: 'Excellent for office and leadership; keep uncluttered and bright.',
    7: 'Avoid sharp objects pointing inward; soften with rounded decor.',
    8: 'Prime wealth sector — desk, safe, or active income work here.',
    9: 'Celebration star — social areas, visibility, marketing.',
  };

  function dirLabel(dir) {
    if (root.XuanKong && root.XuanKong.DIR_LABEL[dir]) return root.XuanKong.DIR_LABEL[dir];
    return dir;
  }

  function buildReportData(intake, chart, insights) {
    intake = intake || {};
    chart = chart || (root.XuanKong && intake.year ? root.XuanKong.buildAnnualChart(intake.year) : null);
    insights = insights || (chart && root.XuanKong ? root.XuanKong.insightsForFacing(chart, intake.facing || 'S') : null);

    var kuaBlock = null;
    if (intake.dob && intake.gender && root.BaZhai) {
      var parts = intake.dob.split('-');
      kuaBlock = root.BaZhai.calculate({
        year: parts[0], month: parts[1], day: parts[2],
        gender: intake.gender,
        houseFacing: intake.facing,
      });
    }

    return {
      generatedAt: new Date().toISOString(),
      intake: intake,
      chart: chart,
      insights: insights,
      kua: kuaBlock,
    };
  }

  function sectionGrid(chart) {
    if (!chart || !chart.cells) return '';
    var html = '<table class="grid"><thead><tr><th>Sector</th><th>Star</th><th>Theme</th><th>Note</th></tr></thead><tbody>';
    chart.cells.forEach(function (row) {
      row.forEach(function (cell) {
        if (cell.direction === 'center') return;
        html += '<tr><td>' + dirLabel(cell.direction) + '</td><td>' + cell.star + ' ' + cell.cn + '</td><td>' + cell.label + '</td><td>' + (STAR_TIPS[cell.star] || '') + '</td></tr>';
      });
    });
    html += '</tbody></table>';
    return html;
  }

  function renderHtml(data, mode) {
    mode = mode || 'full';
    var intake = data.intake || {};
    var year = data.chart && data.chart.year || intake.year || 2026;
    var facing = intake.facing || 'S';
    var insights = data.insights;
    var kua = data.kua;

    var css =
      'body{font-family:Georgia,serif;color:#1F2A26;background:#EAE7DF;padding:40px;line-height:1.55}' +
      'h1{font-weight:400;font-size:28px;margin-bottom:8px}' +
      '.meta{font-family:monospace;font-size:12px;color:#6B7873;margin-bottom:24px}' +
      'h2{font-size:18px;margin:28px 0 12px;color:#7A9B8E;font-family:monospace;letter-spacing:.1em;text-transform:uppercase}' +
      '.grid{width:100%;border-collapse:collapse;font-size:13px;margin:16px 0}' +
      '.grid th,.grid td{border:1px solid rgba(31,42,38,.15);padding:8px 10px;text-align:left}' +
      '.grid th{background:rgba(122,155,142,.15);font-family:monospace;font-size:10px}' +
      '.lock{color:#9a4b3b;background:rgba(154,75,59,.08);padding:16px;border:1px dashed #9a4b3b;margin-top:24px}' +
      '.foot{margin-top:40px;font-size:11px;color:#6B7873}';

    var body = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Energy X-Ray ' + year + '</title><style>' + css + '</style></head><body>';
    body += '<h1>The Living Compass · Energy X-Ray</h1>';
    body += '<p class="meta">Home faces ' + dirLabel(facing) + ' · ' + year + ' annual flying stars · Generated ' + new Date().toLocaleDateString() + '</p>';

    if (insights) {
      body += '<h2>Snapshot</h2><p>' + insights.headline + '</p>';
      body += '<ul>';
      (insights.highlights || []).forEach(function (h) {
        body += '<li><strong>' + h.dirLabel + ' (' + h.star + ')</strong> — ' + h.label + '</li>';
      });
      body += '</ul>';
    }

    if (kua) {
      body += '<h2>Your personal Kua · ' + kua.kua + '</h2>';
      body += '<p>' + kua.archetype + ' · ' + kua.groupLabel + '</p><ul>';
      kua.actions.forEach(function (a) { body += '<li>' + a + '</li>'; });
      body += '</ul>';
    }

    body += '<h2>2026 sector map</h2>';
    body += sectionGrid(data.chart);

    if (mode === 'preview') {
      body += '<div class="lock"><strong>Full Home Report ($39)</strong> — Room-by-room cures, missing-corner notes, and printable action checklist. Order at metaphysicflow.com/compass/order</div>';
    } else {
      body += '<h2>Three-step cures (overview)</h2><ol>';
      body += '<li>Relocate bed and desk toward personal Tian Yi and Sheng Qi bearings.</li>';
      body += '<li>Calm inauspicious annual stars with element cures (metal for 5 Yellow, etc.).</li>';
      body += '<li>Refresh entryway and wealth sector — remove clutter blocking your facing line.</li>';
      body += '</ol>';
    }

    body += '<p class="foot">metaphysicflow.com/compass · Empowerment, not prophecy · Guanlan Energy</p></body></html>';
    return body;
  }

  function openPrintable(data, mode) {
    var html = renderHtml(data, mode);
    var w = window.open('', '_blank');
    if (!w) return false;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(function () { w.print(); }, 400);
    return true;
  }

  root.CompassReport = {
    buildReportData: buildReportData,
    renderHtml: renderHtml,
    openPrintable: openPrintable,
    STAR_TIPS: STAR_TIPS,
  };
})(typeof window !== 'undefined' ? window : global);
