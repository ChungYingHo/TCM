// 元素週期表共用資料 —— 單一資料來源（被 /periodic-table 工具頁與筆記內小週期表共用）。
//
// 全為靜態化學常識，非 LLM 生成：
//   - 符號、中英名、週期/族/區塊、分類：化學定義。
//   - 電子組態：程式依 Aufbau／(n+ℓ)（Madelung）順序生成，再套一份「半滿／全滿」等
//     公認例外修正表（Cr、Cu、Mo、Ag、Au、La、Ce、Gd、Pt、U… 等）。
//   - 三大週期趨勢數值：電負度（Pauling）、原子半徑（共價半徑 Cordero, pm）、
//     第一游離能（kJ/mol），採教科書標準值，主要供「看趨勢」用；不同資料來源末位略有差異。
//
// 93 號之後皆人造放射性元素，後中不考中文名，故 zh 留空只顯示符號；其組態以理論／教科書值為準。

export type Block = 's' | 'p' | 'd' | 'f'

export interface IonColor {
  ion: string // 離子式，如 Cu²⁺、MnO₄⁻
  name: string // 顏色（中文）
  css: string // 約略色票，供色塊顯示
}

export type Category =
  | 'alkali' // 鹼金屬
  | 'alkaline' // 鹼土金屬
  | 'transition' // 過渡金屬
  | 'post-transition' // 後過渡（貧）金屬
  | 'metalloid' // 類金屬
  | 'nonmetal' // 非金屬
  | 'halogen' // 鹵素
  | 'noble' // 惰性氣體
  | 'lanthanide' // 鑭系
  | 'actinide' // 錒系

export interface Element {
  z: number
  sym: string
  en: string
  zh: string // 中文名（1–92；93+ 留空）
  period: number
  group: number | null // 1–18 主表族；f 區內過渡元素為 null
  block: Block
  category: Category
  config: string // 完整組態，如 1s²2s²2p⁴
  shorthand: string // 稀有氣體簡寫，如 [He]2s²2p⁴
  eneg: number | null // 電負度（Pauling）
  radius: number | null // 原子（共價）半徑 pm
  ie1: number | null // 第一游離能 kJ/mol
  ea: number | null // 電子親和力 kJ/mol（放出能量；越大越易得電子）
  valence: number | null // 價電子數（僅主族；過渡/內過渡價數多變故為 null）
  ox: number[] // 常見氧化態（由負到正；空陣列＝不常考或鈍氣 0）
  mass: number // 標準原子量（放射性元素取最穩定同位素質量數）
  ions: IonColor[] // 常見離子在水溶液中的顏色（多為過渡金屬，定性分析考點）
}

// ── 原始資料（index = Z − 1） ────────────────────────────────────────────────

const SYMBOLS =
  'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(
    ' ',
  )

const EN_NAMES =
  'Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminium Silicon Phosphorus Sulfur Chlorine Argon Potassium Calcium Scandium Titanium Vanadium Chromium Manganese Iron Cobalt Nickel Copper Zinc Gallium Germanium Arsenic Selenium Bromine Krypton Rubidium Strontium Yttrium Zirconium Niobium Molybdenum Technetium Ruthenium Rhodium Palladium Silver Cadmium Indium Tin Antimony Tellurium Iodine Xenon Caesium Barium Lanthanum Cerium Praseodymium Neodymium Promethium Samarium Europium Gadolinium Terbium Dysprosium Holmium Erbium Thulium Ytterbium Lutetium Hafnium Tantalum Tungsten Rhenium Osmium Iridium Platinum Gold Mercury Thallium Lead Bismuth Polonium Astatine Radon Francium Radium Actinium Thorium Protactinium Uranium Neptunium Plutonium Americium Curium Berkelium Californium Einsteinium Fermium Mendelevium Nobelium Lawrencium Rutherfordium Dubnium Seaborgium Bohrium Hassium Meitnerium Darmstadtium Roentgenium Copernicium Nihonium Flerovium Moscovium Livermorium Tennessine Oganesson'.split(
    ' ',
  )

