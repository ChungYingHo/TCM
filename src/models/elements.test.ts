import { describe, expect, it } from 'vitest'
import { ELEMENTS, totalElectrons } from '@/models/elements'

const byZ = (z: number) => ELEMENTS.find((e) => e.z === z)!

describe('元素資料完整性', () => {
  it('恰好 118 個元素、Z 連續', () => {
    expect(ELEMENTS).toHaveLength(118)
    ELEMENTS.forEach((e, i) => expect(e.z).toBe(i + 1))
  })

  it('每個元素都有符號、英文名、週期(1–7)、合法區塊', () => {
    for (const e of ELEMENTS) {
      expect(e.sym).toBeTruthy()
      expect(e.en).toBeTruthy()
      expect(e.period).toBeGreaterThanOrEqual(1)
      expect(e.period).toBeLessThanOrEqual(7)
      expect(['s', 'p', 'd', 'f']).toContain(e.block)
    }
  })

  it('1–92 有中文名', () => {
    for (let z = 1; z <= 92; z++) expect(byZ(z).zh).toBeTruthy()
  })

  it('組態電子數 = 原子序（全 118 驗證）', () => {
    for (let z = 1; z <= 118; z++) expect(totalElectrons(z)).toBe(z)
  })
})

describe('電子組態（含例外與簡寫）', () => {
  it('一般元素', () => {
    expect(byZ(8).config).toBe('1s²2s²2p⁴') // O
    expect(byZ(8).shorthand).toBe('[He]2s²2p⁴')
    expect(byZ(20).shorthand).toBe('[Ar]4s²') // Ca
    expect(byZ(26).config).toBe('1s²2s²2p⁶3s²3p⁶3d⁶4s²') // Fe
    expect(byZ(26).shorthand).toBe('[Ar]3d⁶4s²')
    expect(byZ(35).shorthand).toBe('[Ar]3d¹⁰4s²4p⁵') // Br
  })

  it('H、He 無內層、簡寫等於完整組態', () => {
    expect(byZ(1).config).toBe('1s¹')
    expect(byZ(1).shorthand).toBe('1s¹')
    expect(byZ(2).shorthand).toBe('1s²')
  })

  it('半滿／全滿等公認例外', () => {
    expect(byZ(24).shorthand).toBe('[Ar]3d⁵4s¹') // Cr
    expect(byZ(29).shorthand).toBe('[Ar]3d¹⁰4s¹') // Cu
    expect(byZ(42).shorthand).toBe('[Kr]4d⁵5s¹') // Mo
    expect(byZ(46).shorthand).toBe('[Kr]4d¹⁰') // Pd（5s 全讓出）
    expect(byZ(47).shorthand).toBe('[Kr]4d¹⁰5s¹') // Ag
    expect(byZ(57).shorthand).toBe('[Xe]5d¹6s²') // La（無 4f）
    expect(byZ(64).shorthand).toBe('[Xe]4f⁷5d¹6s²') // Gd
    expect(byZ(79).shorthand).toBe('[Xe]4f¹⁴5d¹⁰6s¹') // Au
    expect(byZ(92).shorthand).toBe('[Rn]5f³6d¹7s²') // U
  })
})

