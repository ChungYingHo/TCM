// Pure parsers for the review material authored inline in the note MDX：
//  - `<Memorize items={[...]}/>` → 必背回想卡（每天排班複習的主體）
//  - `<ExampleQuestion .../>`    → 練習題
// 在 build 時於伺服器端抽出（見 /api/note-review），筆記因此是唯一來源——每日複習永遠
// 不會和筆記顯示的內容分歧。這裡不用 `import.meta.glob`，模組才能安全地被前端／測試 import。
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

/** 一則必背項目＝一張回想卡：正面問 `topic`，翻開看 `body`（條列 HTML）。 */
export interface NoteCard {
  id: string
  subject: NoteSubject
  noteHref: string
  noteTitle: string
  /** 「主題：內容」的主題；沒有主題的項目為空字串（正面改問出處）。 */
  topic: string
  /** 內容，原樣的 HTML 片段（`<ul>`／`<code>`／`<sub>`…），與筆記裡看到的一致。 */
  body: string
}

export interface NoteReviewSource {
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

/** 去掉 `]`／`}` 前的結尾逗號。JSX 陣列常寫成多行帶結尾逗號，那在 JSON 是語法錯——
 *  不處理的話整組 items 會靜靜地變成空陣列，而且沒有任何測試會抓到。 */
export function stripTrailingCommas(json: string): string {
  let out = ''
  let inStr = false
  let quote = ''
  for (let i = 0; i < json.length; i++) {
    const ch = json[i]
    if (inStr) {
      out += ch
      if (ch === '\\') out += json[++i] ?? ''
      else if (ch === quote) inStr = false
      continue
    }
    if (ch === '"' || ch === "'") {
      inStr = true
      quote = ch
    } else if (ch === ',') {
      const next = json.slice(i + 1).match(/^\s*([\]}])/)
      if (next) continue // 結尾逗號，丟掉
    }
    out += ch
  }
  return out
}

function parseJsonArray(src: string): string[] | null {
  for (const candidate of [src, stripTrailingCommas(src)]) {
    try {
      const v: unknown = JSON.parse(candidate)
      if (Array.isArray(v)) return v as string[]
    } catch {
      /* try the next candidate */
    }
  }
  return null
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
      if (depth === 0) return parseJsonArray(attrs.slice(open, i + 1)) ?? []
    }
  }
  return []
}

/** 與 Memorize.svelte 相同的拆法：第一個全形冒號之前（≤18 字）是主題。兩邊必須一致，
 *  否則卡片正面問的主題會和筆記顯示的欄位對不起來。 */
export function splitMemorizeItem(s: string): [topic: string, body: string] {
  const i = s.indexOf('：')
  return i > 0 && i <= 18 ? [s.slice(0, i), s.slice(i + 1)] : ['', s]
}

/** Parse every `<Memorize items={[…]}/>` in one note's raw MDX into recall cards.
 *  `<Memorize>` 用 children（非 items）的舊式寫法沒有可拆的項目，直接跳過。 */
export function parseCards(raw: string, src: NoteReviewSource): NoteCard[] {
  const out: NoteCard[] = []
  for (const m of raw.matchAll(/<Memorize\b([\s\S]*?)\/>/g)) {
    for (const item of arrayProp(m[1], 'items')) {
      const [topic, body] = splitMemorizeItem(item)
      if (!body.trim()) continue
      out.push({
        id: `${src.slug}-m-${out.length + 1}`,
        subject: src.subject,
        noteHref: src.href,
        noteTitle: src.title,
        topic,
        body,
      })
    }
  }
  return out
}

/** Parse every `<ExampleQuestion .../>` in one note's raw MDX into structured examples. */
export function parseExamples(raw: string, src: NoteReviewSource): NoteExample[] {
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
