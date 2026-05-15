import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

function yesterdayDateStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  try {
    const { user_id } = await req.json()
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: moments, error: momentsError } = await supabase
      .from('moments')
      .select('date_key, text, created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: true })

    if (momentsError) throw momentsError

    const allMoments = moments ?? []
    const totalCount = allMoments.length
    const uniqueDays = new Set(allMoments.map(m => m.date_key)).size

    if (uniqueDays < 3) {
      const n = uniqueDays === 0 ? 1 : uniqueDays
      const reflection = `Day ${n}. ${totalCount} moment${totalCount !== 1 ? 's' : ''}. Consistency compounds from the first rep. You are already in motion.`
      return new Response(JSON.stringify({ reflection }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    if (uniqueDays === 3) {
      const reflection = `Just like Warren Buffett, you are compounding wins. Keep using his recipe.`
      return new Response(JSON.stringify({ reflection }), {
        headers: { 'Content-Type': 'application/json', ...CORS }
      })
    }

    const archive = allMoments
      .map(m => `[${m.date_key}] ${m.text}`)
      .join('\n')

    const yDate = yesterdayDateStr()

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 100,
        system: `You are DOPA. You are a precision mirror — not a cheerleader.
Your voice is warm, scientific, and specific. You show people what is actually happening in their behavior using their own words as evidence. You never speak in negatives. Always forward.

The science: consistent positive documentation of real moments creates new neural pathways. Progress is not a feeling — it is a measurable pattern of repeated action. Consistency compounds. Small repeated actions build identity. This is neuroscience, not motivation.

Your five core words. Use them when the evidence supports it:
- Progress: name it as fact, not compliment
- Consistency: name the mechanism out loud
- Discipline: always congratulatory — like a trainer or coach recognizing something real
- Evidence: what makes it undeniable
- Compounding: the word that makes the system click

Your job: ONE sentence, maximum 30 words, connecting something from 3 or more days ago to something from yesterday. The connection must use their actual words. It must name what is already happening — not what could happen. Always forward.

Language rules:
- Use their actual words, not paraphrases
- Never use: "amazing", "proud of you", "incredible", "awesome", "fantastic", "keep it up", "you've got this"
- Never speak in negatives or future conditionals
- Never end with a question
- Sound like a neuroscientist who knows everything about this specific person`,
        messages: [{
          role: 'user',
          content: `Here is my full archive of moments, ordered oldest to newest:\n${archive}\n\nYesterday's date was ${yDate}. If yesterday had no entries, use the most recent day that does.\nFind one connection between something from 3 or more days ago and something from yesterday (or most recent day). One sentence, 30 words max.`
        }]
      })
    })

    if (!aiRes.ok) {
      console.error('Anthropic error:', aiRes.status, await aiRes.text())
      throw new Error('Anthropic API error')
    }

    const aiJson = await aiRes.json()
    const reflection = aiJson.content?.[0]?.text?.trim() ?? 'Consistency compounds from the first rep. You are already in motion.'

    return new Response(JSON.stringify({ reflection }), {
      headers: { 'Content-Type': 'application/json', ...CORS }
    })

  } catch (err) {
    console.error('generate-dopa-reflection error:', String(err))
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS }
    })
  }
})
