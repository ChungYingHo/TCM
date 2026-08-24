import type { APIRoute } from 'astro'
import type { SyncState } from '@/models/progress'
import { kvEnabled, kvGet, kvSet } from '@/utils/kv'

export const prerender = false

// Single-user personal tool → one key holds the whole (tiny) state document.
const KEY = 'tcm:state:v1'
const EMPTY: SyncState = { wrongbook: {}, progress: {}, updatedAt: 0 }

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

/** 只收「一包 id → 紀錄」的物件，其餘一律當空的。 */
const obj = (v: unknown): Record<string, never> =>
  v && typeof v === 'object' ? (v as Record<string, never>) : {}

/**
 * PUT 要原封收下的欄位。`Required<>` 讓**漏收一欄變成編譯錯誤**，而不是等使用者的資料被
 * 清光才發現：2026-08-24 就是這裡漏收 `vocabSrsEpoch` 與 `noteCardSrs`，epoch 存不進雲端
 * → 每次 GET 回來都對不上世代 → cloud.ts 把整包單字複習進度清成空的 → Aira 三週打不開
 * 「複習單字」。以後 SyncState 新增欄位，這裡不處理就編不過。
 */
type StoredStores = Required<Omit<SyncState, 'vocabSrsEpoch'>>

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
  let state: SyncState
  try {
    const body = await request.json()
    const st = body?.state
    if (!st || typeof st !== 'object') {
      return json({ error: 'missing_state' }, 400)
    }
    const stores: StoredStores = {
      wrongbook: obj(st.wrongbook),
      progress: obj(st.progress),
      vocabSrs: obj(st.vocabSrs),
      elementSrs: obj(st.elementSrs),
      classicSrs: obj(st.classicSrs),
      aminoAcidSrs: obj(st.aminoAcidSrs),
      noteCardSrs: obj(st.noteCardSrs),
      updatedAt: typeof st.updatedAt === 'number' ? st.updatedAt : Date.now(),
    }
    // 世代是數字、不是 store，所以單獨處理：**原樣轉存，絕不自己編一個預設值**。
    // 編一個就等於謊報世代，cloud.ts 會據此把整包 vocabSrs 丟掉。客戶端沒送就不存這欄。
    state =
      typeof st.vocabSrsEpoch === 'number' ? { ...stores, vocabSrsEpoch: st.vocabSrsEpoch } : stores
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
