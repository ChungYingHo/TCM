// 胺基酸結構圖的幾何產生器（純函式 → 可測、可重用）。
// 畫「兩性離子骨架」H₃N⁺–Cα(–COO⁻)(–H)–[側鏈 R]，側鏈以紅色標示。
// 側鏈造型只是把 @/models/aminoAcids 的 R 基「畫出來」；R 基資料本身已查證，
// 帶環者（苯環/酚/咪唑/吲哚/吡咯啶/胍基）以原子數與雜原子位置正確為目標、造型力求清楚。
// 不靠 LLM 即時判讀結構；座標為本檔靜態定義。

export type Prim =
  | { k: 'bond'; x1: number; y1: number; x2: number; y2: number; r?: boolean }
  | { k: 'atom'; x: number; y: number; s: string; r?: boolean }
  | { k: 'poly'; pts: string; r?: boolean } // 環骨架（折線，不填色）
  | { k: 'ring'; cx: number; cy: number; rad: number } // 芳香環內圈

export interface Structure {
  prims: Prim[]
  w: number
  h: number
}

const CX = 100
const STEP = 30 // 側鏈每節垂直間距
const A = 9 // 原子半高（垂直鍵留白）
const HX = 12 // 原子半寬（水平鍵留白）

// 側鏈節點：label＝該位置原子/基團；right＝向右單鍵支鏈；dbl＝向右雙鍵原子（如羰基 =O、胍基 =NH）
interface Node {
  label: string
  right?: string
  dbl?: string
}
interface Side {
  chain: Node[]
  ring?: 'benzene' | 'phenol' | 'imidazole' | 'indole'
}

// 各胺基酸側鏈造型（由 Cβ 往下；環接在最後一節 CH₂ 之下）。脯胺酸(P)另以整環特例處理。
const SIDE: Record<string, Side> = {
  G: { chain: [{ label: 'H' }] },
  A: { chain: [{ label: 'CH₃' }] },
  V: { chain: [{ label: 'CH', right: 'CH₃' }, { label: 'CH₃' }] },
  L: { chain: [{ label: 'CH₂' }, { label: 'CH', right: 'CH₃' }, { label: 'CH₃' }] },
  I: { chain: [{ label: 'CH', right: 'CH₃' }, { label: 'CH₂' }, { label: 'CH₃' }] },
  M: { chain: [{ label: 'CH₂' }, { label: 'CH₂' }, { label: 'S' }, { label: 'CH₃' }] },
  F: { chain: [{ label: 'CH₂' }], ring: 'benzene' },
  Y: { chain: [{ label: 'CH₂' }], ring: 'phenol' },
  W: { chain: [{ label: 'CH₂' }], ring: 'indole' },
  S: { chain: [{ label: 'CH₂' }, { label: 'OH' }] },
  T: { chain: [{ label: 'CH', right: 'OH' }, { label: 'CH₃' }] },
  C: { chain: [{ label: 'CH₂' }, { label: 'SH' }] },
  N: { chain: [{ label: 'CH₂' }, { label: 'C', dbl: 'O' }, { label: 'NH₂' }] },
  Q: { chain: [{ label: 'CH₂' }, { label: 'CH₂' }, { label: 'C', dbl: 'O' }, { label: 'NH₂' }] },
  D: { chain: [{ label: 'CH₂' }, { label: 'C', dbl: 'O' }, { label: 'OH' }] },
  E: { chain: [{ label: 'CH₂' }, { label: 'CH₂' }, { label: 'C', dbl: 'O' }, { label: 'OH' }] },
  K: { chain: [{ label: 'CH₂' }, { label: 'CH₂' }, { label: 'CH₂' }, { label: 'CH₂' }, { label: 'NH₃⁺' }] },
  R: { chain: [{ label: 'CH₂' }, { label: 'CH₂' }, { label: 'CH₂' }, { label: 'NH' }, { label: 'C', dbl: 'NH' }, { label: 'NH₂' }] },
  H: { chain: [{ label: 'CH₂' }], ring: 'imidazole' },
}

function backbonePrims(): Prim[] {
  return [
    { k: 'atom', x: CX, y: 24, s: 'COO⁻' },
    { k: 'bond', x1: CX, y1: 24 + A, x2: CX, y2: 70 - A },
    { k: 'atom', x: CX, y: 70, s: 'C' },
    { k: 'atom', x: 40, y: 70, s: 'H₃N⁺' },
    { k: 'bond', x1: 62, y1: 70, x2: CX - HX, y2: 70 },
    { k: 'atom', x: 152, y: 70, s: 'H' },
    { k: 'bond', x1: CX + HX, y1: 70, x2: 140, y2: 70 },
  ]
}