// 中文名（1–92；93 號之後人造放射性元素，後中不考中文名，留空只顯示符號）
const ZH_NAMES: Record<number, string> = {
  1: '氫', 2: '氦', 3: '鋰', 4: '鈹', 5: '硼', 6: '碳', 7: '氮', 8: '氧', 9: '氟', 10: '氖',
  11: '鈉', 12: '鎂', 13: '鋁', 14: '矽', 15: '磷', 16: '硫', 17: '氯', 18: '氬', 19: '鉀', 20: '鈣',
  21: '鈧', 22: '鈦', 23: '釩', 24: '鉻', 25: '錳', 26: '鐵', 27: '鈷', 28: '鎳', 29: '銅', 30: '鋅',
  31: '鎵', 32: '鍺', 33: '砷', 34: '硒', 35: '溴', 36: '氪', 37: '銣', 38: '鍶', 39: '釔', 40: '鋯',
  41: '鈮', 42: '鉬', 43: '鎝', 44: '釕', 45: '銠', 46: '鈀', 47: '銀', 48: '鎘', 49: '銦', 50: '錫',
  51: '銻', 52: '碲', 53: '碘', 54: '氙', 55: '銫', 56: '鋇', 57: '鑭', 58: '鈰', 59: '鐠', 60: '釹',
  61: '鉕', 62: '釤', 63: '銪', 64: '釓', 65: '鋱', 66: '鏑', 67: '鈥', 68: '鉺', 69: '銩', 70: '鐿',
  71: '鎦', 72: '鉿', 73: '鉭', 74: '鎢', 75: '錸', 76: '鋨', 77: '銥', 78: '鉑', 79: '金', 80: '汞',
  81: '鉈', 82: '鉛', 83: '鉍', 84: '釙', 85: '砈', 86: '氡', 87: '鍅', 88: '鐳', 89: '錒', 90: '釷',
  91: '鏷', 92: '鈾',
}

// 電負度（Pauling）；null = 未定義／不常列（多為惰性氣體與超重元素）
const ENEG: (number | null)[] = [
  2.2, null, 0.98, 1.57, 2.04, 2.55, 3.04, 3.44, 3.98, null, // 1–10
  0.93, 1.31, 1.61, 1.9, 2.19, 2.58, 3.16, null, 0.82, 1.0, // 11–20
  1.36, 1.54, 1.63, 1.66, 1.55, 1.83, 1.88, 1.91, 1.9, 1.65, // 21–30
  1.81, 2.01, 2.18, 2.55, 2.96, 3.0, 0.82, 0.95, 1.22, 1.33, // 31–40
  1.6, 2.16, 1.9, 2.2, 2.28, 2.2, 1.93, 1.69, 1.78, 1.96, // 41–50
  2.05, 2.1, 2.66, 2.6, 0.79, 0.89, 1.1, 1.12, 1.13, 1.14, // 51–60
  1.13, 1.17, 1.2, 1.2, 1.2, 1.22, 1.23, 1.24, 1.25, 1.1, // 61–70
  1.27, 1.3, 1.5, 2.36, 1.9, 2.2, 2.2, 2.28, 2.54, 2.0, // 71–80
  1.62, 2.33, 2.02, 2.0, 2.2, null, 0.79, 0.9, 1.1, 1.3, // 81–90
  1.5, 1.38, 1.36, 1.28, 1.13, 1.28, 1.3, 1.3, 1.3, null, // 91–100
  null, null, null, null, null, null, null, null, null, null, // 101–110
  null, null, null, null, null, null, null, null, // 111–118
]

