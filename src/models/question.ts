// Mirror of pipeline/tcmpipe/models.py — keep in sync.

export type School = 'CMU' | 'ISU' | 'TCU'
export type Subject = 'chemistry' | 'chinese' | 'biology' | 'english'
export type OptionLetter = 'A' | 'B' | 'C' | 'D' | 'E'

export interface Option {
  letter: OptionLetter
  text: string
}

export interface QuestionRecord {
  id: string
  school: School
  year: number
  subject: Subject
  question_number: number
  question_image_url: string
  question_text: string
  options: Option[]
  correct_answer: OptionLetter[] // post-errata; array supports 送分 / multi-answer
  original_answer: OptionLetter[]
  errata_applied: boolean
  errata_reason_image_url: string | null
  award_all: boolean
  concept_tags: string[]
  era?: string | null // 朝代/時代（國文用，例：唐/宋；無法判定為 null）
  explanation: string | null
  needs_review: boolean
  image_w: number
  image_h: number
  // provenance / search-only — stripped from the API payload to keep it lean
  ocr_text?: string | null
  source_pdf?: string
  source_answer_pdf?: string
  errata_reason_image_url?: string | null
}

export interface SchoolShard {
  school: School
  generated_at: string
  schema_version: number
  questions: QuestionRecord[]
}

export interface SchoolIndex {
  school: School
  count: number
  years: number[]
  subjects: Subject[]
  tags: string[]
  byYear: Record<string, number[]>
  bySubject: Record<string, number[]>
  byTag: Record<string, number[]>
}

export const SCHOOLS: School[] = ['CMU', 'ISU', 'TCU']
export const SUBJECTS: Subject[] = ['chemistry', 'chinese', 'biology', 'english']

export const SCHOOL_LABEL: Record<School, string> = {
  CMU: '中國醫',
  ISU: '義守',
  TCU: '慈濟',
}

export const SUBJECT_LABEL: Record<Subject, string> = {
  chemistry: '化學',
  chinese: '國文',
  biology: '生物',
  english: '英文',
}
