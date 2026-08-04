import { describe, it, expect } from 'vitest'
import { parseCards, parseExamples, splitMemorizeItem, stripTrailingCommas } from '@/utils/noteReview'

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

describe('splitMemorizeItem', () => {
  it('splits on the first full-width colon within 18 chars', () => {
    expect(splitMemorizeItem('節點：徑向 n−ℓ−1')).toEqual(['節點', '徑向 n−ℓ−1'])
  })

  it('treats a late or missing colon as body-only', () => {
    expect(splitMemorizeItem('沒有冒號的一整句話')).toEqual(['', '沒有冒號的一整句話'])
    expect(splitMemorizeItem('這是一個超過十八個字的很長很長很長主題：內容')).toEqual([
      '',
      '這是一個超過十八個字的很長很長很長主題：內容',
    ])
  })
})

describe('stripTrailingCommas', () => {
  it('drops a comma before a closing bracket but keeps commas inside strings', () => {
    expect(stripTrailingCommas('["a", "b",]')).toBe('["a", "b"]')
    expect(stripTrailingCommas('["先 a, 再 b",]')).toBe('["先 a, 再 b"]')
    expect(stripTrailingCommas('["a", "b"]')).toBe('["a", "b"]')
  })

  it('is not fooled by an escaped quote', () => {
    expect(stripTrailingCommas('["say \\", ok",]')).toBe('["say \\", ok"]')
  })
})

describe('parseCards', () => {
  it('turns each Memorize item into a recall card', () => {
    const raw = `
<Memorize items={[
  "節點：<ul><li>徑向 <code>n−ℓ−1</code></li><li>角向 <code>ℓ</code></li></ul>",
  "Pauli：一軌域最多 2 電子且自旋相反。",
]} />
`
    const cards = parseCards(raw, SRC)
    expect(cards).toHaveLength(2)
    expect(cards[0].id).toBe('chem-x-m-1')
    expect(cards[0].topic).toBe('節點')
    expect(cards[0].body).toContain('<li>')
    expect(cards[0].noteTitle).toBe('測試')
    expect(cards[1].topic).toBe('Pauli')
  })

  it('keeps numbering continuous across several Memorize blocks', () => {
    const raw = '<Memorize items={["甲：一"]} /><Memorize label="補充" items={["乙：二"]} />'
    expect(parseCards(raw, SRC).map((c) => c.id)).toEqual(['chem-x-m-1', 'chem-x-m-2'])
  })

  it('does not end an item array early on a literal "]" inside a string', () => {
    const raw = '<Memorize items={["組態：<code>[Ar]4s¹3d⁵</code>", "第二則：內容"]} />'
    expect(parseCards(raw, SRC).map((c) => c.topic)).toEqual(['組態', '第二則'])
  })

  it('skips children-style Memorize and empty bodies', () => {
    expect(parseCards('<Memorize>自由格式內容</Memorize>', SRC)).toEqual([])
    expect(parseCards('<Memorize items={["主題：", "   "]} />', SRC)).toEqual([])
  })
})
