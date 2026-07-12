import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const q3Map: Record<string, number> = {
  'takes-a-while':    1,
  'feel-distant':     2,
  'not-enough-solid': 3,
  'call-up-fast':     4,
}
const q4Map: Record<string, number> = {
  'rarely-notice':   1,
  'gone-by-bedtime': 2,
  'no-proof':        3,
  'fuels-next-day':  4,
}

// ─── Email 1: Progress Profile ────────────────────────────────

const FONT = `font-family:-apple-system,Arial,sans-serif`

const PROFILES: Record<string, { label: string; tagline: string }> = {
  'invisible-progress': { label: 'Invisible Progress', tagline: 'You are doing more than your brain is letting you keep.' },
  'feeling-behind':     { label: 'Feeling Behind',     tagline: 'You have been measuring yourself by the gap. DOPA measures you by what is already building.' },
  'identity-lag':       { label: 'Identity Lag',       tagline: 'You are further along than your brain has learned to show you yet. DOPA closes that gap.' },
  'self-trust-gap':     { label: 'Self-Trust Gap',     tagline: 'You have handled more than you remember. DOPA keeps the record so it is always within reach.' },
  'life-on-pause':      { label: 'Life on Pause',      tagline: 'You are doing more than pause feels like.' },
}

function scorecardBlock(profile: string | null, score: number): string {
  const data = profile ? PROFILES[profile] : null
  if (!data) return ''
  const fill = Math.round((score / 13) * 100)
  const bar =
    `<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;height:6px;"><tr>` +
    `<td width="${fill}%" style="background:#A855F7;height:6px;border-radius:3px 0 0 3px;"></td>` +
    `<td style="background:rgba(255,255,255,0.1);height:6px;border-radius:0 3px 3px 0;"></td>` +
    `</tr></table>`
  return (
    `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">` +
    `<tr><td style="background:#1A1033;border-radius:12px;padding:24px;">` +
    `<div style="font-size:0.6rem;font-weight:700;color:rgba(255,176,32,0.6);letter-spacing:0.2em;text-transform:uppercase;margin-bottom:12px;${FONT};">Your Progress Profile</div>` +
    `<div style="font-size:1.4rem;font-weight:800;color:#A855F7;font-family:Georgia,'Times New Roman',serif;margin-bottom:16px;">${data.label}</div>` +
    `<div style="font-size:0.8rem;color:rgba(255,255,255,0.5);margin-bottom:4px;${FONT};">Visibility &nbsp;·&nbsp; ${score} / 13</div>` +
    bar +
    `<div style="font-size:0.9rem;color:rgba(255,255,255,0.6);font-style:italic;font-family:Georgia,'Times New Roman',serif;line-height:1.6;">"${data.tagline}"</div>` +
    `</td></tr></table>`
  )
}