// 把一條側鏈（chain＋可選環）的 prims 疊出來，回傳最後一節的 y（供環接續）。
function chainPrims(side: Side, startY: number): { prims: Prim[]; lastY: number } {
  const prims: Prim[] = []
  // Cα 往下接 Cβ
  prims.push({ k: 'bond', x1: CX, y1: 70 + A, x2: CX, y2: startY - A, r: true })
  let y = startY
  side.chain.forEach((n, i) => {
    prims.push({ k: 'atom', x: CX, y, s: n.label, r: true })
    if (n.right) {
      prims.push({ k: 'bond', x1: CX + HX, y1: y, x2: CX + 30, y2: y, r: true })
      prims.push({ k: 'atom', x: CX + 44, y, s: n.right, r: true })
    }
    if (n.dbl) {
      prims.push({ k: 'bond', x1: CX + HX, y1: y - 3, x2: CX + 30, y2: y - 3, r: true })
      prims.push({ k: 'bond', x1: CX + HX, y1: y + 3, x2: CX + 30, y2: y + 3, r: true })
      prims.push({ k: 'atom', x: CX + 42, y, s: n.dbl, r: true })
    }
    // 節間鍵；最後一節之後若接環，由 ringPrims 畫單一接續鍵（不在此補，免得戳進環裡）
    if (i < side.chain.length - 1) {
      prims.push({ k: 'bond', x1: CX, y1: y + A, x2: CX, y2: y + STEP - A, r: true })
      y += STEP
    }
  })
  return { prims, lastY: y }
}

// 正多邊形頂點（pointy-top；i=0 在正上方），SVG y 向下。
function polygon(cx: number, cy: number, rad: number, n: number): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)])
  }
  return pts
}
const ptsStr = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

function rotate([x, y]: [number, number], ang: number): [number, number] {
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  return [x * c - y * s, x * s + y * c]
}

// 與邊 a→b「共用該邊」、向遠離 away 那一側展開的正六邊形 6 頂點（用於吲哚的稠環苯環）。
function hexOnEdge(a: [number, number], b: [number, number], away: [number, number]): [number, number][] {
  const d: [number, number] = [b[0] - a[0], b[1] - a[1]]
  let best: [number, number][] = []
  let bestDist = -1
  for (const sign of [1, -1]) {
    const ext = (sign * Math.PI) / 3 // 正六邊形外角 60°
    const v: [number, number][] = [a, b]
    for (let k = 1; k <= 4; k++) {
      const dk = rotate(d, k * ext)
      const last = v[v.length - 1]
      v.push([last[0] + dk[0], last[1] + dk[1]])
    }
    const cx = v.reduce((s, p) => s + p[0], 0) / 6
    const cy = v.reduce((s, p) => s + p[1], 0) / 6
    const dist = Math.hypot(cx - away[0], cy - away[1])
    if (dist > bestDist) {
      bestDist = dist
      best = v
    }
  }
  return best
}

