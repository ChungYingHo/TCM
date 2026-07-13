import { describe, it, expect } from 'vitest'
import { READING_R1, READING_R1_META } from '@/data/reading-r1'
import { READING_R2, READING_R2_META } from '@/data/reading-r2'

const SETS = [
  { code: 'R1', meta: READING_R1_META, articles: READING_R1 },
  { code: 'R2', meta: READING_R2_META, articles: READING_R2 },
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

  it('every word has word/pos/en/zh filled', () => {
    for (const a of articles) {
      for (const w of a.words) {
        expect(w.word.trim().length).toBeGreaterThan(0)
        expect(w.pos.trim().length).toBeGreaterThan(0)
        expect(w.en.trim().length).toBeGreaterThan(0)
        expect(w.zh.trim().length).toBeGreaterThan(0)
      }
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
