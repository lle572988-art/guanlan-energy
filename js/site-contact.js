(function () {
  var WA_NUMBER = '8613983664891';
  var WA_BASE = 'https://wa.me/' + WA_NUMBER;
  var EMAIL = 'hello@metaphysicflow.com';

  var MESSAGES = {
    default: 'Hi, I have a question about Guanlan Energy.',
    order: 'Hi, I just placed an order on metaphysicflow.com and have a question.',
    consultation: 'Hi, I would like to ask about the Live Video Consultation.'
  };

  var WA_ICON =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>' +
    '</svg>';

  function pageContext() {
    var path = window.location.pathname || '';
    if (path.indexOf('thank-you') !== -1) return 'order';
    if (path.indexOf('consultation') !== -1) return 'consultation';
    return 'default';
  }

  function waUrl(ctx) {
    return WA_BASE + '?text=' + encodeURIComponent(MESSAGES[ctx] || MESSAGES.default);
  }

  window.GUANLAN_CONTACT = {
    whatsapp: WA_BASE,
    email: EMAIL,
    whatsappHref: waUrl,
    icon: WA_ICON
  };

  function injectFloatingButton() {
    if (document.getElementById('guanlan-wa-float') || document.body.getAttribute('data-guanlan-wa-skip') === '1') return;

    var style = document.createElement('style');
    style.textContent =
      '#guanlan-wa-float{position:fixed;bottom:22px;right:22px;z-index:9998;display:inline-flex;align-items:center;gap:10px;' +
      'padding:13px 20px;background:#25D366;color:#fff!important;text-decoration:none!important;' +
      'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px;font-weight:600;' +
      'border-radius:999px;box-shadow:0 4px 22px rgba(37,211,102,.45);transition:transform .2s,box-shadow .2s}' +
      '#guanlan-wa-float:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(37,211,102,.55)}' +
      '@media(max-width:520px){#guanlan-wa-float .guanlan-wa-label{display:none}#guanlan-wa-float{padding:15px;border-radius:50%}}';
    document.head.appendChild(style);

    var btn = document.createElement('a');
    btn.id = 'guanlan-wa-float';
    btn.href = waUrl(pageContext());
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.setAttribute('aria-label', 'Message on WhatsApp');
    btn.innerHTML = WA_ICON + '<span class="guanlan-wa-label">WhatsApp</span>';
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

  function initCtas() {
    document.querySelectorAll('[data-guanlan-wa-cta]').forEach(function (el) {
      var ctx = el.getAttribute('data-guanlan-wa-cta') || 'default';
      el.href = waUrl(ctx);
      el.target = '_blank';
      el.rel = 'noopener';
    });
  }

  function run() {
    injectFooterLinks();
    injectFloatingButton();
    initCtas();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
