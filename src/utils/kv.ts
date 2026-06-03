// Server-only helper for the Vercel Marketplace store (Upstash Redis REST).
// Reads credentials Vercel injects (KV_* or UPSTASH_* naming). When no store is
// configured every call no-ops, so the app keeps working on plain localStorage.

function env(key: string): string | undefined {
  const p = typeof process !== 'undefined' ? process.env?.[key] : undefined
  return p || (import.meta.env as Record<string, string | undefined>)[key]
}

function store(): { url: string; token: string } | null {
  const url = env('KV_REST_API_URL') || env('UPSTASH_REDIS_REST_URL')
  const token = env('KV_REST_API_TOKEN') || env('UPSTASH_REDIS_REST_TOKEN')
  return url && token ? { url, token } : null
}

export function kvEnabled(): boolean {
  return store() !== null
}

/** Raw string value, or null if missing / store unconfigured. */
export async function kvGet(key: string): Promise<string | null> {
  const s = store()
  if (!s) return null
  const res = await fetch(`${s.url}/get/${key}`, { headers: { Authorization: `Bearer ${s.token}` } })
  if (!res.ok) throw new Error(`kv get ${res.status}`)
  const data = await res.json()
  return data?.result ?? null
}

export async function kvSet(key: string, value: string): Promise<void> {
  const s = store()
  if (!s) return
  const res = await fetch(`${s.url}/set/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${s.token}` },
    body: value,
  })
  if (!res.ok) throw new Error(`kv set ${res.status}`)
}
