import type { NoteReviewData } from '@/pages/api/note-review'

let cache: Promise<NoteReviewData> | null = null

/** Lazily fetch the note recall cards + worked examples (parsed from MDX server-side),
 *  cached in-module. */
export function loadNoteReviewData(): Promise<NoteReviewData> {
  if (!cache) {
    cache = fetch('/api/note-review').then((res) => {
      if (!res.ok) throw new Error(`failed to load note review data: ${res.status}`)
      return res.json() as Promise<NoteReviewData>
    })
    cache.catch(() => (cache = null))
  }
  return cache
}
