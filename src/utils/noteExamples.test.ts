import { describe, it, expect } from 'vitest'
import { parseExamples, parseNoteTags } from '@/utils/noteExamples'

const SRC = { slug: 'chem-x', href: '/chem-x', title: '測試', subject: '化學' as const }

describe('parseExamples', () => {
  it('parses n / q / options / answer / steps from a single example', () => {
    const raw = `
<ExampleQuestion client:visible
  n={1}
  q="下列何者<b>不是</b>所有細胞都有？"
  options={["細胞膜", "核糖體", "具膜的細胞核", "DNA"]}
  answer="(C) 具膜的細胞核"
  steps={["所有細胞共同特徵。", "原核沒有核 → (C)。"]}
/>
`
    const [ex] = parseExamples(raw, SRC)
    expect(ex.id).toBe('chem-x-ex-1')
    expect(ex.subject).toBe('化學')
    expect(ex.noteHref).toBe('/chem-x')
    expect(ex.q).toContain('不是')
    expect(ex.options).toEqual(['細胞膜', '核糖體', '具膜的細胞核', 'DNA'])
    expect(ex.answer).toBe('(C) 具膜的細胞核')
    expect(ex.steps).toHaveLength(2)
  })

  it('does not end an option array early on a literal "]" inside a string ([Ar])', () => {
    const raw = '<ExampleQuestion n={2} q="電子組態？" options={["[Ar]3d⁵", "[Ne]3s²", "1s²"]} answer="(A)" steps={[]} />'
    const [ex] = parseExamples(raw, SRC)
    expect(ex.options).toEqual(['[Ar]3d⁵', '[Ne]3s²', '1s²'])
    expect(ex.id).toBe('chem-x-ex-2')
  })

  it('parses multiple examples and skips a blank-stem one', () => {
    const raw = `
<ExampleQuestion n={1} q="第一題" options={["a","b"]} answer="(A)" steps={["x"]} />
<ExampleQuestion n={2} q="" options={["a"]} answer="(A)" steps={[]} />
<ExampleQuestion n={3} q="第三題" options={["c","d"]} answer="(B) d" steps={["y"]} />
`
    const out = parseExamples(raw, SRC)
    expect(out.map((e) => e.n)).toEqual([1, 3])
  })

  it('returns [] when there are no examples', () => {
    expect(parseExamples('## 一些散文\n沒有例題。', SRC)).toEqual([])
  })
})

describe('parseNoteTags', () => {
  it('extracts the NoteStats tag and RelatedQuestions tag + also', () => {
    const raw = `
<NoteStats tag="化學計量" client:load />
散文…
<RelatedQuestions tag="原子結構與核化學" also={["週期性","化學鍵與分子結構"]} limit={10} client:load />
`
    expect(parseNoteTags(raw).sort()).toEqual(
      ['化學計量', '原子結構與核化學', '週期性', '化學鍵與分子結構'].sort(),
    )
  })

  it('dedupes and returns [] when no tags present', () => {
    expect(parseNoteTags('<NoteStats tag="熱力學" /><NoteStats tag="熱力學" />')).toEqual(['熱力學'])
    expect(parseNoteTags('沒有任何元件')).toEqual([])
  })
})
