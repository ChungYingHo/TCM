// Fire-and-forget opener for the global note dialog mounted once in Layout.astro.
// Any component can surface a 考點筆記 without prop-drilling: openNote('atomic-structure').
export interface OpenNoteDetail {
  slug: string
  title?: string
}

export function openNote(slug: string, title = ''): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<OpenNoteDetail>('tcm:opennote', { detail: { slug, title } }))
}
