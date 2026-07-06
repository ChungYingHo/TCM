// Canonical concept taxonomy — single source of truth for the UI.
//
// Ordering here is PEDAGOGICAL (prerequisite-respecting), and drives:
//   - the study-page tag filter order
//   - the notes index "learning path" order
//   - the analytics trend ordering
//   - which tag is "primary" for a multi-tag question (earliest in order)
//
// The tag STRINGS must stay in sync with the offline tagger
// (pipeline/tcmpipe/tags.py). Each tag maps to exactly one concept note
// (src/content/notes/<slug>.mdx). Keep `tag` ⇄ note frontmatter `tag` aligned.
//
// Entries with a `parent` are NOTE-ONLY sub-topics: finer study notes that carve
// out a slice of a broad category (e.g. 假設語氣 within 文法：時態與語態). They have
// NO tagger rule, so no question carries their tag directly — the question-derived
// surfaces (study filter, analytics) simply never list them. To still feed
// "today's quiz" and show frequency, gen_schedule.py aliases each sub-topic's quiz
// pool to its parent's, and the note's <NoteStats> points at the parent tag.

import type { Subject } from '@/models/question'
import { SUBJECTS } from '@/models/question'

export interface TaxonomyEntry {
  tag: string // matches question.concept_tags[] and note frontmatter `tag`
  slug: string // note filename (src/content/notes/<slug>.mdx), or src/pages id for `claimed`
  short: string // compact label for chips/filters
  parent?: string // note-only sub-topic: borrows this broad tag's quiz pool + stats
  // This tag's READING is merged into another note (that note `covers:` this tag). The tag
  // still exists for question-tagging / 考點趨勢; tagSlug resolves it to `readIn` for the page.
  readIn?: string
  // note-claiming tag (2026-06-28): lives in a src/pages note registered in models/notes.ts,
  // NOT the deprecated collection. `slug` is the src/pages id; questions are claimed per-note
  // via pipeline/overrides/concept_tags.json. The taxonomy.test deprecated-note check is skipped.
  claimed?: boolean
}

