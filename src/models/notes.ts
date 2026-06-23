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
]

export function notesBySubject(subject: NoteSubject): NoteEntry[] {
  return NOTES.filter((n) => n.subject === subject)
}

export function tagsBySubject(subject: NoteSubject): string[] {
  const tags = new Set(notesBySubject(subject).flatMap((n) => n.tags))
  return [...tags]
}