// 原子半徑（共價半徑 Cordero 2008, pm）；null = 來源未列
const RADIUS: (number | null)[] = [
  31, 28, 128, 96, 84, 76, 71, 66, 57, 58, // 1–10
  166, 141, 121, 111, 107, 105, 102, 106, 203, 176, // 11–20
  170, 160, 153, 139, 139, 132, 126, 124, 132, 122, // 21–30
  122, 120, 119, 120, 120, 116, 220, 195, 190, 175, // 31–40
  164, 154, 147, 146, 142, 139, 145, 144, 142, 139, // 41–50
  139, 138, 139, 140, 244, 215, 207, 204, 203, 201, // 51–60
  199, 198, 198, 196, 194, 192, 192, 189, 190, 187, // 61–70
  187, 175, 170, 162, 151, 144, 141, 136, 136, 132, // 71–80
  145, 146, 148, 140, 150, 150, 260, 221, 215, 206, // 81–90
  200, 196, 190, 187, 180, 169, null, null, null, null, // 91–100
  null, null, null, null, null, null, null, null, null, null, // 101–110
  null, null, null, null, null, null, null, null, // 111–118
]

// 第一游離能（kJ/mol）；null = 來源未列
const IE1: (number | null)[] = [
  1312, 2372, 520, 899, 801, 1086, 1402, 1314, 1681, 2081, // 1–10
  496, 738, 578, 786, 1012, 1000, 1251, 1521, 419, 590, // 11–20
  633, 659, 651, 653, 717, 762, 760, 737, 745, 906, // 21–30
  579, 762, 947, 941, 1140, 1351, 403, 549, 600, 640, // 31–40
  652, 684, 702, 710, 720, 804, 731, 868, 558, 709, // 41–50
  834, 869, 1008, 1170, 376, 503, 538, 534, 527, 533, // 51–60
  540, 545, 547, 593, 566, 573, 581, 589, 597, 603, // 61–70
  524, 659, 761, 770, 760, 840, 880, 870, 890, 1007, // 71–80
  589, 716, 703, 812, 899, 1037, 380, 509, 499, 587, // 81–90
  568, 597, 604, 585, 578, 581, null, null, null, null, // 91–100
  null, null, null, null, null, null, null, null, null, null, // 101–110
  null, null, null, null, null, null, null, null, // 111–118
]

// 電子親和力（kJ/mol，放出能量；越大越易得電子）。null = 不利得電子或數值不確定／非考點
// （第 2、18 族與 N、Mn、Zn 加電子不放熱；鑭系／錒系數值不確定，皆留白）。
// 考點：鹵素最大、且 Cl(349)＞F(328)。主族與 d 區採實測值，僅鑭系/錒系刻意不列以免假精確。
const EA: (number | null)[] = [
  73, null, 60, null, 27, 122, null, 141, 328, null, // 1–10
  53, null, 42, 134, 72, 200, 349, null, 48, null, // 11–20（Ca 留白：第 2 族不利得電子）
  18, 8, 51, 65, null, 15, 64, 112, 119, null, // 21–30
  41, 119, 78, 195, 325, null, 47, null, 30, 41, // 31–40（Sr 留白）
  86, 72, 53, 101, 110, 54, 126, null, 29, 107, // 41–50
  101, 190, 295, null, 46, null, null, null, null, null, // 51–60（Ba 及鑭系留白）
  null, null, null, null, null, null, null, null, null, null, // 61–70（鑭系留白）
  null, 0, 31, 79, 15, 104, 151, 205, 223, null, // 71–80（Lu 留白）
  19, 35, 91, 136, 233, null, 47, null, null, null, // 81–90（Ra 及錒系留白）
  null, null, null, null, null, null, null, null, null, null, // 91–100（錒系留白）
  null, null, null, null, null, null, null, null, null, null, // 101–110
  null, null, null, null, null, null, null, null, // 111–118
]

