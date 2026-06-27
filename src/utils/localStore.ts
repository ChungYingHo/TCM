// One localStorage-backed JSON store: cached read, quota-safe write, and a
// `tcm:statechange` broadcast on every non-silent write so cloud.ts can sync.
// Backs progress / wrongBook / every Leitner instance — previously three
// byte-identical copies of this block that had to be kept in lockstep.

export interface JsonStore<T> {
  /** Cached parse of the key (falls back to `fallback()` on missing/corrupt data). */
  read(): T
  /** Persist + cache; `silent` skips the statechange event (used by cloud restore). */
  write(value: T, silent?: boolean): void
}

export function createJsonStore<T extends object>(
  key: string,
  fallback: () => T = () => ({}) as T,
): JsonStore<T> {
  let cache: T | null = null

  return {
    read() {
      if (typeof localStorage === 'undefined') return cache ?? fallback()
      // Fast path: reuse cache while the key still exists (getItem is cheap;
      // JSON.parse is not). Cache invalidates if the key was removed externally
      // (localStorage.clear() / removeItem, e.g. between test runs).
      if (cache !== null && localStorage.getItem(key) !== null) return cache
      try {
        const v = JSON.parse(localStorage.getItem(key) || 'null')
        cache = v && typeof v === 'object' ? (v as T) : fallback()
      } catch {
        cache = fallback()
      }
      return cache
    },

    write(value, silent = false) {
      cache = value
      if (typeof localStorage === 'undefined') return
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch { /* QuotaExceededError — data stays in memory, retries on next write */ }
      if (!silent && typeof window !== 'undefined') window.dispatchEvent(new Event('tcm:statechange'))
    },
  }
}
