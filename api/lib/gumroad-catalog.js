/** Gumroad product permalinks ↔ site product keys */
export const GUMROAD_PRODUCTS = {
  acvsfx: {
    key: 'life-palace-dive',
    name: 'Life Palace Deep Dive',
    price: '$9.90',
    checkout: 'https://lleonard88.gumroad.com/l/acvsfx?wanted=true',
  },
  lfoxf: {
    key: 'three-palace-snapshot',
    name: 'Three-Palace Snapshot',
    price: '$19',
    checkout: 'https://lleonard88.gumroad.com/l/lfoxf?wanted=true',
  },
  tiuyjr: {
    key: 'full-chart',
    name: 'Full 12-Palace Matrix',
    price: '$39',
    checkout: 'https://lleonard88.gumroad.com/l/tiuyjr?wanted=true',
  },
  lozmm: {
    key: 'live-reading',
    name: 'Live Video Consultation',
    price: '$99',
    checkout: 'https://lleonard88.gumroad.com/l/lozmm?wanted=true',
  },
};

export function resolveGumroadProduct(body) {
  const permalink = (body.short_product_id || body.product_permalink || '').toLowerCase();
  const slug = permalink.replace(/^.*\//, '').split('?')[0];
  if (GUMROAD_PRODUCTS[slug]) return GUMROAD_PRODUCTS[slug];

  const name = (body.product_name || '').toLowerCase();
  for (const meta of Object.values(GUMROAD_PRODUCTS)) {
    if (name && meta.name.toLowerCase().includes(name.slice(0, 12))) return meta;
  }
  return null;
}

export function thankYouUrl(productKey) {
  return `https://metaphysicflow.com/thank-you.html?product=${encodeURIComponent(productKey || 'full-chart')}`;
}

export function extractCustomFields(body) {
  const skip = new Set([
    'seller_id', 'product_id', 'product_name', 'product_permalink', 'short_product_id',
    'sale_id', 'sale_timestamp', 'order_number', 'email', 'full_name', 'purchaser_id',
    'price', 'quantity', 'shipping_information', 'country', 'zip_code', 'recurrence',
    'variants', 'offer_code', 'test', 'custom_fields', 'shipping_rate', 'affiliate',
    'affiliate_credit_amount_cents', 'is_gift_receiver_purchase', 'referrer', 'ip_country',
    'is_preorder_authorization', 'subscription_id', 'url_params', 'license_key',
    'guanlan_dob', 'guanlan_hour', 'guanlan_country', 'guanlan_main_star',
  ]);
  const fields = {};
  for (const [k, v] of Object.entries(body || {})) {
    if (skip.has(k) || v == null || v === '') continue;
    if (k.startsWith('_')) continue;
    fields[k] = String(v);
  }
  return fields;
}

/** Birth info from checkout URL params (Gumroad Ping url_params) + optional Gumroad custom fields */
export function extractBirthContext(body) {
  const fields = {};
  let params = {};
  try {
    const raw = body?.url_params;
    params = typeof raw === 'string' ? JSON.parse(raw) : (raw || {});
  } catch (e) { /* ignore */ }

  if (params.guanlan_dob) fields['Date of birth'] = params.guanlan_dob;
  if (params.guanlan_hour) fields['Birth hour'] = params.guanlan_hour;
  if (params.guanlan_country) fields['Birth city / country'] = params.guanlan_country;
  if (params.guanlan_main_star) fields['Life Palace star'] = params.guanlan_main_star;

  const custom = extractCustomFields(body);
  return { ...fields, ...custom };
}
