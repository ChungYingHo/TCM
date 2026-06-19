import { describe, it, expect } from 'vitest'
import { structure, type Prim } from '@/utils/aminoAcidStructure'
import { AMINO_ACIDS } from '@/models/aminoAcids'

const CODES = AMINO_ACIDS.map((a) => a.code1)
const atoms = (ps: Prim[]) => ps.filter((p): p is Extract<Prim, { k: 'atom' }> => p.k === 'atom')
const polys = (ps: Prim[]) => ps.filter((p): p is Extract<Prim, { k: 'poly' }> => p.k === 'poly')

describe('胺基酸結構產生器', () => {
  it('每個胺基酸都產生 prims，且座標皆為有限數', () => {
    for (const c of CODES) {
      const s = structure(c)
      expect(s.prims.length, c).toBeGreaterThan(0)
      expect(s.w).toBe(200)
      expect(s.h, c).toBeGreaterThan(0)
      for (const p of s.prims) {
        const nums =
          p.k === 'bond' ? [p.x1, p.y1, p.x2, p.y2]
            : p.k === 'atom' ? [p.x, p.y]
              : p.k === 'ring' ? [p.cx, p.cy, p.rad]
                : p.pts.split(/[ ,]/).map(Number)
        for (const n of nums) expect(Number.isFinite(n), `${c} ${p.k}`).toBe(true)
      }
    }
  })

  it('每個結構都畫出共通骨架的 COO⁻ 與 Cα', () => {
    for (const c of CODES) {
      const labels = atoms(structure(c).prims).map((p) => p.s)
      expect(labels, c).toContain('COO⁻')
      expect(labels, c).toContain('C')
    }
  })

  it('組胺酸咪唑恰有兩個環上 N（1,3 位）', () => {
    expect(atoms(structure('H').prims).filter((p) => p.s === 'N')).toHaveLength(2)
  })

  it('脯胺酸的 N 在環內（非游離 H₃N⁺）', () => {
    const labels = atoms(structure('P').prims).map((p) => p.s)
    expect(labels).toContain('N')
    expect(labels).not.toContain('H₃N⁺')
  })

  it('色胺酸吲哚：苯環與吡咯確實共用一條邊（≥2 個共同頂點）', () => {
    const ps = polys(structure('W').prims)
    expect(ps).toHaveLength(2) // 吡咯五元環 + 苯六元環
    const parse = (s: string) => s.trim().split(' ').map((pt) => pt.split(',').map(Number))
    const pent = parse(ps[0].pts)
    const hex = parse(ps[1].pts)
    const same = (a: number[], b: number[]) => Math.abs(a[0] - b[0]) < 0.5 && Math.abs(a[1] - b[1]) < 0.5
    const shared = pent.filter((a) => hex.some((b) => same(a, b)))
    const uniq = shared.filter((a, i) => shared.findIndex((b) => same(a, b)) === i)
    expect(uniq.length).toBeGreaterThanOrEqual(2)
  })
})