export const TAXONOMY: Record<Subject, TaxonomyEntry[]> = {
  chemistry: [
    // ── note-claiming tags（一篇一個、認領自己範圍的考古題；基礎篇用「基礎-」、正課用主題名）──
    { tag: '基礎-週期表', slug: 'periodic-table', short: '週期表', claimed: true },
    { tag: '基礎-胺基酸', slug: 'amino-acids', short: '胺基酸', claimed: true },
    { tag: '基礎-原子結構', slug: 'chem-atomic-theory', short: '原子結構', claimed: true },
    { tag: '量子力學', slug: 'chem-quantum', short: '量子力學', claimed: true },
    { tag: '原子光譜', slug: 'chem-atomic-spectra', short: '原子光譜', claimed: true },
    { tag: '原子軌域', slug: 'chem-orbitals', short: '原子軌域', claimed: true },
    { tag: '基礎-單位因次', slug: 'chem-units', short: '單位因次', claimed: true },
    { tag: '基礎-化學鍵', slug: 'chem-molecules', short: '化學鍵', claimed: true },
    { tag: '基礎-化學計量', slug: 'chem-stoichiometry', short: '化學計量', claimed: true },
    { tag: '基礎-熱力學', slug: 'chem-thermo', short: '熱力學', claimed: true },
    // ── legacy concept tags（過渡期保留；隨 backfill 逐桶認領後淘汰）──
    { tag: '原子結構與核化學', slug: 'atomic-structure', short: '原子結構' },
    // 週期性 + 化學鍵的「閱讀」併入 atomic-structure（covers 三個 tag）；tag 本身保留供題庫/趨勢。
    { tag: '週期性', slug: 'periodicity', short: '週期性', readIn: 'atomic-structure' },
    { tag: '化學鍵與分子結構', slug: 'chem-bonding', short: '化學鍵', readIn: 'atomic-structure' },
    { tag: '化學計量', slug: 'stoichiometry', short: '化學計量' },
    { tag: '氣體', slug: 'gas-laws', short: '氣體' },
    { tag: '溶液與依數性質', slug: 'solutions', short: '溶液' },
    { tag: '相變與分子間作用力', slug: 'imf-phases', short: '相變/IMF' },
    { tag: '熱力學', slug: 'thermo', short: '熱力學' },
    { tag: '反應速率', slug: 'kinetics', short: '反應速率' },
    { tag: '化學平衡', slug: 'equilibrium', short: '化學平衡' },
    { tag: '酸鹼平衡', slug: 'acid-base', short: '酸鹼' },
    { tag: '水溶液離子平衡', slug: 'aqueous-equilibria', short: '緩衝/滴定/Ksp' },
    { tag: '氧化還原', slug: 'redox', short: '氧化還原' },
    { tag: '電化學', slug: 'electrochem', short: '電化學' },
    { tag: '配位化合物', slug: 'coordination', short: '配位化合物' },
    { tag: '有機命名與官能基', slug: 'organic-naming', short: '有機命名' },
    { tag: '有機反應與機構', slug: 'organic-reactions', short: '有機反應' },
    { tag: '芳香族化學', slug: 'aromatics', short: '芳香族' },
    { tag: '立體化學', slug: 'stereoisomers', short: '立體化學' },
    { tag: '生物有機分子', slug: 'biomolecules-chem', short: '生化分子' },
    { tag: '光譜分析', slug: 'spectroscopy', short: '光譜' },
    { tag: '化學綜合', slug: 'chem-misc', short: '綜合題' },
  ],
  biology: [
    // ── note-claiming tags（細胞三篇）──
    { tag: '細胞-原核與真核', slug: 'bio-cell-1', short: '原核真核', claimed: true },
    { tag: '細胞-細胞核與胞器', slug: 'bio-cell-2', short: '細胞核胞器', claimed: true },
    { tag: '細胞-骨架與連結', slug: 'bio-cell-3', short: '骨架連結', claimed: true },
    // ── legacy concept tags ──
    { tag: '生命分子與生物化學', slug: 'biomolecules', short: '生命分子' },
    { tag: '細胞構造與胞器', slug: 'cell-structure', short: '細胞構造' },
    { tag: '細胞膜與物質運輸', slug: 'membrane-transport', short: '細胞膜運輸' },
    { tag: '酵素', slug: 'enzymes', short: '酵素' },
    { tag: '細胞呼吸與能量代謝', slug: 'cell-respiration', short: '細胞呼吸' },
    { tag: '光合作用與C4/CAM', slug: 'photosynthesis', short: '光合作用' },
    { tag: '細胞分裂', slug: 'cell-division', short: '細胞分裂' },
    { tag: '孟德爾遺傳', slug: 'mendelian', short: '孟德爾遺傳' },
    { tag: '分子遺傳：DNA複製與染色體', slug: 'dna-replication', short: 'DNA複製' },
    { tag: '基因表現：轉錄轉譯與調控', slug: 'gene-expression', short: '基因表現' },
    { tag: '生物技術與分子工具', slug: 'biotech', short: '生物技術' },
    { tag: '演化與生命起源', slug: 'evolution', short: '演化' },
    { tag: '分類與生物多樣性', slug: 'taxonomy-diversity', short: '分類/多樣性' },
    { tag: '微生物', slug: 'microbiology', short: '微生物' },
    { tag: '植物構造與組織', slug: 'plant-structure', short: '植物構造' },
    { tag: '植物生理', slug: 'plant-physiology', short: '植物生理' },
    { tag: '神經系統與行為', slug: 'nervous-system', short: '神經系統' },
    { tag: '內分泌系統', slug: 'endocrine', short: '內分泌' },
    { tag: '循環與呼吸', slug: 'circulation-respiration', short: '循環/呼吸' },
    { tag: '免疫系統', slug: 'immunity', short: '免疫' },
    { tag: '消化與營養', slug: 'digestion', short: '消化' },
    { tag: '排泄與滲透調節', slug: 'excretion', short: '排泄' },
    { tag: '骨骼與肌肉運動', slug: 'musculoskeletal', short: '骨骼肌肉' },
    { tag: '動物生殖與發育', slug: 'animal-reproduction', short: '生殖發育' },
    { tag: '生態學', slug: 'ecology', short: '生態學' },
    { tag: '生物學綜合', slug: 'bio-misc', short: '綜合題' },
  ],
  chinese: [
    // ── note-claiming tag（認領自己範圍的考古題；slug＝src/pages id）──
    { tag: '部首', slug: 'cn-radicals', short: '部首', claimed: true },
    // ── legacy concept tags ──
    { tag: '字音字形', slug: 'cn-phonetics', short: '字音字形' },
    { tag: '字詞義訓詁', slug: 'cn-word-meaning', short: '字詞義' },
    { tag: '通假字與古今字', slug: 'cn-loan-characters', short: '通假字', parent: '古典散文文言閱讀' },
    { tag: '成語熟語', slug: 'cn-idioms', short: '成語' },
    { tag: '修辭格', slug: 'cn-rhetoric', short: '修辭' },
    { tag: '詞性語法句構', slug: 'cn-grammar', short: '語法句構' },
    { tag: '詞語結構與構詞', slug: 'cn-word-formation', short: '詞語結構', parent: '詞性語法句構' },
    { tag: '標點符號與文意', slug: 'cn-punctuation', short: '標點符號', parent: '詞性語法句構' },
    { tag: '古典韻文', slug: 'cn-verse', short: '古典韻文' },
    { tag: '古典散文文言閱讀', slug: 'cn-classical-prose', short: '文言閱讀' },
    { tag: '文學史常識', slug: 'cn-literature', short: '文學史' },
    { tag: '文化教材思想', slug: 'cn-thought', short: '思想教材' },
    { tag: '國學常識', slug: 'cn-sinology', short: '國學常識' },
    { tag: '應用文書信', slug: 'cn-applied', short: '應用文' },
    { tag: '閱讀理解綜合', slug: 'cn-reading', short: '閱讀理解' },
  ],
  english: [
    { tag: '文法：時態與語態', slug: 'en-tense', short: '時態語態' },
    { tag: '文法：假設語氣與條件句', slug: 'en-subjunctive', short: '假設語氣', parent: '文法：時態與語態' },
    { tag: '文法：動名詞與不定詞', slug: 'en-verbals', short: '動名詞/不定詞', parent: '文法：時態與語態' },
    { tag: '文法：子句與關係代名詞', slug: 'en-clauses', short: '子句關代' },
    { tag: '文法：主詞動詞一致', slug: 'en-agreement', short: '主動詞一致', parent: '句構與語意連貫' },
    { tag: '文法：介系詞與片語', slug: 'en-prepositions', short: '介系詞' },
    { tag: '文法：冠詞與名詞數', slug: 'en-articles', short: '冠詞/名詞數', parent: '句構與語意連貫' },
    { tag: '句構與語意連貫', slug: 'en-structure', short: '句構連貫' },
    { tag: '文法：比較與對等結構', slug: 'en-comparison', short: '比較結構', parent: '句構與語意連貫' },
    { tag: '字彙', slug: 'en-vocab', short: '字彙' },
    { tag: '易混淆字詞', slug: 'en-confusables', short: '易混淆字', parent: '字彙' },
    { tag: '同義反義與字根字首', slug: 'en-synonym', short: '同反義/字根' },
    { tag: '片語動詞與慣用語', slug: 'en-phrases', short: '片語慣用' },
    { tag: '克漏字', slug: 'en-cloze', short: '克漏字' },
    { tag: '閱讀測驗', slug: 'en-reading', short: '閱讀測驗' },
  ],
}

