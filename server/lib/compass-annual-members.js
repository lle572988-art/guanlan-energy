/**
 * Living Compass Annual pass members — stored on Vercel Blob.
 */
import { list, put } from '@vercel/blob';

const MEMBERS_PATH = 'compass-annual-members.json';

async function readMembers() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  try {
    const { blobs } = await list({ prefix: MEMBERS_PATH });
    if (!blobs?.length) return [];
    const resp = await fetch(blobs[0].url);
    if (!resp.ok) return [];
    const data = await resp.json();
    return Array.isArray(data.members) ? data.members : [];
  } catch (e) {
    console.error('[compass-annual-members] read:', e.message);
    return [];
  }
}

async function writeMembers(members) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
  await put(MEMBERS_PATH, JSON.stringify({ members, updatedAt: new Date().toISOString() }, null, 2), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
  return true;
}

export async function registerCompassAnnualMember({
  email,
  facing = 'S',
  dob = '',
  gender = '',
  year = 2026,
  saleId = '',
}) {
  if (!email) return null;
  const norm = email.trim().toLowerCase();
  const now = new Date();
  const expires = new Date(now);
  expires.setFullYear(expires.getFullYear() + 1);

  const members = await readMembers();
  const existing = members.find((m) => m.email === norm);
  const entry = {
    email: norm,
    facing: facing || existing?.facing || 'S',
    dob: dob || existing?.dob || '',
    gender: gender || existing?.gender || '',
    year: parseInt(year, 10) || existing?.year || 2026,
    saleId: saleId || existing?.saleId || '',
    subscribedAt: existing?.subscribedAt || now.toISOString(),
    expiresAt: expires.toISOString(),
    lastMonthlySent: existing?.lastMonthlySent || '',
    active: true,
  };

  if (existing) {
    Object.assign(existing, entry);
  } else {
    members.push(entry);
  }

  await writeMembers(members);
  return entry;
}

export async function listActiveAnnualMembers() {
  const members = await readMembers();
  const now = Date.now();
  return members.filter((m) => m.active && m.email && new Date(m.expiresAt).getTime() > now);
}

export async function markMonthlySent(email, monthKey) {
  const norm = email.trim().toLowerCase();
  const members = await readMembers();
  const m = members.find((x) => x.email === norm);
  if (!m) return false;
  m.lastMonthlySent = monthKey;
  await writeMembers(members);
  return true;
}

export async function getMembersNeedingMonthly(monthKey) {
  const active = await listActiveAnnualMembers();
  return active.filter((m) => m.lastMonthlySent !== monthKey);
}
