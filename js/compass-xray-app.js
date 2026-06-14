/**
 * Energy X-Ray — upload + facing + flying star overlay + AI cure preview.
 */
(function (global) {
  'use strict';

  var state = {
    image: null,
    imageUrl: '',
    imageDataUrl: '',
    cureDataUrl: '',
    facing: 'S',
    year: 2026,
    chart: null,
    cureUrl: '',
    cureLoading: false,
    room: 'living room',
  };

  function track(event, props) {
    if (global.plausible) global.plausible(event, props ? { props: props } : undefined);
    if (global.gtag) global.gtag('event', event, props || {});
  }

  function el(id) { return document.getElementById(id); }

  function resizeToDataUrl(img, maxDim) {
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
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    return c.toDataURL('image/jpeg', 0.85);
  }

  function facingCureMeta() {
    if (!state.chart || !global.XuanKong) return { element: 'metal', hint: 'Add calm metal accents in the facing sector.', star: null };
    var star = state.chart.chart[state.facing];
    var cure = global.XuanKong.STAR_CURE && global.XuanKong.STAR_CURE[star];
    if (cure) return { element: cure.element, hint: cure.hint, star: star };
    var info = global.XuanKong.STAR_INFO[star];
    return {
      element: 'metal',
      hint: info ? info.label : 'Add balanced decor in the facing sector.',
      star: star,
    };
  }

  function drawOverlay() {
    var canvas = el('xrayCanvas');
    var wrap = el('xrayCanvasWrap');
    if (!canvas || !wrap) return;

    var ctx = canvas.getContext('2d');
    var w = wrap.clientWidth || wrap.offsetWidth;
    if (!w) w = Math.min(640, (global.innerWidth || 360) - 48);
    var h = Math.round(w * 0.75);
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    if (state.image) {
      ctx.drawImage(state.image, 0, 0, w, h);
      ctx.fillStyle = 'rgba(31,42,38,0.08)';
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#E3E0D7';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(31,42,38,0.35)';
      ctx.font = '15px Hanken Grotesk, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload a room or floor plan photo', w / 2, h / 2);
    }

    if (!state.chart || !global.XuanKong) return;

    var cells = state.chart.cells;
    var cols = 3, rows = 3;
    var pad = 12;
    var gw = w - pad * 2;
    var gh = h - pad * 2;
    var cw = gw / cols;
    var ch = gh / rows;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cell = cells[r][c];
        var x = pad + c * cw;
        var y = pad + r * ch;
        ctx.fillStyle = cell.color;
        ctx.globalAlpha = state.image ? 0.72 : 0.88;
        ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(234,227,223,0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, cw - 4, ch - 4);

        var isFace = cell.direction === state.facing;
        if (isFace) {
          ctx.strokeStyle = '#A88A52';
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 1, y + 1, cw - 2, ch - 2);
        }

        ctx.fillStyle = cell.textColor;
        ctx.textAlign = 'center';
        ctx.font = '600 22px IBM Plex Mono, monospace';
        ctx.fillText(String(cell.star), x + cw / 2, y + ch / 2 - 6);
        ctx.font = '500 10px IBM Plex Mono, monospace';
        ctx.fillText(cell.direction === 'center' ? 'CTR' : cell.direction, x + cw / 2, y + ch / 2 + 14);
      }
    }

    ctx.fillStyle = 'rgba(31,42,38,0.75)';
    ctx.font = '11px IBM Plex Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('N ↑', pad + 4, pad + 14);
    ctx.textAlign = 'right';
    ctx.fillText('Facing: ' + state.facing, w - pad - 4, h - pad - 6);
  }

  function updateCurePanel() {
    var panel = el('xrayCure');
    if (!panel) return;

    var show = state.chart && state.image;
    panel.hidden = !show;
    if (!show) return;

    var meta = facingCureMeta();
    var hint = el('xrayCureHint');
    if (hint) {
      var dirLabel = global.XuanKong.DIR_LABEL[state.facing] || state.facing;
      hint.textContent = 'Facing sector (' + dirLabel + ', star ' + meta.star + '): ' + meta.hint;
    }

    var before = el('xrayCureBefore');
    if (before && state.imageDataUrl) before.src = state.imageDataUrl;

    var compare = el('xrayCureCompare');
    if (compare) compare.hidden = !state.cureUrl;

    var after = el('xrayCureAfter');
    if (after && state.cureUrl) after.src = state.cureUrl;
  }

  function setUploadStatus(msg, isError) {
    var preview = el('xrayUploadPreview');
    if (!preview) return;
    preview.textContent = msg || '';
    preview.hidden = !msg;
    preview.style.color = isError ? '#9a4b3b' : 'var(--ink-faint)';
  }

  function isImageFile(file) {
    if (!file) return false;
    if (file.type && file.type.match(/^image\//)) return true;
    return /\.(heic|heif|jpg|jpeg|png|webp|gif|bmp)$/i.test(file.name || '');
  }

  function setCureStatus(msg, isError) {
    var node = el('xrayCureStatus');
    if (!node) return;
    node.textContent = isError ? userSafeError(msg) : (msg || '');
    node.style.color = isError ? '#9a4b3b' : 'var(--ink-faint)';
  }

  function renderInsights() {
    if (!state.chart || !global.XuanKong) return;
    var ins = global.XuanKong.insightsForFacing(state.chart, state.facing);
    var headline = el('xrayHeadline');
    var list = el('xrayInsightList');
    var lock = el('xrayLock');

    if (headline) headline.textContent = ins.headline;

    if (list) {
      var html = '';
      ins.highlights.forEach(function (h) {
        html += '<li class="xray-insight xray-insight--good"><strong>' + h.dirLabel + ' · ' + h.star + '</strong> ' + h.label + '</li>';
      });
      ins.cautions.forEach(function (c) {
        html += '<li class="xray-insight xray-insight--caution"><strong>' + c.dirLabel + ' · ' + c.star + '</strong> ' + c.label + '</li>';
      });
      list.innerHTML = html;
    }

    if (lock) lock.hidden = false;
    updateCurePanel();

    if (global.CompassIntake) {
      global.CompassIntake.save({
        facing: state.facing,
        year: state.year,
        hasImage: !!state.image,
        room: state.room,
      });
    }
  }

  function runScan() {
    if (!global.XuanKong) return;
    state.facing = (el('xrayFacing') && el('xrayFacing').value) || 'S';
    state.year = parseInt((el('xrayYear') && el('xrayYear').value) || '2026', 10);
    state.chart = global.XuanKong.buildAnnualChart(state.year);
    state.cureUrl = '';

    drawOverlay();
    renderInsights();

    var results = el('xrayResults');
    if (results) {
      results.hidden = false;
      results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    track('compass_xray_scan', { facing: state.facing, year: state.year, has_image: !!state.image });
  }

  function userSafeError(msg, apiError) {
    if (apiError) return apiError;
    if (!msg) return 'Could not generate preview. Try again in a moment.';
    if (/DOCTYPE|Unexpected token|SyntaxError|is not valid JSON/i.test(msg)) {
      return 'Preview service is busy — try a smaller photo or wait a minute. Your flying star map above is still complete.';
    }
    return msg;
  }

  function readApiJson(res) {
    return res.text().then(function (text) {
      if (!text) return {};
      try {
        return JSON.parse(text);
      } catch (e) {
        var err = new Error(userSafeError('', res.status >= 500 ? 'Preview service is busy — wait a minute and try again.' : ''));
        err.httpStatus = res.status;
        throw err;
      }
    });
  }

  async function generateCure() {
    if (!state.image || !state.cureDataUrl || state.cureLoading) return;

    var meta = facingCureMeta();
    var roomSel = el('xrayRoom');
    state.room = (roomSel && roomSel.value) || 'living room';

    var btn = el('xrayCureBtn');
    state.cureLoading = true;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Generating… ~60–90s';
    }
    setCureStatus('Staging your room with ' + meta.element + ' cures…');

    try {
      var res = await fetch('/api/compass-cure-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: state.cureDataUrl,
          element: meta.element,
          room: state.room,
          star: meta.star,
        }),
      });
      var data = await readApiJson(res);
      if (!res.ok) {
        var msg = data.error || 'Generation failed';
        if (res.status === 503) msg = 'AI cure preview is warming up — your flying star map above is still complete.';
        throw new Error(msg);
      }

      state.cureUrl = data.url;
      updateCurePanel();
      setCureStatus('Preview ready — illustrative staging, not a renovation plan.');

      if (global.CompassIntake) {
        global.CompassIntake.save({
          facing: state.facing,
          year: state.year,
          room: state.room,
          cureUrl: state.cureUrl,
          cureElement: meta.element,
        });
      }
      track('compass_cure_generated', { element: meta.element, star: meta.star, room: state.room });
    } catch (err) {
      setCureStatus(userSafeError(err.message), true);
      track('compass_cure_error', { message: err.message });
    } finally {
      state.cureLoading = false;
      if (btn) {
        btn.disabled = false;
        btn.textContent = state.cureUrl ? 'Regenerate cure preview' : 'Generate cure preview';
      }
    }
  }

  function downloadPreview() {
    if (!state.chart || !global.CompassReport || !global.XuanKong) return;
    var intake = (global.CompassIntake && global.CompassIntake.load()) || {
      facing: state.facing,
      year: state.year,
    };
    var data = global.CompassReport.buildReportData(intake, state.chart, global.XuanKong.insightsForFacing(state.chart, state.facing));
    global.CompassReport.openPrintable(data, 'preview');
    track('compass_xray_preview_pdf', { year: state.year });
  }

  function bindUpload() {
    var zone = el('xrayUpload');
    var input = el('xrayFile');
    if (!zone || !input) return;

    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('drag'); });
    zone.addEventListener('dragleave', function () { zone.classList.remove('drag'); });
    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      zone.classList.remove('drag');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) loadFile(input.files[0]);
    });
  }

  function isHeicFile(file) {
    return /\.(heic|heif)$/i.test(file.name || '') || /heic|heif/i.test(file.type || '');
  }

  function fileToDisplayableBlob(file) {
    if (!isHeicFile(file)) return Promise.resolve(file);
    if (!global.heic2any) {
      return Promise.reject(new Error(
        'HEIC photo detected — on iPhone: Settings → Camera → Formats → Most Compatible, or export as JPG.'
      ));
    }
    return global.heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 }).then(function (result) {
      return result instanceof Blob ? result : result[0];
    }).catch(function () {
      return Promise.reject(new Error('Could not open HEIC — save as JPG and upload again.'));
    });
  }

  function blobToImage(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('Could not read this file — try another photo.')); };
      reader.onload = function (e) {
        var img = new Image();
        img.onerror = function () {
          reject(new Error('This image format is not supported — try JPG or PNG.'));
        };
        img.onload = function () { resolve(img); };
        img.src = e.target.result;
      };
      reader.readAsDataURL(blob);
    });
  }

  function loadFile(file) {
    if (!isImageFile(file)) {
      setUploadStatus('Please upload a JPG, PNG, or HEIC photo.', true);
      return;
    }
    setUploadStatus(isHeicFile(file) ? 'Converting HEIC…' : 'Loading photo…', false);
    track('compass_xray_upload');
    fileToDisplayableBlob(file)
      .then(blobToImage)
      .then(function (img) {
        state.image = img;
        state.imageDataUrl = resizeToDataUrl(img, 1280);
        state.cureDataUrl = resizeToDataUrl(img, 512);
        state.imageUrl = state.imageDataUrl;
        state.cureUrl = '';
        setUploadStatus(file.name + ' — mapping flying stars…', false);
        drawOverlay();
        runScan();
      })
      .catch(function (err) {
        setUploadStatus(err.message || 'Could not read this file — try another photo.', true);
      });
  }

  function applyIntake() {
    var intake = global.CompassIntake && global.CompassIntake.load();
    if (!intake) return;
    if (intake.facing && el('xrayFacing')) el('xrayFacing').value = intake.facing;
    if (intake.year && el('xrayYear')) el('xrayYear').value = String(intake.year);
    if (intake.room && el('xrayRoom')) el('xrayRoom').value = intake.room;
    if (intake.cureUrl) state.cureUrl = intake.cureUrl;
    state.facing = intake.facing || state.facing;
    state.year = intake.year || state.year;
    state.room = intake.room || state.room;
  }

  function init() {
    applyIntake();
    bindUpload();
    drawOverlay();

    var btn = el('xrayScanBtn');
    if (btn) btn.addEventListener('click', runScan);

    var previewBtn = el('xrayPreviewBtn');
    if (previewBtn) previewBtn.addEventListener('click', downloadPreview);

    var cureBtn = el('xrayCureBtn');
    if (cureBtn) cureBtn.addEventListener('click', generateCure);

    window.addEventListener('resize', function () {
      if (state.chart || state.image) drawOverlay();
    });

    var wrap = el('xrayCanvasWrap');
    if (wrap && global.ResizeObserver) {
      new global.ResizeObserver(function () {
        if (state.chart || state.image) drawOverlay();
      }).observe(wrap);
    }

    requestAnimationFrame(function () { drawOverlay(); });

    track('compass_xray_landing');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.CompassXRay = {
    runScan: runScan,
    generateCure: generateCure,
    getState: function () { return state; },
    downloadPreview: downloadPreview,
  };
})(window);
