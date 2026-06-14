/**
 * Compass checkout intake — sessionStorage + Gumroad URL params.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'compass_intake';

  function save(data) {
    try {
      var prev = load() || {};
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign(prev, data)));
    } catch (e) { /* ignore */ }
  }

  function load() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function fromXRayState() {
    if (!global.CompassXRay) return null;
    var s = global.CompassXRay.getState();
    if (!s || !s.chart) return null;
    var intake = {
      facing: s.facing || 'S',
      year: s.year || 2026,
      hasImage: !!s.image,
    };
    save(intake);
    return intake;
  }

  function appendCompassParams(href, intake) {
    if (!intake) intake = load();
    if (!intake) return href;
    var sep = href.indexOf('?') === -1 ? '?' : '&';
    var out = href + sep +
      'guanlan_facing=' + encodeURIComponent(intake.facing || '') +
      '&guanlan_xray_year=' + encodeURIComponent(String(intake.year || 2026));
    if (intake.dob) out += '&guanlan_dob=' + encodeURIComponent(intake.dob);
    if (intake.gender) out += '&guanlan_gender=' + encodeURIComponent(intake.gender);
    if (intake.kua) out += '&guanlan_kua=' + encodeURIComponent(String(intake.kua));
    return out;
  }

  function track(event, props) {
    if (global.plausible) global.plausible(event, props ? { props: props } : undefined);
    if (global.gtag) global.gtag('event', event, props || {});
  }

  global.CompassIntake = {
    save: save,
    load: load,
    fromXRayState: fromXRayState,
    appendCompassParams: appendCompassParams,
    STORAGE_KEY: STORAGE_KEY,
    track: track,
  };
})(window);
