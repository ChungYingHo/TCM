import type { NoteDrillData } from '@/pages/api/note-examples'

let cache: Promise<NoteDrillData> | null = null

/** Lazily fetch the note worked-examples + per-subject covered tags (parsed from MDX
 *  server-side), cached in-module. */
export function loadNoteDrillData(): Promise<NoteDrillData> {
  if (!cache) {
    cache = fetch('/api/note-examples').then((res) => {
      if (!res.ok) throw new Error(`failed to load note drill data: ${res.status}`)
      return res.json() as Promise<NoteDrillData>
    })
    cache.catch(() => (cache = null))
  }
  return cache
}
