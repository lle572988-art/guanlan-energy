/**
 * Gumroad overlay checkout + post-purchase redirect (no gumroad-button styling).
 * Requires: gumroad.js loaded first, links with data-gumroad-overlay-checkout="true"
 */
(function() {
  var PERMALINK_TO_PRODUCT = {
    acvsfx: 'life-palace-dive',
    lfoxf: 'three-palace-snapshot',
    tiuyjr: 'full-chart',
    lozmm: 'live-reading'
  };

  var THANK_YOU = 'https://metaphysicflow.com/thank-you.html';

  function productFromHref(href) {
    var m = (href || '').match(/\/l\/([^/?]+)/);
    return m ? PERMALINK_TO_PRODUCT[m[1]] : null;
  }

  function redirectAfterSale(data) {
    var productKey = null;
    try {
      if (data.product && data.product.short_url) {
        var slug = data.product.short_url.split('/').pop();
        productKey = PERMALINK_TO_PRODUCT[slug];
      }
      if (!productKey && data.product && data.product.permalink) {
        productKey = PERMALINK_TO_PRODUCT[data.product.permalink];
      }
    } catch (e) { /* ignore */ }

    var url = THANK_YOU + (productKey ? '?product=' + encodeURIComponent(productKey) : '');
    if (window.gtag) gtag('event', 'purchase', { item_name: productKey || 'gumroad', item_category: 'ziwei_reading' });
    if (window.plausible) plausible('purchase_complete', { props: { product: productKey || 'unknown', channel: 'gumroad_overlay' } });
    window.location.replace(url);
  }

  window.addEventListener('message', function(ev) {
    if (!ev.data || typeof ev.data !== 'string') return;
    try {
      var data = JSON.parse(ev.data);
      if (data.post_message_name === 'sale') redirectAfterSale(data);
    } catch (e) { /* not gumroad */ }
  });

  function attachPricingLink(link, product, section) {
    var href = link.getAttribute('href') || '';
    if (href.indexOf('utm_source=') === -1) {
      var sep = href.indexOf('?') === -1 ? '?' : '&';
      link.setAttribute('href', href + sep + 'utm_source=site&utm_medium=cta&utm_campaign=pricing&utm_content=' + encodeURIComponent(section + '_' + product));
    }
    link.addEventListener('click', function() {
      if (window.gtag) {
        gtag('event', 'begin_checkout', {
          item_name: product,
          item_category: 'ziwei_reading',
          source_section: section,
          checkout_channel: 'gumroad_overlay'
        });
      }
      if (window.plausible) plausible('purchase_click', { props: { product: product, channel: 'gumroad_overlay' } });
    });
  }

  function initGumroadLinks() {
    document.querySelectorAll('a[href*="lleonard88.gumroad.com"]').forEach(function(link) {
      if (!link.getAttribute('data-gumroad-overlay-checkout')) {
        link.setAttribute('data-gumroad-overlay-checkout', 'true');
        link.setAttribute('data-gumroad-single-product', 'true');
      }
      var product = link.getAttribute('data-product') || productFromHref(link.getAttribute('href')) || 'gumroad';
      var parent = link.closest('section, header, nav, footer, div');
      var section = (parent && parent.id) ? parent.id : 'page';
      attachPricingLink(link, product, section);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGumroadLinks);
  } else {
    initGumroadLinks();
  }
})();
