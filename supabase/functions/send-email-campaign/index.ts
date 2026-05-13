import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!
const PAYPAL_URL = Deno.env.get('PAYPAL_ME_URL') ?? 'PAYPAL_ME_URL_PLACEHOLDER'

// ─── Design tokens ────────────────────────────────────────────

const FONT = `font-family:'DM Sans',Arial,sans-serif`

// ─── Base template ────────────────────────────────────────────

function wrap(inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#06000D;${FONT};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#06000D;">
<tr><td align="center" style="padding:40px 24px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="padding:0 0 32px 0;">
  <span style="font-size:22px;font-weight:700;color:#F5F5F0;letter-spacing:-0.5px;">DOPA</span><span style="font-size:22px;font-weight:400;color:#A855F7;">mine</span><br/>
  <span style="font-size:13px;color:#888888;">Your dopamine. From the inside.</span>
</td></tr>
<tr><td style="padding:0;">${inner}</td></tr>
<tr><td style="height:40px;"></td></tr>
<tr><td style="padding:24px 0 0 0;border-top:1px solid #1A1530;">
  <span style="font-size:12px;color:#444444;${FONT};">
    <a href="https://mydopa.app" style="color:#444444;text-decoration:none;">mydopa.app</a>
    &nbsp;·&nbsp;
    <a href="mailto:hello@mydopa.app?subject=unsubscribe" style="color:#444444;text-decoration:none;">Unsubscribe</a>
  </span>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function p(text: string): string {
  return `<p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#F5F5F0;${FONT};">${text}</p>`
}

function btn(label: string, url: string, bg = '#7B2FBE', fg = '#ffffff'): string {
  return `<table cellpadding="0" cellspacing="0" style="margin-top:32px;"><tr>
<td style="background:${bg};border-radius:8px;">
  <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:${fg};text-decoration:none;${FONT};">${label}</a>
</td></tr></table>`
}

// ─── Email 1: Welcome ─────────────────────────────────────────

function tmplWelcome(name: string): string {
  return wrap(
    p(`${name},`) +
    p('The dare is live. 7 days. 3 good things.') +
    p('The bar is low. You just have to show up.') +
    p('On Day 7, something lands in your inbox.') +
    p('Until then — go find your first one.') +
    p('— DOPAmine') +
    btn('Open the app →', 'https://mydopa.app/app.html')
  )
}

// ─── Email 2A: Day 3 Active ───────────────────────────────────

function tmplDay3Active(name: string): string {
  return wrap(
    p(`${name},`) +
    p('Most people quit before this.') +
    p("You didn't. Something's forming.") +
    p('Keep going.') +
    p('— DOPAmine') +
    btn('See your streak →', 'https://mydopa.app/app.html')
  )
}

// ─── Email 2B: Day 3 Dormant ──────────────────────────────────

function tmplDay3Dormant(name: string): string {
  return wrap(
    p(`${name},`) +
    p("3 good things. That's it. The whole practice.") +
    p("You've still got 4 days to feel the difference.") +
    p('The dare is still open. So is the app.') +
    p('— DOPAmine') +
    btn('Find my 3 →', 'https://mydopa.app/app.html', '#FFB020', '#1A0030')
  )
}

// ─── Email 3: Day 7 Completion ────────────────────────────────

function tmplDay7(name: string): string {
  return wrap(
    p(`${name},`) +
    p('Seven days ago, this was a bet.') +
    p("Now it's something else.") +
    p("Your brain has been doing this quietly the whole time — looking for the good, holding onto it, building on it. You gave it 7 days and something is different. That's not a claim. That's what you built.") +
    p("Tomorrow morning, a note lands in your inbox. From the person who built this.") +
    p("Don't miss it.") +
    p('— DOPAmine') +
    btn('See your week →', 'https://mydopa.app/app.html')
  )
}

// ─── Email 4: Day 8 Founding Member ──────────────────────────
// SEND CALL COMMENTED OUT — re@mydopa.app not yet active in Resend.
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
  return wrap(
    p(`${name},`) +
    p("It can't anymore.") +
    p("That's not a claim. That's what consistent attention to the good things actually does. Fourteen days ago you were walking past the same moments you're now holding onto. The moments didn't change. Your brain did.") +
    p('The founding member offer is still open. Not forever — but still open. $17.95/year. Locked for life.') +
    p("If you've felt something shift in the last two weeks, this is how you keep it.") +
    p("If you're not ready, no pressure.") +
    p('Thank you for the 14 days.') +
    p('Rene<br/>Founder, DOPAmine') +
    btn('Become a founding member →', PAYPAL_URL)
  )
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
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw
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
    const rawName   = sub.first_name || authUser.raw_user_meta_data?.first_name || authUser.email.split('@')[0]
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
    // SEND COMMENTED OUT — re@mydopa.app not yet active in Resend.
    // To activate: uncomment the sendEmail block below.
    if (ageDays >= 8 && ageDays <= 9 && !sub.paid && !sub.email_day8_sent) {
      counts.day8_pending++
      // const ok = await sendEmail({
      //   from: 'Rene <re@mydopa.app>',
      //   to: email,
      //   subject: 'You actually did it.',
      //   html: tmplDay8(name)
      // })
      // if (ok) {
      //   await supabase.from('push_subscriptions').update({ email_day8_sent: true }).eq('id', sub.id)
      // }
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
