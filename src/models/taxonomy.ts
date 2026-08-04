// Canonical concept taxonomy — 考古題 concept_tags 的正規名稱與教學順序。
//
// 2026-08-05：筆記不再「認領」考古題（NoteStats／RelatedQuestions／/study／/analytics 都已移除），
// 這份表因此縮回單一用途——把題目的 concept_tags 排序、給短標籤，供線上測驗與詳解顯示。
// 剩下的消費者：ExamApp（模擬考的考點標籤）、AnswerReveal／askAI（解題模板挑選）。
//
// Ordering here is PEDAGOGICAL (prerequisite-respecting), and drives:
//   - which tag is "primary" for a multi-tag question (earliest in order)
//   - 解題模板的挑選順序
//
// The tag STRINGS must stay in sync with the offline tagger (pipeline/tcmpipe/tags.py).

import type { Subject } from '@/models/question'
import { SUBJECTS } from '@/models/question'

export interface TaxonomyEntry {
  tag: string // matches question.concept_tags[]
  short: string // compact label for chips/filters
}

export const TAXONOMY: Record<Subject, TaxonomyEntry[]> = {
  chemistry: [
    // ── 有筆記的考點（基礎篇用「基礎-」、正課用主題名）──
    { tag: '基礎-週期表', short: '週期表' },
    { tag: '基礎-胺基酸', short: '胺基酸' },
    { tag: '基礎-原子結構', short: '原子結構' },
    { tag: '量子力學', short: '量子力學' },
    { tag: '原子光譜', short: '原子光譜' },
    { tag: '原子軌域', short: '原子軌域' },
    { tag: '電子組態', short: '電子組態' },
    { tag: '離子與電子行為', short: '離子與磁光' },
    { tag: '基礎-單位因次', short: '單位因次' },
    { tag: '基礎-化學鍵', short: '化學鍵' },
    { tag: '基礎-化學計量', short: '化學計量' },
    { tag: '基礎-熱力學', short: '熱力學' },
    // ── 尚未寫成筆記的考點（題目仍會標到，模擬考需要它們的短標籤）──
    { tag: '原子結構與核化學', short: '原子結構' },
    { tag: '週期性', short: '週期性' },
    { tag: '週期趨勢', short: '週期趨勢' },
    { tag: '化學鍵與分子結構', short: '化學鍵' },
    { tag: '化學計量', short: '化學計量' },
    { tag: '氣體', short: '氣體' },
    { tag: '溶液與依數性質', short: '溶液' },
    { tag: '相變與分子間作用力', short: '相變/IMF' },
    { tag: '熱力學', short: '熱力學' },
    { tag: '反應速率', short: '反應速率' },
    { tag: '化學平衡', short: '化學平衡' },
    { tag: '酸鹼平衡', short: '酸鹼' },
    { tag: '水溶液離子平衡', short: '緩衝/滴定/Ksp' },
    { tag: '氧化還原', short: '氧化還原' },
    { tag: '電化學', short: '電化學' },
    { tag: '配位化合物', short: '配位化合物' },
    { tag: '有機命名與官能基', short: '有機命名' },
    { tag: '有機反應與機構', short: '有機反應' },
    { tag: '芳香族化學', short: '芳香族' },
    { tag: '立體化學', short: '立體化學' },
    { tag: '生物有機分子', short: '生化分子' },
    { tag: '光譜分析', short: '光譜' },
    { tag: '化學綜合', short: '綜合題' },
  ],
  biology: [
    // ── 有筆記的考點（細胞六篇）──
    { tag: '細胞-原核與真核', short: '原核真核' },
    { tag: '細胞-細胞核與胞器', short: '細胞核胞器' },
    { tag: '細胞-骨架與連結', short: '骨架連結' },
    { tag: '細胞-細胞膜', short: '細胞膜' },
    { tag: '細胞-物質運輸', short: '物質運輸' },
    { tag: '細胞-訊號傳遞', short: '訊號傳遞' },
    // ── 尚未寫成筆記的考點 ──
    { tag: '生命分子與生物化學', short: '生命分子' },
    { tag: '細胞構造與胞器', short: '細胞構造' },
    { tag: '細胞膜與物質運輸', short: '細胞膜運輸' },
    { tag: '酵素', short: '酵素' },
    { tag: '細胞呼吸與能量代謝', short: '細胞呼吸' },
    { tag: '光合作用與C4/CAM', short: '光合作用' },
    { tag: '細胞分裂', short: '細胞分裂' },
    { tag: '孟德爾遺傳', short: '孟德爾遺傳' },
    { tag: '分子遺傳：DNA複製與染色體', short: 'DNA複製' },
    { tag: '基因表現：轉錄轉譯與調控', short: '基因表現' },
    { tag: '生物技術與分子工具', short: '生物技術' },
    { tag: '演化與生命起源', short: '演化' },
    { tag: '分類與生物多樣性', short: '分類/多樣性' },
    { tag: '微生物', short: '微生物' },
    { tag: '植物構造與組織', short: '植物構造' },
    { tag: '植物生理', short: '植物生理' },
    { tag: '神經系統與行為', short: '神經系統' },
    { tag: '內分泌系統', short: '內分泌' },
    { tag: '循環與呼吸', short: '循環/呼吸' },
    { tag: '免疫系統', short: '免疫' },
    { tag: '消化與營養', short: '消化' },
    { tag: '排泄與滲透調節', short: '排泄' },
    { tag: '骨骼與肌肉運動', short: '骨骼肌肉' },
    { tag: '動物生殖與發育', short: '生殖發育' },
    { tag: '生態學', short: '生態學' },
    { tag: '生物學綜合', short: '綜合題' },
  ],
  chinese: [
    // ── 有筆記的考點 ──
    { tag: '部首', short: '部首' },
    { tag: '詩經', short: '詩經' },
    // ── 尚未寫成筆記的考點 ──
    { tag: '字音字形', short: '字音字形' },
    { tag: '字詞義訓詁', short: '字詞義' },
    { tag: '通假字與古今字', short: '通假字' },
    { tag: '成語熟語', short: '成語' },
    { tag: '修辭格', short: '修辭' },
    { tag: '詞性語法句構', short: '語法句構' },
    { tag: '詞語結構與構詞', short: '詞語結構' },
    { tag: '標點符號與文意', short: '標點符號' },
    { tag: '古典韻文', short: '古典韻文' },
    { tag: '古典散文文言閱讀', short: '文言閱讀' },
    { tag: '文學史常識', short: '文學史' },
    { tag: '文化教材思想', short: '思想教材' },
    { tag: '國學常識', short: '國學常識' },
    { tag: '應用文書信', short: '應用文' },
    { tag: '閱讀理解綜合', short: '閱讀理解' },
  ],
  english: [
    { tag: '文法：時態與語態', short: '時態語態' },
    { tag: '文法：假設語氣與條件句', short: '假設語氣' },
    { tag: '文法：動名詞與不定詞', short: '動名詞/不定詞' },
    { tag: '文法：子句與關係代名詞', short: '子句關代' },
    { tag: '文法：主詞動詞一致', short: '主動詞一致' },
    { tag: '文法：介系詞與片語', short: '介系詞' },
    { tag: '文法：冠詞與名詞數', short: '冠詞/名詞數' },
    { tag: '句構與語意連貫', short: '句構連貫' },
    { tag: '文法：比較與對等結構', short: '比較結構' },
    { tag: '字彙', short: '字彙' },
    { tag: '易混淆字詞', short: '易混淆字' },
    { tag: '同義反義與字根字首', short: '同反義/字根' },
    { tag: '片語動詞與慣用語', short: '片語慣用' },
    { tag: '克漏字', short: '克漏字' },
    { tag: '閱讀測驗', short: '閱讀測驗' },
  ],
}

