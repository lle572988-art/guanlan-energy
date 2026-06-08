(function () {
  var STORAGE_KEY = 'guanlan_cookie_consent';

  function injectStyles() {
    if (document.getElementById('cookie-consent-styles')) return;
    var style = document.createElement('style');
    style.id = 'cookie-consent-styles';
    style.textContent =
      '#cookie-consent{position:fixed;bottom:0;left:0;right:0;z-index:9999;padding:1rem 1.5rem;background:rgba(6,13,26,.96);border-top:1px solid rgba(197,152,74,.25);backdrop-filter:blur(8px)}' +
      '.cookie-consent-inner{max-width:960px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem}' +
      '.cookie-consent-inner p{font-size:.88rem;color:#7FA0BA;margin:0;max-width:640px;line-height:1.5}' +
      '.cookie-consent-inner a{color:#E2C27A}' +
      '.cookie-consent-actions{display:flex;gap:.6rem;flex-shrink:0}' +
      '.cookie-consent-actions button{font-family:serif;font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;padding:.55rem 1rem;cursor:pointer;border-radius:1px}' +
      '#cookie-reject{background:transparent;border:1px solid rgba(197,152,74,.35);color:#9BB5CC}' +
      '#cookie-accept{background:#C5984A;border:1px solid #C5984A;color:#03070F}';
    document.head.appendChild(style);
  }

  function loadAnalytics() {
    if (!document.getElementById('guanlan-plausible')) {
      window.plausible =
        window.plausible ||
        function () {
          (window.plausible.q = window.plausible.q || []).push(arguments);
        };
      var p = document.createElement('script');
      p.id = 'guanlan-plausible';
      p.defer = true;
      p.dataset.domain = 'metaphysicflow.com';
      p.src = 'https://plausible.io/js/script.js';
      document.body.appendChild(p);
    }

    if (!document.getElementById('guanlan-gtag')) {
      var g = document.createElement('script');
      g.id = 'guanlan-gtag';
      g.async = true;
      g.src = 'https://www.googletagmanager.com/gtag/js?id=G-T82Z7E5ELB';
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', 'G-T82Z7E5ELB');
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* private mode */
    }
    if (value === 'accepted') loadAnalytics();
    var banner = document.getElementById('cookie-consent');
    if (banner) banner.remove();
  }

  function showBanner() {
    if (document.getElementById('cookie-consent')) return;
    injectStyles();
    var banner = document.createElement('div');
    banner.id = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<div class="cookie-consent-inner">' +
      '<p>We use privacy-friendly analytics to improve the site. No ad tracking. ' +
      '<a href="/privacy.html">Privacy Policy</a></p>' +
      '<div class="cookie-consent-actions">' +
      '<button type="button" id="cookie-reject">Essential only</button>' +
      '<button type="button" id="cookie-accept">Accept analytics</button>' +
      '</div></div>';
    document.body.appendChild(banner);
    document.getElementById('cookie-accept').addEventListener('click', function () {
      setConsent('accepted');
    });
    document.getElementById('cookie-reject').addEventListener('click', function () {
      setConsent('rejected');
    });
  }

  var existing;
  try {
    existing = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    existing = null;
  }

  if (existing === 'accepted') {
    loadAnalytics();
  } else if (!existing) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }
})();