// ---- derived lookups -------------------------------------------------------

const ALL: TaxonomyEntry[] = SUBJECTS.flatMap((s) => TAXONOMY[s])

const TAG_INDEX = new Map<string, number>(ALL.map((e, i) => [e.tag, i]))
const TAG_TO_ENTRY = new Map<string, TaxonomyEntry>(ALL.map((e) => [e.tag, e]))
const TAG_TO_SUBJECT = new Map<string, Subject>(
  SUBJECTS.flatMap((s) => TAXONOMY[s].map((e) => [e.tag, s] as [string, Subject])),
)

/** Ordered tag strings for a subject (pedagogical order). */
export function orderedTags(subject: Subject): string[] {
  return TAXONOMY[subject].map((e) => e.tag)
}

/** Note slug for a tag (resolves `readIn` to the merged note), or null if none. */
export function tagSlug(tag: string): string | null {
  const e = TAG_TO_ENTRY.get(tag)
  return e ? (e.readIn ?? e.slug) : null
}

/** For a note-claiming tag (`claimed: true`), the note's route `/<slug>`; else null.
 *  用於 /study 趨勢標籤標出「已有筆記」的考點並可點進去。 */
export function claimedNoteHref(tag: string): string | null {
  const e = TAG_TO_ENTRY.get(tag)
  return e?.claimed ? `/${e.slug}` : null
}

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