// ---- derived lookups -------------------------------------------------------

const ALL: TaxonomyEntry[] = SUBJECTS.flatMap((s) => TAXONOMY[s])

const TAG_INDEX = new Map<string, number>(ALL.map((e, i) => [e.tag, i]))
const TAG_TO_ENTRY = new Map<string, TaxonomyEntry>(ALL.map((e) => [e.tag, e]))
const TAG_TO_SUBJECT = new Map<string, Subject>(
  SUBJECTS.flatMap((s) => TAXONOMY[s].map((e) => [e.tag, s] as [string, Subject])),
)

/** Compact chip label for a tag (falls back to the tag itself). */
export function tagShort(tag: string): string {
  return TAG_TO_ENTRY.get(tag)?.short ?? tag
}

export function tagSubject(tag: string): Subject | null {
  return TAG_TO_SUBJECT.get(tag) ?? null
}

/** Sort comparator placing tags in pedagogical order (unknown tags last). */
export function byTaxonomyOrder(a: string, b: string): number {
  const ia = TAG_INDEX.get(a) ?? Number.MAX_SAFE_INTEGER
  const ib = TAG_INDEX.get(b) ?? Number.MAX_SAFE_INTEGER
  return ia - ib || a.localeCompare(b, 'zh-Hant')
}

/**
 * Primary tag of a (possibly multi-tag) question: the one earliest in
 * pedagogical order — i.e. the most fundamental prerequisite category.
 */
export function primaryTag(tags: string[]): string | null {
  if (!tags.length) return null
  return [...tags].sort(byTaxonomyOrder)[0]
}
