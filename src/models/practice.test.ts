import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import type { PracticeTest } from '@/models/practice'
import { PRACTICE_LETTERS, scorePractice } from '@/models/practice'
import { NOTES } from '@/models/notes'

const DATA = path.resolve('./src/data/practice')
const PUBLIC = path.resolve('./public')
const PAGES = path.resolve('./src/pages/practice')

const files = readdirSync(DATA).filter((f) => f.endsWith('.json'))
const tests: PracticeTest[] = files.map(
  (f) => JSON.parse(readFileSync(path.join(DATA, f), 'utf8')) as PracticeTest,
)

// 這批資料是腳本產的，重跑一次就整份換掉。答案錯了畫面不會壞、只會安靜地把對的判成錯的，
// 所以每一條都盯著「產出有沒有缺角」，而不是盯畫面。
describe('國文實力測驗的資料分片', () => {
  it('至少有 12 份，每份都解析得出題目', () => {
    expect(tests.length).toBeGreaterThanOrEqual(12)
    for (const t of tests) expect(t.questions.length, `${t.code} 沒有題目`).toBeGreaterThan(0)
  })

  it('題數與答案卡數一致，且每一題都有答案', () => {
    for (const t of tests) {
      expect(t.questions.length, `${t.code} 題數對不上 questionCount`).toBe(t.questionCount)
      expect(t.keyCount, `${t.code} 答案卡只讀到 ${t.keyCount} 個`).toBe(t.questionCount)
      const noAnswer = t.questions.filter((q) => !q.answer).map((q) => q.n)
      expect(noAnswer, `${t.code} 這幾題沒有答案：${noAnswer.join(',')}`).toEqual([])
    }
  })

  it('答案只會是 A 到 D', () => {
    for (const t of tests) {
      for (const q of t.questions) {
        expect(PRACTICE_LETTERS, `${t.code} 第 ${q.n} 題的答案是 ${q.answer}`).toContain(q.answer)
      }
    }
  })

  it('題號從 1 開始連號，不重複', () => {
    for (const t of tests) {
      const nums = t.questions.map((q) => q.n)
      expect(new Set(nums).size, `${t.code} 題號有重複`).toBe(nums.length)
      expect(nums, `${t.code} 題號不連續`).toEqual(nums.map((_, i) => i + 1))
    }
  })

  it('每一題的裁圖都真的存在，尺寸不是 0', () => {
    for (const t of tests) {
      for (const q of t.questions) {
        expect(existsSync(path.join(PUBLIC, q.img)), `${t.code} 缺圖 ${q.img}`).toBe(true)
        expect(q.w, `${t.code} 第 ${q.n} 題圖寬為 0`).toBeGreaterThan(0)
        expect(q.h, `${t.code} 第 ${q.n} 題圖高為 0`).toBeGreaterThan(0)
      }
    }
  })

  // 抽出來的題幹只在「確定沒被雙層文字弄壞」時才留。這條防的是門檻被調鬆之後，
  // 疊字的句子（「若以以」「酒酒入豪腸」）悄悄變成圖片的替代文字。
  it('留下來的題幹沒有疊字', () => {
    const doubled: string[] = []
    for (const t of tests) {
      for (const q of t.questions) {
        if (!q.stem) continue
        const s = q.stem.replace(/\s/g, '')
        if (s.length < 8) continue
        const rate = [...s].filter((c, i) => i > 0 && c === s[i - 1]).length / (s.length - 1)
        if (rate > 0.04) doubled.push(`${t.code} 第 ${q.n} 題：${q.stem.slice(0, 24)}`)
      }
    }
    expect(doubled, `這些題幹疑似被雙層文字弄壞：\n${doubled.join('\n')}`).toEqual([])
  })

  it('每份都有註冊成筆記，也都有自己的頁面檔', () => {
    for (const t of tests) {
      const entry = NOTES.find((n) => n.href === `/practice/${t.code}`)
      expect(entry, `${t.code} 沒有註冊進 NOTES`).toBeDefined()
      expect(existsSync(path.join(PAGES, `${t.code}.astro`)), `${t.code} 沒有頁面檔`).toBe(true)
    }
  })
})

describe('scorePractice', () => {
  const t = {
    code: 'X',
    title: 'x',
    questionCount: 3,
    answeredCount: 3,
    explainedCount: 0,
    stemCount: 0,
    keyCount: 3,
    questions: [
      { n: 1, answer: 'A', img: '', w: 1, h: 1 },
      { n: 2, answer: 'B', img: '', w: 1, h: 1 },
      { n: 3, answer: 'C', img: '', w: 1, h: 1 },
    ],
  } as PracticeTest

  it('只算已作答的，答對才加分', () => {
    expect(scorePractice(t, { 1: 'A', 2: 'D' })).toEqual({ answered: 2, correct: 1, total: 3 })
  })

  it('沒作答時全部是 0', () => {
    expect(scorePractice(t, {})).toEqual({ answered: 0, correct: 0, total: 3 })
  })
})
