// 20 種標準胺基酸資料 —— 老師「結構與名稱對照」背誦工具的單一資料來源。
//
// 正確性不靠 LLM 記憶：代號／分類／必需與否／側鏈 R 皆對照權威資料表查證
// （Wikipedia「Proteinogenic amino acid」＋ Lehninger 五大分類）；中文名採台灣
// 教科書慣用（Aira 課本照片已確認 Asn=天門冬醯胺、Gln=麩醯胺酸、Cys=半胱胺酸…）。
// 「結構圖」另以可查證方式呈現、並請對照課本確認，不在此檔硬編座標。
//
// 分類採課本同款 Lehninger 五類；必需胺基酸＝His Ile Leu Lys Met Phe Thr Trp Val 共 9 個
// （Arg Cys Gln? 等「條件性必需」此處一律歸非必需，與「成人 9 必需」教法一致）。

export type AACategory = 'nonpolar' | 'aromatic' | 'polar' | 'acidic' | 'basic'

export interface AminoAcid {
  zh: string // 中文名（台灣慣用）
  en: string // 英文名
  code3: string // 三字母代號
  code1: string // 一字母代號
  category: AACategory
  essential: boolean // 必需胺基酸（9 個）
  r: string // 側鏈 R 基（縮寫結構式；環狀者以描述標示，結構圖另繪）
}

export const AA_CATEGORY_LABEL: Record<AACategory, string> = {
  nonpolar: '非極性（脂肪族）',
  aromatic: '芳香族',
  polar: '極性不帶電',
  acidic: '酸性（帶負電）',
  basic: '鹼性（帶正電）',
}

// 依分類排序（同課本：非極性脂肪族 → 芳香族 → 極性不帶電 → 酸性 → 鹼性）
export const AMINO_ACIDS: AminoAcid[] = [
  // ── 非極性脂肪族 ──
  { zh: '甘胺酸', en: 'Glycine', code3: 'Gly', code1: 'G', category: 'nonpolar', essential: false, r: '–H' },
  { zh: '丙胺酸', en: 'Alanine', code3: 'Ala', code1: 'A', category: 'nonpolar', essential: false, r: '–CH₃' },
  { zh: '纈胺酸', en: 'Valine', code3: 'Val', code1: 'V', category: 'nonpolar', essential: true, r: '–CH(CH₃)₂' },
  { zh: '白胺酸', en: 'Leucine', code3: 'Leu', code1: 'L', category: 'nonpolar', essential: true, r: '–CH₂CH(CH₃)₂' },
  { zh: '異白胺酸', en: 'Isoleucine', code3: 'Ile', code1: 'I', category: 'nonpolar', essential: true, r: '–CH(CH₃)CH₂CH₃' },
  { zh: '脯胺酸', en: 'Proline', code3: 'Pro', code1: 'P', category: 'nonpolar', essential: false, r: '側鏈接回 N 成環（亞胺酸）' },
  { zh: '甲硫胺酸', en: 'Methionine', code3: 'Met', code1: 'M', category: 'nonpolar', essential: true, r: '–CH₂CH₂SCH₃' },
  // ── 芳香族 ──
  { zh: '苯丙胺酸', en: 'Phenylalanine', code3: 'Phe', code1: 'F', category: 'aromatic', essential: true, r: '–CH₂–（苯環 C₆H₅）' },
  { zh: '酪胺酸', en: 'Tyrosine', code3: 'Tyr', code1: 'Y', category: 'aromatic', essential: false, r: '–CH₂–（對位酚 C₆H₄OH）' },
  { zh: '色胺酸', en: 'Tryptophan', code3: 'Trp', code1: 'W', category: 'aromatic', essential: true, r: '–CH₂–（吲哚基）' },
  // ── 極性不帶電 ──
  { zh: '絲胺酸', en: 'Serine', code3: 'Ser', code1: 'S', category: 'polar', essential: false, r: '–CH₂OH' },
  { zh: '蘇胺酸', en: 'Threonine', code3: 'Thr', code1: 'T', category: 'polar', essential: true, r: '–CH(OH)CH₃' },
  { zh: '半胱胺酸', en: 'Cysteine', code3: 'Cys', code1: 'C', category: 'polar', essential: false, r: '–CH₂SH' },
  { zh: '天門冬醯胺', en: 'Asparagine', code3: 'Asn', code1: 'N', category: 'polar', essential: false, r: '–CH₂CONH₂' },
  { zh: '麩醯胺酸', en: 'Glutamine', code3: 'Gln', code1: 'Q', category: 'polar', essential: false, r: '–CH₂CH₂CONH₂' },
  // ── 酸性（帶負電）──
  { zh: '天門冬胺酸', en: 'Aspartate', code3: 'Asp', code1: 'D', category: 'acidic', essential: false, r: '–CH₂COOH' },
  { zh: '麩胺酸', en: 'Glutamate', code3: 'Glu', code1: 'E', category: 'acidic', essential: false, r: '–CH₂CH₂COOH' },
  // ── 鹼性（帶正電）──
  { zh: '離胺酸', en: 'Lysine', code3: 'Lys', code1: 'K', category: 'basic', essential: true, r: '–(CH₂)₄NH₂' },
  { zh: '精胺酸', en: 'Arginine', code3: 'Arg', code1: 'R', category: 'basic', essential: false, r: '–(CH₂)₃NHC(=NH)NH₂（胍基）' },
  { zh: '組胺酸', en: 'Histidine', code3: 'His', code1: 'H', category: 'basic', essential: true, r: '–CH₂–（咪唑基）' },
]
