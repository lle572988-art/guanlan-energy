/**
 * Xuan Kong (玄空) annual flying star chart — client-side, no API.
 */
(function (root) {
  'use strict';

  var DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  var FLY_ORDER = ['center', 'NW', 'W', 'NE', 'S', 'N', 'SW', 'E', 'SE'];

  var GRID_LAYOUT = [
    ['NW', 'N', 'NE'],
    ['W', 'center', 'E'],
    ['SW', 'S', 'SE'],
  ];

  var DIR_LABEL = {
    N: 'North', NE: 'Northeast', E: 'East', SE: 'Southeast',
    S: 'South', SW: 'Southwest', W: 'West', NW: 'Northwest', center: 'Center',
  };

  var STAR_INFO = {
    1: { cn: '一白', en: 'One White', label: 'Career & growth', nature: 'good', color: '#D8D5CC', text: '#1F2A26' },
    2: { cn: '二黑', en: 'Two Black', label: 'Illness & worry', nature: 'bad', color: '#4A5550', text: '#FBF7EE' },
    3: { cn: '三碧', en: 'Three Jade', label: 'Conflict & noise', nature: 'bad', color: '#5B8C5A', text: '#FBF7EE' },
    4: { cn: '四绿', en: 'Four Green', label: 'Romance & study', nature: 'mixed', color: '#7A9B8E', text: '#1F2A26' },
    5: { cn: '五黄', en: 'Five Yellow', label: 'Misfortune — avoid renovation', nature: 'bad', color: '#C9A24B', text: '#1F2A26' },
    6: { cn: '六白', en: 'Six White', label: 'Authority & mentors', nature: 'good', color: '#E8E4DC', text: '#1F2A26' },
    7: { cn: '七赤', en: 'Seven Red', label: 'Theft & sharp edges', nature: 'bad', color: '#C0573B', text: '#FBF7EE' },
    8: { cn: '八白', en: 'Eight White', label: 'Wealth & momentum', nature: 'good', color: '#A88A52', text: '#FBF7EE' },
    9: { cn: '九紫', en: 'Nine Purple', label: 'Celebration & visibility', nature: 'good', color: '#9B7BB8', text: '#FBF7EE' },
  };

  /** Five-element cure to apply when a sector holds a challenging star */
  var STAR_CURE = {
    1: { element: 'water', hint: 'Activate with water features or focused career work.' },
    2: { element: 'metal', hint: 'Keep quiet and clean; add white, grey, or brass metal decor.' },
    3: { element: 'fire', hint: 'Reduce noise; soften with warm light — avoid excess wood clutter.' },
    4: { element: 'wood', hint: 'Fresh plants and study-friendly light support romance and learning.' },
    5: { element: 'metal', hint: 'No renovation here. Metal cures only — brass, white, round shapes.' },
    6: { element: 'metal', hint: 'Keep uncluttered; metal accents support authority and mentors.' },
    7: { element: 'water', hint: 'Soften sharp corners; use dark blue accents and rounded decor.' },
    8: { element: 'earth', hint: 'Prime wealth sector — stable earth tones and active income work.' },
    9: { element: 'fire', hint: 'Celebration star — warm lighting and social visibility.' },
  };

  /** 2026 Bing Wu (丙午) annual chart — Two Black in center,顺飞 */
  var ANNUAL_2026 = {
    center: 2, NW: 3, W: 4, NE: 5, S: 6, N: 7, SW: 8, E: 9, SE: 1,
  };

  function annualCenterStar(year) {
    var y = parseInt(year, 10) || new Date().getFullYear();
    if (y === 2026) return 2;
    var offset = y - 2024;
    var center = 9 - (offset % 9);
    if (center < 1) center += 9;
    return center;
  }

  function monthlyCenterStar(year, month) {
    var base = annualCenterStar(year);
    var m = parseInt(month, 10) || 1;
    var c = base - (m - 1);
    while (c < 1) c += 9;
    return c;
  }

  function buildChartFromRecord(chart, meta) {
    return {
      year: meta.year,
      month: meta.month || null,
      centerStar: chart.center,
      chart: chart,
      cells: GRID_LAYOUT.map(function (row) {
        return row.map(function (dir) {
          var num = chart[dir];
          var info = STAR_INFO[num] || STAR_INFO[5];
          return {
            direction: dir,
            star: num,
            cn: info.cn,
            en: info.en,
            label: info.label,
            nature: info.nature,
            color: info.color,
            textColor: info.text,
          };
        });
      }),
    };
  }

  function buildChartFromCenter(center, meta) {
    var chart = {};
    var star = center;
    for (var i = 0; i < FLY_ORDER.length; i++) {
      chart[FLY_ORDER[i]] = star;
      star -= 1;
      if (star < 1) star = 9;
    }
    return {
      year: meta.year,
      month: meta.month || null,
      centerStar: center,
      chart: chart,
      cells: GRID_LAYOUT.map(function (row) {
        return row.map(function (dir) {
          var num = chart[dir];
          var info = STAR_INFO[num] || STAR_INFO[5];
          return {
            direction: dir,
            star: num,
            cn: info.cn,
            en: info.en,
            label: info.label,
            nature: info.nature,
            color: info.color,
            textColor: info.text,
          };
        });
      }),
    };
  }

  function buildAnnualChart(year) {
    var y = parseInt(year, 10) || new Date().getFullYear();
    if (y === 2026) return buildChartFromRecord(ANNUAL_2026, { year: y, month: null });
    return buildChartFromCenter(annualCenterStar(y), { year: y, month: null });
  }

  function buildMonthlyChart(year, month) {
    var y = parseInt(year, 10) || new Date().getFullYear();
    var m = parseInt(month, 10) || 1;
    return buildChartFromCenter(monthlyCenterStar(y, m), { year: y, month: m });
  }

  function monthlyTimeline(year) {
    var y = parseInt(year, 10) || new Date().getFullYear();
    var names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return names.map(function (label, i) {
      var month = i + 1;
      var center = monthlyCenterStar(y, month);
      var info = STAR_INFO[center];
      return {
        month: month,
        label: label,
        center: center,
        centerLabel: info.en,
        nature: info.nature,
      };
    });
  }

  function sectorAlerts(chart, sectors) {
    if (!chart || !sectors) return [];
    var alerts = [];
    Object.keys(sectors).forEach(function (key) {
      var dir = sectors[key];
      if (!dir || dir === 'center' || !chart.chart[dir]) return;
      var star = chart.chart[dir];
      if (star === 5 || star === 2 || star === 7) {
        var info = STAR_INFO[star];
        alerts.push({
          room: key,
          direction: dir,
          dirLabel: DIR_LABEL[dir],
          star: star,
          label: info.label,
          severity: star === 5 ? 'high' : 'medium',
        });
      }
    });
    return alerts;
  }

  function insightsForFacing(result, facing) {
    var chart = result.chart;
    var face = facing || 'S';
    var faceStar = chart[face];
    var faceInfo = STAR_INFO[faceStar];
    var highlights = [];
    var cautions = [];

    Object.keys(chart).forEach(function (dir) {
      if (dir === 'center') return;
      var n = chart[dir];
      var info = STAR_INFO[n];
      if (!info) return;
      var entry = { direction: dir, dirLabel: DIR_LABEL[dir], star: n, label: info.label, nature: info.nature };
      if (info.nature === 'good') highlights.push(entry);
      if (info.nature === 'bad') cautions.push(entry);
    });

    highlights.sort(function (a, b) { return a.star - b.star; });
    cautions.sort(function (a, b) { return b.star - a.star; });

    return {
      facing: face,
      facingLabel: DIR_LABEL[face],
      facingStar: faceStar,
      facingInfo: faceInfo,
      headline: 'Your home faces ' + DIR_LABEL[face] + ' — in ' + result.year + ' this sector holds ' +
        faceInfo.en + ' (' + faceInfo.cn + '): ' + faceInfo.label + '.',
      wealthSectors: highlights.filter(function (h) { return h.star === 8 || h.star === 9 || h.star === 6; }),
      avoidSectors: cautions.filter(function (c) { return c.star === 5 || c.star === 2 || c.star === 7; }),
      highlights: highlights.slice(0, 3),
      cautions: cautions.slice(0, 3),
    };
  }

  root.XuanKong = {
    DIRECTIONS: DIRECTIONS,
    GRID_LAYOUT: GRID_LAYOUT,
    STAR_INFO: STAR_INFO,
    STAR_CURE: STAR_CURE,
    DIR_LABEL: DIR_LABEL,
    ANNUAL_2026: ANNUAL_2026,
    annualCenterStar: annualCenterStar,
    monthlyCenterStar: monthlyCenterStar,
    buildAnnualChart: buildAnnualChart,
    buildMonthlyChart: buildMonthlyChart,
    monthlyTimeline: monthlyTimeline,
    sectorAlerts: sectorAlerts,
    insightsForFacing: insightsForFacing,
  };
})(typeof window !== 'undefined' ? window : global);
