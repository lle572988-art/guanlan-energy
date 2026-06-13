// Vercel Serverless Function — Email Capture
// Env: RESEND_API_KEY, RESEND_AUDIENCE_ID (optional)
//      BUTTONDOWN_API_KEY (legacy fallback)

function getWelcomeEmailHTML(coupon) {
  return `
    <div style="max-width:560px;margin:0 auto;font-family:Georgia,serif;background:#060D1A;color:#C8D8E8;padding:2rem;">
      <h1 style="color:#C5984A;font-size:1.5rem;font-weight:300;">Your Purple Star Chart Preview</h1>
      <p>Thank you for generating your Zi Wei Dou Shu chart.</p>
      <p>Your free 12-palace preview is available at:<br>
        <a href="https://metaphysicflow.com/free-chart.html" style="color:#E2C27A;">
          metaphysicflow.com/free-chart.html
        </a>
      </p>
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
      subject: 'Your Free Zi Wei Dou Shu Chart Preview is Ready',
      html: getWelcomeEmailHTML(coupon),
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

export default async function handler(req, res) {
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, source, coupon } = req.body || {};
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const synced =
      (await syncViaResend(email, source, coupon)) ||
      (await syncViaButtondown(email, source, coupon));

    if (!synced) {
      console.log('[subscribe] captured (no ESP configured):', { email, source, coupon });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[subscribe]', err);
    return res.status(500).json({ error: 'Service error' });
  }
}
