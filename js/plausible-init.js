/** Load synchronously before app bundles — queues custom events until tagged-events.js loads. */
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
