/**
 * Compass cure staging — client-side Canvas (free, no API).
 * Illustrative decor overlays on the facing sector + gentle room atmosphere.
 */
(function (global) {
  'use strict';

  var GRID = [
    ['NW', 'N', 'NE'],
    ['W', 'center', 'E'],
    ['SW', 'S', 'SE'],
  ];

  var ATMOSPHERE = {
    metal: { r: 228, g: 232, b: 240, a: 0.12, warmth: 0 },
    wood: { r: 72, g: 148, b: 96, a: 0.14, warmth: 0.02 },
    water: { r: 48, g: 96, b: 148, a: 0.16, warmth: -0.04 },
    fire: { r: 220, g: 120, b: 64, a: 0.18, warmth: 0.12 },
    earth: { r: 196, g: 152, b: 72, a: 0.14, warmth: 0.08 },
  };

  function palette(element) {
    return ATMOSPHERE[element] || ATMOSPHERE.metal;
  }

  function facingRect(w, h, facing) {
    var pad = Math.round(Math.min(w, h) * 0.06);
    var gw = w - pad * 2;
    var gh = h - pad * 2;
    var cw = gw / 3;
    var ch = gh / 3;
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        if (GRID[r][c] === facing) {
          return {
            x: pad + c * cw + 4,
            y: pad + r * ch + 4,
            w: cw - 8,
            h: ch - 8,
          };
        }
      }
    }
    return { x: pad + cw + 4, y: pad + ch + 4, w: cw - 8, h: ch - 8 };
  }

  function applyAtmosphere(ctx, w, h, element) {
    var pal = palette(element);
    ctx.save();
    ctx.fillStyle = 'rgba(' + pal.r + ',' + pal.g + ',' + pal.b + ',' + pal.a + ')';
    ctx.fillRect(0, 0, w, h);
    if (pal.warmth > 0) {
      ctx.fillStyle = 'rgba(255,180,100,' + (pal.warmth * 0.35) + ')';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  function sectorGlow(ctx, rect, element) {
    var pal = palette(element);
    var cx = rect.x + rect.w / 2;
    var cy = rect.y + rect.h / 2;
    var rad = Math.max(rect.w, rect.h) * 0.85;
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, 'rgba(' + pal.r + ',' + pal.g + ',' + pal.b + ',0.28)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(rect.x - rad * 0.3, rect.y - rad * 0.3, rect.w + rad * 0.6, rect.h + rad * 0.6);
  }

  function drawMetalCures(ctx, rect) {
    var cx = rect.x + rect.w * 0.55;
    var cy = rect.y + rect.h * 0.62;
    var bowlW = rect.w * 0.38;
    var bowlH = rect.h * 0.14;
    ctx.save();
    ctx.fillStyle = 'rgba(168,138,82,0.55)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, bowlW / 2, bowlH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(220,200,160,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(240,240,248,0.75)';
    for (var i = 0; i < 5; i++) {
      var ox = cx - bowlW * 0.25 + i * bowlW * 0.12;
      var oy = cy - bowlH * 0.35;
      ctx.beginPath();
      ctx.arc(ox, oy, 3 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(200,210,230,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(rect.x + rect.w * 0.22, rect.y + rect.h * 0.35, rect.w * 0.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawWoodCures(ctx, rect) {
    var baseX = rect.x + rect.w * 0.28;
    var baseY = rect.y + rect.h * 0.88;
    ctx.save();
    ctx.strokeStyle = 'rgba(48,88,56,0.65)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(baseX, rect.y + rect.h * 0.42);
    ctx.stroke();
    for (var i = 0; i < 4; i++) {
      var ly = rect.y + rect.h * (0.35 + i * 0.12);
      ctx.fillStyle = 'rgba(72,160,96,' + (0.45 + i * 0.08) + ')';
      ctx.beginPath();
      ctx.ellipse(baseX, ly, rect.w * 0.18, rect.h * 0.08, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(baseX + rect.w * 0.06, ly - rect.h * 0.04, rect.w * 0.14, rect.h * 0.06, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(88,180,110,0.35)';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }

  function drawWaterCures(ctx, rect) {
    var cx = rect.x + rect.w * 0.5;
    var cy = rect.y + rect.h * 0.55;
    ctx.save();
    for (var r = 0; r < 4; r++) {
      var radius = rect.w * (0.08 + r * 0.07);
      ctx.strokeStyle = 'rgba(80,140,200,' + (0.35 - r * 0.06) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    var g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    g.addColorStop(0, 'rgba(40,80,140,0.15)');
    g.addColorStop(0.5, 'rgba(100,160,220,0.22)');
    g.addColorStop(1, 'rgba(30,60,100,0.12)');
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }

  function drawFireCures(ctx, rect) {
    var spots = [
      { x: 0.35, y: 0.45, r: 0.22 },
      { x: 0.62, y: 0.58, r: 0.18 },
    ];
    ctx.save();
    spots.forEach(function (s) {
      var cx = rect.x + rect.w * s.x;
      var cy = rect.y + rect.h * s.y;
      var rad = rect.w * s.r;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, 'rgba(255,200,120,0.55)');
      g.addColorStop(0.4, 'rgba(232,120,64,0.25)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
    });
    var candleX = rect.x + rect.w * 0.72;
    var candleY = rect.y + rect.h * 0.52;
    ctx.fillStyle = 'rgba(240,220,180,0.8)';
    ctx.fillRect(candleX, candleY, rect.w * 0.04, rect.h * 0.18);
    ctx.fillStyle = 'rgba(255,180,80,0.9)';
    ctx.beginPath();
    ctx.moveTo(candleX + rect.w * 0.02, candleY);
    ctx.lineTo(candleX + rect.w * 0.04, candleY - rect.h * 0.06);
    ctx.lineTo(candleX + rect.w * 0.06, candleY);
    ctx.fill();
    ctx.restore();
  }

  function drawEarthCures(ctx, rect) {
    var vx = rect.x + rect.w * 0.38;
    var vy = rect.y + rect.h * 0.55;
    ctx.save();
    ctx.fillStyle = 'rgba(180,140,80,0.55)';
    ctx.beginPath();
    ctx.moveTo(vx, vy - rect.h * 0.2);
    ctx.lineTo(vx + rect.w * 0.14, vy);
    ctx.lineTo(vx + rect.w * 0.1, vy + rect.h * 0.22);
    ctx.lineTo(vx - rect.w * 0.1, vy + rect.h * 0.22);
    ctx.lineTo(vx - rect.w * 0.14, vy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(196,152,72,0.35)';
    ctx.fillRect(rect.x, rect.y + rect.h * 0.72, rect.w, rect.h * 0.28);
    ctx.fillStyle = 'rgba(220,180,100,0.25)';
    ctx.fillRect(rect.x + rect.w * 0.1, rect.y + rect.h * 0.78, rect.w * 0.8, rect.h * 0.12);
    ctx.restore();
  }

  function drawCures(ctx, rect, element) {
    sectorGlow(ctx, rect, element);
    if (element === 'metal') drawMetalCures(ctx, rect);
    else if (element === 'wood') drawWoodCures(ctx, rect);
    else if (element === 'water') drawWaterCures(ctx, rect);
    else if (element === 'fire') drawFireCures(ctx, rect);
    else drawEarthCures(ctx, rect);

    ctx.save();
    ctx.strokeStyle = 'rgba(168,138,82,0.75)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }

  function render(img, opts) {
    opts = opts || {};
    var element = (opts.element || 'metal').toLowerCase();
    var facing = opts.facing || 'S';
    var maxDim = opts.maxDim || 1024;

    var w = img.width;
    var h = img.height;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round(h * maxDim / w);
        w = maxDim;
      } else {
        w = Math.round(w * maxDim / h);
        h = maxDim;
      }
    }

    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0, w, h);
    applyAtmosphere(ctx, w, h, element);

    var rect = facingRect(w, h, facing);
    drawCures(ctx, rect, element);

    ctx.save();
    ctx.font = '600 11px IBM Plex Mono, monospace';
    ctx.fillStyle = 'rgba(31,42,38,0.65)';
    ctx.textAlign = 'right';
    ctx.fillText('Illustrative staging · ' + element.toUpperCase(), w - 12, h - 10);
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.9);
  }

  global.CompassCureCanvas = { render: render };
})(window);