function buildEmail1Html(name: string, profile: string | null, score: number): string {
  const header =
    `<div style="text-align:center;margin-bottom:40px;">` +
    `<img src="https://mydopa.app/assets/mascot.png" width="64" height="64" alt="Dopa" style="display:block;margin:0 auto 12px;">` +
    `<div style="font-size:1.1rem;letter-spacing:-0.3px;line-height:1.1;${FONT};">` +
    `<span style="font-weight:900;color:#FFFFFF;">My</span>` +
    `<span style="font-weight:600;color:#A855F7;">Dopa</span>` +
    `<span style="font-size:0.36em;font-weight:700;vertical-align:super;color:#A855F7;">&#8482;</span>` +
    `</div>` +
    `<div style="font-size:0.65rem;font-weight:600;color:rgba(255,255,255,0.4);letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;${FONT};">GREAT YESTERDAY. BETTER TOMORROW.</div>` +
    `</div>`
  const body =
    `<p style="margin:0 0 16px;font-size:0.95rem;color:#F5F5F0;line-height:1.7;${FONT};">Your answers told DOPA something. Here is what it sees.</p>` +
    scorecardBlock(profile, score) +
    `<p style="margin:16px 0 0;font-size:0.95rem;color:#F5F5F0;line-height:1.7;${FONT};">MyDopa is built for exactly this. It captures evidence of who you already are — one moment at a time — so your brain can finally keep it.</p>`
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0E0B1A;${FONT};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0E0B1A;">
<tr><td align="center" style="padding:40px 24px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="padding:48px 48px 56px;background-color:#0E0B1A;border-radius:16px;overflow:hidden;">
  ${header}
  <div style="font-size:0.65rem;font-weight:700;color:rgba(255,176,32,0.7);letter-spacing:0.2em;text-transform:uppercase;margin-bottom:16px;${FONT};">YOUR PROGRESS PROFILE</div>
  <div style="font-size:3rem;font-weight:900;color:#B57BF7;font-family:Georgia,'Times New Roman',serif;line-height:1;margin-bottom:8px;">${name}.</div>
  <div style="font-size:1.9rem;font-weight:800;color:white;font-family:Georgia,'Times New Roman',serif;line-height:1.25;margin-bottom:28px;">DOPA read<br/>your answers.</div>
  <div style="font-size:0.95rem;color:#F5F5F0;line-height:1.7;margin-bottom:24px;${FONT};">${body}</div>
  <p style="margin:0 0 32px;font-size:0.95rem;color:#F5F5F0;${FONT};">— DOPA</p>
  <table cellpadding="0" cellspacing="0"><tr>
    <td style="background:#7B2FBE;border-radius:50px;">
      <a href="https://mydopa.app" style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:600;color:white;text-decoration:none;${FONT};">See what's waiting &#8594;</a>
    </td>
  </tr></table>
  <div style="margin-top:48px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);">
    <span style="font-size:12px;${FONT};">
      <a href="https://mydopa.app" style="color:rgba(255,176,32,0.4);text-decoration:none;">mydopa.app</a>
      <span style="color:rgba(255,176,32,0.4);"> &nbsp;&#183;&nbsp; </span>
      <a href="mailto:hello@mydopa.app?subject=unsubscribe" style="color:rgba(255,176,32,0.4);text-decoration:none;">Unsubscribe</a>
    </span>
  </div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST')   return new Response('Method not allowed', { status: 405, headers: CORS })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }

  const email = ((body.email ?? '') as string).trim().toLowerCase()
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }

  const answers = (body.answers ?? {}) as Record<string, unknown>
  const first_name  = ((answers.first_name ?? '') as string).trim() || null
  const age_group   = (answers.age_group  ?? null) as string | null
  const sex         = (answers.sex        ?? null) as string | null
  const q1_profile  = (answers.q1_profile ?? null) as string | null
  const q2_likert   = Number(answers.q2_likert) || 0
  const q3_evidence = (answers.q3_evidence ?? '') as string
  const q4_good_day = (answers.q4_good_day ?? '') as string

  const visibility_score =
    q2_likert +
    (q3Map[q3_evidence] ?? 0) +
    (q4Map[q4_good_day] ?? 0)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { error } = await supabase
    .from('waitlist_subscribers')
    .upsert({
      email,
      first_name,
      age_group,
      sex,
      quiz_result:       q1_profile,
      visibility_score,
      quiz_answers:      answers,
      consent_status:    'subscribed',
      consent_timestamp: new Date().toISOString(),
    }, { onConflict: 'email' })

  if (error) {
    console.error('Supabase upsert error:', error)
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }

  // Email 1 to subscriber — fires only after successful DB upsert
  const displayFirst = first_name
    ? first_name.charAt(0).toUpperCase() + first_name.slice(1)
    : 'there'
  await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      from:    'MyDopa <hello@mydopa.app>',
      to:      [email],
      subject: 'Your Progress Profile is in.',
      html:    buildEmail1Html(displayFirst, q1_profile, visibility_score),
    }),
  }).catch((err) => console.error('Email 1 send failed:', err))

  // Internal notification — fires only after successful DB upsert
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
