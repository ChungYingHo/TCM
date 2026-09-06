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
  /** 內容裡的每個 `<li>`。用來在卡面顯示「共 N 個要點」並逐條給提示——光看主題想不
   *  起來的時候，知道要回想幾件事、再放一條出來，比直接翻答案有效（Aira 2026-08-05）。 */
  points: string[]
  /** 內容的純文字（去標籤、截在第一個公式前），沒有條列的卡片用它做局部提示。 */
  plain: string
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

/** 把一個 JS 字串常值（含頭尾引號）還原成它的值，單雙引號都吃。
 *  單引號轉成合法的 JSON 字串再交給 JSON.parse，跳脫序列（\\、\n、\u…）的語意才會一致。 */
function unquoteLiteral(literal: string): string {
  const quote = literal[0]
  const body = literal.slice(1, -1)
  if (quote === '"') return unquote(literal)
  let out = ''
  for (let i = 0; i < body.length; i++) {
    const ch = body[i]
    if (ch === '\\') {
      const next = body[i + 1] ?? ''
      // \' 在 JSON 不合法，直接還原成 '；其餘跳脫原樣留給 JSON.parse 處理
      out += next === "'" ? "'" : ch + next
      i++
    } else {
      out += ch === '"' ? '\\"' : ch
    }
  }
  try {
    return JSON.parse(`"${out}"`) as string
  } catch {
    return body
  }
}

/** 從 `[ … ]` 裡把字串常值一個個挑出來，**單引號與雙引號都吃**。
 *
 *  ⚠️ 2026-08-05 修的真實 bug：原本只有 JSON.parse 這條路，而 JSON 規格只認雙引號。
 *  chem-chemical-bonding、amino-acids、periodic-table 這三處的 JSX 陣列寫的是單引號
 *  （`options={['$\\ce{CCl4}$', …]}`），JSON.parse 直接拋錯 → 整組 options 與 steps
 *  變空陣列 → 每日練習題出現「有題目沒有選項」的題（120 題裡有 29 題中招）。
 *  筆記頁本身是 MDX 自己編譯的、完全正常，所以只有每日複習壞掉，很難察覺。
 *
 *  只取字串元素；陣列裡若有數字之類的非字串會被略過（本專案的陣列全是字串）。 */
function parseStringArray(src: string): string[] | null {
  const out: string[] = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (ch === '"' || ch === "'") {
      let j = i + 1
      while (j < src.length) {
        if (src[j] === '\\') {
          j += 2
          continue
        }
        if (src[j] === ch) break
        j++
      }
      if (j >= src.length) return null // 字串沒收尾＝抓錯範圍，寧可回 null
      out.push(unquoteLiteral(src.slice(i, j + 1)))
      i = j + 1
    } else {
      i++
    }
  }
  return out
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
        const span = attrs.slice(open, i + 1)
        // 先試 JSON（雙引號、含結尾逗號），不行再用容忍單引號的挑字串法。
        return parseJsonArray(span) ?? parseStringArray(span) ?? []
      }
    }
  }
  return []
}

/** 去掉 HTML 標籤，只留看得見的字。 */
function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '')
}

/** 主題最多幾個「看得見的字」。超過就當它不是主題，整則變成沒有標題的一列。 */
const TOPIC_MAX = 18

/** 第一個全形冒號之前是主題，但長度上限量的是**去掉標籤後**的字數。
 *  主題常包 `<code>`／`<b>`，標籤本身不該吃掉額度——`混成看 <code>X+E</code>` 看起來
 *  只有 9 個字，原始字串卻有 25 個，照原始長度算會把主題整個丟掉，卡片正面就退成
 *  問不出東西的「這篇的重點」（2026-08-24 全站抓到 7 則）。
 *  `Memorize.astro` 直接 import 這支，兩邊不會再各寫一份而漂移。 */
export function splitMemorizeItem(s: string): [topic: string, body: string] {
  const i = s.indexOf('：')
  if (i <= 0) return ['', s]
  const topic = s.slice(0, i)
  return stripTags(topic).length <= TOPIC_MAX ? [topic, s.slice(i + 1)] : ['', s]
}

