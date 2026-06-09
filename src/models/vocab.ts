// Shape of src/data/vocab.json (built by pipeline/gen_vocab_ecdict.py + gen_vocab_examples.py).
// Phonetic + zh come from ECDICT (authoritative); example/example_zh are LLM drafts.
export interface VocabWord {
  id: string // the word itself — stable across regenerations (per-word SRS keys on it)
  word: string
  phonetic: string
  zh: string
  pos: string
  tags: string[] // gre / toefl / ielts / cet6 / ky …
  frq: number // frequency rank (lower = more common; 0 = unranked)
  examCount: number // times it appeared as a 後中 option
  examCorrect: number // times it was the correct answer
  examIds: string[]
  example: string
  example_zh: string
  draft: boolean // example is an AI draft
}

export interface VocabData {
  generated_at: string
  count: number
  withExamples: number
  words: VocabWord[]
}
