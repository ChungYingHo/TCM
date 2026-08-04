import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { SUBJECTS } from '@/models/question'
import { TAXONOMY, tagSubject, byTaxonomyOrder, primaryTag } from '@/models/taxonomy'
import { SOLVE_STEPS, solveSteps } from '@/models/solveTemplates'

const DATA_DIR = path.resolve('./src/data')

const allEntries = SUBJECTS.flatMap((s) => TAXONOMY[s])
const allTags = allEntries.map((e) => e.tag)

describe('taxonomy integrity', () => {
  it('every tag is unique', () => {
    expect(new Set(allTags).size).toBe(allTags.length)
  })

  it('every tag resolves to its subject', () => {
    for (const s of SUBJECTS) for (const e of TAXONOMY[s]) expect(tagSubject(e.tag)).toBe(s)
  })

  it('orders tags by pedagogical position, unknown tags last', () => {
    const chem = TAXONOMY.chemistry.map((e) => e.tag)
    expect(byTaxonomyOrder(chem[0], chem[1])).toBeLessThan(0)
    expect(byTaxonomyOrder('原子結構與核化學', '光譜分析')).toBeLessThan(0)
    expect(byTaxonomyOrder('原子結構與核化學', '不存在的標籤')).toBeLessThan(0)
  })

  it('primaryTag returns the most fundamental (earliest) tag', () => {
    expect(primaryTag(['反應速率', '化學平衡'])).toBe('反應速率')
    expect(primaryTag(['光譜分析', '原子結構與核化學'])).toBe('原子結構與核化學')
    expect(primaryTag([])).toBeNull()
  })
})

describe('solveTemplates coverage', () => {
  it('provides solve steps for every taxonomy tag', () => {
    for (const tag of allTags) {
      const steps = solveSteps(tag)
      expect(steps.length, `no solve steps for ${tag}`).toBeGreaterThanOrEqual(3)
    }
  })

  it('has no solve-step keys outside the taxonomy', () => {
    for (const key of Object.keys(SOLVE_STEPS))
      expect(allTags.includes(key), `stray solveTemplate key ${key}`).toBe(true)
  })
})

describe('question data ⇄ taxonomy', () => {
  it('every concept_tag in the shards is a known taxonomy tag', () => {
    const known = new Set(allTags)
    for (const school of ['CMU', 'ISU', 'TCU']) {
      const shard = JSON.parse(readFileSync(path.join(DATA_DIR, `${school}.json`), 'utf8'))
      for (const q of shard.questions)
        for (const t of q.concept_tags ?? [])
          expect(known.has(t), `unknown tag "${t}" in ${q.id}`).toBe(true)
    }
  })
})

describe('vocab dataset', () => {
  it('has the enriched shape and sane values', () => {
    const vocab = JSON.parse(readFileSync(path.join(DATA_DIR, 'vocab.json'), 'utf8'))
    expect(Array.isArray(vocab.words)).toBe(true)
    // 字根字彙為手工小字庫（試點 15 字，陸續擴充）；上界另由 vocab.test.ts 守。
    expect(vocab.words.length).toBeGreaterThan(10)
    for (const w of vocab.words.slice(0, 30)) {
      expect(typeof w.word).toBe('string')
      expect(w.id).toBe(w.word) // the word itself is the stable id
      expect(typeof w.zh).toBe('string')
      expect(w.zh.length).toBeGreaterThan(0)
      expect(Array.isArray(w.tags)).toBe(true)
      expect(w.examCorrect).toBeLessThanOrEqual(w.examCount)
    }
  })
})
