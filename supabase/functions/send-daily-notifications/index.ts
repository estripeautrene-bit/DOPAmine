import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push'

type Slot     = 'ywg' | 'morning' | 'afternoon' | 'evening'
type PairSlot = 'morning' | 'afternoon' | 'evening'

const PAIRS: Record<string, Record<PairSlot, string>> = {
  A: {
    morning:   "Something good is already out there. Go find your first one.",
    afternoon: "Afternoon check. How many wins have you caught today?",
    evening:   "Last chance to close the day right. What was good?"
  },
  B: {
    morning:   "Bet you can't name 3 good things before noon.",
    afternoon: "Still taking that bet. How many have you logged?",
    evening:   "Don't you dare close this day without 3 wins logged."
  },
  C: {
    morning:   "[N] days. Today makes [N+1]. Your 3 are out there.",
    afternoon: "Day [N+1] in progress. How many wins today?",
    evening:   "[N+1] days. Your 3 wins close it out."
  },
  D: {
    morning:   "3 things are going to happen today. Start watching.",
    afternoon: "What have you noticed so far? Catch what\'s worth keeping.",
    evening:   "Day\'s almost done. What was good?"
  },
  E: {
    morning:   "New day. What you built is still here. Find your 3.",
    afternoon: "Welcome back. How many wins today?",
    evening:   "End it strong. One more good thing is out there."
  },
  F: {
    morning:   "Day [DAY]. Still building. 3 wins is the whole practice.",
    afternoon: "Still building. How many wins today?",
    evening:   "Day [DAY] done right means 3 wins. How close are you?"
  },
  H: {
    morning:   "Weekend. Still 3. Easier when the day slows down.",
    afternoon: "Mid-day. Weekend wins count just as much. How many?",
    evening:   "End the weekend right. 3 wins. Done?"
  },
  I: {
    morning:   "3 is your floor. What\'s today\'s ceiling?",
    afternoon: "How many are you at? You usually go past 3.",
    evening:   "3 minimum. You usually go past it. How many today?"
  }
}

// Pair J – "The Ghost": 3 context variants, selected at job creation time
const PAIR_J: Record<string, Partial<Record<PairSlot, string>>> = {
  WEEKDAY: {
    morning:   "Something good is about to happen today. Will you catch it?",
    afternoon: "Something good probably just happened. Did you keep it?",
    evening:   "The day\'s almost gone. What\'s worth keeping from it?"
  },
  POSTGYM: {
    morning:   "That workout just happened. You going to remember it tonight?"
    // afternoon/evening fall back to WEEKDAY variant
  },
  WEEKEND: {
    morning:   "Weekends move fast. Something good is already happening.",
    afternoon: "Mid-weekend check. What\'s been good so far today?",
    evening:   "Weekend\'s almost done. What would be a shame to forget?"
  }
}

const DEFAULT_ROTATION = ['A', 'B', 'D']

// Yesterday Was Good – tiered personalized copy
const YWG_TIERS = {
  TIER1: [
    "Yesterday you kept {n} things. Your past is building itself.",
    "{n} wins yesterday. That's a day worth remembering.",
    "Yesterday had {n} good moments in it. You caught them all."
  ],
  TIER2: [
    "Yesterday you kept {n} things. That's not nothing.",
    "{n} wins from yesterday. Still yours this morning.",
    "Yesterday didn't disappear. You kept {n} pieces of it."
  ],
  TIER3: [
    "Yesterday had at least one good thing in it. You kept it.",
    "One win from yesterday. Still counts this morning."
  ],
  COLD: [
    "Yesterday is waiting. See what you kept."
  ],
  MILESTONE: [
    "{streak} days of keeping things. That's a great past being built."
  ]
}
const STREAK_MILESTONES = new Set([7, 14, 30, 50, 100])

interface UserState {
  streak_count: number
  wins_today: number
  wins_yesterday: number
  missed_yesterday: boolean
  account_age_days: number
  avg_daily_wins_7d: number
}

function applyVars(copy: string, state: UserState): string {
  return copy
    .replace(/\[N\+1\]/g, String(state.streak_count + 1))
    .replace(/\[N\]/g,    String(state.streak_count))
    .replace(/\[DAY\]/g,  String(state.account_age_days))
}

function afternoonCopy(pairId: string, state: UserState): string {
  if (state.wins_today >= 3) return "Already at 3. Good morning."
  if (state.wins_today === 2) return "Two in. One more and the day is done right."
  if (state.wins_today === 1) return "One in. Two to go. You\'ve got time."
  return applyVars(PAIRS[pairId]?.afternoon ?? PAIRS.A.afternoon, state)
}

function eveningCopy(pairId: string, state: UserState): string {
  if (state.wins_today >= 4) return "Past 3 today. That\'s a good day."
  if (state.wins_today === 3) return applyVars(PAIRS[pairId]?.evening ?? PAIRS.A.evening, state)
  if (state.wins_today === 2) return "Two down. One more and the day is done right."
  if (state.wins_today === 1) return "One down. Two more before the day closes."
  return "Still time. What\'s one good thing from today? Start there."
}