// 常見氧化態（由負到正；考點導向，非窮舉）。空 = 鈍氣 0 或後中不考。鑭系預設 +3。
const OX: Record<number, number[]> = {
  1: [-1, 1], 3: [1], 4: [2], 5: [3], 6: [-4, 2, 4], 7: [-3, 3, 5], 8: [-2], 9: [-1],
  11: [1], 12: [2], 13: [3], 14: [-4, 4], 15: [-3, 3, 5], 16: [-2, 4, 6], 17: [-1, 1, 5, 7],
  19: [1], 20: [2], 21: [3], 22: [3, 4], 23: [2, 3, 4, 5], 24: [2, 3, 6], 25: [2, 4, 7],
  26: [2, 3], 27: [2, 3], 28: [2], 29: [1, 2], 30: [2],
  31: [3], 32: [2, 4], 33: [-3, 3, 5], 34: [-2, 4, 6], 35: [-1, 1, 5],
  37: [1], 38: [2], 39: [3], 40: [4], 41: [5], 42: [4, 6], 43: [7], 44: [3, 4], 45: [3],
  46: [2, 4], 47: [1], 48: [2], 49: [3], 50: [2, 4], 51: [3, 5], 52: [-2, 4, 6], 53: [-1, 1, 5, 7],
  54: [2, 4, 6], 55: [1], 56: [2],
  57: [3], 58: [3], 59: [3], 60: [3], 61: [3], 62: [3], 63: [3], 64: [3], 65: [3], 66: [3],
  67: [3], 68: [3], 69: [3], 70: [3], 71: [3],
  72: [4], 73: [5], 74: [6], 75: [7], 76: [4], 77: [3, 4], 78: [2, 4], 79: [1, 3], 80: [1, 2],
  81: [1, 3], 82: [2, 4], 83: [3, 5], 84: [2, 4], 85: [-1, 1], 87: [1], 88: [2], 89: [3],
  90: [4], 91: [5], 92: [4, 6],
}

// 標準原子量（IUPAC）；放射性無穩定同位素者取最穩定同位素質量數（整數）。
const MASS: number[] = [
  1.008, 4.003, 6.94, 9.012, 10.81, 12.011, 14.007, 15.999, 18.998, 20.18, // 1–10
  22.99, 24.305, 26.982, 28.085, 30.974, 32.06, 35.45, 39.95, 39.098, 40.078, // 11–20
  44.956, 47.867, 50.942, 51.996, 54.938, 55.845, 58.933, 58.693, 63.546, 65.38, // 21–30
  69.723, 72.63, 74.922, 78.971, 79.904, 83.798, 85.468, 87.62, 88.906, 91.224, // 31–40
  92.906, 95.95, 98, 101.07, 102.906, 106.42, 107.868, 112.414, 114.818, 118.71, // 41–50
  121.76, 127.6, 126.904, 131.293, 132.905, 137.327, 138.905, 140.116, 140.908, 144.242, // 51–60
  145, 150.36, 151.964, 157.25, 158.925, 162.5, 164.93, 167.259, 168.934, 173.045, // 61–70
  174.967, 178.49, 180.948, 183.84, 186.207, 190.23, 192.217, 195.084, 196.967, 200.592, // 71–80
  204.38, 207.2, 208.98, 209, 210, 222, 223, 226, 227, 232.038, // 81–90
  231.036, 238.029, 237, 244, 243, 247, 247, 251, 252, 257, // 91–100
  258, 259, 266, 267, 268, 269, 270, 269, 278, 281, // 101–110
  282, 285, 286, 289, 290, 293, 294, 294, // 111–118
]

