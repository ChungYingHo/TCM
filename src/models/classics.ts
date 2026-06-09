// Shape of src/data/classics.json (built by pipeline/gen_classics.py).
// `original` is authoritative public-domain text; `translation` + `annotation` are drafts.
export interface ClassicAnnotation {
  term: string
  note: string
}

export interface Classic {
  id: string
  title: string
  author: string
  dynasty: string // display era, e.g. 東晉 / 唐 / 北宋
  era: string // bucket aligned with question era tags: 先秦/漢/魏晉南北朝/唐/宋/元/明/清
  source: string
  tags: string[]
  original: string
  translation: string
  annotation: ClassicAnnotation[]
  draft: boolean
  examRelevance: { count: number; ids: string[]; tags: string[] }
}

export interface ClassicsData {
  generated_at: string
  count: number
  classics: Classic[]
}
