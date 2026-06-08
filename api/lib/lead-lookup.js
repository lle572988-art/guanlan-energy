import { list } from '@vercel/blob';

const BLOB_PATH = 'leads.json';

const HOUR_LABELS = [
  '子時 · Zi (23:00–01:00)', '丑時 · Chou (01:00–03:00)', '寅時 · Yin (03:00–05:00)',
  '卯時 · Mao (05:00–07:00)', '辰時 · Chen (07:00–09:00)', '巳時 · Si (09:00–11:00)',
  '午時 · Wu (11:00–13:00)', '未時 · Wei (13:00–15:00)', '申時 · Shen (15:00–17:00)',
  '酉時 · You (17:00–19:00)', '戌時 · Xu (19:00–21:00)', '亥時 · Hai (21:00–23:00)',
];

export async function lookupLeadByEmail(email) {
  if (!email || !process.env.BLOB_READ_WRITE_TOKEN) return null;
  const normalized = String(email).trim().toLowerCase();
  try {
    const { blobs } = await list({ prefix: BLOB_PATH });
    if (!blobs?.length) return null;
    const resp = await fetch(blobs[0].url, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const leads = Array.isArray(data.leads) ? data.leads : [];
    for (let i = leads.length - 1; i >= 0; i -= 1) {
      if (leads[i].email === normalized) return leads[i];
    }
  } catch (e) {
    console.error('[lead-lookup]', e.message);
  }
  return null;
}

export function leadToBirthFields(lead) {
  if (!lead) return {};
  const fields = {};
  if (lead.dob) fields['Date of birth'] = String(lead.dob).replace(/\//g, '-');
  if (lead.hour !== '' && lead.hour !== undefined && lead.hour !== null) {
    const idx = parseInt(lead.hour, 10);
    fields['Birth hour'] = (!Number.isNaN(idx) && HOUR_LABELS[idx]) ? HOUR_LABELS[idx] : String(lead.hour);
  }
  if (lead.country) fields['Birth city / country'] = lead.country;
  if (lead.mainStarEn || lead.mainStar) fields['Life Palace star'] = lead.mainStarEn || lead.mainStar;
  if (lead.name) fields['Name'] = lead.name;
  return fields;
}
