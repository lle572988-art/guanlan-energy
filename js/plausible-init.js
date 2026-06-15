/** Plausible stub + tagged-events loader (used across compass and main site). */
window.plausible = window.plausible || function () {
  (window.plausible.q = window.plausible.q || []).push(arguments);
};

window.trackPlausible = function (eventName, options) {
  if (typeof window.plausible !== 'function') return;
  if (options && options.revenue) {
    window.plausible(eventName, { revenue: options.revenue, props: options.props || {} });
    return;
  }
  if (options && options.props) {
    window.plausible(eventName, { props: options.props });
    return;
  }
  window.plausible(eventName);
};

(function () {
  if (document.querySelector('script[data-domain="metaphysicflow.com"]')) return;
  var s = document.createElement('script');
  s.defer = true;
  s.setAttribute('data-domain', 'metaphysicflow.com');
  s.src = 'https://plausible.io/js/script.tagged-events.js';
  document.head.appendChild(s);
})();
