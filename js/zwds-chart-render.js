/**
 * zwds-chart-render.js — Branch-based dynamic SVG rendering for Zi Wei Dou Shu
 * Uses earthly branch (地支) grid positions — never hardcoded palace slots.
 */
(function(root) {
  'use strict';

  var BRANCH_GRID = {
    '巳': { col: 0, row: 0 }, '午': { col: 1, row: 0 }, '未': { col: 2, row: 0 }, '申': { col: 3, row: 0 },
    '辰': { col: 0, row: 1 },                                                 '酉': { col: 3, row: 1 },
    '卯': { col: 0, row: 2 },                                                 '戌': { col: 3, row: 2 },
    '寅': { col: 0, row: 3 }, '丑': { col: 1, row: 3 }, '子': { col: 2, row: 3 }, '亥': { col: 3, row: 3 }
  };

  var PALACE_EN = [
    'Life & Destiny', 'Siblings', 'Spouse & Romance', 'Children & Creativity',
    'Wealth', 'Health', 'Travel & Migration', 'Friends & Servants',
    'Career & Status', 'Property', 'Virtue & Fortune', 'Parents'
  ];

  var STAR_EN = {
    '紫微': 'Zi Wei', '天機': 'Tian Ji', '太陽': 'Tai Yang', '武曲': 'Wu Qu',
    '天同': 'Tian Tong', '廉貞': 'Lian Zhen', '天府': 'Tian Fu', '太陰': 'Tai Yin',
    '貪狼': 'Tan Lang', '巨門': 'Ju Men', '天相': 'Tian Xiang', '天梁': 'Tian Liang',
    '七殺': 'Qi Sha', '破軍': 'Po Jun'
  };

  function branchToXY(branch) {
    var g = BRANCH_GRID[branch];
    if (!g) return { x: 60, y: 60 };
    return { x: 60 + g.col * 110, y: 60 + g.row * 110 };
  }

  function buildChartData(result) {
    if (root.zwdsCore && typeof root.zwdsCore.buildChartData === 'function') {
      return root.zwdsCore.buildChartData(result);
    }
    if (!result || !result.palaces) return { palaces: [] };
    return {
      palaces: result.palaces.map(function(p) {
        var branch = p.branch || (p.stemBranch ? p.stemBranch.slice(-1) : '');
        var mainStars = p.mainStars || p.majorStars || [];
        var hua = p.fourHua || [];
        return {
          palaceName: p.palaceName || p.name,
          branch: branch,
          mainStars: mainStars,
          luckyTransform: p.luckyTransform || hua.join(' · '),
          bigCycle: p.bigCycle || ''
        };
      })
    };
  }

  function addText(parent, ns, x, y, text, size, fill, glow) {
    var scale = (typeof window !== 'undefined' && window.innerWidth <= 768) ? 1.35 : 1;
    var mobile = scale > 1;
    var mobileFill = fill;
    if (mobile) {
      if (fill === '#7A5C28') mobileFill = '#ecd89a';
      else if (fill === '#9BB5CC') mobileFill = '#d4e4f2';
      else if (fill === '#C5984A' || fill === '#E2C27A') mobileFill = '#f2da98';
    }
    var t = document.createElementNS(ns, 'text');
    t.setAttribute('x', String(x));
    t.setAttribute('y', String(y));
    t.setAttribute('font-size', String(Math.round(size * scale * 10) / 10));
    t.setAttribute('fill', mobileFill);
    if (glow) t.setAttribute('filter', 'url(#softglow)');
    t.textContent = text;
    parent.appendChild(t);
  }

  function renderPalace(container, palace, palaceIndex, sourcePalace, ns) {
    if (!palace || !palace.branch) return null;

    var pos = branchToXY(palace.branch);
    var isLife = palaceIndex === 0;
    var g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', 'translate(' + pos.x + ',' + pos.y + ')');
    g.setAttribute('data-branch', palace.branch);
    g.setAttribute('data-palace', palace.palaceName || '');

    if (isLife) {
      var bg = document.createElementNS(ns, 'rect');
      bg.setAttribute('width', '110');
      bg.setAttribute('height', '110');
      bg.setAttribute('fill', '#C5984A');
      bg.setAttribute('opacity', '0.08');
      g.appendChild(bg);
    }

    addText(g, ns, 8, 18, palace.branch, 7.5, '#7A5C28', false);
    addText(g, ns, 8, 34, palace.palaceName, 10, isLife ? '#E2C27A' : '#C5984A', isLife);
    addText(g, ns, 8, 48, PALACE_EN[palaceIndex] || '', 7, '#9BB5CC', false);

    var majors = palace.mainStars || [];
    var starBaseY = 66;
    if (majors.length === 0) {
      addText(g, ns, 8, starBaseY, '—', 9, '#9BB5CC', false);
    } else {
      majors.forEach(function(star, si) {
        var label = STAR_EN[star] ? star + ' · ' + STAR_EN[star] : star;
        addText(g, ns, 8, starBaseY + si * 14, label, 8.5, '#E2C27A', true);
      });
    }

    var auxY = starBaseY + Math.max(majors.length, 1) * 14 + 2;
    var aux = sourcePalace && sourcePalace.auxiliaryStars ? sourcePalace.auxiliaryStars : [];
    if (aux.length) {
      addText(g, ns, 8, auxY, aux.slice(0, 4).join(' '), 7.5, '#9BB5CC', false);
      auxY += 14;
    }

    if (palace.luckyTransform) {
      addText(g, ns, 8, auxY, palace.luckyTransform, 6.5, '#7A5C28', false);
      auxY += 12;
    }

    if (palace.bigCycle) {
      addText(g, ns, 8, auxY, palace.bigCycle, 6, '#7A5C28', false);
      auxY += 12;
    }

    if (sourcePalace && sourcePalace.stemBranch) {
      addText(g, ns, 8, Math.min(auxY, 106), sourcePalace.stemBranch, 6.5, '#7A5C28', false);
    }

    container.appendChild(g);
    return g;
  }

  function renderChartSvg(result) {
    var content = document.getElementById('palaces-content');
    if (!content || !result) return false;

    var chartData = buildChartData(result);
    var ns = 'http://www.w3.org/2000/svg';
    content.innerHTML = '';

    chartData.palaces.forEach(function(palace, i) {
      var source = result.palaces && result.palaces[i] ? result.palaces[i] : null;
      renderPalace(content, palace, i, source, ns);
    });

    return content.childNodes.length > 0;
  }

  root.ZwdsChartRender = {
    BRANCH_GRID: BRANCH_GRID,
    branchToXY: branchToXY,
    buildChartData: buildChartData,
    renderPalace: renderPalace,
    renderChartSvg: renderChartSvg
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.ZwdsChartRender;
  }
})(typeof window !== 'undefined' ? window : global);