function addMinutesToHHMM(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function getYWGCopy(state: UserState, variantIndex: number): { copy: string; tierSize: number } {
  if (STREAK_MILESTONES.has(state.streak_count)) {
    return {
      copy: YWG_TIERS.MILESTONE[0].replace('{streak}', String(state.streak_count)),
      tierSize: 1
    }
  }
  const n = state.wins_yesterday
  let tier: string[]
  if (state.account_age_days <= 3 || n === 0) {
    tier = YWG_TIERS.COLD
  } else if (n >= 5) {
    tier = YWG_TIERS.TIER1
  } else if (n >= 2) {
    tier = YWG_TIERS.TIER2
  } else {
    tier = YWG_TIERS.TIER3
  }
  const copy = tier[variantIndex % tier.length].replace(/{n}/g, String(n))
  return { copy, tierSize: tier.length }
}

function localHHMM(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date())
    const h = parts.find(p => p.type === 'hour')?.value ?? '00'
    const m = parts.find(p => p.type === 'minute')?.value ?? '00'
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
  } catch { return '00:00' }
}

function dateKey(timezone: string, offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(d)
  } catch { return d.toISOString().substring(0, 10) }
}

function dayOfWeek(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(new Date())
  } catch { return 'Monday' }
}

function computeState(
  moments: { date_key: string; created_at: string }[],
  timezone: string
): UserState {
  const today     = dateKey(timezone, 0)
  const yesterday = dateKey(timezone, -1)

  const byDate: Record<string, number> = {}
  for (const m of moments) {
    byDate[m.date_key] = (byDate[m.date_key] ?? 0) + 1
  }

  const wins_today       = byDate[today] ?? 0
  const wins_yesterday   = byDate[yesterday] ?? 0
  const missed_yesterday = wins_yesterday === 0

  const days = Object.keys(byDate).sort((a, b) => b.localeCompare(a))
  let streak_count = 0
  if (days.length > 0) {
    let cursor: string | null = days[0] === today ? today : days[0] === yesterday ? yesterday : null
    if (cursor) {
      for (const day of days) {
        if (day === cursor) {
          streak_count++
          const d = new Date(cursor + 'T12:00:00Z')
          d.setDate(d.getDate() - 1)
          cursor = d.toISOString().substring(0, 10)
        } else break
      }
    }
  }

  const earliest = moments[0]?.created_at ?? null
  const account_age_days = earliest
    ? Math.floor((Date.now() - new Date(earliest).getTime()) / 86400000)
    : 0

  let totalLast7 = 0
  for (let i = 0; i < 7; i++) {
    totalLast7 += byDate[dateKey(timezone, -i)] ?? 0
  }
  const avg_daily_wins_7d = totalLast7 / 7

  return { streak_count, wins_today, wins_yesterday, missed_yesterday, account_age_days, avg_daily_wins_7d }
}

function detectJVariant(
  state: UserState,
  tz: string,
  moments: { date_key: string; created_at: string }[]
): string {
  const dow = dayOfWeek(tz)
  if (dow === 'Saturday' || dow === 'Sunday') return 'J_WEEKEND'

  const hour = parseInt(localHHMM(tz).substring(0, 2), 10)
  if (hour >= 7 && hour < 9 && state.streak_count >= 3) {
    const today = dateKey(tz, 0)
    const hasMorningSave = moments.some(m => {
      if (m.date_key !== today) return false
      try {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: tz, hour: '2-digit', hour12: false
        }).formatToParts(new Date(m.created_at))
        const h = parseInt(parts.find(p => p.type === 'hour')?.value ?? '23', 10)
        return h < 10
      } catch { return false }
    })
    if (hasMorningSave) return 'J_POSTGYM'
  }

  return 'J_WEEKDAY'
}

function getJCopy(pairId: string, slot: PairSlot): string {
  const variant = pairId.slice(2) // strip 'J_' → WEEKDAY / POSTGYM / WEEKEND
  return PAIR_J[variant]?.[slot] ?? PAIR_J.WEEKDAY[slot] ?? ''
}

function selectPair(
  state: UserState,
  timezone: string,
  moments: { date_key: string; created_at: string }[]
): string {
  const dow       = dayOfWeek(timezone)
  const isWeekend = dow === 'Saturday' || dow === 'Sunday'

  if (state.missed_yesterday && state.account_age_days > 14) return 'E'
  if (state.avg_daily_wins_7d > 3.5 && state.account_age_days >= 7) return 'I'
  if (state.streak_count >= 3) return 'C'
  if (isWeekend) return 'H'
  if (state.account_age_days <= 14) return 'F'
  if (state.account_age_days <= 21) return detectJVariant(state, timezone, moments)

  const dayIndex = Math.floor(Date.now() / 86400000) % 3
  return DEFAULT_ROTATION[dayIndex]
}

const FIXED_TIMES: Record<string, string> = { afternoon: '12:30', evening: '20:30' }

