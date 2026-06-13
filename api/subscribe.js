// Vercel Edge Function — Email Capture + double opt-in via KV
// Env: RESEND_API_KEY, RESEND_AUDIENCE_ID (optional), KV_* (Vercel KV)
// Fallback: BUTTONDOWN_API_KEY or immediate welcome email when KV unavailable

export const config = { runtime: 'edge' };

const SITE = 'https://metaphysicflow.com';
const TOKEN_TTL = 86400;

function normalizeEmail(raw) {
  return String(raw || '').trim().toLowerCase();
}

const corsHeaders = {
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Access-Control-Allow-Origin': 'https://metaphysicflow.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getWelcomeEmailHTML(coupon, source) {
  const isLifePreview = /exit|life.?palace|preview/i.test(source || '');
  const title = isLifePreview ? 'Your Life Palace Preview' : 'Your Purple Star Chart Preview';
  const previewUrl = `${SITE}/free-chart.html`;
  const pdfUrl = process.env.PDF_URL;
  const pdfNote = isLifePreview
    ? (pdfUrl
      ? `<p style="margin-top:1rem;">Your Life Palace preview is ready — open your chart and scroll to the Life Palace reading:</p>
       <p><a href="${pdfUrl}" style="color:#E2C27A;font-weight:bold;">Download / view your Life Palace preview →</a></p>
       <p style="font-size:0.9rem;color:#7FA0BA;">We will also add you to our priority queue with a personal note when your full written reading slot opens.</p>`
      : `<p style="margin-top:1rem;">Your Life Palace preview is ready on our chart page:</p>
       <p><a href="${previewUrl}" style="color:#E2C27A;font-weight:bold;">Open your free chart and scroll to Life Palace →</a></p>
       <p style="font-size:0.9rem;color:#7FA0BA;">PDF delivery is temporarily unavailable — your full preview is available instantly online.</p>`)
    : `<p>Your free 12-palace preview is available at:<br>
        <a href="${previewUrl}" style="color:#E2C27A;">metaphysicflow.com/free-chart.html</a></p>`;
  if (isLifePreview && !pdfUrl) {
    console.error('[subscribe] PDF_URL missing — using online preview fallback for', source || 'unknown');
  }
  return `
    <div style="max-width:560px;margin:0 auto;font-family:Georgia,serif;background:#060D1A;color:#C8D8E8;padding:2rem;">
      <h1 style="color:#C5984A;font-size:1.5rem;font-weight:300;">${title}</h1>
      <p>Thank you for generating your Zi Wei Dou Shu chart.</p>
      ${pdfNote}
      ${coupon ? `<p style="background:rgba(197,152,74,0.1);border:1px solid rgba(197,152,74,0.3);
        padding:1rem;border-radius:2px;">
        🎁 Your exclusive coupon: <strong style="color:#C5984A;">${coupon}</strong><br>
        Save $5 on your first Full 12-Palace Matrix reading.
      </p>` : ''}
      <p style="font-style:italic;color:#7FA0BA;font-size:0.9rem;">
        — The Purple Star Reader | Guanlan Energy
      </p>
    </div>
  `;
}

function getConfirmEmailHTML(confirmUrl) {
  return `
    <div style="max-width:560px;margin:0 auto;font-family:Georgia,serif;background:#060D1A;color:#C8D8E8;padding:2rem;">
      <h1 style="color:#C5984A;font-size:1.5rem;font-weight:300;">Confirm your email</h1>
      <p>Click below to confirm and receive your Zi Wei Dou Shu reading preview. This link expires in 24 hours.</p>
      <p style="margin:1.5rem 0;">
        <a href="${confirmUrl}" style="display:inline-block;padding:12px 24px;background:#C5984A;color:#060D1A;text-decoration:none;border-radius:2px;font-weight:bold;">Confirm my email →</a>
      </p>
      <p style="font-size:0.85rem;color:#7FA0BA;">If the button does not work, copy this link:<br>${confirmUrl}</p>
      <p style="font-style:italic;color:#7FA0BA;font-size:0.9rem;margin-top:1.5rem;">— Guanlan Energy</p>
    </div>
  `;
}

