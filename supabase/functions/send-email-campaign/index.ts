import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!
const PAYPAL_URL = Deno.env.get('PAYPAL_ME_URL') ?? 'PAYPAL_ME_URL_PLACEHOLDER'

// ─── Design tokens ────────────────────────────────────────────

const FONT = `font-family:-apple-system,Arial,sans-serif`

// ─── Base template ────────────────────────────────────────────

function wrap(opts: {
  eyebrow: string
  name: string
  headline: string
  body: string
  sig: string
  ctaLabel: string
  ctaUrl: string
  ctaBorder?: string
  ctaColor?: string
}): string {
  const border = opts.ctaBorder ?? 'rgba(255,255,255,0.45)'
  const color  = opts.ctaColor  ?? 'white'
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#0E0B1A;${FONT};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0E0B1A;">
<tr><td align="center" style="padding:40px 24px;">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
<tr><td style="position:relative;padding:48px 48px 56px;background:#0E0B1A;border-radius:16px;overflow:hidden;">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 140% 80% at 50% 85%,rgba(255,176,32,0.85) 0%,rgba(200,110,0,0.55) 28%,rgba(120,60,0,0.35) 50%,rgba(60,25,0,0.15) 68%,transparent 82%);pointer-events:none;"></div>
  <div style="position:relative;">
    <table cellpadding="0" cellspacing="0" style="margin-bottom:40px;"><tr>
      <td style="padding-right:12px;vertical-align:middle;">
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#7B2FBE,#B57BF7);border-radius:11px;text-align:center;line-height:48px;font-size:26px;font-weight:900;color:white;font-style:italic;font-family:Georgia,serif;">D</div>
      </td>
      <td style="vertical-align:middle;">
        <div style="font-size:1.1rem;font-weight:900;color:white;letter-spacing:-0.3px;line-height:1.1;${FONT};">DOPA<span style="font-weight:400;color:#B57BF7;">mine</span></div>
        <div style="font-size:0.65rem;font-weight:600;color:rgba(255,255,255,0.4);letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;${FONT};">GREAT YESTERDAY. BETTER TOMORROW.</div>
      </td>
    </tr></table>
    <div style="font-size:0.65rem;font-weight:700;color:rgba(255,176,32,0.7);letter-spacing:0.2em;text-transform:uppercase;margin-bottom:16px;${FONT};">${opts.eyebrow}</div>
    <div style="font-size:3rem;font-weight:900;color:#B57BF7;font-family:Georgia,'Times New Roman',serif;line-height:1;margin-bottom:8px;">${opts.name}.</div>
    <div style="font-size:1.9rem;font-weight:800;color:white;font-family:Georgia,'Times New Roman',serif;line-height:1.25;margin-bottom:28px;">${opts.headline}</div>
    <div style="font-size:0.95rem;color:rgba(255,255,255,0.65);line-height:1.7;margin-bottom:24px;${FONT};">${opts.body}</div>
    <p style="margin:0 0 32px;font-size:0.95rem;color:rgba(255,255,255,0.65);${FONT};">${opts.sig}</p>
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="border:1.5px solid ${border};border-radius:50px;">
        <a href="${opts.ctaUrl}" style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:600;color:${color};text-decoration:none;${FONT};">${opts.ctaLabel}</a>
      </td>
    </tr></table>
    <div style="margin-top:48px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);">
      <span style="font-size:12px;${FONT};">
        <a href="https://mydopa.app" style="color:rgba(255,176,32,0.4);text-decoration:none;">mydopa.app</a>
        <span style="color:rgba(255,176,32,0.4);"> &nbsp;·&nbsp; </span>
        <a href="mailto:hello@mydopa.app?subject=unsubscribe" style="color:rgba(255,176,32,0.4);text-decoration:none;">Unsubscribe</a>
      </span>
    </div>
  </div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function bp(text: string): string {
  return `<p style="margin:0 0 16px;">${text}</p>`
}

function bpLast(text: string): string {
  return `<p style="margin:0;">${text}</p>`
}

function bpBreak(): string {
  return `<p style="margin:0 0 20px;">&nbsp;</p>`
}

// ─── Email 1: Welcome ─────────────────────────────────────────

