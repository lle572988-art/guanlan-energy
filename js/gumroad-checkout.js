/**
 * Gumroad checkout in a new tab — site stays open; birth context in URL for Ping.
 */
(function() {
  var PERMALINK_TO_PRODUCT = {
    acvsfx: 'life-palace-dive',
    lfoxf: 'three-palace-snapshot',
    tiuyjr: 'full-chart',
    lozmm: 'live-reading'
  };

  var THANK_YOU = 'https://metaphysicflow.com/thank-you.html';
  var STORAGE_KEY = 'guanlan_birth';
  var bannerTimer = null;

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

  function appendGuanlanParams(href, birth) {
    if (!hasBirth(birth)) return href;
    var sep = href.indexOf('?') === -1 ? '?' : '&';
    var out = href + sep +
      'guanlan_dob=' + encodeURIComponent(birth.dob) +
      '&guanlan_hour=' + encodeURIComponent(birth.hourLabel);
    if (birth.country) out += '&guanlan_country=' + encodeURIComponent(birth.country);
    if (birth.mainStar) out += '&guanlan_main_star=' + encodeURIComponent(birth.mainStar);
    return out;
  }

  function appendThankYouRedirect(href, productKey) {
    if (!productKey || productKey === 'gumroad') return href;
    var redirect = THANK_YOU + '?product=' + encodeURIComponent(productKey);
    var sep = href.indexOf('?') === -1 ? '?' : '&';
    return href + sep + 'redirect_url=' + encodeURIComponent(redirect);
  }

  function productFromHref(href) {
    var m = (href || '').match(/\/l\/([^/?]+)/);
    return m ? PERMALINK_TO_PRODUCT[m[1]] : null;
  }

  function ensureCheckoutBanner() {
    if (document.getElementById('guanlan-checkout-banner')) return;

    var style = document.createElement('style');
    style.textContent =
      '#guanlan-checkout-banner{position:fixed;bottom:0;left:0;right:0;z-index:9999;' +
      'background:linear-gradient(180deg,rgba(6,16,12,0) 0%,rgba(6,16,12,.96) 18%,#0c1628 100%);' +
      'border-top:1px solid rgba(201,168,76,.35);padding:1rem 1.25rem 1.25rem;transform:translateY(110%);' +
      'transition:transform .35s ease;font-family:-apple-system,BlinkMacSystemFont,sans-serif}' +
      '#guanlan-checkout-banner.show{transform:translateY(0)}' +
      '#guanlan-checkout-banner .inner{max-width:720px;margin:0 auto;display:flex;gap:.75rem;align-items:center;flex-wrap:wrap}' +
      '#guanlan-checkout-banner p{flex:1;min-width:200px;margin:0;font-size:.875rem;color:rgba(240,235,224,.82);line-height:1.45}' +
      '#guanlan-checkout-banner a{color:#c9a84c;text-decoration:none;font-weight:600}' +
      '#guanlan-checkout-banner .btn-home{display:inline-block;padding:.55rem .9rem;background:#c9a84c;color:#06100c;' +
      'font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;font-weight:700}' +
      '#guanlan-checkout-banner .btn-dismiss{background:transparent;border:1px solid rgba(74,102,128,.45);' +
      'color:rgba(240,235,224,.55);padding:.5rem .75rem;cursor:pointer;font-size:.75rem}';
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.id = 'guanlan-checkout-banner';
    bar.setAttribute('role', 'status');
    bar.innerHTML =
      '<div class="inner">' +
        '<p><strong>Checkout opened in a new tab.</strong> Close that tab anytime to cancel — this page stays here.</p>' +
        '<a class="btn-home" href="/">Back to home</a>' +
        '<button type="button" class="btn-dismiss" aria-label="Dismiss">Dismiss</button>' +
      '</div>';
    document.body.appendChild(bar);

    bar.querySelector('.btn-dismiss').addEventListener('click', function() {
      bar.classList.remove('show');
    });
  }

  function showCheckoutBanner() {
    ensureCheckoutBanner();
    var bar = document.getElementById('guanlan-checkout-banner');
    bar.classList.add('show');
    if (bannerTimer) clearTimeout(bannerTimer);
    bannerTimer = setTimeout(function() {
      bar.classList.remove('show');
    }, 45000);
  }

  function trackCheckoutClick(product, section) {
    if (window.gtag) {
      gtag('event', 'begin_checkout', {
        item_name: product,
        item_category: 'ziwei_reading',
        source_section: section,
        checkout_channel: 'gumroad_new_tab'
      });
    }
    if (window.plausible) {
      plausible('purchase_click', { props: { product: product, channel: 'gumroad_new_tab' } });
    }
  }

  function openCheckout(url, product, section) {
    var win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.href = url;
      return;
    }
    showCheckoutBanner();
    trackCheckoutClick(product, section);
  }

  function ensureModal() {
    if (document.getElementById('guanlan-birth-modal')) return;

    var style = document.createElement('style');
    style.textContent =
      '#guanlan-birth-modal{position:fixed;inset:0;z-index:10000;background:rgba(3,7,15,.88);display:none;align-items:center;justify-content:center;padding:1rem}' +
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
        '<p>We need your birth date and hour to write your chart. Checkout opens in a <strong>separate tab</strong> — close it anytime to come back here.</p>' +
        '<label for="guanlan-birth-dob">Date of birth</label>' +
        '<input id="guanlan-birth-dob" type="date" required />' +
        '<label for="guanlan-birth-hour">Birth hour (Chinese double-hour)</label>' +
        '<select id="guanlan-birth-hour" required>' +
          HOUR_OPTIONS.map(function(h) { return '<option value="' + h + '">' + h + '</option>'; }).join('') +
        '</select>' +
        '<label for="guanlan-birth-country">Birth city / country (optional)</label>' +
        '<input id="guanlan-birth-country" type="text" placeholder="e.g. San Francisco, USA" />' +
        '<div class="actions">' +
          '<button type="button" class="btn-gold" id="guanlan-birth-submit">Open checkout</button>' +
          '<button type="button" class="btn-ghost" id="guanlan-birth-cancel">Cancel</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    document.getElementById('guanlan-birth-cancel').addEventListener('click', function() {
      wrap.classList.remove('open');
    });
  }

  function showBirthModal(product, section, baseHref, onReady) {
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
      var birth = {
        dob: dobEl.value,
        hourLabel: hourEl.value,
        country: (countryEl.value || '').trim(),
        mainStar: (existing && existing.mainStar) || (window.__chartData && window.__chartData.lifeStarEn) || ''
      };
      saveBirth(birth);
      modal.classList.remove('open');
      submit.removeEventListener('click', handler);
      onReady(birth);
    };
    submit.addEventListener('click', handler);
  }

  function buildCheckoutUrl(baseHref, birth, product, section) {
    var href = baseHref || '';
    href = appendGuanlanParams(href, birth);
    href = appendThankYouRedirect(href, product);
    if (href.indexOf('utm_source=') === -1) {
      var sep = href.indexOf('?') === -1 ? '?' : '&';
      href += sep + 'utm_source=site&utm_medium=cta&utm_campaign=pricing&utm_content=' + encodeURIComponent(section + '_' + product);
    }
    return href;
  }

  function attachPricingLink(link, product, section, birth) {
    var base = link.getAttribute('data-gumroad-base') || link.getAttribute('href') || '';
    base = base.split('&guanlan_')[0].split('?guanlan_')[0].split('&redirect_url=')[0].split('?redirect_url=')[0];
    link.setAttribute('data-gumroad-base', base);
    link.setAttribute('href', buildCheckoutUrl(base, birth, product, section));
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');

    link.addEventListener('click', function(e) {
      e.preventDefault();

      function proceed(withBirth) {
        var url = buildCheckoutUrl(base, withBirth, product, section);
        link.setAttribute('href', url);
        openCheckout(url, product, section);
      }

      var current = getBirthPrefill();
      if (!hasBirth(current)) {
        showBirthModal(product, section, base, proceed);
        return false;
      }

      proceed(current);
      return false;
    });
  }

  function initGumroadLinks() {
    var birth = getBirthPrefill();
    document.querySelectorAll('a[href*="lleonard88.gumroad.com"]').forEach(function(link) {
      link.removeAttribute('data-gumroad-overlay-checkout');
      link.removeAttribute('data-gumroad-single-product');
      link.classList.remove('gumroad-button');

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
