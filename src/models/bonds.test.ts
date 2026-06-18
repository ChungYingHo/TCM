import { describe, it, expect } from 'vitest'
import { BOND_EXAMPLES, BOND_TYPE_LABEL, type BondType } from '@/models/bonds'

describe('bonds dataset', () => {
  it('every example is well-formed', () => {
    for (const b of BOND_EXAMPLES) {
      expect(b.formula.length, 'empty formula').toBeGreaterThan(0)
      expect(b.name.length, `${b.formula} missing name`).toBeGreaterThan(0)
      expect(b.why.length, `${b.formula} missing why`).toBeGreaterThan(4)
      expect(BOND_TYPE_LABEL[b.type], `${b.formula} bad type`).toBeTruthy()
      // polarity is a molecular property → only meaningful on covalent molecules
      if (b.polarity) expect(b.type, `${b.formula} polarity on non-covalent`).toBe('covalent')
    }
  })

  it('covers all three bond types', () => {
    const types = new Set<BondType>(BOND_EXAMPLES.map((b) => b.type))
    expect(types).toEqual(new Set<BondType>(['ionic', 'covalent', 'metallic']))
  })

  it('has unique formulas', () => {
    const f = BOND_EXAMPLES.map((b) => b.formula)
    expect(new Set(f).size).toBe(f.length)
  })

  it('classifies the textbook traps correctly', () => {
    const by = (f: string) => BOND_EXAMPLES.find((b) => b.formula === f)
    expect(by('CO₂')?.type).toBe('covalent')
    expect(by('CO₂')?.polarity).toBe('nonpolar') // polar bonds, nonpolar molecule
    expect(by('NaCl')?.type).toBe('ionic')
    expect(by('Fe')?.type).toBe('metallic')
    expect(by('H₂O')?.polarity).toBe('polar')
  })
})