// 常見離子在水溶液中的顏色（定性分析／配位化學考點；色票為約略示意色）。
const IONS: Record<number, IonColor[]> = {
  24: [{ ion: 'Cr³⁺', name: '綠', css: '#3fae6e' }, { ion: 'CrO₄²⁻', name: '黃', css: '#f2cf3e' }, { ion: 'Cr₂O₇²⁻', name: '橙', css: '#e8742c' }],
  25: [{ ion: 'Mn²⁺', name: '淡粉', css: '#f0bcd0' }, { ion: 'MnO₄⁻', name: '紫', css: '#7b2fbf' }],
  26: [{ ion: 'Fe²⁺', name: '淺綠', css: '#8fc79a' }, { ion: 'Fe³⁺', name: '黃棕', css: '#c8893a' }],
  27: [{ ion: 'Co²⁺', name: '粉紅', css: '#e89bb0' }],
  28: [{ ion: 'Ni²⁺', name: '綠', css: '#5fae7a' }],
  29: [{ ion: 'Cu²⁺', name: '藍', css: '#3f7fd6' }],
}

// ── 電子組態生成（Aufbau／Madelung + 例外修正） ────────────────────────────────

const L_LETTER = ['s', 'p', 'd', 'f']
const cap = (l: number) => 2 * (2 * l + 1)

// 填入順序（(n+ℓ) 規則）：[n, ℓ]，總容量恰為 118
const FILL_ORDER: [number, number][] = [
  [1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [3, 2], [4, 1], [5, 0], [4, 2],
  [5, 1], [6, 0], [4, 3], [5, 2], [6, 1], [7, 0], [5, 3], [6, 2], [7, 1],
]

// 公認的基態例外（值為「該副層電子數」覆寫；0 代表移除該副層）。皆教科書常見異常組態。
const EXCEPTIONS: Record<number, Record<string, number>> = {
  24: { '3d': 5, '4s': 1 }, // Cr 半滿
  29: { '3d': 10, '4s': 1 }, // Cu 全滿
  41: { '4d': 4, '5s': 1 }, // Nb
  42: { '4d': 5, '5s': 1 }, // Mo
  44: { '4d': 7, '5s': 1 }, // Ru
  45: { '4d': 8, '5s': 1 }, // Rh
  46: { '4d': 10, '5s': 0 }, // Pd
  47: { '4d': 10, '5s': 1 }, // Ag
  57: { '4f': 0, '5d': 1, '6s': 2 }, // La
  58: { '4f': 1, '5d': 1, '6s': 2 }, // Ce
  64: { '4f': 7, '5d': 1, '6s': 2 }, // Gd
  78: { '4f': 14, '5d': 9, '6s': 1 }, // Pt
  79: { '5d': 10, '6s': 1 }, // Au
  89: { '5f': 0, '6d': 1, '7s': 2 }, // Ac
  90: { '5f': 0, '6d': 2, '7s': 2 }, // Th
  91: { '5f': 2, '6d': 1, '7s': 2 }, // Pa
  92: { '5f': 3, '6d': 1, '7s': 2 }, // U
  93: { '5f': 4, '6d': 1, '7s': 2 }, // Np
  96: { '5f': 7, '6d': 1, '7s': 2 }, // Cm
  103: { '6d': 0, '7s': 2, '7p': 1 }, // Lr
}

interface Subshell {
  n: number
  l: number
  count: number
}

function subshells(z: number): Subshell[] {
  const m = new Map<string, Subshell>()
  let left = z
  for (const [n, l] of FILL_ORDER) {
    if (left <= 0) break
    const count = Math.min(cap(l), left)
    m.set(`${n}${L_LETTER[l]}`, { n, l, count })
    left -= count
  }
  const ex = EXCEPTIONS[z]
  if (ex) {
    for (const [label, count] of Object.entries(ex)) {
      if (count === 0) {
        m.delete(label)
      } else {
        m.set(label, { n: Number(label[0]), l: L_LETTER.indexOf(label[1]), count })
      }
    }
  }
  // 書寫順序：先 n 再 ℓ（3d 寫在 4s 前，沿用本專案筆記寫法）
  return [...m.values()].sort((a, b) => a.n - b.n || a.l - b.l)
}

const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
}
const sup = (n: number) =>
  String(n)
    .split('')
    .map((d) => SUP[d])
    .join('')

