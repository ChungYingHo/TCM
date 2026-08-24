import { describe, it, expect } from 'vitest'
import { READING_R1, READING_R1_META } from '@/data/reading-r1'
import { READING_R2, READING_R2_META } from '@/data/reading-r2'
import { READING_R3, READING_R3_META } from '@/data/reading-r3'
import { READING_R4, READING_R4_META } from '@/data/reading-r4'
import { READING_R5, READING_R5_META } from '@/data/reading-r5'

const SETS = [
  { code: 'R1', meta: READING_R1_META, articles: READING_R1 },
  { code: 'R2', meta: READING_R2_META, articles: READING_R2 },
  { code: 'R3', meta: READING_R3_META, articles: READING_R3 },
  { code: 'R4', meta: READING_R4_META, articles: READING_R4 },
  { code: 'R5', meta: READING_R5_META, articles: READING_R5 },
]

describe.each(SETS)('reading $code data integrity', ({ meta, articles }) => {
  it('meta.articleCount matches array length', () => {
    expect(meta.articleCount).toBe(articles.length)
  })

  it('meta.wordCount matches total words', () => {
    const total = articles.reduce((n, a) => n + a.words.length, 0)
    expect(meta.wordCount).toBe(total)
  })

  it('article ids are 1..N sequential', () => {
    expect(articles.map((a) => a.id)).toEqual(articles.map((_, i) => i + 1))
  })

  it('every article has non-empty title, topic, content and words', () => {
    for (const a of articles) {
      expect(a.title.trim().length).toBeGreaterThan(0)
      expect(a.topic.trim().length).toBeGreaterThan(0)
      expect(a.content.trim().length).toBeGreaterThan(0)
      expect(a.words.length).toBeGreaterThan(0)
    }
  })

  // R1／R2 來自 VOA 的 Words in This Story，有英文釋義。R3 以後的講義只給中譯，
  // 所以 en 是選填的，pos 也允許空（`NGO 即 nongovernmental organization` 這種縮寫展開
  // 原卷就沒標詞性）。word 與 zh 一定要有，缺了那一條在字彙表裡就是空的。
  it('every word has word and zh filled, and en when present is non-empty', () => {
    for (const a of articles) {
      for (const w of a.words) {
        expect(w.word.trim().length, `${a.title} 有詞條沒有單字`).toBeGreaterThan(0)
        expect(w.zh.trim().length, `${a.title}「${w.word}」沒有中譯`).toBeGreaterThan(0)
        if (w.en !== undefined) expect(w.en.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('no duplicate words within an article', () => {
    for (const a of articles) {
      const lower = a.words.map((w) => w.word.toLowerCase())
      expect(new Set(lower).size, `${a.title} 的字彙表有重複`).toBe(lower.length)
    }
  })

  it('match forms, when present, are non-empty', () => {
    for (const a of articles) {
      for (const w of a.words) {
        if (!w.match) continue
        expect(w.match.length).toBeGreaterThan(0)
        for (const f of w.match) expect(f.trim().length).toBeGreaterThan(0)
      }
    }
  })
})

// R3 以後的 match 是直接從 PDF 裡「被加粗的那些字」抽出來的，所以每個表面形都一定
// 出現在內文。這條就是在守那件事：抽壞了底線會標不到，畫面上看不出來。
describe.each([
  { code: 'R3', articles: READING_R3 },
  { code: 'R4', articles: READING_R4 },
  { code: 'R5', articles: READING_R5 },
])('reading $code 的底線表面形都在內文裡', ({ articles }) => {
  it('每個 match 形都能在該篇文章找到', () => {
    const missing: string[] = []
    for (const a of articles) {
      for (const w of a.words) {
        for (const f of w.match ?? []) {
          const escaped = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          if (!new RegExp(`\\b${escaped}\\b`, 'i').test(a.content)) {
            missing.push(`${a.title}：${f}`)
          }
        }
      }
    }
    expect(missing, `這些表面形標不到底線：\n${missing.join('\n')}`).toEqual([])
  })
})

// R2 保證每個詞條（或其 match 屈折形）都真的出現在該篇內文，底線才標得到。
// R1 早於 match 慣例、部分詞條只以屈折形出現，故此嚴格檢查僅套用於 R2。
describe('reading R2 highlight forms appear in content', () => {
  it('every vocab surface form is present in its article passage', () => {
    for (const a of READING_R2) {
      for (const w of a.words) {
        const forms = w.match ?? [w.word]
        for (const f of forms) {
          const escaped = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const re = new RegExp(`\\b${escaped}\\b`, 'i')
          expect(re.test(a.content), `${a.title}: "${f}" not found in passage`).toBe(true)
        }
      }
    }
  })
})
