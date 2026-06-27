import type { APIRoute } from 'astro'
import { NOTES, type NoteSubject } from '@/models/notes'
import { parseExamples, parseNoteTags, type NoteExample } from '@/utils/noteExamples'

export const prerender = false

export interface NoteDrillData {
  examples: NoteExample[]
  /** 每科筆記實際涵蓋的考點 tag（NoteStats/RelatedQuestions 宣告）；用來把每日刷題的考古題
   *  限縮在「筆記真的有教」的範圍內，不撈到沒寫過的考點。 */
  coveredTags: Partial<Record<NoteSubject, string[]>>
}

// Raw-import the note MDX server-side and pull out the inline worked examples + covered tags
// once at module load. Server-only `import.meta.glob` so the full note prose never reaches the
// client bundle — the daily drill fetches just this lean JSON. Notes stay the single source.
const RAW = import.meta.glob('/src/pages/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function build(): NoteDrillData {
  const byHref = new Map(NOTES.map((n) => [n.href, n]))
  const examples: NoteExample[] = []
  const tags = new Map<NoteSubject, Set<string>>()
  for (const [path, raw] of Object.entries(RAW)) {
    const slug = path.replace(/^.*\/([^/]+)\.mdx$/, '$1')
    const note = byHref.get(`/${slug}`)
    if (!note) continue
    examples.push(...parseExamples(raw, { slug, href: note.href, title: note.title, subject: note.subject }))
    const set = tags.get(note.subject) ?? new Set<string>()
    for (const t of parseNoteTags(raw)) set.add(t)
    tags.set(note.subject, set)
  }
  const coveredTags: Partial<Record<NoteSubject, string[]>> = {}
  for (const [subject, set] of tags) coveredTags[subject] = [...set]
  return { examples, coveredTags }
}

const BODY = JSON.stringify(build())

export const GET: APIRoute = () =>
  new Response(BODY, {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'private, max-age=3600',
    },
  })
