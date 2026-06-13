export const config = { runtime: 'edge' };

const SITE = 'https://metaphysicflow.com';

const RESEND_FORM_HTML = `<h1>Link expired or invalid</h1>
<p>This confirmation link has expired (links are valid for 24 hours). Enter your email to receive a new one.</p>
<form method="POST" action="/api/subscribe">
<input type="hidden" name="resend" value="1"/>
<label for="email">Email address</label>
<input type="email" id="email" name="email" required{{EMAIL_VALUE}}/>
<button type="submit">Resend confirmation</button>
</form>
<p style="margin-top:1rem;font-size:0.85rem"><a href="${SITE}/free-chart.html" style="color:#C5984A">← Back to free chart</a></p>`;

function htmlPage(title, bodyHtml, canonical, extraHead) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title}</title>
<meta name="robots" content="noindex,follow"/>
<link rel="canonical" href="${canonical}"/>
${extraHead || ''}
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Georgia,serif;background:#060D1A;color:#C8D8E8;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem}
.wrap{max-width:520px;text-align:center}
h1{color:#C5984A;font-size:1.6rem;font-weight:300;margin-bottom:1rem}
p{color:#7FA0BA;line-height:1.7;margin-bottom:1.25rem}
a.btn{display:inline-block;padding:12px 24px;background:#C5984A;color:#060D1A;text-decoration:none;border-radius:2px;font-size:0.85rem;letter-spacing:0.06em}
form{margin-top:1.5rem;text-align:left}
label{display:block;font-size:0.85rem;margin-bottom:0.35rem;color:#C8D8E8}
input{width:100%;padding:10px 12px;border:1px solid rgba(197,152,74,0.35);background:#0a1528;color:#C8D8E8;border-radius:2px;margin-bottom:0.75rem}
button{padding:10px 18px;background:#C5984A;color:#060D1A;border:none;border-radius:2px;cursor:pointer}
</style>
</head>
<body><div class="wrap">${bodyHtml}</div></body>
</html>`;
}

function confirmedPage(dob, hour) {
  const consultParams = new URLSearchParams();
  if (dob) consultParams.set('dob', dob);
  if (hour) consultParams.set('hour', hour);
  const consultQuery = consultParams.toString();
  const consultUrl = `${SITE}/consultation.html${consultQuery ? `?${consultQuery}` : ''}#book`;
  return htmlPage(
    'Email Confirmed · Guanlan Energy',
    `<h1>Email Confirmed · Your Zi Wei Dou Shu Reading Is On Its Way</h1>
<p>Your subscription is confirmed. Open your free chart preview or book a deeper reading.</p>
<a class="btn" href="${consultUrl}">Continue to your reading →</a>
<p style="margin-top:1rem;font-size:0.85rem"><a href="${SITE}/free-chart.html?confirmed=1" style="color:#C5984A">Open your free chart →</a></p>`,
    `${SITE}/free-chart.html`,
    '<meta http-equiv="refresh" content="5;url=/free-chart.html?confirmed=1"/>'
  );
}

function expiredPage(emailPrefill) {
  const val = emailPrefill ? ` value="${emailPrefill.replace(/"/g, '&quot;')}"` : '';
  const bodyHtml = RESEND_FORM_HTML.replace('{{EMAIL_VALUE}}', val);
  return htmlPage(
    'Confirm Your Email · Guanlan Energy',
    bodyHtml,
    `${SITE}/free-chart.html`
  );
}

function getWelcomeEmailHTML(coupon, source) {
  const isLifePreview = /exit|life.?palace|preview/i.test(source || '');
  const title = isLifePreview ? 'Your Life Palace Preview' : 'Your Purple Star Chart Preview';
  const previewUrl = `${SITE}/free-chart.html`;
  const pdfUrl = process.env.PDF_URL;
  const pdfNote = isLifePreview
    ? (pdfUrl
      ? `<p style="margin-top:1rem;">Your Life Palace preview is ready:</p>
       <p><a href="${pdfUrl}" style="color:#E2C27A;font-weight:bold;">Download / view your Life Palace preview →</a></p>`
      : `<p style="margin-top:1rem;">Your Life Palace preview is ready on our chart page:</p>
       <p><a href="${previewUrl}" style="color:#E2C27A;font-weight:bold;">Open your free chart →</a></p>`)
    : `<p>Your free 12-palace preview is available at:<br>
        <a href="${previewUrl}" style="color:#E2C27A;">metaphysicflow.com/free-chart.html</a></p>`;
  return `
    <div style="max-width:560px;margin:0 auto;font-family:Georgia,serif;background:#060D1A;color:#C8D8E8;padding:2rem;">
      <h1 style="color:#C5984A;font-size:1.5rem;font-weight:300;">${title}</h1>
      <p>Thank you for confirming — your Zi Wei Dou Shu chart access is unlocked.</p>
      ${pdfNote}
      ${coupon ? `<p style="background:rgba(197,152,74,0.1);border:1px solid rgba(197,152,74,0.3);padding:1rem;border-radius:2px;">
        🎁 Your exclusive coupon: <strong style="color:#C5984A;">${coupon}</strong>
      </p>` : ''}
      <p style="font-style:italic;color:#7FA0BA;font-size:0.9rem;">— The Purple Star Reader | Guanlan Energy</p>
    </div>
  `;
}

async function sendConfirmedEmail(email, source, coupon) {
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
        data: { source, coupon, confirmed: true },
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

export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get('token') || '';

  if (!token) {
    return new Response(expiredPage(''), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  let kv = null;
  try {
    const mod = await import('@vercel/kv');
    kv = mod.kv;
  } catch {
    return new Response(expiredPage(''), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  let raw = null;
  try {
    raw = await kv.get(token);
  } catch (err) {
    console.error('[confirm] KV get', err);
  }

  if (!raw) {
    return new Response(expiredPage(''), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  let data = {};
  try {
    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    data = {};
  }

  const { email, tier, dob, hour, source, coupon, ts } = data;
  if (!email) {
    return new Response(expiredPage(''), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  try {
    await kv.set(`${email}:confirmed`, 'true');
    if (dob) await kv.set(`${email}:dob`, String(dob));
    if (hour) await kv.set(`${email}:hour`, String(hour));
    await sendConfirmedEmail(email, source, coupon);
    await kv.delete(token);
  } catch (err) {
    console.error('[confirm]', err);
    return new Response(expiredPage(email), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  console.log('[confirm] confirmed', { email, tier, ts });
  return new Response(confirmedPage(dob || '', hour || ''), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
