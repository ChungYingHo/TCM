// 每日單字排程：依老師「字首（prefix）」順序、每天推進一個字首組（非隨機）。
// 起算日 = 使用者開始的那天（day 0）；之後每天一組，帶完 11 組再循環回頭。
// 起算日之前一律當 day 0（提早看就先看第一組）。
import { PREFIX_GROUPS, type PrefixGroup, type VocabWord } from '@/models/vocab'
import { parseYmd } from '@/utils/date'

/** 每日單字排程起算日（day 0）。Aira 2026-07-06 開始。 */
export const VOCAB_SCHEDULE_START = '2026-07-06'

/** 起算日到 dayKey 的天數（day 0 = 起算日）；起算日之前一律回 0。 */
export function vocabDayIndex(dayKey: string, start: string = VOCAB_SCHEDULE_START): number {
  const days = Math.floor((parseYmd(dayKey) - parseYmd(start)) / 86_400_000)
  return days > 0 ? days : 0
}

/** 今日該帶的字首組（依老師字首順序，每天一組、循環）。 */
export function prefixGroupForDay(dayKey: string, start: string = VOCAB_SCHEDULE_START): PrefixGroup {
  const groups = [...PREFIX_GROUPS].sort((a, b) => a.order - b.order)
  return groups[vocabDayIndex(dayKey, start) % groups.length]
}

/** 今日單字：屬於今日字首組的字，依字庫原順序（非隨機）。 */
export function vocabForDay(words: VocabWord[], dayKey: string, start: string = VOCAB_SCHEDULE_START): VocabWord[] {
  const id = prefixGroupForDay(dayKey, start).id
  return words.filter((w) => w.prefixId === id)
}
