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

  return new Response(JSON.stringify({ ok: true }), {
    status:  200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
})
