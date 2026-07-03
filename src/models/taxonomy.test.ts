import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { SUBJECTS } from '@/models/question'
import {
  TAXONOMY,
  orderedTags,
  tagSlug,
  tagSubject,
  byTaxonomyOrder,
  primaryTag,
} from '@/models/taxonomy'
import { SOLVE_STEPS, solveSteps } from '@/models/solveTemplates'
import { NOTES } from '@/models/notes'

const NOTES_DIR = path.resolve('./_deprecated/notes')
const DATA_DIR = path.resolve('./src/data')

const allEntries = SUBJECTS.flatMap((s) => TAXONOMY[s])
const allTags = allEntries.map((e) => e.tag)

function noteFrontmatter(slug: string): { tag: string; subject: string; kind: string; covers: string[] } {
  const src = readFileSync(path.join(NOTES_DIR, `${slug}.mdx`), 'utf8')
  const tag = /\btag:\s*(.+)/.exec(src)?.[1].trim() ?? ''
  const subject = /\bsubject:\s*(.+)/.exec(src)?.[1].trim() ?? ''
  const kind = /\bkind:\s*(.+)/.exec(src)?.[1].trim() ?? 'note'
  const coversInner = /\bcovers:\s*\[(.*?)\]/.exec(src)?.[1] ?? ''
  const covers = [...coversInner.matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1])
  return { tag, subject, kind, covers }
}

describe('taxonomy integrity', () => {
  it('every tag and slug is unique', () => {
    expect(new Set(allTags).size).toBe(allTags.length)
    const slugs = allEntries.map((e) => e.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every tag resolves to its subject and slug (readIn → merged note)', () => {
    for (const s of SUBJECTS)
      for (const e of TAXONOMY[s]) {
        expect(tagSubject(e.tag)).toBe(s)
        expect(tagSlug(e.tag)).toBe(e.readIn ?? e.slug)
      }
  })

  it('orders tags by pedagogical position, unknown tags last', () => {
    const chem = orderedTags('chemistry')
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

describe('taxonomy ⇄ concept notes', () => {
  it('every taxonomy tag resolves to a note file (own or via readIn) with matching subject', () => {
    for (const s of SUBJECTS)
      for (const e of TAXONOMY[s]) {
        if (e.claimed) {
          // note-claiming tag: lives in a src/pages note registered in models/notes.ts
          expect(
            NOTES.some((n) => n.tags.includes(e.tag)),
            `claimed tag "${e.tag}" not used by any note in models/notes.ts`,
          ).toBe(true)
          continue
        }
        const file = e.readIn ?? e.slug
        expect(existsSync(path.join(NOTES_DIR, `${file}.mdx`)), `missing note ${file}`).toBe(true)
        const fm = noteFrontmatter(file)
        expect(fm.subject, `subject mismatch in ${file}`).toBe(s)
        if (e.readIn) {
          // a merged-in tag: the host note must declare it under `covers`
          expect(fm.covers, `${file} should cover "${e.tag}"`).toContain(e.tag)
        } else {
          expect(fm.tag, `tag mismatch in ${e.slug}`).toBe(e.tag)
        }
      }
  })

  it('has no orphan note files outside the taxonomy', () => {
    const slugs = new Set(allEntries.map((e) => e.slug))
    const files = readdirSync(NOTES_DIR).filter((f) => f.endsWith('.mdx'))
    for (const f of files) {
      const slug = f.replace('.mdx', '')
      if (noteFrontmatter(slug).kind === 'review') continue // review digests live outside the taxonomy
      expect(slugs.has(slug), `orphan note ${f}`).toBe(true)
    }
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
