/**
 * Gumroad overlay checkout → auto thank-you redirect (no Gumroad dashboard config).
 * Top escape bar lets buyers close checkout and stay on site.
 */
(function() {
  var PERMALINK_TO_PRODUCT = {
    acvsfx: 'life-palace-dive',
    lfoxf: 'three-palace-snapshot',
    tiuyjr: 'full-chart',
    lozmm: 'live-reading',
    compassrm: 'compass-room',
    compasshm: 'compass-home',
    compassyr: 'compass-home-year',
    compassann: 'compass-annual'
  };

  var PRODUCT_USD = {
    'life-palace-dive': 9.9,
    'three-palace-snapshot': 19,
    'full-chart': 39,
    'live-reading': 99,
    'compass-room': 19,
    'compass-home': 39,
    'compass-home-year': 49,
    'compass-annual': 79
  };

  var THANK_YOU = 'https://metaphysicflow.com/thank-you.html';
  var STORAGE_KEY = 'guanlan_birth';

  var HOUR_OPTIONS = [
    '子時 · Zi (23:00–01:00)', '丑時 · Chou (01:00–03:00)', '寅時 · Yin (03:00–05:00)',
    '卯時 · Mao (05:00–07:00)', '辰時 · Chen (07:00–09:00)', '巳時 · Si (09:00–11:00)',
    '午時 · Wu (11:00–13:00)', '未時 · Wei (13:00–15:00)', '申時 · Shen (15:00–17:00)',
    '酉時 · You (17:00–19:00)', '戌時 · Xu (19:00–21:00)', '亥時 · Hai (21:00–23:00)'
  ];

  function readStoredBirth() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveBirth(data) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  function getBirthPrefill() {
    var stored = readStoredBirth();
    if (stored && stored.dob && stored.hourLabel) return stored;

    var p = new URLSearchParams(window.location.search);
    var rawDate = p.get('dob') || p.get('date') || '';
    var hourLabel = p.get('hourLabel') || '';
    var country = p.get('country') || '';
    if (!hourLabel && p.get('hour') !== null && p.get('hour') !== '') {
      var hi = parseInt(p.get('hour'), 10);
      if (!isNaN(hi) && HOUR_OPTIONS[hi]) hourLabel = HOUR_OPTIONS[hi];
    }
    var dob = rawDate.replace(/\//g, '-');
    var mainStar = '';
    if (window.__chartData) {
      mainStar = window.__chartData.lifeStarEn || window.__chartData.persona || '';
    }
    if (dob && hourLabel) {
      var data = { dob: dob, hourLabel: hourLabel, country: country, mainStar: mainStar };
      saveBirth(data);
      return data;
    }
    return stored || { dob: '', hourLabel: '', country: '', mainStar: mainStar };
  }

  function hasBirth(data) {
    return !!(data && data.dob && data.hourLabel);
  }

  function isCompassProduct(product) {
    return product && product.indexOf('compass') === 0;
  }

  function hasCompassIntake() {
    if (!window.CompassIntake) return false;
    var ci = window.CompassIntake.load();
    return ci && ci.dob && ci.gender;
  }

  function appendGuanlanParams(href, birth, product) {
    if (isCompassProduct(product) && window.CompassIntake) {
      return window.CompassIntake.appendCompassParams(href);
    }
    if (!hasBirth(birth)) return href;
    var sep = href.indexOf('?') === -1 ? '?' : '&';
    var out = href + sep +
      'guanlan_dob=' + encodeURIComponent(birth.dob) +
      '&guanlan_hour=' + encodeURIComponent(birth.hourLabel);
    if (birth.country) out += '&guanlan_country=' + encodeURIComponent(birth.country);
    if (birth.mainStar) out += '&guanlan_main_star=' + encodeURIComponent(birth.mainStar);
    if (window.CompassIntake && window.CompassIntake.appendCompassParams) {
      out = window.CompassIntake.appendCompassParams(out);
    }
    return out;
  }

  function productFromHref(href) {
    var m = (href || '').match(/\/l\/([^/?]+)/);
    return m ? PERMALINK_TO_PRODUCT[m[1]] : null;
  }

  function redirectAfterSale(data) {
    hideEscapeBar();
    var productKey = null;
    try {
      if (data.product && data.product.short_url) {
        productKey = PERMALINK_TO_PRODUCT[data.product.short_url.split('/').pop()];
      }
      if (!productKey && data.product && data.product.permalink) {
        productKey = PERMALINK_TO_PRODUCT[data.product.permalink];
      }
    } catch (e) { /* ignore */ }

    var url = THANK_YOU + (productKey ? '?product=' + encodeURIComponent(productKey) : '');
    if (window.gtag) gtag('event', 'purchase', { item_name: productKey || 'gumroad', item_category: 'ziwei_reading' });
    if (window.trackPlausible) {
      var saleValue = PRODUCT_USD[productKey] || 0;
      trackPlausible('Purchase-Success', {
        revenue: { currency: 'USD', amount: saleValue },
        props: { product: productKey || 'unknown', channel: 'gumroad_overlay' },
      });
      trackPlausible('purchase_complete', { props: { product: productKey || 'unknown', channel: 'gumroad_overlay' } });
    } else if (window.plausible) {
      var saleValueFallback = PRODUCT_USD[productKey] || 0;
      plausible('Purchase-Success', { revenue: { currency: 'USD', amount: saleValueFallback }, props: { product: productKey || 'unknown', channel: 'gumroad_overlay' } });
      plausible('purchase_complete', { props: { product: productKey || 'unknown', channel: 'gumroad_overlay' } });
    }
    window.location.replace(url);
  }

  window.addEventListener('message', function(ev) {
    if (!ev.data || typeof ev.data !== 'string') return;
    try {
      var data = JSON.parse(ev.data);
      if (data.post_message_name === 'sale') redirectAfterSale(data);
    } catch (e) { /* not gumroad */ }
  });

  function closeGumroadOverlay() {
    document.querySelectorAll('iframe[src*="gumroad"]').forEach(function(el) {
      var p = el.parentElement;
      el.remove();
      if (p && p.className && String(p.className).indexOf('gumroad') !== -1) p.remove();
    });
    document.querySelectorAll('[class*="gumroad"]').forEach(function(el) {
      if (el.id === 'guanlan-checkout-escape') return;
      if (el.tagName === 'IFRAME' || /overlay|modal|popup/i.test(String(el.className))) {
        el.remove();
      }
    });
    document.body.style.overflow = '';
    hideEscapeBar();
  }

  function ensureEscapeBar() {
    if (document.getElementById('guanlan-checkout-escape')) return;

    var style = document.createElement('style');
    style.textContent =
      '#guanlan-checkout-escape{position:fixed;top:0;left:0;right:0;z-index:2147483646;display:none;' +
      'background:#161b26;border-bottom:1px solid rgba(201,168,76,.45);padding:.7rem 1rem;' +
      'font-family:-apple-system,BlinkMacSystemFont,sans-serif;text-align:center}' +
      '#guanlan-checkout-escape.show{display:block}' +
      '#guanlan-checkout-escape p{margin:0;font-size:.82rem;color:rgba(240,235,224,.85);line-height:1.45}' +
      '#guanlan-checkout-escape button{margin-top:.45rem;background:transparent;border:1px solid rgba(201,168,76,.5);' +
      'color:#e8cc88;padding:.45rem .9rem;font-size:.72rem;letter-spacing:.06em;cursor:pointer}';
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.id = 'guanlan-checkout-escape';
    bar.innerHTML =
      '<p>Secure checkout open — tap <strong>✕</strong> on the popup to cancel, or:</p>' +
      '<button type="button" id="guanlan-checkout-escape-btn">← Stay on site (close checkout)</button>';
    document.body.appendChild(bar);
    document.getElementById('guanlan-checkout-escape-btn').addEventListener('click', closeGumroadOverlay);
  }

  function showEscapeBar() {
    ensureEscapeBar();
    document.getElementById('guanlan-checkout-escape').classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function hideEscapeBar() {
    var bar = document.getElementById('guanlan-checkout-escape');
    if (bar) bar.classList.remove('show');
    document.body.style.overflow = '';
  }

  function trackCheckoutClick(product, section) {
    var props = {
      item_name: product,
      item_category: 'ziwei_reading',
      source_section: section,
      checkout_channel: 'gumroad_overlay'
    };
    if (window.trackEvent) {
      window.trackEvent('checkout_click', props);
      return;
    }
    if (window.gtag) {
      gtag('event', 'begin_checkout', props);
    }
    if (window.trackPlausible) {
      trackPlausible('Click-Buy-Report', { props: { product: product, value: PRODUCT_USD[product] || 0 } });
      trackPlausible('purchase_click', { props: { product: product, channel: 'gumroad_overlay' } });
    } else if (window.plausible) {
      plausible('Click-Buy-Report', { props: { product: product, value: PRODUCT_USD[product] || 0 } });
      plausible('purchase_click', { props: { product: product, channel: 'gumroad_overlay' } });
    }
  }

  function ensureModal() {
    if (document.getElementById('guanlan-birth-modal')) return;

    var style = document.createElement('style');
    style.textContent =
      '#guanlan-birth-modal{position:fixed;inset:0;z-index:2147483647;background:rgba(3,7,15,.88);display:none;align-items:center;justify-content:center;padding:1rem}' +
      '#guanlan-birth-modal.open{display:flex}' +
      '#guanlan-birth-modal .panel{max-width:420px;width:100%;background:#0c1628;border:1px solid rgba(201,168,76,.35);padding:1.75rem;color:#f0ebe0;font-family:Georgia,serif}' +
      '#guanlan-birth-modal h3{margin:0 0 .5rem;font-weight:400;color:#e8d4a0;font-size:1.35rem}' +
      '#guanlan-birth-modal p{margin:0 0 1rem;font-size:.9rem;color:rgba(240,235,224,.65);line-height:1.5}' +
      '#guanlan-birth-modal label{display:block;font-size:.75rem;letter-spacing:.08em;color:#c9a84c;margin:.75rem 0 .35rem;text-transform:uppercase;font-family:sans-serif}' +
      '#guanlan-birth-modal input,#guanlan-birth-modal select{width:100%;box-sizing:border-box;background:#06100c;border:1px solid rgba(74,102,128,.45);color:#f0ebe0;padding:.65rem .75rem;font-size:.95rem}' +
      '#guanlan-birth-modal .actions{display:flex;gap:.5rem;margin-top:1.25rem;flex-wrap:wrap}' +
      '#guanlan-birth-modal .btn-gold{flex:1;min-width:140px;background:#c9a84c;color:#06100c;border:none;padding:.75rem 1rem;font-family:sans-serif;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}' +
      '#guanlan-birth-modal .btn-ghost{background:transparent;border:1px solid rgba(74,102,128,.5);color:rgba(240,235,224,.6);padding:.75rem 1rem;cursor:pointer;font-size:.75rem}';
    document.head.appendChild(style);

    var wrap = document.createElement('div');
    wrap.id = 'guanlan-birth-modal';
    wrap.innerHTML =
      '<div class="panel" role="dialog" aria-labelledby="guanlan-birth-title">' +
        '<h3 id="guanlan-birth-title">Birth details for your reading</h3>' +
        '<p>Quick step before checkout — then pay in the popup. Close it anytime to stay here.</p>' +
        '<label for="guanlan-birth-dob">Date of birth</label>' +
        '<input id="guanlan-birth-dob" type="date" required />' +
        '<label for="guanlan-birth-hour">Birth hour (Chinese double-hour)</label>' +
        '<select id="guanlan-birth-hour" required>' +
          HOUR_OPTIONS.map(function(h) { return '<option value="' + h + '">' + h + '</option>'; }).join('') +
        '</select>' +
        '<label for="guanlan-birth-country">Birth city / country (optional)</label>' +
        '<input id="guanlan-birth-country" type="text" placeholder="e.g. San Francisco, USA" />' +
        '<div class="actions">' +
          '<button type="button" class="btn-gold" id="guanlan-birth-submit">Continue to checkout</button>' +
          '<button type="button" class="btn-ghost" id="guanlan-birth-cancel">Cancel</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    document.getElementById('guanlan-birth-cancel').addEventListener('click', function() {
      wrap.classList.remove('open');
    });
  }

  function showBirthModal(onReady) {
    ensureModal();
    var modal = document.getElementById('guanlan-birth-modal');
    var existing = getBirthPrefill();
    var dobEl = document.getElementById('guanlan-birth-dob');
    var hourEl = document.getElementById('guanlan-birth-hour');
    var countryEl = document.getElementById('guanlan-birth-country');
    if (existing.dob) dobEl.value = existing.dob;
    if (existing.hourLabel) hourEl.value = existing.hourLabel;
    if (existing.country) countryEl.value = existing.country;
    modal.classList.add('open');

    var submit = document.getElementById('guanlan-birth-submit');
    var handler = function() {
      if (!dobEl.value) { dobEl.focus(); return; }
      saveBirth({
        dob: dobEl.value,
        hourLabel: hourEl.value,
        country: (countryEl.value || '').trim(),
        mainStar: (existing && existing.mainStar) || (window.__chartData && window.__chartData.lifeStarEn) || ''
      });
      modal.classList.remove('open');
      submit.removeEventListener('click', handler);
      onReady();
    };
    submit.addEventListener('click', handler);
  }

  function ensureCompassModal() {
    if (document.getElementById('guanlan-compass-modal')) return;

    var style = document.createElement('style');
    style.textContent =
      '#guanlan-compass-modal{position:fixed;inset:0;z-index:2147483647;background:rgba(31,42,38,.88);display:none;align-items:center;justify-content:center;padding:1rem}' +
      '#guanlan-compass-modal.open{display:flex}' +
      '#guanlan-compass-modal .panel{max-width:420px;width:100%;background:#EAE7DF;border:1px solid rgba(122,155,142,.35);padding:1.75rem;color:#1F2A26;font-family:Georgia,serif}' +
      '#guanlan-compass-modal h3{margin:0 0 .5rem;font-weight:400;color:#1F2A26;font-size:1.35rem}' +
      '#guanlan-compass-modal p{margin:0 0 1rem;font-size:.9rem;color:#6B7873;line-height:1.5}' +
      '#guanlan-compass-modal label{display:block;font-size:.75rem;letter-spacing:.08em;color:#7A9B8E;margin:.75rem 0 .35rem;text-transform:uppercase;font-family:sans-serif}' +
      '#guanlan-compass-modal input,#guanlan-compass-modal select{width:100%;box-sizing:border-box;background:#FBF7EE;border:1px solid rgba(31,42,38,.15);color:#1F2A26;padding:.65rem .75rem;font-size:.95rem}' +
      '#guanlan-compass-modal .actions{display:flex;gap:.5rem;margin-top:1.25rem;flex-wrap:wrap}' +
      '#guanlan-compass-modal .btn-gold{flex:1;min-width:140px;background:#1F2A26;color:#EAE7DF;border:none;padding:.75rem 1rem;font-family:sans-serif;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}' +
      '#guanlan-compass-modal .btn-ghost{background:transparent;border:1px solid rgba(31,42,38,.25);color:#6B7873;padding:.75rem 1rem;cursor:pointer;font-size:.75rem}';
    document.head.appendChild(style);

    var wrap = document.createElement('div');
    wrap.id = 'guanlan-compass-modal';
    wrap.innerHTML =
      '<div class="panel" role="dialog" aria-labelledby="guanlan-compass-title">' +
        '<h3 id="guanlan-compass-title">Home details for your X-Ray</h3>' +
        '<p>Birth date and gender resolve your Kua directions. Facing tells us which sector is at your front door.</p>' +
        '<label for="guanlan-compass-dob">Date of birth</label>' +
        '<input id="guanlan-compass-dob" type="date" required />' +
        '<label for="guanlan-compass-gender">Gender (for Kua)</label>' +
        '<select id="guanlan-compass-gender" required>' +
          '<option value="female">Woman</option><option value="male">Man</option>' +
        '</select>' +
        '<label for="guanlan-compass-facing">Home faces (front door outward)</label>' +
        '<select id="guanlan-compass-facing">' +
          '<option value="N">North</option><option value="NE">Northeast</option><option value="E">East</option>' +
          '<option value="SE">Southeast</option><option value="S" selected>South</option><option value="SW">Southwest</option>' +
          '<option value="W">West</option><option value="NW">Northwest</option>' +
        '</select>' +
        '<div class="actions">' +
          '<button type="button" class="btn-gold" id="guanlan-compass-submit">Continue to checkout</button>' +
          '<button type="button" class="btn-ghost" id="guanlan-compass-cancel">Cancel</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    document.getElementById('guanlan-compass-cancel').addEventListener('click', function() {
      wrap.classList.remove('open');
    });
  }

  function showCompassModal(onReady) {
    ensureCompassModal();
    var modal = document.getElementById('guanlan-compass-modal');
    var existing = window.CompassIntake ? window.CompassIntake.load() : null;
    var dobEl = document.getElementById('guanlan-compass-dob');
    var genderEl = document.getElementById('guanlan-compass-gender');
    var facingEl = document.getElementById('guanlan-compass-facing');
    if (existing) {
      if (existing.dob) dobEl.value = existing.dob;
      if (existing.gender) genderEl.value = existing.gender;
      if (existing.facing) facingEl.value = existing.facing;
    }
    modal.classList.add('open');

    var submit = document.getElementById('guanlan-compass-submit');
    var handler = function() {
      if (!dobEl.value) { dobEl.focus(); return; }
      window.CompassIntake.save({
        dob: dobEl.value,
        gender: genderEl.value,
        facing: facingEl.value,
        year: existing && existing.year || 2026,
      });
      modal.classList.remove('open');
      submit.removeEventListener('click', handler);
      onReady();
    };
    submit.addEventListener('click', handler);
  }

  function ensureCheckoutIntake(product, onReady) {
    if (isCompassProduct(product)) {
      if (!hasCompassIntake()) {
        showCompassModal(onReady);
        return;
      }
      onReady();
      return;
    }
    if (!hasBirth(getBirthPrefill())) {
      showBirthModal(onReady);
      return;
    }
    onReady();
  }

  function buildCheckoutUrl(baseHref, birth, product, section) {
    var href = baseHref || '';
    href = appendGuanlanParams(href, birth, product);
    if (href.indexOf('utm_source=') === -1) {
      var sep = href.indexOf('?') === -1 ? '?' : '&';
      href += sep + 'utm_source=site&utm_medium=cta&utm_campaign=pricing&utm_content=' +
        encodeURIComponent(section + '_' + product) + '&utm_term=gumroad';
    }
    return href;
  }

  function openOverlayCheckout(url) {
    function launch() {
      showEscapeBar();
      var a = document.createElement('a');
      a.href = url;
      a.setAttribute('data-gumroad-overlay-checkout', 'true');
      a.setAttribute('data-gumroad-single-product', 'true');
      a.style.position = 'fixed';
      a.style.left = '-9999px';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    if (window.__loadGumroadScript) {
      window.__loadGumroadScript(launch);
      return;
    }
    launch();
  }

    window.GuanlanGumroad = {
    openCheckout: function(url, product, section) {
      section = section || 'checkout';
      product = product || 'gumroad';
      function launch() {
        var finalUrl = buildCheckoutUrl(url, getBirthPrefill(), product, section);
        trackCheckoutClick(product, section);
        openOverlayCheckout(finalUrl);
      }
      ensureCheckoutIntake(product, launch);
    },
    ensureIntake: ensureCheckoutIntake
  };

  function attachPricingLink(link, product, section, birth) {
    var base = link.getAttribute('data-gumroad-base') || link.getAttribute('href') || '';
    base = base.split('&guanlan_')[0].split('?guanlan_')[0];
    link.setAttribute('data-gumroad-base', base);
    link.setAttribute('href', buildCheckoutUrl(base, birth, product, section));
    link.setAttribute('data-gumroad-overlay-checkout', 'true');
    link.setAttribute('data-gumroad-single-product', 'true');
    link.removeAttribute('target');
    link.classList.remove('gumroad-button');

    link.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      ensureCheckoutIntake(product, function() {
        link.setAttribute('href', buildCheckoutUrl(base, getBirthPrefill(), product, section));
        showEscapeBar();
        trackCheckoutClick(product, section);
        openOverlayCheckout(link.getAttribute('href'));
      });
      return false;
    });
  }

  function initGumroadLinks() {
    var birth = getBirthPrefill();
    document.querySelectorAll('a[href*="lleonard88.gumroad.com"]').forEach(function(link) {
      var product = link.getAttribute('data-product') || productFromHref(link.getAttribute('href')) || 'gumroad';
      var parent = link.closest('section, header, nav, footer, div');
      var section = (parent && parent.id) ? parent.id : 'page';
      attachPricingLink(link, product, section, birth);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGumroadLinks);
  } else {
    initGumroadLinks();
  }
})();
