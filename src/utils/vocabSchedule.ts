// 每日單字排程：把整個字根字庫依「字首（prefix）組順序」排成一條清單，每天取接下來的 20 個。
// 起算日 = 使用者開始的那天（day 0）；每天前進 20 個，跑到底繞回開頭 → 永遠剛好 20、循環。
// 一個字首組可能被切到相鄰兩天（字根順序連續、跨日不中斷）。起算日之前一律當 day 0。
import { PREFIX_GROUPS, type VocabWord } from '@/models/vocab'
import { parseYmd } from '@/utils/date'

/** 每日單字排程起算日（day 0）。Aira 2026-07-06 開始。 */
export const VOCAB_SCHEDULE_START = '2026-07-06'

/** 每日單字數量。 */
export const VOCAB_PER_DAY = 20

/** 起算日到 dayKey 的天數（day 0 = 起算日）；起算日之前一律回 0。 */
export function vocabDayIndex(dayKey: string, start: string = VOCAB_SCHEDULE_START): number {
  const days = Math.floor((parseYmd(dayKey) - parseYmd(start)) / 86_400_000)
  return days > 0 ? days : 0
}

/** 字根字庫依字首組順序排成的清單：同組維持字庫原順序；沒有對應字首組的字略過。 */
export function orderedVocab(words: VocabWord[]): VocabWord[] {
  const orderOf = (id: string | undefined): number =>
    id === undefined ? -1 : (PREFIX_GROUPS.find((g) => g.id === id)?.order ?? -1)
  return words
    .filter((w) => orderOf(w.prefixId) >= 0)
    .sort((a, b) => orderOf(a.prefixId) - orderOf(b.prefixId))
}

/**
 * 今日單字：把字根字庫排成字首順序的一條清單，取第 day×20 起的 20 個（跑到底繞回開頭）。
 * 永遠回傳剛好 VOCAB_PER_DAY 個（整庫不足 20 時才回全部），字首組跨日連續。
 */
export function vocabForDay(words: VocabWord[], dayKey: string, start: string = VOCAB_SCHEDULE_START): VocabWord[] {
  const list = orderedVocab(words)
  const n = list.length
  if (n === 0) return []
  // take 必須維持 min(20, n)：整庫不足 20 時只回全部、不繞回補足，因為 DailyPlan 的
  // {#each todayWords as w (w.id)} 是 keyed，同一天出現重複字會 duplicate-key crash。
  // 若日後要「永遠補滿 20」，得同時把該 each 的 key 改成含 index（如 `${w.id}#${i}`）。
  const take = Math.min(VOCAB_PER_DAY, n)
  const base = (vocabDayIndex(dayKey, start) * VOCAB_PER_DAY) % n
  const out: VocabWord[] = []
  for (let i = 0; i < take; i++) out.push(list[(base + i) % n])
  return out
}
