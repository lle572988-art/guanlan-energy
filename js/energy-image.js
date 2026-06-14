/**
 * Five-element AI energy image — calls /api/generate-image after chart is ready.
 */
(function (global) {
  'use strict';

  var BUREAU_TO_KEY = { '金': 'metal', '木': 'wood', '水': 'water', '火': 'fire', '土': 'earth' };

  function bureauToElementKey(bureau) {
    var m = String(bureau || '').match(/([金木水火土])/);
    return m && BUREAU_TO_KEY[m[1]] ? BUREAU_TO_KEY[m[1]] : 'earth';
  }

  function track(event, props) {
    if (global.plausible) global.plausible(event, props ? { props: props } : undefined);
    if (global.gtag) global.gtag('event', event, props || {});
  }

  function bindChartEnergyImage(opts) {
    var section = document.getElementById('energy-image-section');
    var btn = document.getElementById('gen-energy-img');
    var wrap = document.getElementById('energy-img-wrap');
    var labelEl = document.getElementById('energy-img-element-label');
    if (!section || !btn || !wrap) return;

    var elementKey = opts.elementKey || bureauToElementKey(opts.bureau);
    var elementLabel = opts.elementLabel || elementKey;
    global.userDominantElement = elementKey;

    if (labelEl) {
      labelEl.textContent = elementLabel + ' · ' + elementKey.charAt(0).toUpperCase() + elementKey.slice(1);
    }
    section.style.display = 'block';
    wrap.innerHTML =
      '<p class="energy-img-placeholder">👇 Click the button above — your unique AI mandala will appear here in ~10 seconds.</p>';

    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';

    btn.addEventListener('click', async function () {
      var element = global.userDominantElement || elementKey;
      btn.disabled = true;
      btn.textContent = 'Generating… (~10s)';
      wrap.innerHTML = '<p class="energy-img-loading">Channeling your element energy…</p>';
      track('energy_image_start', { element: element });

      try {
        var res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ element: element }),
        });
        var data = await res.json();

        if (!res.ok || !data.url) {
          var msg = data.error || 'Generation failed. Try again later.';
          if (res.status === 429) msg = 'Daily limit reached — try again tomorrow.';
          wrap.innerHTML = '<p class="energy-img-error">' + msg + '</p>';
          track('energy_image_fail', { element: element, status: res.status });
          return;
        }

        wrap.innerHTML =
          '<img src="' + data.url + '" alt="Your ' + element + ' element energy mandala" ' +
          'class="energy-img-result" width="512" height="512" loading="lazy">' +
          '<div class="energy-img-actions">' +
          '<a class="sg-btn sg-btn--primary" href="' + data.url + '" download="guanlan-energy-' + element + '.png">⬇ Save Image</a>' +
          '</div>';
        track('energy_image_success', { element: element });
      } catch (e) {
        wrap.innerHTML = '<p class="energy-img-error">Generation failed. Try again later.</p>';
        track('energy_image_fail', { element: element, status: 'network' });
      } finally {
        btn.disabled = false;
        btn.textContent = 'Generate My Element Energy Art';
      }
    });
  }

  global.EnergyImage = {
    bind: bindChartEnergyImage,
    bureauToElementKey: bureauToElementKey,
  };
})(window);
