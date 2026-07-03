import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PREFIX_GROUPS, prefixById, type VocabData } from '@/models/vocab'

// 出貨的字根字彙字庫（原字庫 3240 字已封存於 vocab-legacy.json，不在此測）。
const vocab = JSON.parse(readFileSync(path.resolve('./src/data/vocab.json'), 'utf8')) as VocabData

describe('字根字彙 corpus (src/data/vocab.json)', () => {
  it('是手工小字庫，非舊 3240 字庫', () => {
    expect(vocab.words.length).toBeGreaterThan(10)
    expect(vocab.words.length).toBeLessThan(400) // 防舊 3240 字庫溜回來
    expect(vocab.count).toBe(vocab.words.length)
  })

  it('每字都有合法字首、非空字根拆解（含字義）、KK 音標、例句與中文', () => {
    for (const w of vocab.words) {
      expect(w.id, `${w.word} 的 id 應等於 word`).toBe(w.word)
      expect(prefixById(w.prefixId ?? ''), `未知 prefixId「${w.prefixId}」於 ${w.word}`).toBeDefined()
      expect((w.parts?.length ?? 0) > 0, `${w.word} 缺字根拆解 parts`).toBe(true)
      for (const p of w.parts ?? []) {
        expect(p.text.length, `${w.word} 有空的 part.text`).toBeGreaterThan(0)
        expect(p.gloss.length, `${w.word} 的字根「${p.text}」缺字義 gloss`).toBeGreaterThan(0)
      }
      expect(w.phonetic.length, `${w.word} 缺音標`).toBeGreaterThan(0)
      expect(w.example.length, `${w.word} 缺例句`).toBeGreaterThan(0)
      expect(w.zh.length, `${w.word} 缺中文`).toBeGreaterThan(0)
    }
  })

  it('PREFIX_GROUPS 的 id 不重複、order 為 1..N', () => {
    const ids = PREFIX_GROUPS.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
    const orders = PREFIX_GROUPS.map((g) => g.order).sort((a, b) => a - b)
    expect(orders).toEqual(PREFIX_GROUPS.map((_, i) => i + 1))
  })
})
