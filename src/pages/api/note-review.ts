import type { APIRoute } from 'astro'
import { NOTES } from '@/models/notes'
import { parseCards, parseExamples, type NoteCard, type NoteExample } from '@/utils/noteReview'

export const prerender = false

export interface NoteReviewData {
  /** 必背回想卡，每日複習排班的主體。 */
  cards: NoteCard[]
  /** 筆記裡的互動例題，當每日練習題。 */
  examples: NoteExample[]
}

// Raw-import the note MDX server-side and pull out the recall cards + worked examples once at
// module load. Server-only `import.meta.glob` so the full note prose never reaches the client
// bundle — 每日複習只抓這份精簡 JSON。筆記維持唯一來源。
// `*.mdx` 是一般筆記；`*/index.astro` 是週期表與胺基酸這類工具頁——它們同樣寫 `<Memorize>`，
// 這樣「元素／胺基酸」就跟其他化學一起進排班，不必另做小遊戲。
const RAW = {
  ...(import.meta.glob('/src/pages/*.mdx', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>),
  ...(import.meta.glob('/src/pages/*/index.astro', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>),
}

function build(): NoteReviewData {
  const byHref = new Map(NOTES.map((n) => [n.href, n]))
  const cards: NoteCard[] = []
  const examples: NoteExample[] = []
  for (const [path, raw] of Object.entries(RAW)) {
    const slug = path.replace(/^.*\/([^/]+)\.mdx$/, '$1').replace(/^.*\/([^/]+)\/index\.astro$/, '$1')
    const note = byHref.get(`/${slug}`)
    if (!note) continue
    const src = { slug, href: note.href, title: note.title, subject: note.subject }
    cards.push(...parseCards(raw, src))
    examples.push(...parseExamples(raw, src))
  }
  return { cards, examples }
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
