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

/** Parse Gumroad Ping url_params (JSON string or url_params[key] flat keys) */
export function parseGumroadUrlParams(body) {
  const params = {};
  try {
    const raw = body?.url_params;
    if (typeof raw === 'string' && raw.trim()) {
      Object.assign(params, JSON.parse(raw));
    } else if (raw && typeof raw === 'object') {
      Object.assign(params, raw);
    }
  } catch (e) { /* ignore */ }

  for (const [k, v] of Object.entries(body || {})) {
    if (v == null || v === '') continue;
    const bracket = k.match(/^url_params\[([^\]]+)\]$/);
    if (bracket) params[bracket[1]] = v;
  }
  return params;
}

/** Only birth / chart fields for emails — never raw Gumroad metadata */
export function extractBirthContext(body) {
  const params = parseGumroadUrlParams(body);
  const fields = {};

  if (params.guanlan_dob) fields['Date of birth'] = params.guanlan_dob;
  if (params.guanlan_hour) fields['Birth hour'] = params.guanlan_hour;
  if (params.guanlan_country) fields['Birth city / country'] = params.guanlan_country;
  if (params.guanlan_main_star) fields['Life Palace star'] = params.guanlan_main_star;

  const gumroadCustomLabels = [
    ['Date of birth (YYYY-MM-DD)', 'Date of birth'],
    ['Birth hour (e.g. Zi Hour 23:00–01:00)', 'Birth hour'],
    ['Birth city / country (optional)', 'Birth city / country'],
  ];
  for (const [label, key] of gumroadCustomLabels) {
    if (body?.[label] && !fields[key]) fields[key] = String(body[label]);
  }

  return fields;
}
