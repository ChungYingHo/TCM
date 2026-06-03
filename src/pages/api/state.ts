import type { APIRoute } from 'astro'
import { mergeState, type SyncState } from '@/utils/sync'

export const prerender = false

// Single-user personal tool → one key holds the whole state document.
const KEY = 'tcm:state:v1'
const EMPTY: SyncState = { wrongbook: {}, progress: {}, updatedAt: 0 }

// Works with a Vercel KV or Upstash Redis store (either env-var naming).
// Vercel injects these at runtime → read process.env first, fall back to build env.
function env(key: string): string | undefined {
  const p = typeof process !== 'undefined' ? process.env?.[key] : undefined
  return p || (import.meta.env as Record<string, string | undefined>)[key]
}
function store(): { url: string; token: string } | null {
  const url = env('KV_REST_API_URL') || env('UPSTASH_REDIS_REST_URL')
  const token = env('KV_REST_API_TOKEN') || env('UPSTASH_REDIS_REST_TOKEN')
  return url && token ? { url, token } : null
}

async function kvGet(s: { url: string; token: string }): Promise<SyncState> {
  const res = await fetch(`${s.url}/get/${KEY}`, { headers: { Authorization: `Bearer ${s.token}` } })
  if (!res.ok) throw new Error(`kv get ${res.status}`)
  const data = await res.json()
  if (!data?.result) return EMPTY
  try {
    return JSON.parse(data.result) as SyncState
  } catch {
    return EMPTY
  }
}

async function kvSet(s: { url: string; token: string }, value: SyncState): Promise<void> {
  const res = await fetch(`${s.url}/set/${KEY}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${s.token}` },
    body: JSON.stringify(value),
  })
  if (!res.ok) throw new Error(`kv set ${res.status}`)
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

export const GET: APIRoute = async () => {
  const s = store()
  if (!s) return json({ disabled: true })
  try {
    return json({ state: await kvGet(s) })
  } catch {
    return json({ error: 'kv_unavailable' }, 502)
  }
}

export const PUT: APIRoute = async ({ request }) => {
  const s = store()
  if (!s) return json({ disabled: true })
  let incoming: SyncState = EMPTY
  try {
    const body = await request.json()
    const st = body?.state
    if (st && typeof st === 'object') {
      incoming = {
        wrongbook: st.wrongbook ?? {},
        progress: st.progress ?? {},
        updatedAt: typeof st.updatedAt === 'number' ? st.updatedAt : Date.now(),
      }
    }
  } catch {
    return json({ error: 'bad_body' }, 400)
  }
  try {
    const merged = mergeState(await kvGet(s), incoming)
    await kvSet(s, merged)
    return json({ state: merged })
  } catch {
    return json({ error: 'kv_unavailable' }, 502)
  }
}
