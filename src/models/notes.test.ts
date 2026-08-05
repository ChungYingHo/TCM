import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import {
  NOTES,
  NOTE_SUBJECTS,
  noteCategory,
  notesIn,
  siblingNotes,
  subjectSummary,
} from '@/models/notes'
import { parseCards, parseExamples } from '@/utils/noteReview'

const PAGES = path.resolve('./src/pages')

/** 每篇筆記在 src/pages 底下的實際檔案（MDX 筆記或工具頁的 index.astro）。 */
function pageFile(href: string): string | null {
  const slug = href.replace(/^\//, '')
  for (const p of [`${slug}.mdx`, `${slug}/index.astro`, `${slug}.astro`]) {
    const full = path.join(PAGES, p)
    if (existsSync(full)) return full
  }
  return null
}

describe('notes registry', () => {
  it('every id and href is unique', () => {
    expect(new Set(NOTES.map((n) => n.id)).size).toBe(NOTES.length)
    expect(new Set(NOTES.map((n) => n.href)).size).toBe(NOTES.length)
  })

  it('every registered note has a real page', () => {
    for (const n of NOTES) expect(pageFile(n.href), `no page for ${n.href}`).not.toBeNull()
  })

  it('siblingNotes walks within the same category + subject', () => {
    const chem = notesIn('考點筆記', '化學')
    const { current, prev, next } = siblingNotes(chem[1].href)
    expect(current?.id).toBe(chem[1].id)
    expect(prev?.id).toBe(chem[0].id)
    expect(next?.id).toBe(chem[2].id)
  })
})

// 必背卡的 items 是 JSX 的雙引號字串，KaTeX 指令必須寫 `\\dfrac`（兩個反斜線）。
// 只寫一個會安靜地壞掉，而且兩種壞法都不會有人發現：
//   `\t`、`\n` 這類 → 變成控制字元，畫面印出 `imes`、`frac{}` 這種怪字。
//   其他 `\x`     → JSON.parse 直接失敗，**整組 items 變空陣列**，必背卡與每日複習一起消失。
// 這兩條就是專門守它的（2026-08-05 真的踩過）。
describe('必背卡的 items 沒有寫壞', () => {
  const withMemorize = NOTES.map((n) => ({ n, file: pageFile(n.href) }))
    .filter((x) => x.file && readFileSync(x.file, 'utf8').includes('<Memorize'))

  it('有寫 <Memorize items> 的筆記都解析得出卡片（解析失敗會整組變空）', () => {
    expect(withMemorize.length).toBeGreaterThan(15)
    for (const { n, file } of withMemorize) {
      const raw = readFileSync(file!, 'utf8')
      if (!raw.includes('items={[')) continue
      const cards = parseCards(raw, { slug: n.id, href: n.href, title: n.title, subject: n.subject })
      expect(cards.length, `${n.title}（${n.href}）的必背卡解析成 0 張——多半是某個 \\ 沒寫成 \\\\`).toBeGreaterThan(0)
    }
  })

  it('卡片內容沒有控制字元（\\t 之類被吃掉的反斜線）', () => {
    for (const { n, file } of withMemorize) {
      const raw = readFileSync(file!, 'utf8')
      const cards = parseCards(raw, { slug: n.id, href: n.href, title: n.title, subject: n.subject })
      for (const c of cards) {
        // eslint-disable-next-line no-control-regex
        const bad = /[\u0000-\u001f]/.exec(c.topic + c.body)
        expect(bad, `${n.title} 的「${c.topic}」含控制字元，檢查 LaTeX 是否少寫一個反斜線`).toBeNull()
      }
    }
  })
})

// 每日練習題直接吃 parseExamples 的產出。選項若解析成空陣列，題目會變成「有題幹沒有選項」
// 的廢題——而筆記頁自己是 MDX 編譯的、看起來完全正常，所以只看筆記永遠發現不了。
// 2026-08-05 真的發生過：三篇用單引號寫 JSX 陣列，120 題裡有 29 題中招。
describe('每篇筆記的例題都能出成可作答的題', () => {
  const withExamples = NOTES.map((n) => ({ n, file: pageFile(n.href) })).filter(
    (x) => x.file && readFileSync(x.file, 'utf8').includes('<ExampleQuestion'),
  )

  it('例題的選項不會解析成空陣列', () => {
    expect(withExamples.length).toBeGreaterThan(15)
    const broken: string[] = []
    for (const { n, file } of withExamples) {
      const raw = readFileSync(file!, 'utf8')
      for (const ex of parseExamples(raw, { slug: n.id, href: n.href, title: n.title, subject: n.subject })) {
        if (!ex.options.length) broken.push(`${n.title} 例 ${ex.n}`)
      }
    }
    expect(broken, `這些例題抽出來沒有選項，每日練習會變成廢題：\n${broken.join('\n')}`).toEqual([])
  })

  it('例題的解題步驟不會解析成空陣列', () => {
    const broken: string[] = []
    for (const { n, file } of withExamples) {
      const raw = readFileSync(file!, 'utf8')
      for (const ex of parseExamples(raw, { slug: n.id, href: n.href, title: n.title, subject: n.subject })) {
        if (!ex.steps.length) broken.push(`${n.title} 例 ${ex.n}`)
      }
    }
    expect(broken, `這些例題抽出來沒有步驟：\n${broken.join('\n')}`).toEqual([])
  })
})

describe('每科一份速查總表', () => {
  it('每科都恰好有一份「快速複習」總表', () => {
    for (const s of NOTE_SUBJECTS) {
      const summaries = NOTES.filter((n) => n.subject === s && noteCategory(n) === '快速複習')
      expect(summaries.length, `${s} 應有 1 份總表，實際 ${summaries.length} 份`).toBe(1)
    }
  })

  // 這條是防漂移的主力：寫了新筆記卻忘了回去更新該科總表，這裡會紅。
  it('每篇考點筆記都被自己科目的總表連到', () => {
    for (const s of NOTE_SUBJECTS) {
      const summary = subjectSummary(s)
      expect(summary, `${s} 沒有總表`).toBeDefined()
      const file = pageFile(summary!.href)
      expect(file, `找不到 ${summary!.href} 的檔案`).not.toBeNull()
      const raw = readFileSync(file!, 'utf8')
      for (const n of notesIn('考點筆記', s)) {
        expect(
          raw.includes(`](${n.href})`),
          `${summary!.title} 沒有連到「${n.title}」（${n.href}）——寫完筆記要回去更新總表`,
        ).toBe(true)
      }
    }
  })
})
