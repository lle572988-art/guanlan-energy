// Vercel Edge Function — Email Capture
// Env: RESEND_API_KEY, RESEND_AUDIENCE_ID (optional)
//      BUTTONDOWN_API_KEY (legacy fallback)

export const config = { runtime: 'edge' };

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
  const previewUrl = 'https://metaphysicflow.com/free-chart.html';
  const pdfUrl = process.env.PDF_URL || previewUrl;
  const pdfNote = isLifePreview
    ? `<p style="margin-top:1rem;">Your Life Palace preview is ready — open your chart and scroll to the Life Palace reading:</p>
       <p><a href="${pdfUrl}" style="color:#E2C27A;font-weight:bold;">Download / view your Life Palace preview →</a></p>
       <p style="font-size:0.9rem;color:#7FA0BA;">We will also add you to our priority queue with a personal note when your full written reading slot opens.</p>`
    : `<p>Your free 12-palace preview is available at:<br>
        <a href="${previewUrl}" style="color:#E2C27A;">metaphysicflow.com/free-chart.html</a></p>`;
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

async function syncViaResend(email, source, coupon) {
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

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Guanlan Energy <chart@metaphysicflow.com>',
      to: email,
      subject: /exit|life.?palace|preview/i.test(source || '')
        ? 'Your Life Palace Preview — Guanlan Energy'
        : 'Your Free Zi Wei Dou Shu Chart Preview is Ready',
      html: getWelcomeEmailHTML(coupon, source),
    }),
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

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: corsHeaders });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { email, source, coupon } = body;
  if (!email || !email.includes('@')) {
    return jsonResponse({ error: 'Invalid email' }, 400);
  }

  try {
    const synced =
      (await syncViaResend(email, source, coupon)) ||
      (await syncViaButtondown(email, source, coupon));

    if (!synced) {
      console.log('[subscribe] captured (no ESP configured):', { email, source, coupon });
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error('[subscribe]', err);
    return jsonResponse({ error: 'Service error' }, 500);
  }
}
