export interface NoteEntry {
  id: string
  href: string
  title: string
  subject: NoteSubject
  tags: string[]
  desc: string
}

export type NoteSubject = '化學' | '生物' | '國文' | '英文'

export const NOTE_SUBJECTS: NoteSubject[] = ['化學', '生物', '國文', '英文']

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
    id: 'reading-r1',
    href: '/readings/r1',
    title: '增補廣讀 R1：VOA 字彙',
    subject: '英文',
    tags: ['廣讀'],
    desc: '7 篇 VOA 中級文章 + 47 個重點字彙（旋元佑老師編授）',
  },
]

export function notesBySubject(subject: NoteSubject): NoteEntry[] {
  return NOTES.filter((n) => n.subject === subject)
}

export function tagsBySubject(subject: NoteSubject): string[] {
  const tags = new Set(notesBySubject(subject).flatMap((n) => n.tags))
  return [...tags]
}