const fmt = (subs: Subshell[]) => subs.map((s) => `${s.n}${L_LETTER[s.l]}${sup(s.count)}`).join('')

export const NOBLE_GAS_ZS = [2, 10, 18, 36, 54, 86]

function configFull(z: number): string {
  return fmt(subshells(z))
}

function configShorthand(z: number): string {
  const core = [...NOBLE_GAS_ZS].reverse().find((n) => n < z)
  if (!core) return configFull(z) // H、He 無內層可簡寫
  const coreSubs = subshells(core)
  const valence = subshells(z).filter((s) => !coreSubs.some((c) => c.n === s.n && c.l === s.l))
  return `[${SYMBOLS[core - 1]}]${fmt(valence)}`
}

/** 某原子序的總電子數（= 各副層電子數和），供測試驗證組態完整性。 */
export function totalElectrons(z: number): number {
  return subshells(z).reduce((sum, s) => sum + s.count, 0)
}

/** 主族價電子數＝最外層（最大 n）的電子數；過渡／內過渡價數多變，回傳 null。 */
function valenceOf(z: number, block: Block): number | null {
  if (block === 'd' || block === 'f') return null
  const subs = subshells(z)
  const maxN = Math.max(...subs.map((s) => s.n))
  return subs.filter((s) => s.n === maxN).reduce((sum, s) => sum + s.count, 0)
}

// ── 位置／區塊／分類 ──────────────────────────────────────────────────────────

/** 主表 18 欄座標（period, col）；f 區內過渡元素回傳 null（另排兩列）。 */
export function mainPos(z: number): { period: number; col: number } | null {
  if (z === 1) return { period: 1, col: 1 }
  if (z === 2) return { period: 1, col: 18 }
  if (z <= 4) return { period: 2, col: z - 2 }
  if (z <= 10) return { period: 2, col: z + 8 }
  if (z <= 12) return { period: 3, col: z - 10 }
  if (z <= 18) return { period: 3, col: z }
  if (z <= 36) return { period: 4, col: z - 18 }
  if (z <= 54) return { period: 5, col: z - 36 }
  if (z <= 56) return { period: 6, col: z - 54 }
  if (z <= 71) return null
  if (z <= 86) return { period: 6, col: z - 68 }
  if (z <= 88) return { period: 7, col: z - 86 }
  if (z <= 103) return null
  return { period: 7, col: z - 100 }
}

export function periodOf(z: number): number {
  if (z <= 2) return 1
  if (z <= 10) return 2
  if (z <= 18) return 3
  if (z <= 36) return 4
  if (z <= 54) return 5
  if (z <= 86) return 6
  return 7
}

function blockOf(z: number): Block {
  if ((z >= 57 && z <= 71) || (z >= 89 && z <= 103)) return 'f'
  if ((z >= 21 && z <= 30) || (z >= 39 && z <= 48) || (z >= 72 && z <= 80) || (z >= 104 && z <= 112)) return 'd'
  if (
    (z >= 5 && z <= 10) ||
    (z >= 13 && z <= 18) ||
    (z >= 31 && z <= 36) ||
    (z >= 49 && z <= 54) ||
    (z >= 81 && z <= 86) ||
    (z >= 113 && z <= 118)
  )
    return 'p'
  return 's'
}

const METALLOIDS = new Set([5, 14, 32, 33, 51, 52, 84, 85]) // B Si Ge As Sb Te Po At
const NONMETALS = new Set([1, 6, 7, 8, 15, 16, 34]) // H C N O P S Se