/** 給必背卡內文的 `<ul>`／`<li>` 掛上 class。
 *  `.prose ul:not([class])` 會還原 markdown 條列的 disc 符號，而必背卡的條列是元件自排版
 *  （已有自己的 `·`）——沒有 class 就會兩個符號疊在一起。tailwind.css 的註解本來就要求
 *  「元件內自排版的 list 自帶 class」，這裡補上，不用比 CSS 特異性。 */
export function tagLists(html: string): string {
  return html.replace(/<ul>/g, '<ul class="mz-list">').replace(/<li>/g, '<li class="mz-item">')
}

/** 抽出每個 `<li>` 的內容。 */
export function listPoints(html: string): string[] {
  return [...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1].trim()).filter(Boolean)
}

/** 提示用的純文字：去標籤，並在**遇到第一個公式就停**。
 *  把 `$…$` 的 LaTeX 原始碼拆開會變成 `\Delta S_{宇宙}` 這種讀不懂的東西，
 *  截在公式前反而誠實——前面沒東西可提示時，UI 就不給提示按鈕。 */
export function plainText(html: string): string {
  return stripTags(html.split('$')[0])
    .replace(/\s+/g, ' ')
    .trim()
}

/** 找出每個自閉合的 `<Name …/>`，回傳各自的屬性字串。
 *  結尾的 `/>` 用逐字掃描找，**跳過引號字串裡的 `/>`**：非貪婪正則遇到 `q="上句<br/>下句"`
 *  會在 `<br/>` 就截斷，那一題的 options 與 answer 全部落在下一次比對之外、整題靜默消失
 *  （2026-09-05 動力學篇與 bio-cell-6 實抓）。遇到裸 `>` 代表是 children 寫法（`<Memorize>…</Memorize>`），
 *  不是自閉合標籤，跳過它繼續找下一個。 */
export function selfClosingAttrs(raw: string, name: string): string[] {
  const out: string[] = []
  const open = new RegExp(`<${name}\\b`, 'g')
  let m: RegExpExecArray | null
  while ((m = open.exec(raw))) {
    const start = m.index + m[0].length
    let quote = ''
    let end = -1
    let i = start
    for (; i < raw.length; i++) {
      const ch = raw[i]
      if (quote) {
        if (ch === '\\') i++
        else if (ch === quote) quote = ''
      } else if (ch === '"' || ch === "'") {
        quote = ch
      } else if (ch === '/' && raw[i + 1] === '>') {
        end = i
        break
      } else if (ch === '>') {
        break
      }
    }
    if (end >= 0) {
      out.push(raw.slice(start, end))
      open.lastIndex = end + 2
    } else {
      open.lastIndex = Math.max(open.lastIndex, i + 1)
    }
  }
  return out
}

/** Parse every `<Memorize items={[…]}/>` in one note's raw MDX into recall cards.
 *  `<Memorize>` 用 children（非 items）的舊式寫法沒有可拆的項目，直接跳過。 */
export function parseCards(raw: string, src: NoteReviewSource): NoteCard[] {
  const out: NoteCard[] = []
  for (const attrs of selfClosingAttrs(raw, 'Memorize')) {
    for (const item of arrayProp(attrs, 'items')) {
      const [topic, body] = splitMemorizeItem(item)
      if (!body.trim()) continue
      out.push({
        id: `${src.slug}-m-${out.length + 1}`,
        subject: src.subject,
        noteHref: src.href,
        noteTitle: src.title,
        topic,
        body,
        points: listPoints(body),
        plain: plainText(body),
      })
    }
  }
  return out
}

/** Parse every `<ExampleQuestion .../>` in one note's raw MDX into structured examples. */
export function parseExamples(raw: string, src: NoteReviewSource): NoteExample[] {
  const out: NoteExample[] = []
  for (const attrs of selfClosingAttrs(raw, 'ExampleQuestion')) {
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
