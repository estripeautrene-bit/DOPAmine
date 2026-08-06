import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

const STATIC_BASE = 'https://mydopa.app'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const url   = new URL(req.url)
  const email = url.searchParams.get('email')?.trim().toLowerCase()

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return new Response(null, {
      status: 302,
      headers: { ...CORS, 'Location': `${STATIC_BASE}/unsubscribed.html?err=invalid` },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { error } = await supabase
    .from('waitlist_subscribers')
    .update({ consent_status: 'unsubscribed' })
    .eq('email', email)

  if (error) {
    console.error('Unsubscribe DB error:', error)
    return new Response(null, {
      status: 302,
      headers: { ...CORS, 'Location': `${STATIC_BASE}/unsubscribed.html?err=db` },
    })
  }

  return new Response(null, {
    status: 302,
    headers: { ...CORS, 'Location': `${STATIC_BASE}/unsubscribed.html` },
  })
})