function categoryOf(z: number, group: number | null, block: Block): Category {
  if (z >= 57 && z <= 71) return 'lanthanide'
  if (z >= 89 && z <= 103) return 'actinide'
  if (group === 18) return 'noble'
  if (group === 17) return 'halogen'
  if (METALLOIDS.has(z)) return 'metalloid'
  if (NONMETALS.has(z)) return 'nonmetal'
  if (group === 1 && z !== 1) return 'alkali'
  if (group === 2) return 'alkaline'
  if (block === 'd') return 'transition'
  return 'post-transition' // 其餘 p 區金屬（Al、Ga、In、Sn、Tl、Pb、Bi…）
}

// ── 組裝 ──────────────────────────────────────────────────────────────────────

export const ELEMENTS: Element[] = SYMBOLS.map((sym, i) => {
  const z = i + 1
  const block = blockOf(z)
  const group = mainPos(z)?.col ?? null
  return {
    z,
    sym,
    en: EN_NAMES[i],
    zh: ZH_NAMES[z] ?? '',
    period: periodOf(z),
    group,
    block,
    category: categoryOf(z, group, block),
    config: configFull(z),
    shorthand: configShorthand(z),
    eneg: ENEG[i] ?? null,
    radius: RADIUS[i] ?? null,
    ie1: IE1[i] ?? null,
    ea: EA[i] ?? null,
    valence: valenceOf(z, block),
    ox: OX[z] ?? [],
    mass: MASS[i],
    ions: IONS[z] ?? [],
  }
})

/** Element by atomic number (1-based Z), or undefined out of range. */
export function elementByZ(z: number): Element | undefined {
  return ELEMENTS[z - 1]
}

// ── 週期表「地基」練習資料（每日元素遊戲：測驗＋背誦） ───────────────────────────
// 老師：「元素表是一切之基礎」。以下全為靜態化學常識（族/週期/系列/常用原子量），非 LLM。

/** 族別的美式 A／B 表示（1A–8A 主族、1B–8B 過渡）。f 區（鑭系/錒系）回 null。 */
export function groupLabelAB(e: Element): string | null {
  const g = e.group
  if (e.block === 'f' || g === null) return null
  if (g <= 2) return `${g}A` // 1A、2A
  if (g >= 13) return `${g - 10}A` // 13→3A … 18→8A
  if (g <= 7) return `${g}B` // 3B–7B
  if (g <= 10) return '8B' // 第 8/9/10 欄同屬 8B（Fe/Co/Ni 三縱列）
  return `${g - 10}B` // 11→1B、12→2B
}

/** B 族的 3d／4d／5d 過渡系列（La 當 5d 起點、不深究 f 區）。 */
export const SERIES: Record<'3d' | '4d' | '5d', number[]> = {
  '3d': [21, 22, 23, 24, 25, 26, 27, 28, 29, 30], // Sc–Zn
  '4d': [39, 40, 41, 42, 43, 44, 45, 46, 47, 48], // Y–Cd
  '5d': [57, 72, 73, 74, 75, 76, 77, 78, 79, 80], // La, Hf–Hg
}

/** 某原子序屬於哪一個 d 過渡系列；非過渡回 null。 */
export function seriesOf(z: number): '3d' | '4d' | '5d' | null {
  for (const k of ['3d', '4d', '5d'] as const) if (SERIES[k].includes(z)) return k
  return null
}

// 老師指定要背熟的「常用原子量」（慣用整數/半整數值，避免四捨五入歧義；與 MASS[] 四捨五入一致）。
export const COMMON_MASS: Record<number, number> = {
  1: 1, 2: 4, 6: 12, 7: 14, 8: 16, 9: 19, 10: 20, // H He C N O F Ne
  11: 23, 12: 24, 13: 27, 15: 31, 16: 32, 17: 35.5, 18: 40, // Na Mg Al P S Cl Ar
  19: 39, 20: 40, 24: 52, 26: 56, 29: 63.5, // K Ca Cr Fe Cu
  35: 80, 47: 108, 53: 127, 79: 197, 80: 200.6, // Br Ag I Au Hg
}