describe('週期趨勢數值的關鍵錨點', () => {
  it('電負度：F 最大、Cs 最小（在有定義者中）', () => {
    const defined = ELEMENTS.filter((e) => e.eneg !== null)
    const max = defined.reduce((a, b) => (b.eneg! > a.eneg! ? b : a))
    const min = defined.reduce((a, b) => (b.eneg! < a.eneg! ? b : a))
    expect(max.sym).toBe('F')
    expect(max.eneg).toBe(3.98)
    expect(min.sym).toBe('Cs') // Cs/Fr 同為 0.79，reduce 取先遇到的 Cs
  })

  it('第一游離能：He 最大、Cs 最小', () => {
    const defined = ELEMENTS.filter((e) => e.ie1 !== null)
    const max = defined.reduce((a, b) => (b.ie1! > a.ie1! ? b : a))
    const min = defined.reduce((a, b) => (b.ie1! < a.ie1! ? b : a))
    expect(max.sym).toBe('He')
    expect(min.sym).toBe('Cs')
  })

  it('同週期游離能的著名小逆轉：N>O、Be>B、Mg>Al、P>S', () => {
    expect(byZ(7).ie1!).toBeGreaterThan(byZ(8).ie1!) // N > O
    expect(byZ(4).ie1!).toBeGreaterThan(byZ(5).ie1!) // Be > B
    expect(byZ(12).ie1!).toBeGreaterThan(byZ(13).ie1!) // Mg > Al
    expect(byZ(15).ie1!).toBeGreaterThan(byZ(16).ie1!) // P > S
  })

  it('半徑：同族往下變大（鹼金屬 Li<Na<K<Rb<Cs）', () => {
    const r = [3, 11, 19, 37, 55].map((z) => byZ(z).radius!)
    for (let i = 1; i < r.length; i++) expect(r[i]).toBeGreaterThan(r[i - 1])
  })

  it('電子親和力：鹵素最大，且著名例外 Cl＞F', () => {
    expect(byZ(17).ea!).toBeGreaterThan(byZ(9).ea!) // Cl > F
    expect(byZ(17).ea!).toBeGreaterThan(byZ(16).ea!) // Cl > S（同週期鹵素最大）
  })

  it('電子親和力：第 2 族與鑭系一律留白（與解說「留白」一致、不放假精確值）', () => {
    for (const z of [4, 12, 20, 38, 56]) expect(byZ(z).ea).toBeNull() // Be Mg Ca Sr Ba
    for (let z = 57; z <= 71; z++) expect(byZ(z).ea).toBeNull() // 鑭系
  })
})

describe('考試用欄位：價電子與氧化態', () => {
  it('主族價電子＝最外層電子數', () => {
    expect(byZ(11).valence).toBe(1) // Na
    expect(byZ(8).valence).toBe(6) // O
    expect(byZ(17).valence).toBe(7) // Cl
    expect(byZ(10).valence).toBe(8) // Ne
    expect(byZ(20).valence).toBe(2) // Ca
    expect(byZ(31).valence).toBe(3) // Ga（[Ar]3d¹⁰4s²4p¹ → 最外層 4s²4p¹）
  })

  it('過渡／內過渡不給單一價電子數（null）', () => {
    expect(byZ(26).valence).toBeNull() // Fe（d 區）
    expect(byZ(57).valence).toBeNull() // La（f 區）
  })

  it('原子量：常用值正確、且每個元素都有', () => {
    expect(byZ(1).mass).toBeCloseTo(1.008, 3) // H
    expect(byZ(6).mass).toBeCloseTo(12.011, 3) // C
    expect(byZ(8).mass).toBeCloseTo(15.999, 3) // O
    expect(byZ(17).mass).toBeCloseTo(35.45, 2) // Cl
    expect(byZ(82).mass).toBeCloseTo(207.2, 1) // Pb
    for (const e of ELEMENTS) expect(e.mass).toBeGreaterThan(0)
  })

  it('常見離子顏色：過渡金屬考點', () => {
    expect(byZ(29).ions.map((i) => i.ion)).toContain('Cu²⁺') // 銅藍
    expect(byZ(25).ions.map((i) => i.ion)).toContain('MnO₄⁻') // 過錳酸根紫
    expect(byZ(26).ions).toHaveLength(2) // Fe²⁺、Fe³⁺
    // 主族（如 Na）無離子顏色資料
    expect(byZ(11).ions).toEqual([])
    // 每筆都要有色票與顏色名
    for (const e of ELEMENTS) for (const ion of e.ions) {
      expect(ion.css).toMatch(/^#/)
      expect(ion.name).toBeTruthy()
    }
  })

  it('常見氧化態：高頻考點', () => {
    expect(byZ(26).ox).toEqual([2, 3]) // Fe
    expect(byZ(25).ox).toContain(7) // Mn 有 +7
    expect(byZ(17).ox).toContain(-1) // Cl 有 −1
    expect(byZ(17).ox).toContain(7) // Cl 也有 +7
    expect(byZ(8).ox).toEqual([-2]) // O
    expect(byZ(11).ox).toEqual([1]) // Na
    expect(byZ(2).ox).toEqual([]) // He 鈍氣
    // 氧化態一律由負到正排序
    for (const e of ELEMENTS) {
      for (let i = 1; i < e.ox.length; i++) expect(e.ox[i]).toBeGreaterThan(e.ox[i - 1])
    }
  })
})
