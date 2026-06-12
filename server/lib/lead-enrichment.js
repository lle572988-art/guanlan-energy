/**
 * Normalize and enrich lead payloads for storage, ESP sync, and drip sequences.
 */

const STAR_EN_MAP = {
  '紫微': 'Zi Wei · Purple Emperor',
  '天機': 'Tian Ji · Heavenly Secret',
  '太陽': 'Tai Yang · Sun',
  '武曲': 'Wu Qu · Commander',
  '天同': 'Tian Tong · Heavenly Unity',
  '廉貞': 'Lian Zhen · Chastity Star',
  '天府': 'Tian Fu · Heavenly Treasury',
  '太陰': 'Tai Yin · Lunar Nobility',
  '貪狼': 'Tan Lang · Greedy Wolf',
  '巨門': 'Ju Men · Giant Gate',
  '天相': 'Tian Xiang · Minister',
  '天梁': 'Tian Liang · Heavenly Beam',
  '七殺': 'Qi Sha · Seven Killings',
  '破軍': 'Po Jun · Army Breaker',
};

const CORE_PALACE_TAGS = ['palace-life', 'palace-wealth', 'palace-career'];

function slugifyStar(cn) {
  if (!cn) return '';
  return 'star-' + cn.replace(/\s/g, '');
}

function buildPalaceTags(body) {
  const tags = [...CORE_PALACE_TAGS];
  if (body.mainStar) tags.push(slugifyStar(body.mainStar));
  if (body.source) tags.push(String(body.source));
  if (body.country) tags.push('has-birth-location');
  return [...new Set(tags)];
}

export function enrichLead(body) {
  const email = String(body.email || '').trim().toLowerCase();
  const birthYear = body.birthYear || body.birth_year || '';
  const birthMonth = body.birthMonth || body.birth_month || '';
  const birthDay = body.birthDay || body.birth_day || '';
  const birthHour = body.birthHour ?? body.birth_hour ?? body.hour ?? '';
  const dob =
    body.dob ||
    body.date ||
    (birthYear && birthMonth && birthDay
      ? `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`
      : '');
  const hour = birthHour !== '' && birthHour !== null && birthHour !== undefined ? birthHour : '';
  const country = body.country || '';
  const mainStar = body.mainStar || body.mainStarCn || '';
  const mainStarEn =
    body.mainStarEn ||
    (mainStar && STAR_EN_MAP[mainStar] ? STAR_EN_MAP[mainStar].split('·')[0].trim() : '');

  const enriched = {
    email,
    dob,
    birthYear: birthYear || (dob ? dob.split('-')[0] : ''),
    birthMonth: birthMonth || (dob ? dob.split('-')[1] : ''),
    birthDay: birthDay || (dob ? dob.split('-')[2] : ''),
    birthHour: hour,
    hour,
    country,
    mainStar,
    mainStarEn,
    name: body.name || '',
    page: body.page || body.sourceUrl || '/free-chart.html',
    sourceUrl: body.sourceUrl || body.page || '',
    source: body.source || 'free-chart-gate',
    pdfReady: body.pdfReady !== false,
    chartSvgProvided: Boolean(body.chartSvg),
    tags: buildPalaceTags({ ...body, mainStar }),
    captured_at: new Date().toISOString(),
  };

  return enriched;
}

export function validateLeadPayload(enriched) {
  if (!enriched.email || !enriched.email.includes('@')) {
    return { ok: false, error: 'Invalid email' };
  }
  return { ok: true };
}
