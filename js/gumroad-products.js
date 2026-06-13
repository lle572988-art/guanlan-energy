/** Primary checkout URLs — Gumroad. See /gumroad-setup.html for Ping setup. */
/** Paste slugs from Gumroad → Products → URL (gumroad.com/l/{slug}) */
const PARTNER_SKU = ''; // Partner Compatibility Reading ($59)
const ANNUAL_SKU = ''; // Annual Cosmic Alignment ($199)
// Intake until Gumroad SKUs are live — consultation page with product param (replace with Tally when ready)
const PARTNER_INTAKE = 'https://metaphysicflow.com/consultation.html?product=partner-compatibility#book';
const ANNUAL_INTAKE = 'https://metaphysicflow.com/consultation.html?product=annual#book';

function warnIfPlaceholder(url, label) {
  if (/tally\.so\/placeholder|placeholder-/i.test(url)) {
    console.warn('[Guanlan] ' + label + ' intake URL is still a placeholder:', url);
  }
}

warnIfPlaceholder(PARTNER_INTAKE, 'Partner');
warnIfPlaceholder(ANNUAL_INTAKE, 'Annual');

function gumroadUrl(slug) {
  return slug ? 'https://lleonard88.gumroad.com/l/' + slug + '?wanted=true' : '';
}

window.GUANLAN_GUMROAD = {
  'life-palace-dive': 'https://lleonard88.gumroad.com/l/acvsfx?wanted=true',
  'three-palace-snapshot': 'https://lleonard88.gumroad.com/l/lfoxf?wanted=true',
  'full-chart': 'https://lleonard88.gumroad.com/l/tiuyjr?wanted=true',
  'live-reading': 'https://lleonard88.gumroad.com/l/lozmm?wanted=true'
};

window.GUANLAN_GUMROAD['partner-compatibility'] = PARTNER_SKU
  ? gumroadUrl(PARTNER_SKU)
  : PARTNER_INTAKE;
window.GUANLAN_GUMROAD['annual'] = ANNUAL_SKU
  ? gumroadUrl(ANNUAL_SKU)
  : ANNUAL_INTAKE;

/** Paste into Gumroad → Product → Settings → Redirect after purchase */
window.GUANLAN_GUMROAD_THANK_YOU = {
  'life-palace-dive': 'https://metaphysicflow.com/thank-you.html?product=life-palace-dive',
  'three-palace-snapshot': 'https://metaphysicflow.com/thank-you.html?product=three-palace-snapshot',
  'full-chart': 'https://metaphysicflow.com/thank-you.html?product=full-chart',
  'live-reading': 'https://metaphysicflow.com/thank-you.html?product=live-reading',
  'partner-compatibility': 'https://metaphysicflow.com/thank-you.html?product=partner-compatibility',
  'annual': 'https://metaphysicflow.com/thank-you.html?product=annual'
};
