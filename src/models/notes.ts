export interface NoteEntry {
  id: string
  href: string
  title: string
  subject: NoteSubject
  tags: string[]
  desc: string
  /** 筆記分類；省略視為「考點筆記」。「快速複習」放純表格速查/總表。 */
  category?: NoteCategory
}

export type NoteSubject = '化學' | '生物' | '國文' | '英文'

export const NOTE_SUBJECTS: NoteSubject[] = ['化學', '生物', '國文', '英文']

export type NoteCategory = '考點筆記' | '快速複習'

// 顯示順序：快速複習在最上面（速查優先、且通常已讀過想快速回顧）。
export const NOTE_CATEGORIES: NoteCategory[] = ['快速複習', '考點筆記']

export const DEFAULT_CATEGORY: NoteCategory = '考點筆記'

export function noteCategory(n: NoteEntry): NoteCategory {
  return n.category ?? DEFAULT_CATEGORY
}

export const NOTES: NoteEntry[] = [
  {
    id: 'periodic-table',
    href: '/periodic-table',
    title: '元素週期表',
    subject: '化學',
    tags: ['基礎'],
    desc: '必背速查表、自由練習、完整互動週期表（電子組態、電負度/半徑/游離能熱圖）',
  },
  {
    id: 'amino-acids',
    href: '/amino-acids',
    title: '20 種胺基酸',
    subject: '化學',
    tags: ['基礎'],
    desc: '五大分類、側鏈結構圖、必需胺基酸、簡寫對照',
  },
  {
    id: 'chem-atomic-theory',
    href: '/chem-atomic-theory',
    title: '學說與理論',
    subject: '化學',
    tags: ['基礎'],
    desc: '原子模型演進（湯木生→密立根→拉塞福→莫色勒→質譜儀）、五大定律＋坎尼札洛、次原子粒子、同位素／同素異形體／異構物',
  },
  {
    id: 'chem-units',
    href: '/chem-units',
    title: '化學上重要的單位',
    subject: '化學',
    tags: ['基礎'],
    desc: '莫耳/amu/莫耳質量、unit factor、長度/壓力/溫度/能量/濃度/R、化學常用數學、有效數字',
  },
  {
    id: 'chem-molecules',
    href: '/chem-molecules',
    title: '化學分子表達',
    subject: '化學',
    tags: ['基礎'],
    desc: 'AXₙEₘ 與八隅體電子數公式、VSEPR 形狀/鍵角、σ/π 鍵、極性、氫化物/含氧酸/自由基/官能基',
  },
  {
    id: 'chem-stoichiometry',
    href: '/chem-stoichiometry',
    title: '化學反應方程式與化學計量',
    subject: '化學',
    tags: ['基礎'],
    desc: '平衡（觀察法）、係數比意義、計量總流程、限量試劑、理論產量、產率、原子經濟性',
  },
  {
    id: 'chem-thermo',
    href: '/chem-thermo',
    title: '簡單的熱力學',
    subject: '化學',
    tags: ['基礎'],
    desc: '自發性、熵與亂度、系統/外界/宇宙熵（第二定律）、ΔH·ΔS 四種組合與臨界溫度',
  },
  {
    id: 'bio-cell-1',
    href: '/bio-cell-1',
    title: '細胞（一）：概論、顯微鏡與原核／真核',
    subject: '生物',
    tags: ['細胞'],
    desc: '細胞學說與共同特徵、光學／電子／共軛焦顯微鏡與細胞大小、細胞分離、原核 vs 真核與細菌構造（質體、肽聚醣、內共生）',
  },
  {
    id: 'bio-cell-2',
    href: '/bio-cell-2',
    title: '細胞（二）：細胞核、內膜系統與能量胞器',
    subject: '生物',
    tags: ['細胞'],
    desc: '動植物細胞全景、細胞核與核糖體、內膜系統七成員（ER／高基氏體／溶體／液泡）、分泌路徑、粒線體／葉綠體／過氧化體／蛋白酶體',
  },
  {
    id: 'bio-cell-3',
    href: '/bio-cell-3',
    title: '細胞（三）：細胞骨架與細胞外連結',
    subject: '生物',
    tags: ['細胞'],
    desc: '微管・微絲・中間絲的直徑/組成/功能、中心粒與纖毛鞭毛的 9×3 與 9+2、細胞外基質與整聯蛋白、四種細胞間連結',
  },
  {
    id: 'bio-cell-summary',
    href: '/bio-cell-summary',
    title: '細胞・一頁速查總表',
    subject: '生物',
    tags: ['細胞'],
    desc: '三部曲考點濃縮純表格：原核 vs 真核、胞器速查、內膜系統、細胞骨架、細胞連結、動植物差異、顯微鏡與大小，考前 30 秒掃完',
    category: '快速複習',
  },
  {
    id: 'reading-r1',
    href: '/readings/r1',
    title: '增補廣讀 R1：VOA 字彙',
    subject: '英文',
    tags: ['廣讀'],
    desc: '7 篇 VOA 中級文章 + 47 個重點字彙（旋元佑老師編授）',
  },
]

/** 某分類底下、某科目的筆記（分類省略視為「考點筆記」）。 */
export function notesIn(category: NoteCategory, subject: NoteSubject): NoteEntry[] {
  return NOTES.filter((n) => noteCategory(n) === category && n.subject === subject)
}

export function tagsIn(category: NoteCategory, subject: NoteSubject): string[] {
  const tags = new Set(notesIn(category, subject).flatMap((n) => n.tags))
  return [...tags]
}

/** 依 href 找出當前筆記與其「同分類同科目」的上一篇/下一篇（依 NOTES 排序＝閱讀順序）。 */
export function siblingNotes(href: string): {
  current?: NoteEntry
  prev?: NoteEntry
  next?: NoteEntry
} {
  const current = NOTES.find((n) => n.href === href)
  if (!current) return {}
  const group = notesIn(noteCategory(current), current.subject)
  const i = group.findIndex((n) => n.id === current.id)
  return { current, prev: group[i - 1], next: group[i + 1] }
}