async function sendResendEmail(apiKey, payload) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend ${res.status}: ${text}`);
  }
}

async function syncViaResendImmediate(email, source, coupon) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (audienceId) {
    await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        first_name: '',
        unsubscribed: false,
        audience_id: audienceId,
        data: { source, coupon },
      }),
    });
  }

  await sendResendEmail(apiKey, {
    from: 'Guanlan Energy <chart@metaphysicflow.com>',
    to: email,
    subject: /exit|life.?palace|preview/i.test(source || '')
      ? 'Your Life Palace Preview — Guanlan Energy'
      : 'Your Free Zi Wei Dou Shu Chart Preview is Ready',
    html: getWelcomeEmailHTML(coupon, source),
  });

  return true;
}

async function syncViaResendConfirm(email, source, token) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const confirmUrl = `${SITE}/api/confirm?token=${encodeURIComponent(token)}`;
  await sendResendEmail(apiKey, {
    from: 'Guanlan Energy <chart@metaphysicflow.com>',
    reply_to: 'readings@metaphysicflow.com',
    to: email,
    subject: 'Confirm to receive your Zi Wei reading',
    html: getConfirmEmailHTML(confirmUrl),
  });

  return true;
}

async function syncViaButtondown(email, source, coupon) {
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) return false;

  const notes = [`Source: ${source || 'website'}`];
  if (coupon) notes.push(`Coupon: ${coupon}`);

  await fetch('https://api.buttondown.com/v1/subscribers', {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      notes: notes.join(', '),
      tags: [source || 'website'],
    }),
  });

  return true;
}

async function parseBody(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await request.json();
    } catch {
      return {};
    }
  }
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const body = {};
    params.forEach((v, k) => {
      body[k] = v;
    });
    return body;
  }
  return {};
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: corsHeaders });
  }

  const body = await parseBody(request);
  const { email, source, coupon, tier, dob, hour } = body;
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return jsonResponse({ error: 'Invalid email' }, 400);
  }

  let kv = null;
  try {
    const mod = await import('@vercel/kv');
    kv = mod.kv;
  } catch {
    /* KV optional */
  }

  try {
    if (kv && process.env.RESEND_API_KEY) {
      const alreadyConfirmed = await kv.get(`${normalizedEmail}:confirmed`);
      if (alreadyConfirmed) {
        return jsonResponse({ status: 'already_confirmed' });
      }

      const token = crypto.randomUUID();
      const payload = JSON.stringify({
        email: normalizedEmail,
        tier: tier || '',
        dob: dob || '',
        hour: hour !== undefined && hour !== null ? String(hour) : '',
        source: source || 'website',
        coupon: coupon || '',
        ts: Date.now(),
      });
      await kv.set(token, payload, { ex: TOKEN_TTL });
      if (dob) await kv.set(`${normalizedEmail}:dob`, String(dob));
      if (hour !== undefined && hour !== null && hour !== '') {
        await kv.set(`${normalizedEmail}:hour`, String(hour));
      }
      const sent = await syncViaResendConfirm(normalizedEmail, source, token);
      if (!sent) {
        console.log('[subscribe] confirm email failed, falling back');
        await syncViaResendImmediate(normalizedEmail, source, coupon);
      }
      return jsonResponse({ ok: true, confirm: true });
    }

    const synced =
      (await syncViaResendImmediate(normalizedEmail, source, coupon)) ||
      (await syncViaButtondown(normalizedEmail, source, coupon));

    if (!synced) {
      console.log('[subscribe] captured (no ESP configured):', { email, source, coupon });
    }

    return jsonResponse({ ok: true, confirm: false });
  } catch (err) {
    console.error('[subscribe]', err);
    return jsonResponse({ error: 'Service error' }, 500);
  }
}
