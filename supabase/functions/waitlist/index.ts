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
