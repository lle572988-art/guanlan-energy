/**
 * Soul Guardian Canvas — procedural Life Palace guardian art + share flow.
 * Loaded by free-chart.html; triggered from populateResultsUI via SoulGuardian.render().
 */
(function (global) {
  'use strict';

  var W = 600;
  var H = 900;

  var ELEMENT_PAL = {
    Wood: { bg0: '#061408', bg1: '#0a2010', primary: '#6ab87a', accent: '#d4e8d4', glow: 'rgba(106,184,122,0.35)' },
    Fire: { bg0: '#1a0806', bg1: '#120606', primary: '#e07060', accent: '#f0d0c8', glow: 'rgba(224,112,96,0.35)' },
    Earth: { bg0: '#141006', bg1: '#0c0a04', primary: '#c9a84c', accent: '#e8e0cc', glow: 'rgba(201,168,76,0.35)' },
    Metal: { bg0: '#0c0e12', bg1: '#08080a', primary: '#c0c8d4', accent: '#e0e4ec', glow: 'rgba(192,200,212,0.3)' },
    Water: { bg0: '#060e1a', bg1: '#040810', primary: '#5a8fc0', accent: '#c8d8e8', glow: 'rgba(90,143,192,0.35)' }
  };

  /** 14 major stars + open Life Palace */
  var SOUL_GUARDIANS = {
    '紫微': { name: 'Imperial Dragon', cn: '紫微', sigil: 'dragon', virtue: 'Sovereign Presence' },
    '天機': { name: 'Star Fox', cn: '天機', sigil: 'fox', virtue: 'Hidden Strategy' },
    '太陽': { name: 'Solar Eagle', cn: '太陽', sigil: 'eagle', virtue: 'Radiant Vision' },
    '武曲': { name: 'Iron Wolf', cn: '武曲', sigil: 'wolf', virtue: 'Decisive Force' },
    '天同': { name: 'River Deer', cn: '天同', sigil: 'deer', virtue: 'Gentle Harmony' },
    '廉貞': { name: 'Crimson Serpent', cn: '廉貞', sigil: 'serpent', virtue: 'Fierce Integrity' },
    '天府': { name: 'Golden Tortoise', cn: '天府', sigil: 'tortoise', virtue: 'Enduring Abundance' },
    '太陰': { name: 'Moon Hare', cn: '太陰', sigil: 'hare', virtue: 'Quiet Intuition' },
    '貪狼': { name: 'Azure Wolf', cn: '貪狼', sigil: 'wolf', virtue: 'Magnetic Desire' },
    '巨門': { name: 'Gate Raven', cn: '巨門', sigil: 'raven', virtue: 'Unspoken Truth' },
    '天相': { name: 'White Swan', cn: '天相', sigil: 'swan', virtue: 'Balanced Grace' },
    '天梁': { name: 'Sky Crane', cn: '天梁', sigil: 'crane', virtue: 'Ancient Wisdom' },
    '七殺': { name: 'Battle Tiger', cn: '七殺', sigil: 'tiger', virtue: 'Fearless Advance' },
    '破軍': { name: 'Storm Phoenix', cn: '破軍', sigil: 'phoenix', virtue: 'Sacred Rebirth' },
    '__empty__': { name: 'Void Moth', cn: '空宫', sigil: 'moth', virtue: 'Unwritten Destiny' }
  };

  var state = {
    starKey: '__empty__',
    persona: 'The Seeker',
    element: 'Earth',
    theme2026: 'Expansion',
    strength: 'Wisdom',
    lifeBranch: '—',
    tagline: '',
    birthYear: '',
    hourLabel: ''
  };

  function paletteFor(element) {
    return ELEMENT_PAL[element] || ELEMENT_PAL.Earth;
  }

  function guardianFor(starKey) {
    return SOUL_GUARDIANS[starKey] || SOUL_GUARDIANS['__empty__'];
  }

  function wrapLines(ctx, text, maxWidth) {
    var words = (text || '').split(/\s+/);
    var lines = [];
    var line = '';
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
    return lines;
  }

  function drawParticles(ctx, pal, count) {
    ctx.save();
    for (var i = 0; i < count; i++) {
      var x = (Math.sin(i * 2.17 + 0.4) * 0.5 + 0.5) * W;
      var y = (Math.cos(i * 1.83 + 1.1) * 0.5 + 0.5) * H;
      var r = 0.6 + (i % 5) * 0.35;
      ctx.globalAlpha = 0.08 + (i % 7) * 0.025;
      ctx.fillStyle = pal.primary;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawOrbitRings(ctx, cx, cy, pal) {
    ctx.save();
    for (var r = 140; r <= 220; r += 40) {
      ctx.strokeStyle = pal.primary;
      ctx.globalAlpha = 0.08 + (220 - r) * 0.001;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawGlow(ctx, cx, cy, radius, color) {
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  }

  function strokeSigil(ctx, pal) {
    ctx.strokeStyle = pal.primary;
    ctx.fillStyle = pal.accent;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function drawDragon(ctx, cx, cy, s) {
    strokeSigil(ctx, paletteFor(state.element));
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.9, cy + s * 0.3);
    ctx.bezierCurveTo(cx - s * 0.5, cy - s * 0.8, cx + s * 0.2, cy - s * 0.5, cx + s * 0.85, cy - s * 0.15);
    ctx.bezierCurveTo(cx + s * 0.45, cy + s * 0.1, cx + s * 0.1, cy + s * 0.55, cx - s * 0.9, cy + s * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.85, cy - s * 0.15);
    ctx.lineTo(cx + s * 1.05, cy - s * 0.35);
    ctx.lineTo(cx + s * 0.75, cy - s * 0.05);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - s * 0.75, cy + s * 0.15, s * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = paletteFor(state.element).primary;
    ctx.fill();
  }

  function drawFox(ctx, cx, cy, s) {
    var pal = paletteFor(state.element);
    strokeSigil(ctx, pal);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.35, cy - s * 0.55);
    ctx.lineTo(cx, cy - s * 0.95);
    ctx.lineTo(cx + s * 0.35, cy - s * 0.55);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, s * 0.55, s * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.1);
    ctx.lineTo(cx, cy + s * 0.55);
    ctx.stroke();
  }

  function drawEagle(ctx, cx, cy, s) {
    var pal = paletteFor(state.element);
    strokeSigil(ctx, pal);
    ctx.beginPath();
    ctx.moveTo(cx - s * 1.1, cy);
    ctx.quadraticCurveTo(cx - s * 0.2, cy - s * 0.55, cx, cy - s * 0.35);
    ctx.quadraticCurveTo(cx + s * 0.2, cy - s * 0.55, cx + s * 1.1, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.35);
    ctx.lineTo(cx, cy + s * 0.45);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.15, cy + s * 0.45);
    ctx.lineTo(cx + s * 0.15, cy + s * 0.45);
    ctx.stroke();
  }

  function drawWolf(ctx, cx, cy, s) {
    var pal = paletteFor(state.element);
    strokeSigil(ctx, pal);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.25, cy - s * 0.7);
    ctx.lineTo(cx - s * 0.05, cy - s * 0.35);
    ctx.lineTo(cx + s * 0.05, cy - s * 0.35);
    ctx.lineTo(cx + s * 0.25, cy - s * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.35);
    ctx.lineTo(cx - s * 0.55, cy + s * 0.35);
    ctx.quadraticCurveTo(cx, cy + s * 0.65, cx + s * 0.55, cy + s * 0.35);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.12, cy - s * 0.05);
    ctx.lineTo(cx + s * 0.12, cy - s * 0.05);
    ctx.stroke();
  }

  function drawDeer(ctx, cx, cy, s) {
    var pal = paletteFor(state.element);
    strokeSigil(ctx, pal);
    var antlers = [[-0.35, -0.9, -0.55, -0.55], [0.35, -0.9, 0.55, -0.55], [0, -0.95, 0, -0.55]];
    antlers.forEach(function (a) {
      ctx.beginPath();
      ctx.moveTo(cx + a[0] * s, cy + a[1] * s);
      ctx.lineTo(cx + a[2] * s, cy + a[3] * s);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.05, s * 0.35, s * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawSerpent(ctx, cx, cy, s) {
    var pal = paletteFor(state.element);
    strokeSigil(ctx, pal);
    ctx.beginPath();
    for (var t = 0; t <= 1.001; t += 0.02) {
      var angle = t * Math.PI * 4;
      var r = s * (0.25 + t * 0.45);
      var x = cx + Math.cos(angle) * r;
      var y = cy + Math.sin(angle) * r * 0.75;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + s * 0.55, cy - s * 0.15, s * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = pal.primary;
    ctx.fill();
  }

  function drawTortoise(ctx, cx, cy, s) {
    var pal = paletteFor(state.element);
    strokeSigil(ctx, pal);
    ctx.beginPath();
    ctx.ellipse(cx, cy, s * 0.65, s * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * s * 0.45, cy + Math.sin(a) * s * 0.35);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.55, s * 0.12, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawHare(ctx, cx, cy, s) {
    var pal = paletteFor(state.element);
    strokeSigil(ctx, pal);
    ctx.beginPath();
    ctx.ellipse(cx - s * 0.12, cy - s * 0.65, s * 0.08, s * 0.35, -0.2, 0, Math.PI * 2);
    ctx.ellipse(cx + s * 0.12, cy - s * 0.65, s * 0.08, s * 0.35, 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.32, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawRaven(ctx, cx, cy, s) {
    var pal = paletteFor(state.element);
    strokeSigil(ctx, pal);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.9, cy + s * 0.1);
    ctx.lineTo(cx, cy - s * 0.45);
    ctx.lineTo(cx + s * 0.9, cy + s * 0.1);
    ctx.lineTo(cx, cy + s * 0.35);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.45);
    ctx.lineTo(cx + s * 0.15, cy - s * 0.75);
    ctx.stroke();
  }

  function drawSwan(ctx, cx, cy, s) {
    var pal = paletteFor(state.element);
    strokeSigil(ctx, pal);
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.35, cy + s * 0.55);
    ctx.quadraticCurveTo(cx + s * 0.55, cy - s * 0.15, cx, cy - s * 0.75);
    ctx.quadraticCurveTo(cx - s * 0.35, cy - s * 0.15, cx - s * 0.35, cy + s * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.55, cy + s * 0.15);
    ctx.quadraticCurveTo(cx - s * 0.15, cy + s * 0.05, cx + s * 0.45, cy + s * 0.25);
    ctx.stroke();
  }

  function drawCrane(ctx, cx, cy, s) {
    var pal = paletteFor(state.element);
    strokeSigil(ctx, pal);
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.75);
    ctx.lineTo(cx, cy - s * 0.15);
    ctx.lineTo(cx + s * 0.45, cy - s * 0.65);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.55, cy + s * 0.35);
    ctx.quadraticCurveTo(cx - s * 0.1, cy + s * 0.05, cx + s * 0.35, cy + s * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.08, cy + s * 0.75);
    ctx.lineTo(cx + s * 0.08, cy + s * 0.75);
    ctx.stroke();
  }

  function drawTiger(ctx, cx, cy, s) {
    var pal = paletteFor(state.element);
    strokeSigil(ctx, pal);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, cy - s * 0.55);
    ctx.lineTo(cx - s * 0.05, cy - s * 0.35);
    ctx.lineTo(cx + s * 0.05, cy - s * 0.35);
    ctx.lineTo(cx + s * 0.3, cy - s * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + s * 0.05, s * 0.42, 0, Math.PI * 2);
    ctx.stroke();
    [-0.25, 0, 0.25].forEach(function (off) {
      ctx.beginPath();
      ctx.moveTo(cx + off * s, cy - s * 0.05);
      ctx.lineTo(cx + off * s, cy + s * 0.35);
      ctx.stroke();
    });
  }

  function drawPhoenix(ctx, cx, cy, s) {
    var pal = paletteFor(state.element);
    strokeSigil(ctx, pal);
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.55);
    ctx.lineTo(cx, cy - s * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 1.0, cy + s * 0.05);
    ctx.quadraticCurveTo(cx - s * 0.25, cy - s * 0.65, cx, cy - s * 0.55);
    ctx.quadraticCurveTo(cx + s * 0.25, cy - s * 0.65, cx + s * 1.0, cy + s * 0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.35, cy + s * 0.55);
    ctx.quadraticCurveTo(cx - s * 0.15, cy + s * 0.85, cx, cy + s * 0.95);
    ctx.quadraticCurveTo(cx + s * 0.15, cy + s * 0.85, cx + s * 0.35, cy + s * 0.55);
    ctx.stroke();
  }

  function drawMoth(ctx, cx, cy, s) {
    var pal = paletteFor(state.element);
    strokeSigil(ctx, pal);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.95, cy - s * 0.05);
    ctx.quadraticCurveTo(cx - s * 0.35, cy - s * 0.55, cx, cy - s * 0.15);
    ctx.quadraticCurveTo(cx + s * 0.35, cy - s * 0.55, cx + s * 0.95, cy - s * 0.05);
    ctx.quadraticCurveTo(cx + s * 0.35, cy + s * 0.45, cx, cy + s * 0.15);
    ctx.quadraticCurveTo(cx - s * 0.35, cy + s * 0.45, cx - s * 0.95, cy - s * 0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.05, s * 0.06, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = pal.primary;
    ctx.fill();
  }

  var SIGIL_DRAW = {
    dragon: drawDragon,
    fox: drawFox,
    eagle: drawEagle,
    wolf: drawWolf,
    deer: drawDeer,
    serpent: drawSerpent,
    tortoise: drawTortoise,
    hare: drawHare,
    raven: drawRaven,
    swan: drawSwan,
    crane: drawCrane,
    tiger: drawTiger,
    phoenix: drawPhoenix,
    moth: drawMoth
  };

  function drawSigil(ctx, sigil, cx, cy) {
    var fn = SIGIL_DRAW[sigil] || drawMoth;
    fn(ctx, cx, cy, 70);
  }

  function drawSoulGuardianCanvas(canvas, data) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    var starKey = data.starKey || '__empty__';
    var guardian = guardianFor(starKey);
    var pal = paletteFor(data.element || 'Earth');
    var cx = W / 2;

    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, pal.bg0);
    grad.addColorStop(0.45, '#050508');
    grad.addColorStop(1, pal.bg1);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    drawParticles(ctx, pal, 48);

    ctx.strokeStyle = pal.primary;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    ctx.globalAlpha = 1;

    ctx.font = '400 10px Georgia, serif';
    ctx.fillStyle = pal.primary;
    ctx.globalAlpha = 0.35;
    ctx.textAlign = 'right';
    ctx.fillText('GUANLAN ENERGY · 紫微斗數', W - 36, 48);
    ctx.textAlign = 'center';
    ctx.globalAlpha = 1;

    ctx.font = '400 11px Georgia, serif';
    ctx.fillStyle = pal.primary;
    ctx.globalAlpha = 0.45;
    ctx.fillText('SOUL GUARDIAN · 守護靈獸', cx, 78);
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 0.12;
    ctx.fillRect(80, 92, W - 160, 1);
    ctx.globalAlpha = 1;

    drawGlow(ctx, cx, 340, 180, pal.glow);
    drawOrbitRings(ctx, cx, 340, pal);

    drawSigil(ctx, guardian.sigil, cx, 340);

    ctx.font = '500 38px Georgia, serif';
    ctx.fillStyle = pal.primary;
    ctx.fillText(guardian.name.toUpperCase(), cx, 520);

    ctx.font = '400 16px Georgia, serif';
    ctx.fillStyle = pal.accent;
    ctx.globalAlpha = 0.65;
    ctx.fillText(guardian.cn + ' · ' + guardian.virtue, cx, 552);
    ctx.globalAlpha = 1;

    ctx.font = '400 22px Georgia, serif';
    ctx.fillStyle = pal.accent;
    ctx.fillText(data.persona || 'The Seeker', cx, 598);

    ctx.font = '400 13px Georgia, serif';
    ctx.fillStyle = pal.primary;
    ctx.globalAlpha = 0.5;
    var metaLine = (data.element || 'Earth') + ' · ' + (data.lifeBranch || '—');
    if (data.birthYear) metaLine += ' · Born ' + data.birthYear;
    ctx.fillText(metaLine, cx, 628);
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 0.12;
    ctx.fillRect(100, 648, W - 200, 1);
    ctx.globalAlpha = 1;

    ctx.font = 'italic 400 15px Georgia, serif';
    ctx.fillStyle = pal.accent;
    ctx.globalAlpha = 0.55;
    var tag = data.tagline || 'Your destiny is written in the stars.';
    var tagLines = wrapLines(ctx, '"' + tag + '"', W - 120);
    var tagY = 678;
    tagLines.slice(0, 3).forEach(function (line) {
      ctx.fillText(line, cx, tagY);
      tagY += 22;
    });
    ctx.globalAlpha = 1;

    ctx.font = '400 12px Georgia, serif';
    ctx.fillStyle = pal.primary;
    ctx.globalAlpha = 0.45;
    ctx.fillText('2026 ACTIVATION · ' + (data.theme2026 || 'Expansion').toUpperCase(), cx, H - 118);
    ctx.fillText((data.strength || 'Wisdom').toUpperCase() + ' · LIFE PALACE FORCE', cx, H - 96);
    ctx.globalAlpha = 1;

    ctx.font = '400 10px Georgia, serif';
    ctx.fillStyle = pal.primary;
    ctx.globalAlpha = 0.3;
    ctx.fillText('metaphysicflow.com · Free Zi Wei Chart', cx, H - 52);
    ctx.globalAlpha = 1;
  }

  function parseBirthYear(dateStr) {
    if (!dateStr) return '';
    var m = String(dateStr).match(/(\d{4})/);
    return m ? m[1] : '';
  }

  function updateDomLabels(guardian, data) {
    var nameEl = document.getElementById('sg-guardian-name');
    var metaEl = document.getElementById('sg-guardian-meta');
    var virtueEl = document.getElementById('sg-guardian-virtue');
    if (nameEl) nameEl.textContent = guardian.name;
    if (virtueEl) virtueEl.textContent = guardian.virtue + ' · ' + (data.persona || 'The Seeker');
    if (metaEl) {
      metaEl.textContent = guardian.cn + ' · ' + (data.element || 'Earth') + ' · 2026 ' + (data.theme2026 || 'Expansion');
    }
  }

  function track(event, props) {
    if (global.plausible) global.plausible(event, props ? { props: props } : undefined);
    if (global.gtag) global.gtag('event', event, props || {});
  }

  function render(data) {
    state.starKey = data.starKey || data.starCn || '__empty__';
    if (!SOUL_GUARDIANS[state.starKey]) state.starKey = '__empty__';
    state.persona = data.persona || 'The Seeker';
    state.element = data.element || 'Earth';
    state.theme2026 = data.theme2026 || 'Expansion';
    state.strength = data.strength || 'Wisdom';
    state.lifeBranch = data.lifeBranch || '—';
    state.tagline = data.tagline || '';
    state.birthYear = parseBirthYear(data.birthDate);
    state.hourLabel = data.hourLabel || '';

    var section = document.getElementById('soul-guardian-section');
    if (section) section.style.display = 'block';

    var guardian = guardianFor(state.starKey);
    updateDomLabels(guardian, state);

    var canvas = document.getElementById('soulGuardianCanvas');
    drawSoulGuardianCanvas(canvas, {
      starKey: state.starKey,
      persona: state.persona,
      element: state.element,
      theme2026: state.theme2026,
      strength: state.strength,
      lifeBranch: state.lifeBranch,
      tagline: state.tagline,
      birthYear: state.birthYear
    });

    track('soul_guardian_view', { star: state.starKey, guardian: guardian.name });
  }

  function getCanvas() {
    return document.getElementById('soulGuardianCanvas');
  }

  function downloadGuardian() {
    var canvas = getCanvas();
    if (!canvas) return;
    var guardian = guardianFor(state.starKey);
    var link = document.createElement('a');
    link.download = 'soul-guardian-' + guardian.name.toLowerCase().replace(/\s+/g, '-') + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    track('soul_guardian_download', { guardian: guardian.name });
    flashBtn('sg-download-btn', '✓ Saved');
  }

  function shareGuardianTwitter() {
    var guardian = guardianFor(state.starKey);
    var text =
      'My Zi Wei Soul Guardian is the ' + guardian.name + ' — I am ' + state.persona + '. ' +
      'Discover yours free:';
    var url = 'https://metaphysicflow.com/free-chart.html?ref=soul_guardian&from=' + encodeURIComponent(state.persona);
    window.open(
      'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url) +
        '&hashtags=SoulGuardian,ZiWeiDouShu',
      '_blank',
      'width=600,height=420'
    );
    track('soul_guardian_share', { platform: 'twitter', guardian: guardian.name });
  }

  function copyGuardianImage() {
    var canvas = getCanvas();
    if (!canvas) return;

    function onSuccess() {
      flashBtn('sg-copy-image-btn', '✓ Image Copied');
      track('soul_guardian_share', { platform: 'clipboard', guardian: guardianFor(state.starKey).name });
    }

    if (navigator.clipboard && window.ClipboardItem && canvas.toBlob) {
      canvas.toBlob(function (blob) {
        if (!blob) return;
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          .then(onSuccess)
          .catch(function () { downloadGuardian(); });
      }, 'image/png');
    } else {
      downloadGuardian();
    }
  }

  function flashBtn(id, label) {
    var btn = document.getElementById(id);
    if (!btn) return;
    var original = btn.innerHTML;
    btn.textContent = label;
    btn.style.borderColor = 'rgba(109,184,122,0.5)';
    btn.style.color = '#6DB87A';
    setTimeout(function () {
      btn.innerHTML = original;
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 2500);
  }

  global.SoulGuardian = {
    render: render,
    download: downloadGuardian,
    shareTwitter: shareGuardianTwitter,
    copyImage: copyGuardianImage,
    GUARDIANS: SOUL_GUARDIANS
  };

  global.downloadSoulGuardian = downloadGuardian;
  global.shareSoulGuardianTwitter = shareGuardianTwitter;
  global.copySoulGuardianImage = copyGuardianImage;
})(window);
