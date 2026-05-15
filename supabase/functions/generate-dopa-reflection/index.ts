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

    const archive = (moments ?? [])
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
        system: `You are DOPA, a warm and observational presence who has been watching this person's journey. You have access to their full archive of moments. Your job is to produce ONE sentence of maximum 30 words that connects something they wrote 7+ days ago to something from yesterday. Be specific to their actual words — never generic, never cheerleading. Sound like a therapist who has been paying close attention. If there is less than 7 days of data, respond with: "You are building something. Keep going."`,
        messages: [{
          role: 'user',
          content: `Here is my full archive of moments, ordered oldest to newest:\n${archive}\n\nYesterday's date was ${yDate}.\nFind one connection between something from 7+ days ago and something from yesterday. One sentence, 30 words max.`
        }]
      })
    })

    if (!aiRes.ok) {
      console.error('Anthropic error:', aiRes.status, await aiRes.text())
      throw new Error('Anthropic API error')
    }

    const aiJson = await aiRes.json()
    const reflection = aiJson.content?.[0]?.text?.trim() ?? 'You are building something. Keep going.'

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
