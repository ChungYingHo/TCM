import type { APIRoute } from 'astro'
import type { SyncState } from '@/models/progress'
import { kvEnabled, kvGet, kvSet } from '@/utils/kv'

export const prerender = false

// Single-user personal tool → one key holds the whole (tiny) state document.
const KEY = 'tcm:state:v1'
const EMPTY: SyncState = { wrongbook: {}, progress: {}, updatedAt: 0 }

const cleanStreak = (s: unknown): SyncState['streak'] => {
  if (!s || typeof s !== 'object') return undefined
  const { lastDay, count, best } = s as Record<string, unknown>
  if (typeof lastDay !== 'string') return undefined
  return { lastDay, count: Number(count) || 0, best: Number(best) || 0 }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

export const GET: APIRoute = async () => {
  if (!kvEnabled()) return json({ disabled: true })
  try {
    const raw = await kvGet(KEY)
    return json({ state: raw ? (JSON.parse(raw) as SyncState) : EMPTY })
  } catch {
    return json({ error: 'kv_unavailable' }, 502)
  }
}

export const PUT: APIRoute = async ({ request }) => {
  if (!kvEnabled()) return json({ disabled: true })
  let state: SyncState = EMPTY
  try {
    const body = await request.json()
    const st = body?.state
    if (st && typeof st === 'object') {
      state = {
        wrongbook: st.wrongbook ?? {},
        progress: st.progress ?? {},
        streak: cleanStreak(st.streak),
        plan: st.plan && typeof st.plan === 'object' ? st.plan : {},
        vocabSrs: st.vocabSrs && typeof st.vocabSrs === 'object' ? st.vocabSrs : {},
        updatedAt: typeof st.updatedAt === 'number' ? st.updatedAt : Date.now(),
      }
    }
  } catch {
    return json({ error: 'bad_body' }, 400)
  }
  try {
    await kvSet(KEY, JSON.stringify(state)) // last-write-wins
    return json({ ok: true })
  } catch {
    return json({ error: 'kv_unavailable' }, 502)
  }
}
