import { describe, it, expect } from 'vitest'
import { AMINO_ACIDS, AA_CATEGORY_LABEL, type AACategory } from '@/models/aminoAcids'

describe('20 種胺基酸資料', () => {
  it('恰 20 種、三/一字母代號皆唯一、欄位齊全', () => {
    expect(AMINO_ACIDS).toHaveLength(20)
    expect(new Set(AMINO_ACIDS.map((a) => a.code1)).size).toBe(20)
    expect(new Set(AMINO_ACIDS.map((a) => a.code3)).size).toBe(20)
    for (const a of AMINO_ACIDS) {
      expect(a.code1, a.en).toHaveLength(1)
      expect(a.code3, a.en).toHaveLength(3)
      expect(a.zh).toBeTruthy()
      expect(a.en).toBeTruthy()
      expect(a.r).toBeTruthy()
    }
  })

  it('必需胺基酸恰 9 個，且為標準集合', () => {
    const ess = AMINO_ACIDS.filter((a) => a.essential).map((a) => a.code3).sort()
    expect(ess).toEqual(['His', 'Ile', 'Leu', 'Lys', 'Met', 'Phe', 'Thr', 'Trp', 'Val'].sort())
  })

  it('Lehninger 五大分類齊全，個數 7/3/5/2/3', () => {
    const count = (c: AACategory) => AMINO_ACIDS.filter((a) => a.category === c).length
    expect(count('nonpolar')).toBe(7)
    expect(count('aromatic')).toBe(3)
    expect(count('polar')).toBe(5)
    expect(count('acidic')).toBe(2)
    expect(count('basic')).toBe(3)
    for (const a of AMINO_ACIDS) expect(AA_CATEGORY_LABEL[a.category]).toBeTruthy()
  })

  it('抽查關鍵資料', () => {
    const by = (c: string) => AMINO_ACIDS.find((a) => a.code1 === c)!
    expect(by('S').category).toBe('polar') // 絲胺酸
    expect(by('K').category).toBe('basic') // 離胺酸
    expect(by('K').essential).toBe(true)
    expect(by('G').r).toBe('–H') // 甘胺酸
    expect(by('C').code3).toBe('Cys') // 半胱胺酸
  })
})