function tmplWelcome(name: string): string {
  return wrap({
    eyebrow:  'YOUR DOPAMINE. FROM THE INSIDE.',
    name,
    headline: 'You said<br/>you\'d do it.',
    body:     bp('The dare is live. 7 days. 3 good things.') +
              bp('The bar is low. You just have to show up.') +
              bpBreak() +
              bp('On Day 7, something lands in your inbox.') +
              bpLast('Until then — go find your first one.'),
    sig:      '— DOPAmine',
    ctaLabel: 'Open the app →',
    ctaUrl:   'https://mydopa.app/app.html'
  })
}

// ─── Email 2A: Day 3 Active ───────────────────────────────────

function tmplDay3Active(name: string): string {
  return wrap({
    eyebrow:  'DAY 3',
    name,
    headline: 'Most people<br/>quit before this.',
    body:     bp('You didn\'t.') +
              bp('Something\'s forming.') +
              bpBreak() +
              bpLast('Keep going.'),
    sig:      '— DOPAmine',
    ctaLabel: 'See your streak →',
    ctaUrl:   'https://mydopa.app/app.html'
  })
}

// ─── Email 2B: Day 3 Dormant ──────────────────────────────────

function tmplDay3Dormant(name: string): string {
  return wrap({
    eyebrow:   'DAY 3',
    name,
    headline:  'The bar<br/>is low.',
    body:      bp('3 good things. That\'s it. The whole practice.') +
               bpBreak() +
               bp('You\'ve still got 4 days to feel the difference.') +
               bpLast('The dare is still open. So is the app.'),
    sig:       '— DOPAmine',
    ctaLabel:  'Find my 3 →',
    ctaUrl:    'https://mydopa.app/app.html',
    ctaBorder: 'rgba(255,176,32,0.6)',
    ctaColor:  '#FFB020'
  })
}

// ─── Email 3: Day 7 Completion ────────────────────────────────

function tmplDay7(name: string): string {
  return wrap({
    eyebrow:  'DAY 7',
    name,
    headline: 'One week.<br/>You proved it.',
    body:     bp('Seven days ago, this was a bet. Now it\'s something else.') +
              bpBreak() +
              bp('Your brain has been doing this quietly the whole time — looking for the good, holding onto it, building on it.') +
              bpBreak() +
              bp('That\'s not a claim. That\'s what you built.') +
              bpBreak() +
              bpLast('Tomorrow morning, a note lands in your inbox. Don\'t miss it.'),
    sig:      '— DOPAmine',
    ctaLabel: 'See your week →',
    ctaUrl:   'https://mydopa.app/app.html'
  })
}

// ─── Email 4: Day 8 Founding Member ──────────────────────────
// SEND COMMENTED OUT — re@mydopa.app not yet active in Resend.
// Activate: uncomment the sendEmail call in runDailyJob and the
// cron.unschedule line is unnecessary since this runs in the daily job.