function ringPrims(kind: NonNullable<Side['ring']>, attachY: number): { prims: Prim[]; bottom: number } {
  const prims: Prim[] = []
  if (kind === 'benzene' || kind === 'phenol') {
    const rad = 22
    const cy = attachY + A + 8 + rad
    const top = cy - rad
    prims.push({ k: 'bond', x1: CX, y1: attachY + A, x2: CX, y2: top, r: true })
    const hex = polygon(CX, cy, rad, 6)
    prims.push({ k: 'poly', pts: ptsStr([...hex, hex[0]]), r: true })
    prims.push({ k: 'ring', cx: CX, cy, rad: rad - 9 })
    let bottom = cy + rad
    if (kind === 'phenol') {
      prims.push({ k: 'bond', x1: CX, y1: cy + rad, x2: CX, y2: cy + rad + 9, r: true })
      prims.push({ k: 'atom', x: CX, y: cy + rad + 18, s: 'OH', r: true })
      bottom = cy + rad + 18
    }
    return { prims, bottom }
  }
  if (kind === 'imidazole') {
    // 五元環，2 個 N（咪唑 N1、N3，跨頂端 C2 相隔；接點在底部 C4）
    const rad = 20
    const cy = attachY + A + 8 + rad
    const top = cy - rad
    prims.push({ k: 'bond', x1: CX, y1: attachY + A, x2: CX, y2: top, r: true })
    const pent = polygon(CX, cy, rad, 5)
    prims.push({ k: 'poly', pts: ptsStr([...pent, pent[0]]), r: true })
    // 咪唑：接點 CH₂ 在頂點 i0=C4；環序 C4-C5(i1)-N1(i2)-C2(i3)-N3(i4)。
    // 兩個 N 在 i2、i4（相隔 C2=i3，即 1,3 位），其中 N3(i4) 與接點 C4 相鄰、N1(i2) 不相鄰——符合組胺酸。
    prims.push({ k: 'atom', x: pent[2][0] + 7, y: pent[2][1] + 7, s: 'N', r: true })
    prims.push({ k: 'atom', x: pent[4][0] - 8, y: pent[4][1], s: 'N', r: true })
    return { prims, bottom: cy + rad }
  }
  // indole（色胺酸）：苯環與吡咯「真正共用」C3a–C7a 一條邊（稠環）。
  // 吡咯 pointy-top 五元環：i0=C3(接 CH₂)、i1=C2、i2=N1、i3=C7a、i4=C3a；苯環稠在 i3–i4 邊上。
  const rad = 17
  const cy = attachY + A + 8 + rad
  prims.push({ k: 'bond', x1: CX, y1: attachY + A, x2: CX, y2: cy - rad, r: true })
  const pent = polygon(CX, cy, rad, 5)
  prims.push({ k: 'poly', pts: ptsStr([...pent, pent[0]]), r: true })
  prims.push({ k: 'atom', x: pent[2][0] + 9, y: pent[2][1] + 6, s: 'N', r: true }) // 吡咯 N1（NH）
  const hex = hexOnEdge(pent[3], pent[4], [CX, cy]) // 與 C7a–C3a 共邊、向左外展
  prims.push({ k: 'poly', pts: ptsStr([...hex, hex[0]]), r: true })
  const hcx = hex.reduce((s, p) => s + p[0], 0) / 6
  const hcy = hex.reduce((s, p) => s + p[1], 0) / 6
  prims.push({ k: 'ring', cx: hcx, cy: hcy, rad: rad * 0.62 })
  const bottom = Math.max(...pent.concat(hex).map((p) => p[1])) + 6
  return { prims, bottom }
}

// 脯胺酸：側鏈接回 α-胺基 N，形成吡咯啶五元環（N 為環內二級胺）。整體特例。
function prolinePrims(): Structure {
  const prims: Prim[] = [
    { k: 'atom', x: CX, y: 24, s: 'COO⁻' },
    { k: 'bond', x1: CX, y1: 24 + A, x2: CX, y2: 70 - A },
    { k: 'atom', x: CX, y: 70, s: 'C' }, // Cα
    { k: 'atom', x: 150, y: 70, s: 'H' },
    { k: 'bond', x1: CX + HX, y1: 70, x2: 138, y2: 70 },
  ]
  // 五元環：Cα(右上)–N(左上)–Cδ(左下)–Cγ(下)–Cβ(右下)–回 Cα
  const ca: [number, number] = [CX, 70]
  const n: [number, number] = [CX - 40, 70]
  const cd: [number, number] = [CX - 48, 108]
  const cg: [number, number] = [CX - 18, 130]
  const cb: [number, number] = [CX + 8, 104]
  prims.push({ k: 'atom', x: n[0], y: n[1], s: 'N', r: true })
  prims.push({ k: 'bond', x1: ca[0] - HX, y1: 70, x2: n[0] + HX, y2: 70, r: true }) // Cα–N
  prims.push({ k: 'poly', pts: ptsStr([n, cd, cg, cb, ca]), r: true }) // N–Cδ–Cγ–Cβ–Cα
  return { prims, w: 200, h: 150 }
}

/** 由一字母代號產生整個胺基酸的結構圖 prims 與畫布尺寸。 */
export function structure(code1: string): Structure {
  if (code1 === 'P') return prolinePrims()
  const side = SIDE[code1]
  if (!side) return { prims: backbonePrims(), w: 200, h: 110 }
  const prims = backbonePrims()
  const { prims: cp, lastY } = chainPrims(side, 112)
  prims.push(...cp)
  let bottom = lastY + 10
  if (side.ring) {
    const r = ringPrims(side.ring, lastY)
    prims.push(...r.prims)
    bottom = r.bottom
  }
  return { prims, w: 200, h: Math.ceil(bottom + 16) }
}
