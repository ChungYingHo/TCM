import type { VocabData } from '@/models/vocab'

let cache: Promise<VocabData> | null = null
let legacyCache: Promise<VocabData> | null = null

/**
 * Lazily fetch the vocab dataset from the gated API, cached in-module so multiple
 * components (今日複習 / 單字頁) share one request. ~1.2MB, kept out of the main bundle.
 */
export function loadVocab(): Promise<VocabData> {
  if (!cache) {
    cache = fetch('/api/data/vocab').then((res) => {
      if (!res.ok) throw new Error(`failed to load vocab: ${res.status}`)
      return res.json() as Promise<VocabData>
    })
    cache.catch(() => (cache = null)) // let a later mount retry after a failed load
  }
  return cache
}

/**
 * 原字庫（舊 GRE/TOEFL 3240 字）—— 已下架為次要，只有使用者在 /vocab 切到「原字庫」時才抓，
 * 獨立 cache，不進預設載入路徑。
 */
export function loadLegacyVocab(): Promise<VocabData> {
  if (!legacyCache) {
    legacyCache = fetch('/api/data/vocab-legacy').then((res) => {
      if (!res.ok) throw new Error(`failed to load legacy vocab: ${res.status}`)
      return res.json() as Promise<VocabData>
    })
    legacyCache.catch(() => (legacyCache = null)) // let a later mount retry after a failed load
  }
  return legacyCache
}
