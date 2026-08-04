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
