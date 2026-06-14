/**
 * Living Compass — procedural compass art, hero animation, share card.
 */
(function (global) {
  'use strict';

  var SHARE_W = 600;
  var SHARE_H = 900;

  var COLORS = {
    rice: '#EAE7DF',
    celadon: '#7A9B8E',
    ink: '#1F2A26',
    brass: '#A88A52',
    celadonDim: 'rgba(122,155,142,0.35)',
    inkMuted: 'rgba(31,42,38,0.55)',
  };

  var DIR_ANGLE = {
    N: -Math.PI / 2,
    NE: -Math.PI / 4,
    E: 0,
    SE: Math.PI / 4,
    S: Math.PI / 2,
    SW: 3 * Math.PI / 4,
    W: Math.PI,
    NW: -3 * Math.PI / 4,
  };

  var animState = {
    raf: null,
    breathing: true,
    result: null,
    houseFacing: '',
    tick: 0,
  };

  function track(event, props) {
    if (global.plausible) global.plausible(event, props ? { props: props } : undefined);
    if (global.gtag) global.gtag('event', event, props || {});
  }

  function positionColor(pos) {
    if (!pos || !global.BaZhai) return COLORS.celadon;
    var el = global.BaZhai.ELEMENT_COLORS;
    if (pos.kind === 'inauspicious') return 'rgba(192,57,43,0.55)';
    var kuaEl = animState.result && animState.result.element;
    if (kuaEl && el[kuaEl]) return el[kuaEl];
    return COLORS.celadon;
  }

  function facingRotation() {
    var f = animState.houseFacing || animState.result && animState.result.houseFacing;
    if (!f || !DIR_ANGLE[f]) return 0;
    return -DIR_ANGLE[f] + Math.PI / 2;
  }

  function drawCompassFace(ctx, cx, cy, radius, result, breath, rot) {
    var breathe = 1 + Math.sin(breath) * 0.018;
    var r = radius * breathe;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot || 0);

    // Outer ring
    ctx.strokeStyle = COLORS.celadonDim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // Inner precision rings
    for (var i = 1; i <= 3; i++) {
      ctx.globalAlpha = 0.12 + i * 0.04;
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.35 + i * 0.18), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Cardinal ticks
    var labels = ['N', 'E', 'S', 'W'];
    var labelAngles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
    ctx.font = '500 11px "Geist Mono", ui-monospace, monospace';
    ctx.fillStyle = COLORS.inkMuted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var li = 0; li < 4; li++) {
      var a = labelAngles[li];
      var tx = Math.cos(a) * (r + 14);
      var ty = Math.sin(a) * (r + 14);
      ctx.fillText(labels[li], tx, ty);
    }

    // Cross axes
    ctx.strokeStyle = 'rgba(31,42,38,0.08)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.stroke();

  if (result && result.positions) {
      result.positions.forEach(function (pos) {
        var ang = DIR_ANGLE[pos.direction];
        if (!ang) return;
        var dist = pos.kind === 'auspicious' ? r * 0.72 : r * 0.58;
        var px = Math.cos(ang) * dist;
        var py = Math.sin(ang) * dist;
        var glow = positionColor(pos);
        var dotR = pos.kind === 'auspicious' ? 7 : 4;

        ctx.save();
        if (pos.kind === 'auspicious') {
          var g = ctx.createRadialGradient(px, py, 0, px, py, dotR * 3);
          g.addColorStop(0, glow);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, dotR * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = glow;
        ctx.globalAlpha = pos.kind === 'auspicious' ? 0.92 : 0.45;
        ctx.beginPath();
        ctx.arc(px, py, dotR, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      });
    }

    // Center needle — slow drift when no result
    var needleAng = result ? DIR_ANGLE[result.directions.shengqi] : breath * 0.15;
    ctx.save();
    ctx.rotate(needleAng);
    ctx.strokeStyle = COLORS.brass;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(0, r * 0.12);
    ctx.stroke();
    ctx.fillStyle = COLORS.brass;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.58);
    ctx.lineTo(4, -r * 0.42);
    ctx.lineTo(-4, -r * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = COLORS.celadon;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawHeroFrame(canvas) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var cx = w / 2;
    var cy = h / 2;
    var t = animState.tick * 0.02;

    ctx.fillStyle = COLORS.rice;
    ctx.fillRect(0, 0, w, h);

    var grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, w * 0.45);
    grad.addColorStop(0, 'rgba(122,155,142,0.12)');
    grad.addColorStop(1, 'rgba(234,227,223,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    drawCompassFace(ctx, cx, cy, Math.min(w, h) * 0.32, animState.result, t, facingRotation() + t * 0.04);
  }

  function startHeroAnimation(canvas) {
    if (!canvas) return;
    stopHeroAnimation();
    animState.breathing = true;

    function loop() {
      if (!animState.breathing) return;
      animState.tick += 1;
      drawHeroFrame(canvas);
      animState.raf = requestAnimationFrame(loop);
    }
    loop();
  }

  function stopHeroAnimation() {
    animState.breathing = false;
    if (animState.raf) {
      cancelAnimationFrame(animState.raf);
      animState.raf = null;
    }
  }

  function setResult(result, houseFacing) {
    animState.result = result;
    animState.houseFacing = houseFacing || result.houseFacing || '';
  }

  function drawShareCard(canvas, result) {
    if (!canvas || !result) return;
    var ctx = canvas.getContext('2d');
    canvas.width = SHARE_W;
    canvas.height = SHARE_H;

    ctx.fillStyle = COLORS.rice;
    ctx.fillRect(0, 0, SHARE_W, SHARE_H);

    ctx.strokeStyle = COLORS.celadonDim;
    ctx.lineWidth = 1;
    ctx.strokeRect(28, 28, SHARE_W - 56, SHARE_H - 56);

    ctx.font = '400 10px "Hanken Grotesk", system-ui, sans-serif';
    ctx.fillStyle = COLORS.celadon;
    ctx.textAlign = 'center';
    ctx.fillText('THE LIVING COMPASS · 活罗盘', SHARE_W / 2, 58);

    ctx.font = '600 13px "Geist Mono", ui-monospace, monospace';
    ctx.fillStyle = COLORS.brass;
    ctx.fillText('KUA ' + result.kua, SHARE_W / 2, 88);

    ctx.font = '500 22px Fraunces, Georgia, serif';
    ctx.fillStyle = COLORS.ink;
    ctx.fillText(result.archetype, SHARE_W / 2, 118);
    ctx.font = '400 14px "Noto Serif SC", serif';
    ctx.fillStyle = COLORS.inkMuted;
    ctx.fillText(result.cn + ' ' + result.trigram + ' · ' + result.groupLabel, SHARE_W / 2, 148);

    drawCompassFace(ctx, SHARE_W / 2, 340, 130, result, 0, facingRotation());

    var y = 520;
    result.auspicious.forEach(function (pos) {
      ctx.font = '400 13px "Hanken Grotesk", system-ui, sans-serif';
      ctx.fillStyle = COLORS.ink;
      ctx.textAlign = 'left';
      ctx.fillText('◉ ' + pos.short + ' → ' + pos.direction, 72, y);
      ctx.font = '400 11px "Hanken Grotesk", system-ui, sans-serif';
      ctx.fillStyle = COLORS.inkMuted;
      ctx.fillText(pos.label, 88, y + 16);
      y += 44;
    });

    ctx.globalAlpha = 0.2;
    ctx.fillRect(72, y + 8, SHARE_W - 144, 1);
    ctx.globalAlpha = 1;

    ctx.font = '400 12px Fraunces, Georgia, serif';
    ctx.fillStyle = COLORS.inkMuted;
    ctx.textAlign = 'center';
    ctx.fontStyle = 'italic';
    var line = result.actions[0] || '';
    wrapText(ctx, line, SHARE_W / 2, y + 36, SHARE_W - 120, 18);

    ctx.fontStyle = 'normal';
    ctx.font = '400 10px "Hanken Grotesk", system-ui, sans-serif';
    ctx.fillStyle = COLORS.celadon;
    ctx.fillText('metaphysicflow.com/compass', SHARE_W / 2, SHARE_H - 48);
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    var words = (text || '').split(' ');
    var line = '';
    var lines = [];
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    lines.forEach(function (ln, idx) {
      ctx.fillText(ln, x, y + idx * lineHeight);
    });
  }

  function downloadShare(result) {
    var canvas = document.getElementById('lc-share-canvas');
    if (!canvas) return;
    drawShareCard(canvas, result);
    var link = document.createElement('a');
    link.download = 'living-compass-kua-' + result.kua + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    track('living_compass_download', { kua: result.kua });
  }

  function copyShare(result) {
    var canvas = document.getElementById('lc-share-canvas');
    if (!canvas) return;
    drawShareCard(canvas, result);

    function onSuccess() {
      track('living_compass_share', { kua: result.kua, platform: 'clipboard' });
    }

    if (navigator.clipboard && window.ClipboardItem && canvas.toBlob) {
      canvas.toBlob(function (blob) {
        if (!blob) return;
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          .then(onSuccess)
          .catch(function () { downloadShare(result); });
      }, 'image/png');
    } else {
      downloadShare(result);
    }
  }

  function renderInteractive(canvas, result, houseFacing) {
    setResult(result, houseFacing);
    stopHeroAnimation();
    animState.breathing = true;
    animState.tick = 0;

    function loop() {
      if (!animState.breathing) return;
      animState.tick += 1;
      drawHeroFrame(canvas);
      animState.raf = requestAnimationFrame(loop);
    }
    loop();
    track('living_compass_view', { kua: result.kua, group: result.group });
  }

  global.LivingCompassCanvas = {
    startHero: startHeroAnimation,
    stopHero: stopHeroAnimation,
    render: renderInteractive,
    drawShare: drawShareCard,
    download: downloadShare,
    copy: copyShare,
    COLORS: COLORS,
  };
})(window);