function tmplDay8(name: string): string {
  const pp = (t: string) =>
    `<p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#111111;${FONT};">${t}</p>`
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ffffff;${FONT};">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:48px;max-width:560px;">
${pp(`${name},`)}
${pp('Seven days. You showed up.')}
${pp("I've been watching the numbers on my end and I want you to know that most people don't make it here. Something caught your attention and you kept going with it. That is not nothing.")}
${pp("I built this because I believe most people can find what you found — in 7 days — if they have the right tool. You've had 7 days. You tell me if I'm wrong.")}
${pp("Here's what I want to offer you.")}
${pp("As one of the first people who has actually used this product, I want to give you founding member access at a price that will never exist again. $17.95 for the full year — locked at that rate for as long as you stay. When DOPAmine goes public, the annual plan will be $69.99. You get it at $17.95, forever, because you were here first.")}
${pp("If you're in, reply to this email and I'll send you a link directly.")}
${pp("If you're not ready, no pressure. The app stays free through Day 14 and I'll be in touch again then.")}
${pp('Either way — thank you for being here early.')}
${pp('Rene<br/>Founder, DOPAmine')}
<p style="margin:40px 0 0;font-size:12px;color:#999999;${FONT};">If you'd prefer not to hear from me, reply 'unsubscribe' and I'll remove you immediately.</p>
</td></tr>
</table>
</body>
</html>`
}

// ─── Email 5: Day 14 Transformation ──────────────────────────

function tmplDay14(name: string): string {
  return wrap({
    eyebrow:  'DAY 14',
    name,
    headline: '14 days ago your<br/>brain filtered this out.',
    body:     bp('It can\'t anymore.') +
              bpBreak() +
              bp('The moments didn\'t change. Your brain did.') +
              bpBreak() +
              bp('The founding member offer is still open. Not forever — but still open.') +
              bpBreak() +
              bp('$17.95/year. Locked for life.') +
              bpLast('If you\'ve felt something shift — this is how you keep it.'),
    sig:      '— Rene, Founder',
    ctaLabel: 'Become a founding member →',
    ctaUrl:   PAYPAL_URL
  })
}

// ─── Resend sender ────────────────────────────────────────────

async function sendEmail(opts: {
  from: string
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(opts)
  })
  if (!res.ok) {
    console.error('Resend error:', res.status, await res.text())
  }
  return res.ok
}

function displayName(raw: string): string {
  if (!raw) return raw
  const first = raw.split(/[\s.]/)[0]
  return first.charAt(0).toUpperCase() + first.slice(1)
}

// ─── Action: process_queue ────────────────────────────────────
// Runs every minute via pg_cron. Sends welcome emails for new signups.

async function processQueue(supabase: ReturnType<typeof createClient>): Promise<{
  sent: number; failed: number; skipped: number
}> {
  let sent = 0, failed = 0, skipped = 0

  const { data: queue, error } = await supabase
    .from('email_queue')
    .select('id, user_id')
    .eq('status', 'pending')
    .eq('email_type', 'welcome')
    .order('created_at', { ascending: true })
    .limit(50)

  if (error || !queue?.length) return { sent, failed, skipped }

  for (const item of queue) {
    const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(item.user_id)

    if (userErr || !user?.email) {
      await supabase.from('email_queue').update({
        status: 'failed', error: 'user_not_found',
        processed_at: new Date().toISOString()
      }).eq('id', item.id)
      failed++
      continue
    }

    // Check push_subscriptions row (may not exist yet for new signups)
    const { data: sub } = await supabase
      .from('push_subscriptions')
      .select('id, email_welcome_sent, first_name')
      .eq('user_id', item.user_id)
      .maybeSingle()

    if (sub?.email_welcome_sent) {
      await supabase.from('email_queue').update({
        status: 'skipped', processed_at: new Date().toISOString()
      }).eq('id', item.id)
      skipped++
      continue
    }

    const rawName = sub?.first_name
      || user.raw_user_meta_data?.first_name
      || user.raw_user_meta_data?.full_name
      || user.raw_user_meta_data?.name
      || user.email.split('@')[0]
    const name = displayName(rawName)

    const ok = await sendEmail({
      from: 'DOPAmine <hello@mydopa.app>',
      to: user.email,
      subject: "You said you'd do it.",
      html: tmplWelcome(name)
    })

    if (ok) {
      await supabase.from('email_queue').update({
        status: 'sent', processed_at: new Date().toISOString()
      }).eq('id', item.id)
      if (sub) {
        await supabase.from('push_subscriptions').update({
          email_welcome_sent: true,
          first_name: sub.first_name ?? rawName
        }).eq('id', sub.id)
      }
      sent++
    } else {
      await supabase.from('email_queue').update({
        status: 'failed', error: 'resend_error',
        processed_at: new Date().toISOString()
      }).eq('id', item.id)
      failed++
    }
  }

  return { sent, failed, skipped }
}

// ─── Action: daily ────────────────────────────────────────────
// Runs at 08:00 Panama (13:00 UTC) via pg_cron.
// Updates stats + sends day3/7/8/14 emails.

async function runDailyJob(supabase: ReturnType<typeof createClient>): Promise<Record<string, number>> {
  const counts: Record<string, number> = {
    stats_updated: 0,
    day3_active: 0, day3_dormant: 0,
    day7: 0, day8_pending: 0, day14: 0
  }

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('id, user_id, first_name, paid, email_day3_sent, email_day7_sent, email_day8_sent, email_day14_sent')
    .eq('active', true)

  if (error || !subs?.length) return counts

  // Fetch all auth users in one call (up to 1000; paginate if app grows)
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000, page: 1 })
  const authMap = new Map(users.map((u: any) => [u.id, u]))

  // Win counts per user (all time)
  const userIds = subs.map((s: any) => s.user_id)
  const { data: moments } = await supabase
    .from('moments')
    .select('user_id')
    .in('user_id', userIds)

  const winsByUser: Record<string, number> = {}
  for (const m of moments ?? []) {
    winsByUser[m.user_id] = (winsByUser[m.user_id] ?? 0) + 1
  }

  const now = Date.now()

  for (const sub of subs) {
    const authUser = authMap.get(sub.user_id) as any
    if (!authUser?.email) continue

    const ageDays   = Math.floor((now - new Date(authUser.created_at).getTime()) / 86400000)
    const winsTotal = winsByUser[sub.user_id] ?? 0
    const rawName   = sub.first_name
      || authUser.raw_user_meta_data?.first_name
      || authUser.raw_user_meta_data?.full_name
      || authUser.raw_user_meta_data?.name
      || authUser.email.split('@')[0]
    const name      = displayName(rawName)
    const email     = authUser.email as string

    // Update account_age_days, wins_total, first_name
    await supabase.from('push_subscriptions').update({
      account_age_days: ageDays,
      wins_total: winsTotal,
      first_name: rawName
    }).eq('id', sub.id)
    counts.stats_updated++

    // ── Email 2A — Day 3 Active ───────────────────────────────
    if (ageDays >= 3 && ageDays <= 4 && !sub.email_day3_sent && winsTotal >= 1) {
      const ok = await sendEmail({
        from: 'DOPAmine <hello@mydopa.app>',
        to: email,
        subject: 'Three days in.',
        html: tmplDay3Active(name)
      })
      if (ok) {
        await supabase.from('push_subscriptions').update({ email_day3_sent: true }).eq('id', sub.id)
        counts.day3_active++
      }
    }

    // ── Email 2B — Day 3 Dormant ──────────────────────────────
    if (ageDays >= 3 && ageDays <= 4 && !sub.email_day3_sent && winsTotal === 0) {
      const ok = await sendEmail({
        from: 'DOPAmine <hello@mydopa.app>',
        to: email,
        subject: 'The bar is low.',
        html: tmplDay3Dormant(name)
      })
      if (ok) {
        await supabase.from('push_subscriptions').update({ email_day3_sent: true }).eq('id', sub.id)
        counts.day3_dormant++
      }
    }

    // ── Email 3 — Day 7 Completion ────────────────────────────
    if (ageDays >= 7 && ageDays <= 8 && !sub.email_day7_sent) {
      const ok = await sendEmail({
        from: 'DOPAmine <hello@mydopa.app>',
        to: email,
        subject: 'One week. You just proved the dare works.',
        html: tmplDay7(name)
      })
      if (ok) {
        await supabase.from('push_subscriptions').update({ email_day7_sent: true }).eq('id', sub.id)
        counts.day7++
      }
    }

    // ── Email 4 — Day 8 Founding Member ──────────────────────
    if (ageDays >= 8 && ageDays <= 9 && !sub.paid && !sub.email_day8_sent) {
      counts.day8_pending++
      const ok = await sendEmail({
        from: 'Rene <re@mydopa.app>',
        to: email,
        subject: 'You actually did it.',
        html: tmplDay8(name)
      })
      if (ok) {
        await supabase.from('push_subscriptions').update({ email_day8_sent: true }).eq('id', sub.id)
      }
    }

    // ── Email 5 — Day 14 Transformation ──────────────────────
    if (ageDays >= 14 && ageDays <= 15 && !sub.paid && !sub.email_day14_sent) {
      const ok = await sendEmail({
        from: 'DOPAmine <hello@mydopa.app>',
        to: email,
        subject: '14 days ago, your brain was filtering this out.',
        html: tmplDay14(name)
      })
      if (ok) {
        await supabase.from('push_subscriptions').update({ email_day14_sent: true }).eq('id', sub.id)
        counts.day14++
      }
    }
  }

  return counts
}

// ─── Main ─────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const body   = await req.json().catch(() => ({}))
    const action = (body.action ?? '') as string

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    if (action === 'process_queue') {
      const result = await processQueue(supabase)
      return new Response(JSON.stringify({ action, ...result }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (action === 'daily') {
      const result = await runDailyJob(supabase)
      return new Response(JSON.stringify({ action, ...result }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(
      JSON.stringify({ error: 'action must be process_queue | daily' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
