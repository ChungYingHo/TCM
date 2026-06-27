// Pure parser for the `<ExampleQuestion .../>` worked-examples authored inline in the
// note MDX. Extracting them at build time (server side, see /api/note-examples) keeps the
// notes the single source of truth — the daily-drill mix never drifts from what the note
// shows. No `import.meta.glob` here so this module stays safe to import client-side / in tests.
import type { NoteSubject } from '@/models/notes'

export interface NoteExample {
  id: string
  subject: NoteSubject
  noteHref: string
  noteTitle: string
  n: number
  q: string
  options: string[]
  answer: string
  steps: string[]
}

export interface NoteExampleSource {
  slug: string
  href: string
  title: string
  subject: NoteSubject
}

/** Unescape a JS/JSON double-quoted string literal (with the quotes). */
function unquote(literal: string): string {
  try {
    return JSON.parse(literal) as string
  } catch {
    return literal.replace(/^"|"$/g, '')
  }
}

/** Extract a JSX `key={[ ... ]}` array prop, respecting quotes so a literal `]` inside a
 *  string (e.g. "[Ar]") doesn't end the array early. Returns [] if absent/unparseable. */
function arrayProp(attrs: string, key: string): string[] {
  const at = attrs.indexOf(`${key}={`)
  if (at < 0) return []
  const open = attrs.indexOf('[', at)
  if (open < 0) return []
  let depth = 0
  let inStr = false
  let quote = ''
  for (let i = open; i < attrs.length; i++) {
    const ch = attrs[i]
    if (inStr) {
      if (ch === '\\') i++
      else if (ch === quote) inStr = false
      continue
    }
    if (ch === '"' || ch === "'") {
      inStr = true
      quote = ch
    } else if (ch === '[') {
      depth++
    } else if (ch === ']') {
      depth--
      if (depth === 0) {
        try {
          return JSON.parse(attrs.slice(open, i + 1)) as string[]
        } catch {
          return []
        }
      }
    }
  }
  return []
}

/** Concept tags a note declares it teaches — `<NoteStats tag="…">` and any
 *  `<RelatedQuestions tag="…" also={[…]}>`. This is the authoritative "what this note
 *  covers" signal (curated taxonomy tags, not LLM), used to keep the daily drill to
 *  exam questions the notes actually teach — never cold off-syllabus topics. */
export function parseNoteTags(raw: string): string[] {
  const tags = new Set<string>()
  for (const m of raw.matchAll(/<(?:NoteStats|RelatedQuestions)\b[^>]*?\btag="([^"]+)"/g)) {
    tags.add(m[1])
  }
  for (const m of raw.matchAll(/<RelatedQuestions\b[^>]*?\balso=\{(\[[^\]]*\])\}/g)) {
    try {
      for (const t of JSON.parse(m[1]) as string[]) tags.add(t)
    } catch {
      /* malformed also={} — skip */
    }
  }
  return [...tags]
}

/** Parse every `<ExampleQuestion .../>` in one note's raw MDX into structured examples. */
export function parseExamples(raw: string, src: NoteExampleSource): NoteExample[] {
  const out: NoteExample[] = []
  const re = /<ExampleQuestion\b([\s\S]*?)\/>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw))) {
    const attrs = m[1]
    const qMatch = attrs.match(/\bq=("(?:[^"\\]|\\.)*")/)
    const q = qMatch ? unquote(qMatch[1]) : ''
    if (!q) continue // reveal-only / malformed — skip rather than ship a blank stem
    const aMatch = attrs.match(/\banswer=("(?:[^"\\]|\\.)*")/)
    const nMatch = attrs.match(/\bn=\{\s*(\d+)\s*\}/)
    const n = nMatch ? Number(nMatch[1]) : out.length + 1
    out.push({
      id: `${src.slug}-ex-${n}`,
      subject: src.subject,
      noteHref: src.href,
      noteTitle: src.title,
      n,
      q,
      options: arrayProp(attrs, 'options'),
      answer: aMatch ? unquote(aMatch[1]) : '',
      steps: arrayProp(attrs, 'steps'),
    })
  }
  return out
}
