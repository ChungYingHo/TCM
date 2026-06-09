import type { VocabData } from '@/models/vocab'

let cache: Promise<VocabData> | null = null

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
