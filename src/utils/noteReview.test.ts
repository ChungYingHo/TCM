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

  it('does not end a tag at a "/>" inside an attribute string (e.g. <br/> in q) and still finds the next one', () => {
    const raw = `
<ExampleQuestion n={1} q="上句<br/>下句" options={["a","b"]} answer="(A) a" steps={["x <br/> y"]} />
<ExampleQuestion n={2} q="第二題" options={["c","d"]} answer="(B) d" steps={["y"]} />
`
    const out = parseExamples(raw, SRC)
    expect(out.map((e) => e.n)).toEqual([1, 2])
    expect(out[0].q).toBe('上句<br/>下句')
    expect(out[0].options).toEqual(['a', 'b'])
    expect(out[0].answer).toBe('(A) a')
    expect(out[1].answer).toBe('(B) d')
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

  // 2026-08-24 真實 bug：18 字上限原本量原始字串，主題裡的 <code>／<b> 把額度吃光，
  // 全站 7 則必背卡的主題被整個丟掉，每日複習正面退成問不出東西的「這篇的重點」。
  it('18 字上限只算看得見的字，不算 HTML 標籤', () => {
    // 「混成看 X+E」看起來 9 個字，原始字串 25 個。
    expect(splitMemorizeItem('混成看 <code>X+E</code>：2 sp、3 sp²')).toEqual([
      '混成看 <code>X+E</code>',
      '2 sp、3 sp²',
    ])
  })

  it('去掉標籤後仍超過 18 字就不算主題', () => {
    const long = `<b>${'字'.repeat(19)}</b>：內容`
    expect(splitMemorizeItem(long)).toEqual(['', long])
  })
})

// 2026-08-05 真實 bug：JSON 只認雙引號，但 JSX 陣列常寫單引號。原本 options/steps 會靜靜
// 變成空陣列，筆記頁（MDX 自己編譯）正常、只有每日練習題出現「有題目沒有選項」的題。
describe('單引號的 JSX 陣列也要吃得下', () => {
  it('單引號的 options 與 steps 都解析得出來', () => {
    const raw = "<ExampleQuestion n={5} q=\"何者同時具有離子鍵與共價鍵？\" options={['$\\\\ce{CCl4}$', '$\\\\ce{BaCO3}$']} answer=\"(B) $\\\\ce{BaCO3}$\" steps={['先看陽離子。', '再看多原子離子內部。']} />"
    const [ex] = parseExamples(raw, SRC)
    expect(ex.options).toEqual(['$\\ce{CCl4}$', '$\\ce{BaCO3}$'])
    expect(ex.steps).toHaveLength(2)
  })

  it('單引號字串裡跳脫過的撇號不會提早收尾', () => {
    // 原始 MDX 寫的是 options={['it\'s fine', 'plain']}
    const raw = "<ExampleQuestion n={1} q=\"x\" options={['it\\'s fine', 'plain']} answer=\"(A)\" steps={[]} />"
    expect(parseExamples(raw, SRC)[0].options).toEqual(["it's fine", 'plain'])
  })

  it('單引號字串裡可以包雙引號', () => {
    expect(parseCards("<Memorize items={['他說「好」：內容', '乙：二']} />", SRC)[0].topic).toBe('他說「好」')
  })

  it('混用單雙引號也行', () => {
    const raw = "<ExampleQuestion n={1} q=\"x\" options={[\"甲\", '乙']} answer=\"(A)\" steps={[]} />"
    expect(parseExamples(raw, SRC)[0].options).toEqual(['甲', '乙'])
  })

  it('單引號的 Memorize items 一樣吃得下', () => {
    expect(parseCards("<Memorize items={['甲：一', '乙：二']} />", SRC).map((c) => c.topic)).toEqual(['甲', '乙'])
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

  it('extracts the bullet points and plain text used by the hint UI', () => {
    const raw = '<Memorize items={["節點：<ul><li>徑向 <code>n−ℓ−1</code></li><li>角向 $\\\\ell$</li></ul>", "單句：一軌域最多 2 電子。"]} />'
    const [list, single] = parseCards(raw, SRC)
    expect(list.points).toEqual(['徑向 <code>n−ℓ−1</code>', '角向 $\\ell$'])
    // plain 截在第一個公式前，才不會把 LaTeX 原始碼當提示秀出來
    expect(list.plain).toBe('徑向 n−ℓ−1角向')
    // 沒有條列的卡片：points 空，提示改用 plain 的前半段
    expect(single.points).toEqual([])
    expect(single.plain).toBe('一軌域最多 2 電子。')
  })

  it('keeps numbering continuous across several Memorize blocks', () => {
    const raw = '<Memorize items={["甲：一"]} /><Memorize label="補充" items={["乙：二"]} />'
    expect(parseCards(raw, SRC).map((c) => c.id)).toEqual(['chem-x-m-1', 'chem-x-m-2'])
  })

  it('does not end an item array early on a literal "]" inside a string', () => {
    const raw = '<Memorize items={["組態：<code>[Ar]4s¹3d⁵</code>", "第二則：內容"]} />'
    expect(parseCards(raw, SRC).map((c) => c.topic)).toEqual(['組態', '第二則'])
  })

  it('does not end the tag at a "/>" inside an item string', () => {
    const raw = '<Memorize items={["主題：上句<br/>下句", "二：丙"]} /><Memorize items={["三：丁"]} />'
    expect(parseCards(raw, SRC).map((c) => c.topic)).toEqual(['主題', '二', '三'])
    expect(parseCards(raw, SRC)[0].body).toBe('上句<br/>下句')
  })

  it('skips children-style Memorize and empty bodies', () => {
    expect(parseCards('<Memorize>自由格式內容</Memorize>', SRC)).toEqual([])
    expect(parseCards('<Memorize items={["主題：", "   "]} />', SRC)).toEqual([])
  })
})