// 老師指定要背的 B 族欄位（6B、8B②③、1B、2B；考試範圍只到 5d，超重元素不列）。
export const B_GROUP_HIGHLIGHT: { label: string; note: string; zs: number[] }[] = [
  { label: '6B', note: '', zs: [24, 42, 74] },
  { label: '8B②', note: '', zs: [27, 45, 77] },
  { label: '8B③', note: '', zs: [28, 46, 78] },
  { label: '1B', note: '', zs: [29, 47, 79] },
  { label: '2B', note: '', zs: [30, 48, 80] },
]

// 每日「測驗」題池：老師指定 Z=1–36 必背 ∪ 常用原子量補充 Ag/I/Au/Hg ∪ 8A Xe/Rn。
export const QUIZ_CORE_ZS: number[] = [
  ...Array.from({ length: 36 }, (_, i) => i + 1), // H–Kr（Z=1–36 完整）
  47, 53, 54, 79, 80, 86, // Ag I Xe Au Hg Rn
]

/** 背誦模式的一個「整列」（一族／一週期／一系列）：依週期表順序排列的成員原子序。 */
export interface RecallSet {
  key: string
  label: string // 1A、第 3 週期、3d…
  name: string // 鹵素、—、3d 過渡系列…
  zs: number[]
}

const MAIN_GROUP_NAME: Record<number, string> = {
  1: '鹼金屬（含氫）', 2: '鹼土金屬', 13: '硼族', 14: '碳族',
  15: '氮族', 16: '氧族', 17: '鹵素', 18: '惰性氣體',
}

/** 依主族 1A–8A 背（整欄，含 H 在 1A、Og 在 8A）。 */
export const RECALL_GROUPS: RecallSet[] = [1, 2, 13, 14, 15, 16, 17, 18].map((g) => ({
  key: `group-${g}`,
  label: g <= 2 ? `${g}A` : `${g - 10}A`,
  name: MAIN_GROUP_NAME[g],
  zs: ELEMENTS.filter((e) => e.group === g).map((e) => e.z),
}))

/** 依週期背（聚焦第 1–4 週期；含 3d 系列在第 4 週期）。 */
export const RECALL_PERIODS: RecallSet[] = [1, 2, 3, 4].map((p) => ({
  key: `period-${p}`,
  label: `第 ${p} 週期`,
  name: '',
  zs: ELEMENTS.filter((e) => e.period === p).map((e) => e.z),
}))

/** 依 B 族過渡系列背（3d／4d／5d，各 10 個）。 */
export const RECALL_SERIES: RecallSet[] = (['3d', '4d', '5d'] as const).map((k) => ({
  key: `series-${k}`,
  label: k,
  name: `${k} 過渡系列`,
  zs: SERIES[k],
}))

export const CATEGORY_LABEL: Record<Category, string> = {
  alkali: '鹼金屬',
  alkaline: '鹼土金屬',
  transition: '過渡金屬',
  'post-transition': '後過渡金屬',
  metalloid: '類金屬',
  nonmetal: '非金屬',
  halogen: '鹵素',
  noble: '惰性氣體',
  lanthanide: '鑭系',
  actinide: '錒系',
}

export const BLOCK_LABEL: Record<Block, string> = {
  s: 's 區（填 s 副層）',
  p: 'p 區（填 p 副層）',
  d: 'd 區（過渡金屬，填 d 副層）',
  f: 'f 區（鑭系／錒系，填 f 副層）',
}

// 區塊底色（s/p/d/f）——工具頁與筆記內小週期表共用，改色一處生效。
export const BLOCK_BG: Record<Block, string> = {
  s: 'color-mix(in oklab, var(--color-primary) 16%, var(--color-base-100))',
  p: 'color-mix(in oklab, var(--color-warning) 22%, var(--color-base-100))',
  d: 'color-mix(in oklab, var(--color-info) 18%, var(--color-base-100))',
  f: 'color-mix(in oklab, var(--color-secondary) 20%, var(--color-base-100))',
}
