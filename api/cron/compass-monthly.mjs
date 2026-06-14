/**
 * Vercel Cron — monthly flying star briefs for Living Compass Annual members.
 * Schedule: 1st of each month, 09:00 UTC (vercel.json crons).
 * Requires: CRON_SECRET, RESEND_API_KEY, BLOB_READ_WRITE_TOKEN
 */
import {
  getMembersNeedingMonthly,
  markMonthlySent,
} from '../../server/lib/compass-annual-members.js';
import { sendMonthlyBriefToMember } from '../../server/lib/compass-monthly-email.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

function authorizeCron(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== 'production';
  const auth = req.headers.authorization || '';
  return auth === `Bearer ${secret}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!authorizeCron(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;

  const members = await getMembersNeedingMonthly(monthKey);
  if (!members.length) {
    return res.status(200).json({ ok: true, monthKey, sent: 0, message: 'No members due' });
  }

  let sent = 0;
  let failed = 0;

  for (const member of members) {
    try {
      const result = await sendMonthlyBriefToMember(member, now);
      if (result.ok) {
        await markMonthlySent(member.email, result.monthKey);
        sent += 1;
      } else {
        failed += 1;
      }
    } catch (e) {
      console.error('[cron/compass-monthly]', member.email, e.message);
      failed += 1;
    }
  }

  console.log('[cron/compass-monthly]', monthKey, 'sent', sent, 'failed', failed);
  return res.status(200).json({ ok: true, monthKey, sent, failed, total: members.length });
}
