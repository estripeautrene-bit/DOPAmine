const RESEND_KEY     = Deno.env.get('RESEND_API_KEY')!
const AUDIENCE_ID    = Deno.env.get('RESEND_AUDIENCE_ID') ?? ''

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST')   return new Response('Method not allowed', { status: 405, headers: CORS })

  let email: string
  try {
    const body = await req.json()
    email = (body.email ?? '').trim().toLowerCase()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }

  // Add to Resend Audience
  if (AUDIENCE_ID) {
    await fetch(`https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, unsubscribed: false }),
    }).catch(() => {})
  }

  // Notify hello@mydopa.app
  await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      from:    'MyDopa <hello@mydopa.app>',
      to:      ['hello@mydopa.app'],
      subject: `New waitlist signup: ${email}`,
      html:    `<p><strong>${email}</strong> just joined the MyDopa waitlist.</p>`,
    }),
  }).catch(() => {})

  // Confirmation email to the user
  await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      from:    'MyDopa <hello@mydopa.app>',
      to:      [email],
      subject: 'You are on the MyDopa list.',
      html:    `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D0A1A;font-family:'DM Sans',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0A1A;padding:48px 24px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr><td style="padding-bottom:32px;">
        <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#FAF9F7;letter-spacing:-.3px;">MyDopa</span>
      </td></tr>
      <tr><td style="padding-bottom:24px;">
        <h1 style="margin:0;font-family:Georgia,serif;font-size:32px;font-weight:700;color:#FAF9F7;line-height:1.2;">You are on the list.</h1>
      </td></tr>
      <tr><td style="padding-bottom:24px;">
        <p style="margin:0;font-size:16px;color:rgba(250,249,247,0.7);line-height:1.75;">Your Progress Profile is saved. When MyDopa launches, you will be first — at founding member pricing, locked for life.</p>
      </td></tr>
      <tr><td style="padding-bottom:32px;">
        <p style="margin:0;font-size:16px;color:rgba(250,249,247,0.7);line-height:1.75;">Most people are building more than they realize. The brain just filters it out before it registers. MyDopa fixes that — 2 minutes a day.</p>
      </td></tr>
      <tr><td style="padding-bottom:48px;border-top:1px solid rgba(168,85,247,.2);padding-top:24px;">
        <p style="margin:0;font-size:13px;color:rgba(250,249,247,0.35);line-height:1.6;">You received this because you joined the MyDopa waitlist. Reply to this email any time.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`,
    }),
  }).catch(() => {})

  return new Response(JSON.stringify({ ok: true }), {
    status:  200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
})
