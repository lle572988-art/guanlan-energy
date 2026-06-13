(function () {
  function initAB() {
    var cta = document.querySelector('.cta-primary') || document.querySelector('.inline-cta a');
    if (!cta || cta.dataset.abReady) return;
    cta.dataset.abReady = '1';
    var page = (location.pathname.match(/\/blog\/([^/]+)\.html/) || [])[1] || 'growth-post';
    var variant = Math.random() > 0.5 ? 'A' : 'B';
    try {
      var stored = localStorage.getItem('cta_variant');
      if (stored === 'A' || stored === 'B') {
        variant = stored;
      } else {
        localStorage.setItem('cta_variant', variant);
      }
    } catch (e) {
      /* SecurityError — use ephemeral random variant without persisting */
    }
    document.body.setAttribute('data-variant', variant);
    if (variant === 'B') {
      cta.textContent = 'Life Palace Report — $9.90';
      cta.href = 'https://lleonard88.gumroad.com/l/acvsfx?wanted=true';
    }
    if (window.plausible) plausible('cta_variant', { props: { variant: variant, page: page } });
  }

  if (window.requestIdleCallback) {
    requestIdleCallback(initAB, { timeout: 2000 });
  } else {
    setTimeout(initAB, 0);
  }
})();
