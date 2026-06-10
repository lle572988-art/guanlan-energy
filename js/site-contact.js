(function () {
  var WA_NUMBER = '861398' + '3664891';
  var WA_BASE = 'https://wa.me/' + WA_NUMBER;
  var EMAIL = 'hello@metaphysicflow.com';

  var MESSAGES = {
    default: 'Hi, I have a question about Guanlan Energy.',
    order: 'Hi, I just placed an order on metaphysicflow.com and have a question.',
    consultation: 'Hi, I would like to ask about the Live Video Consultation.'
  };

  var WA_ICON =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>' +
    '</svg>';

  var STYLE_ID = 'guanlan-contact-styles';

  var CONTACT_STYLES =
    '#guanlan-wa-float{' +
      'position:fixed;bottom:24px;right:24px;z-index:9998;display:flex;align-items:center;gap:12px;' +
      'padding:10px 16px 10px 10px;min-height:52px;' +
      'background:linear-gradient(135deg,rgba(8,18,14,.94),rgba(12,24,19,.88));' +
      'border:1px solid rgba(201,169,110,.28);border-radius:999px;' +
      'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);' +
      'box-shadow:0 10px 40px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.04);' +
      'color:#f0ebe0!important;text-decoration:none!important;' +
      'transition:transform .28s ease,border-color .28s ease,box-shadow .28s ease;' +
      'outline:none' +
    '}' +
    '#guanlan-wa-float:hover{' +
      'transform:translateY(-2px);' +
      'border-color:rgba(201,169,110,.55);' +
      'box-shadow:0 14px 44px rgba(0,0,0,.5),0 0 0 1px rgba(201,169,110,.08),inset 0 1px 0 rgba(255,255,255,.06)' +
    '}' +
    '#guanlan-wa-float:focus-visible{outline:2px solid rgba(201,169,110,.65);outline-offset:3px}' +
    '#guanlan-wa-float .guanlan-wa-icon{' +
      'display:flex;align-items:center;justify-content:center;flex-shrink:0;' +
      'width:36px;height:36px;border-radius:50%;' +
      'background:linear-gradient(145deg,#2fd06a,#128C7E);color:#fff;' +
      'box-shadow:0 4px 14px rgba(18,140,126,.35)' +
    '}' +
    '#guanlan-wa-float .guanlan-wa-copy{display:flex;flex-direction:column;align-items:flex-start;gap:2px;line-height:1.2}' +
    '#guanlan-wa-float .guanlan-wa-title{' +
      'font-family:Cinzel,"Times New Roman",serif;font-size:11px;letter-spacing:.18em;' +
      'text-transform:uppercase;color:#e8d4a0;font-weight:500' +
    '}' +
    '#guanlan-wa-float .guanlan-wa-sub{' +
      'font-family:"EB Garamond",Georgia,serif;font-size:12px;color:rgba(240,235,224,.52);' +
      'letter-spacing:.02em;font-style:italic' +
    '}' +
    '.guanlan-wa-btn,.wa-btn[data-guanlan-wa-cta],a.wa-btn{' +
      'display:inline-flex;align-items:center;justify-content:center;gap:10px;' +
      'padding:13px 24px;min-height:48px;' +
      'background:linear-gradient(135deg,rgba(8,18,14,.92),rgba(12,24,19,.86));' +
      'border:1px solid rgba(201,169,110,.32);border-radius:2px;' +
      'color:#e8d4a0!important;text-decoration:none!important;' +
      'font-family:Cinzel,"Times New Roman",serif;font-size:10px;letter-spacing:.2em;text-transform:uppercase;' +
      'box-shadow:0 8px 28px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.04);' +
      'transition:transform .25s ease,border-color .25s ease,background .25s ease,box-shadow .25s ease;' +
      'cursor:pointer;outline:none' +
    '}' +
    '.guanlan-wa-btn .guanlan-wa-icon,.wa-btn .guanlan-wa-icon,a.wa-btn .guanlan-wa-icon{' +
      'display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;' +
      'background:linear-gradient(145deg,#2fd06a,#128C7E);color:#fff;flex-shrink:0;' +
      'box-shadow:0 3px 10px rgba(18,140,126,.28)' +
    '}' +
    '.guanlan-wa-btn:hover,.wa-btn[data-guanlan-wa-cta]:hover,a.wa-btn:hover{' +
      'transform:translateY(-1px);border-color:rgba(201,169,110,.55);' +
      'background:linear-gradient(135deg,rgba(10,22,17,.96),rgba(14,28,22,.9));' +
      'box-shadow:0 12px 32px rgba(0,0,0,.34),0 0 0 1px rgba(201,169,110,.06)' +
    '}' +
    '.guanlan-wa-btn:focus-visible,.wa-btn:focus-visible{outline:2px solid rgba(201,169,110,.65);outline-offset:3px}' +
    '.hero-wa{margin-top:28px}' +
    '@media(max-width:640px){' +
      '#guanlan-wa-float{bottom:18px;right:18px;padding:8px;min-height:0;border-radius:50%}' +
      '#guanlan-wa-float .guanlan-wa-copy{display:none}' +
      '#guanlan-wa-float .guanlan-wa-icon{width:48px;height:48px}' +
    '}';

  function pageContext() {
    var path = window.location.pathname || '';
    if (path.indexOf('thank-you') !== -1) return 'order';
    if (path.indexOf('consultation') !== -1) return 'consultation';
    return 'default';
  }

  function waUrl(ctx) {
    return WA_BASE + '?text=' + encodeURIComponent(MESSAGES[ctx] || MESSAGES.default);
  }

  function iconMarkup(size) {
    return '<span class="guanlan-wa-icon" aria-hidden="true">' +
      WA_ICON.replace('width="18"', 'width="' + size + '"').replace('height="18"', 'height="' + size + '"') +
      '</span>';
  }

  window.GUANLAN_CONTACT = {
    whatsapp: WA_BASE,
    email: EMAIL,
    whatsappHref: waUrl,
    icon: WA_ICON
  };

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CONTACT_STYLES;
    document.head.appendChild(style);
  }

  function injectFloatingButton() {
    if (document.getElementById('guanlan-wa-float') || document.body.getAttribute('data-guanlan-wa-skip') === '1') return;

    var btn = document.createElement('a');
    btn.id = 'guanlan-wa-float';
    btn.href = waUrl(pageContext());
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.setAttribute('aria-label', 'Message us on WhatsApp');
    btn.innerHTML =
      iconMarkup(18) +
      '<span class="guanlan-wa-copy">' +
        '<span class="guanlan-wa-title">Ask on WhatsApp</span>' +
        '<span class="guanlan-wa-sub">Usually replies within hours</span>' +
      '</span>';
    document.body.appendChild(btn);
  }

  function injectFooterLinks() {
    var targets = document.querySelectorAll('footer, .footer');
    targets.forEach(function (footer) {
      if (footer.getAttribute('data-guanlan-contact-skip') === '1') return;
      if (footer.querySelector('[data-guanlan-contact]')) return;

      var links = footer.querySelector('.footer-links');
      if (links && !links.querySelector('[data-guanlan-wa]')) {
        var wa = document.createElement('a');
        wa.href = waUrl('default');
        wa.target = '_blank';
        wa.rel = 'noopener';
        wa.setAttribute('data-guanlan-wa', '1');
        wa.textContent = 'WhatsApp';
        links.appendChild(wa);
        footer.setAttribute('data-guanlan-contact', '1');
        return;
      }

      var row = document.createElement('div');
      row.className = 'guanlan-footer-contact';
      row.setAttribute('data-guanlan-contact', '1');
      row.style.cssText = 'margin-top:12px;font-size:12px;letter-spacing:0.05em;line-height:1.8;';
      row.innerHTML =
        '<a href="mailto:' + EMAIL + '" style="color:inherit;opacity:0.55;text-decoration:none;margin-right:14px">Email</a>' +
        '<a href="' + waUrl('default') + '" target="_blank" rel="noopener" data-guanlan-wa="1" style="color:inherit;opacity:0.55;text-decoration:none">WhatsApp</a>';
      footer.appendChild(row);
    });
  }

  function wrapInlineButtons() {
    document.querySelectorAll('[data-guanlan-wa-cta], a.wa-btn').forEach(function (el) {
      if (el.querySelector('.guanlan-wa-icon')) return;
      var label = (el.textContent || '').trim();
      el.innerHTML = iconMarkup(16) + '<span>' + label + '</span>';
    });
  }

  function initCtas() {
    document.querySelectorAll('[data-guanlan-wa-cta]').forEach(function (el) {
      var ctx = el.getAttribute('data-guanlan-wa-cta') || 'default';
      el.href = waUrl(ctx);
      el.target = '_blank';
      el.rel = 'noopener';
    });
  }

  function run() {
    injectStyles();
    injectFooterLinks();
    injectFloatingButton();
    initCtas();
    wrapInlineButtons();
    maybeLoadBlogChrome();
  }

  function maybeLoadBlogChrome() {
    var path = window.location.pathname || '';
    if (path.indexOf('/blog/') !== 0) return;
    if (path === '/blog/' || path === '/blog/index.html') return;
    if (document.querySelector('script[data-guanlan-blog-chrome]')) return;
    var s = document.createElement('script');
    s.src = '/js/blog-article-chrome.js';
    s.defer = true;
    s.setAttribute('data-guanlan-blog-chrome', '1');
    document.body.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