Deno.serve(async (req) => {
  try {
    const body  = await req.json().catch(() => ({}))
    const slot  = body.slot as Slot
    const force = body.force === true

    if (!slot || !['ywg', 'morning', 'afternoon', 'evening'].includes(slot)) {
      return new Response(
        JSON.stringify({ error: 'slot must be ywg | morning | afternoon | evening' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!
    const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!
    const VAPID_EMAIL   = Deno.env.get('VAPID_EMAIL') ?? 'mailto:hello@mydopa.app'
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, subscription, notify_time, timezone, last_morning_pair_id, last_ywg_variant_index')
      .eq('active', true)

    if (error) return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )

    const targets = (subs ?? []).filter(s => {
      if (force) return true
      const tz       = s.timezone ?? 'UTC'
      const now      = localHHMM(tz)
      const baseTime = (s.notify_time ?? '08:00').substring(0, 5)
      if (slot === 'ywg')     return now === baseTime
      if (slot === 'morning') return now === addMinutesToHHMM(baseTime, 30)
      return now === FIXED_TIMES[slot]
    })

    if (targets.length === 0) {
      return new Response(
        JSON.stringify({ slot, sent: 0, skipped: 0, total_active: subs?.length ?? 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const userIds    = [...new Set(targets.map(t => t.user_id).filter(Boolean))]
    const cutoffDate = dateKey('UTC', -30)

    const { data: allMoments } = await supabase
      .from('moments')
      .select('user_id, date_key, created_at')
      .in('user_id', userIds)
      .gte('date_key', cutoffDate)
      .order('created_at', { ascending: true })

    const momentsByUser: Record<string, { date_key: string; created_at: string }[]> = {}
    for (const m of allMoments ?? []) {
      if (!momentsByUser[m.user_id]) momentsByUser[m.user_id] = []
      momentsByUser[m.user_id].push(m)
    }

    const pairUpdates: { id: string; pair: string }[] = []
    const ywgUpdates:  { id: string; nextIndex: number }[] = []

    const results = await Promise.allSettled(
      targets.map(async s => {
        const tz    = s.timezone ?? 'UTC'
        const state = computeState(momentsByUser[s.user_id] ?? [], tz)

        let message: string

        if (slot === 'ywg') {
          const variantIndex = (s.last_ywg_variant_index ?? 0)
          const { copy, tierSize } = getYWGCopy(state, variantIndex)
          message = copy
          ywgUpdates.push({ id: s.id, nextIndex: (variantIndex + 1) % tierSize })
        } else if (slot === 'morning') {
          const pair = selectPair(state, tz, momentsByUser[s.user_id] ?? [])
          message = pair.startsWith('J_')
            ? getJCopy(pair, 'morning')
            : applyVars(PAIRS[pair].morning, state)
          pairUpdates.push({ id: s.id, pair })
        } else {
          const pair      = s.last_morning_pair_id ?? 'A'
          const isJ       = pair.startsWith('J_')
          const isSameDayG = pair === 'G'

          if (slot === 'afternoon') {
            if (isJ) {
              // J suppression: wins >= 3 at send time → fall back to regular copy
              message = state.wins_today >= 3
                ? afternoonCopy('A', state)
                : getJCopy(pair, 'afternoon')
            } else if (!isSameDayG && state.wins_today === 0) {
              // wins_today = 0 at midday trigger — fire J weekday afternoon copy
              message = PAIR_J.WEEKDAY.afternoon!
            } else {
              message = afternoonCopy(pair, state)
            }
          } else {
            if (isJ) {
              message = state.wins_today >= 3
                ? eveningCopy('A', state)
                : getJCopy(pair, 'evening')
            } else {
              message = eveningCopy(pair, state)
            }
          }
        }

        const payload = JSON.stringify({ title: 'DOPAmine', body: message, icon: '/icon.png' })
        return webpush.sendNotification(s.subscription, payload)
      })
    )

    if (slot === 'morning' && pairUpdates.length > 0) {
      await Promise.all(
        pairUpdates.map(({ id, pair }) =>
          supabase.from('push_subscriptions').update({ last_morning_pair_id: pair }).eq('id', id)
        )
      )
    }

    if (slot === 'ywg' && ywgUpdates.length > 0) {
      await Promise.all(
        ywgUpdates.map(({ id, nextIndex }) =>
          supabase.from('push_subscriptions').update({ last_ywg_variant_index: nextIndex }).eq('id', id)
        )
      )
    }

    const expiredIds = results
      .map((r, i) => ({ r, id: targets[i].id }))
      .filter(({ r }) => r.status === 'rejected' && (r.reason as any)?.statusCode === 410)
      .map(({ id }) => id)

    if (expiredIds.length > 0) {
      await supabase.from('push_subscriptions').update({ active: false }).in('id', expiredIds)
    }

    const sent = results.filter(r => r.status === 'fulfilled').length
    return new Response(
      JSON.stringify({ slot, sent, skipped: targets.length - sent, total_active: subs?.length ?? 0 }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})