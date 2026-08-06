import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_KEY   = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ─── Sequence config ───────────────────────────────────────────
// Delay = days from email_1_sent_at before sending email N
const SEQUENCE: { n: 2 | 3 | 4 | 5; days: number; subject: string; buildHtml: (name: string, unsub: string) => string }[] = [
  { n: 2, days: 2,  subject: 'One bad hour can wreck a good day.',              buildHtml: buildEmail2Html },
  { n: 3, days: 5,  subject: "You don't have a discipline problem.",            buildHtml: buildEmail3Html },
  { n: 4, days: 9,  subject: 'How MyDopa turns daily effort into proof.',       buildHtml: buildEmail4Html },
  { n: 5, days: 14, subject: "Why I'm building MyDopa.",                        buildHtml: buildEmail5Html },
]

// ─── Shared helpers ────────────────────────────────────────────
const GF = `<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>`

const CSS = `
  body{margin:0;padding:0;background:#EAE8E3;font-family:'DM Sans',-apple-system,sans-serif;}
  .preheader{display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#FAFAF7;}
  .email-shell{max-width:600px;margin:40px auto;background:#FAFAF7;border-radius:16px;overflow:hidden;box-shadow:0 2px 24px rgba(0,0,0,0.06);}
  .pad{padding:36px 40px 8px 40px;}
  .center{text-align:center;}
  .mascot{width:190px;margin:0 0 6px 0;}
  .logo{font-family:'Playfair Display',serif;font-weight:900;font-size:26px;color:#06000D;}
  .logo span{color:#7B2FBE;}
  .logo sup{font-size:11px;font-weight:700;}
  .h1{font-family:'Playfair Display',serif;font-weight:900;font-size:25px;line-height:1.35;color:#06000D;text-align:center;margin:22px 0 30px 0;}
  .h1 .accent{color:#7B2FBE;}
  .body-copy{font-family:'DM Sans',sans-serif;font-weight:400;font-size:15px;line-height:1.75;color:#2A2730;text-align:left;margin:0 0 18px 0;}
  .body-copy strong{font-weight:700;color:#06000D;}
  .accent-amber{color:#FFB020;font-weight:700;}
  .accent-purple{color:#7B2FBE;font-weight:700;}
  .brand-word{font-weight:700;color:#06000D;}
  .brand-word .brand-dopa{color:#7B2FBE;}
  .feature-word{color:#7B2FBE;font-weight:700;}
  .prompt-block{background:#F7F3FC;border-left:3px solid #7B2FBE;border-radius:6px;padding:16px 20px;margin:4px 0 22px 0;}
  .prompt-block p{margin:0;}
  .sentence-stem{font-family:'Playfair Display',serif;font-weight:700;font-style:italic;font-size:16px;color:#06000D;}
  .keyline{font-family:'Playfair Display',serif;font-weight:700;font-style:italic;font-size:19px;line-height:1.5;color:#7B2FBE;text-align:center;margin:8px 0 26px 0;padding:20px 10px;border-top:1px solid #F0EDF7;border-bottom:1px solid #F0EDF7;}
  .signoff{font-family:'DM Sans',sans-serif;font-size:14px;color:#2A2730;text-align:left;margin:8px 0 4px 0;}
  .signature{font-family:'Playfair Display',serif;font-weight:700;font-size:15px;color:#7B2FBE;margin:0 0 28px 0;}
  .footer{border-top:1px solid #EDE7F0;padding:20px 40px 28px 40px;font-family:'DM Sans',sans-serif;font-size:11.5px;line-height:1.6;color:#9B96A3;text-align:left;}
  .footer a{color:#9B96A3;text-decoration:underline;}
  .footer .sender{color:#6B6670;font-weight:600;}
`

const MASCOT = 'https://mydopa.app/assets/mascot.png'

