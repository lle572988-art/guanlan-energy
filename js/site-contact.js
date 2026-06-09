(function () {
  var WA_NUMBER = '8613983664891';
  var WA_BASE = 'https://wa.me/' + WA_NUMBER;
  var EMAIL = 'hello@metaphysicflow.com';

  var MESSAGES = {
    default: 'Hi, I have a question about Guanlan Energy.',
    order: 'Hi, I just placed an order on metaphysicflow.com and have a question.',
    consultation: 'Hi, I would like to ask about the Live Video Consultation.'
  };

  function waUrl(ctx) {
    return WA_BASE + '?text=' + encodeURIComponent(MESSAGES[ctx] || MESSAGES.default);
  }

  window.GUANLAN_CONTACT = {
    whatsapp: WA_BASE,
    email: EMAIL,
    whatsappHref: waUrl
  };

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
    initCtas();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
