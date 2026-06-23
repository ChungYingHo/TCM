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
    id: 'chem-fundamentals',
    href: '/chem-fundamentals',
    title: '化學基礎定律與 Unit Factor 換算',
    subject: '化學',
    tags: ['基礎'],
    desc: '五大定律、道耳吞原子說、amu／莫耳／莫耳質量、unit factor 速查表',
  },
  {
    id: 'chem-units',
    href: '/chem-units',
    title: '化學常用單位換算（Unit Factor）',
    subject: '化學',
    tags: ['基礎'],
    desc: '長度(Å/pm)、壓力(atm/mmHg/kPa)、能量(cal/J)、濃度(%→M/ppm)、R 值——全 unit factor 分數',
  },
  {
    id: 'chem-vsepr',
    href: '/chem-vsepr',
    title: 'VSEPR 分子形狀與 ABₓEᵧ',
    subject: '化學',
    tags: ['基礎'],
    desc: '孤對電子公式 E=(V−X)/2、ABₓEᵧ→分子形狀對照表、鍵角壓縮、極性判斷',
  },
  {
    id: 'chem-math',
    href: '/chem-math',
    title: '化學常用數學速查',
    subject: '化學',
    tags: ['基礎'],
    desc: 'log 背值表、對數指數運算、科學記號、pH/pOH/pKa 計算',
  },
]

export function notesBySubject(subject: NoteSubject): NoteEntry[] {
  return NOTES.filter((n) => n.subject === subject)
}

export function tagsBySubject(subject: NoteSubject): string[] {
  const tags = new Set(notesBySubject(subject).flatMap((n) => n.tags))
  return [...tags]
}