function shell(preheader: string, body: string, unsub: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
${GF}
<style>${CSS}</style>
</head>
<body>
<div class="preheader">${preheader}</div>
<div class="email-shell">
  <div class="pad">
    <div class="center">
      <img class="mascot" src="${MASCOT}" alt="Dopa" width="190"/>
      <div class="logo">My<span>Dopa</span><sup>&#8482;</sup></div>
    </div>
    ${body}
  </div>
  <div class="footer">
    You&rsquo;re receiving this because you joined the early <span class="sender">MyDopa</span> email list and opted in to receive launch updates.<br/>
    Unsubscribe: <a href="${unsub}">${unsub}</a><br/><br/>
    <span class="sender">MyDopa</span> &mdash; Ren&eacute; Estripeaut, doing business as MyDopa<br/>
    5401 NW 72nd Ave, Suite LPX 15004, Miami, Florida 33166, United States<br/>
    hello@mydopa.app
  </div>
</div>
</body>
</html>`
}

// ─── Email builders ────────────────────────────────────────────

function buildEmail2Html(name: string, unsub: string): string {
  return shell(
    'Threat arrives loud. Evidence needs to be written down.',
    `<div class="h1">One bad hour can wreck a good day.</div>
    <p class="body-copy">Hey ${name},</p>
    <p class="body-copy">Two days ago, you received your <span class="brand-word">My<span class="brand-dopa">Dopa</span></span> Progress Profile.</p>
    <p class="body-copy">The idea behind it was simple: your life already has a body of evidence showing that more is working than your mind is currently able to hold.</p>
    <p class="body-copy">Today, I want to explain why that happens.</p>
    <p class="body-copy">One bad hour can wreck the story of an entire day because the brain gives more weight to what feels threatening, unresolved, or unfinished. One lost negotiation. One hard conversation. One missed workout. One anxious hour. That single moment can take over the emotional room, even when several other things were quietly moving in your favor.</p>
    <p class="body-copy">That does not mean the <span class="accent-amber">good evidence</span> was small.</p>
    <p class="body-copy">It means the threat was louder.</p>
    <p class="body-copy">This is why progress can be real and still feel unavailable when you need it. The useful thing happened. The better choice happened. The recovery happened. The return happened. But if it was not written down, your mind may have nothing stable to come back to when the bad hour starts telling the whole story.</p>
    <p class="body-copy">This is one of the reasons <span class="brand-word">My<span class="brand-dopa">Dopa</span></span> exists.</p>
    <p class="body-copy">It gives the <span class="accent-amber">good evidence</span> somewhere to land.</p>
    <p class="body-copy">Here is today&rsquo;s <span class="brand-word">My<span class="brand-dopa">Dopa</span></span> move: write down one good thing from today that your mind almost skipped.</p>
    <p class="body-copy">It does not have to be impressive. It only has to be true.</p>
    <p class="body-copy">A task you finished. A message you answered. A moment you recovered from. A small decision that moved you forward.</p>
    <p class="body-copy">Then ask yourself:</p>
    <div class="prompt-block"><p class="sentence-stem">&ldquo;What would I believe about today if I gave this evidence its proper weight?&rdquo;</p></div>
    <p class="body-copy">Reply and tell me: what kind of <span class="accent-amber">good evidence</span> do you find yourself ignoring first?</p>
    <p class="signoff">Fall in love with your own progress.</p>
    <p class="signature">&mdash; DOPA</p>`,
    unsub,
  )
}

function buildEmail3Html(name: string, unsub: string): string {
  return shell(
    'You have an evidence problem.',
    `<div class="h1">You don&rsquo;t have a discipline problem.</div>
    <p class="body-copy">Hey ${name},</p>
    <p class="body-copy">Most people judge themselves from memory.</p>
    <p class="body-copy">That sounds normal until you realize how unreliable memory can be when you are trying to measure your own progress.</p>
    <p class="body-copy">Memory is incomplete. It is emotional. It gives extra weight to what feels unresolved. It remembers what is still unfinished more easily than what you already carried, completed, repaired, attempted, or survived.</p>
    <p class="body-copy">So you may be showing up more than you think.</p>
    <p class="body-copy">You may be recovering faster than you notice.</p>
    <p class="body-copy">You may be keeping promises that have become so normal you no longer count them.</p>
    <p class="body-copy">You may be building something real, but because the evidence is scattered across ordinary days, your mind keeps grading you from an incomplete record.</p>
    <p class="body-copy">That is <span class="accent-amber">the evidence problem</span>.</p>
    <p class="body-copy">You are trying to decide who you are becoming without a clear record of what you have already done.</p>
    <p class="body-copy"><span class="brand-word">My<span class="brand-dopa">Dopa</span></span> is being built around one belief: progress has to become <span class="accent-amber">visible</span> before it can become <span class="accent-amber">trustable</span>.</p>
    <p class="body-copy">That is why <span class="feature-word">TODAY</span> matters.</p>
    <p class="body-copy">That is why <span class="feature-word">MYPROGRESS</span> matters.</p>
    <p class="body-copy">That is why your record matters.</p>
    <p class="body-copy">Because once your effort is visible, it stops depending on mood, memory, or whatever went wrong most recently. It becomes something you can return to. Something you can read. Something that gives your confidence a place to stand.</p>
    <p class="body-copy">Here is today&rsquo;s <span class="brand-word">My<span class="brand-dopa">Dopa</span></span> move: jot down one thing from the past 7 days that proves you are <span class="accent-amber">getting better</span>.</p>
    <p class="body-copy">Just one.</p>
    <p class="body-copy">A choice. A return. A conversation. A task. A moment of follow-through. A piece of evidence your mind did not fully count.</p>
    <p class="body-copy">Then complete this sentence:</p>
    <div class="prompt-block"><p class="sentence-stem">&ldquo;This counts because&hellip;&rdquo;</p></div>
    <p class="body-copy">Reply and tell me: what is one thing you keep doing right that you rarely count?</p>
    <p class="signoff">Fall in love with your own progress.</p>
    <p class="signature">&mdash; DOPA</p>`,
    unsub,
  )
}

function buildEmail4Html(name: string, unsub: string): string {
  return shell(
    'Catch the moment. See the pattern. Understand the signal. Watch your resilience grow.',
    `<div class="h1">How <span class="brand-word">My<span class="brand-dopa">Dopa</span></span> turns daily effort into <span class="accent-amber">proof</span>.</div>
    <p class="body-copy">Hey ${name},</p>
    <p class="body-copy">Your progress can be real and still feel invisible when your mind does not have a clear record to return to.</p>
    <p class="body-copy">That is why <span class="brand-word">My<span class="brand-dopa">Dopa</span></span> is being built as a system, not a journal.</p>
    <p class="body-copy">A journal asks you to write.</p>
    <p class="body-copy"><span class="brand-word">My<span class="brand-dopa">Dopa</span></span> helps you keep <span class="accent-amber">proof</span>.</p>
    <p class="body-copy">The system has four core parts.</p>
    <p class="body-copy"><span class="feature-word">TODAY</span> catches the moment while it is still alive.</p>
    <p class="body-copy">This is where you log the meaningful things that happen during the day: the choice you made, the task you completed, the moment you recovered from, the opportunity that appeared, the small win your mind would usually move past too quickly.</p>
    <p class="body-copy"><span class="feature-word">MYPROGRESS</span> shows the pattern that memory would miss.</p>
    <p class="body-copy">One entry can feel small. Ten entries begin to show something. Over time, your record starts revealing what is actually happening: where you are returning faster, where you are showing up more consistently, where your effort is beginning to compound.</p>
    <p class="body-copy"><span class="feature-word">DISCOVERIES</span> helps you understand what the pattern means.</p>
    <p class="body-copy">These are short, focused lessons that help you decode your own behavior, your decisions, your self-image, your habits, and the evidence your record is already showing you. The point is not more information. The point is better interpretation of your own life.</p>
    <p class="body-copy"><span class="feature-word">RESILIENCE HORIZON</span> shows your recovery, reliability, and growth over time.</p>
    <p class="body-copy">It gives you a way to see that the hard hour stayed one hour. That the return happened faster. That the pattern is changing. That your ability to come back, follow through, and trust yourself is expanding.</p>
    <p class="body-copy">That is how <span class="brand-word">My<span class="brand-dopa">Dopa</span></span> turns daily effort into <span class="accent-amber">proof</span>.</p>
    <p class="body-copy">Not by asking you to become someone else.</p>
    <p class="body-copy">By helping you see the evidence of who you are already becoming.</p>
    <p class="body-copy">Reply and tell me: which part would help you most right now: <span class="feature-word">TODAY</span>, <span class="feature-word">MYPROGRESS</span>, <span class="feature-word">DISCOVERIES</span>, or <span class="feature-word">RESILIENCE HORIZON</span>?</p>
    <p class="signoff">Fall in love with your own progress.</p>
    <p class="signature">&mdash; DOPA</p>`,
    unsub,
  )
}

function buildEmail5Html(name: string, unsub: string): string {
  return shell(
    'Progress has to be seen before it can be believed.',
    `<div class="h1">Why I&rsquo;m building <span class="brand-word">My<span class="brand-dopa">Dopa</span></span>.</div>
    <p class="body-copy">Hi ${name},</p>
    <p class="body-copy">I&rsquo;m building <span class="brand-word">My<span class="brand-dopa">Dopa</span></span> because I know what it feels like to do the work and still have one bad hour take over the whole story.</p>
    <p class="body-copy">I know what it feels like to write things down every day: <span class="accent-amber">good moments</span>, gratitudes, efforts, small wins. Training. Building. Healing. Getting stronger. And still seeing how quickly the mind can toss out the evidence when something goes wrong.</p>
    <p class="body-copy">That is why <span class="brand-word">My<span class="brand-dopa">Dopa</span></span> is being designed around one simple principle:</p>
    <div class="keyline">Your day already gives you <span class="accent-amber">proof</span>. You just need a way to protect it.</div>
    <p class="body-copy">You&rsquo;re now on the early <span class="brand-word">My<span class="brand-dopa">Dopa</span></span> list. I&rsquo;ll send you simple build updates over time, and when early access opens, you&rsquo;ll be among the first to know.</p>
    <p class="signoff">Fall in love with your own progress.</p>
    <p class="signature">&mdash; Rene</p>`,
    unsub,
  )
}

// ─── Unsubscribe URL ───────────────────────────────────────────
function unsubUrl(email: string): string {
  return `${SUPABASE_URL}/functions/v1/unsubscribe?email=${encodeURIComponent(email)}`
}

// ─── Main handler ──────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST')   return new Response('Method not allowed', { status: 405, headers: CORS })

  const supabase = createClient(
    SUPABASE_URL,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const results: Record<string, { sent: number; failed: number; skipped: number }> = {}

  for (const step of SEQUENCE) {
    const statusCol    = `email_${step.n}_status`    as const
    const sentAtCol    = `email_${step.n}_sent_at`   as const
    const resendIdCol  = `resend_email_${step.n}_id` as const

    const { data: subscribers, error: queryError } = await supabase
      .from('waitlist_subscribers')
      .select('email, first_name')
      .eq('consent_status', 'subscribed')
      .not('email_1_sent_at', 'is', null)
      .lte('email_1_sent_at', new Date(Date.now() - step.days * 86_400_000).toISOString())
      .is(statusCol, null)

    if (queryError) {
      console.error(`Email ${step.n} query error:`, queryError)
      results[`email_${step.n}`] = { sent: 0, failed: 0, skipped: -1 }
      continue
    }

    let sent = 0, failed = 0
    for (const sub of (subscribers ?? [])) {
      const name  = sub.first_name
        ? (sub.first_name as string).charAt(0).toUpperCase() + (sub.first_name as string).slice(1)
        : 'there'
      const unsub = unsubUrl(sub.email as string)

      try {
        const res  = await fetch('https://api.resend.com/emails', {
          method:  'POST',
          headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            from:    'MyDopa <hello@mydopa.app>',
            to:      [sub.email],
            subject: step.subject,
            html:    step.buildHtml(name, unsub),
          }),
        })
        const data = await res.json() as { id?: string; [k: string]: unknown }

        if (res.ok) {
          await supabase.from('waitlist_subscribers').update({
            [statusCol]:   'sent',
            [sentAtCol]:   new Date().toISOString(),
            [resendIdCol]: data.id ?? null,
          }).eq('email', sub.email)
          sent++
        } else {
          await supabase.from('waitlist_subscribers').update({
            [statusCol]:      'failed',
            last_email_error: JSON.stringify(data),
          }).eq('email', sub.email)
          console.error(`Email ${step.n} failed for ${sub.email}:`, data)
          failed++
        }
      } catch (err) {
        await supabase.from('waitlist_subscribers').update({
          [statusCol]:      'failed',
          last_email_error: String(err),
        }).eq('email', sub.email)
        console.error(`Email ${step.n} error for ${sub.email}:`, err)
        failed++
      }
    }

    results[`email_${step.n}`] = { sent, failed, skipped: 0 }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status:  200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
})
