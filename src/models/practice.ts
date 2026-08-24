/** 補習班國文實力測驗：每份一個 JSON 分片，由 `pipeline/gen_practice_tests.py` 產出。
 *  和三校考古題（`models/question.ts`）完全分開——來源、編號、計分規則都不一樣。 */

export type PracticeLetter = 'A' | 'B' | 'C' | 'D' | 'E'

export const PRACTICE_LETTERS: PracticeLetter[] = ['A', 'B', 'C', 'D']

export interface PracticeQuestion {
  n: number
  /** 只從 PDF 的【解答】表拿。理論上不會缺，缺了就是那份的版型變了。 */
  answer: PracticeLetter | null
  /** 題目裁圖。**畫面顯示一律用這張**，不用抽出來的文字。 */
  img: string
  w: number
  h: number
  /** 抽得乾淨時才有，只拿來當圖片的替代文字。有些頁的雙層文字會抽壞，那種就沒有。 */
  stem?: string
  /** 該份 PDF【詳解】裡對應這一題的段落。原始 PDF 不是每題都寫。 */
  explain?: string
}

export interface PracticeTest {
  code: string
  title: string
  questionCount: number
  answeredCount: number
  explainedCount: number
  stemCount: number
  keyCount: number
  questions: PracticeQuestion[]
}

/** 作答紀錄：題號 → 選的字母。存在 localStorage，換一份測驗各存各的。 */
export type PracticeAnswers = Record<string, PracticeLetter>

export function practiceStoreKey(code: string): string {
  return `tcm.practice.${code}.v1`
}

export interface PracticeScore {
  answered: number
  correct: number
  total: number
}

export function scorePractice(test: PracticeTest, answers: PracticeAnswers): PracticeScore {
  let answered = 0
  let correct = 0
  for (const q of test.questions) {
    const picked = answers[String(q.n)]
    if (!picked) continue
    answered++
    if (q.answer && picked === q.answer) correct++
  }
  return { answered, correct, total: test.questionCount }
}
