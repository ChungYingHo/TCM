// 鍵別（化學鍵種類）資料 —— 每日元素小遊戲的「鍵別」題型來源。
//
// 全為手工查證的化學常識，逐筆對照 atomic-structure.mdx 的化學鍵段（離子鍵＝金屬＋
// 非金屬電負度差大；共價鍵＝非金屬間共用電子對；金屬鍵＝金屬陽離子＋自由電子海）。
// 「評分答案」只取「鍵的種類」（ionic/covalent/metallic）——明確無歧義。
// `polarity` 是「分子」極性，僅供詳解教學（如 CO₂ 鍵極性但分子非極性的經典陷阱），
// 不拿來評分，避免把「鍵極性 vs 分子極性」的灰色地帶當成對錯。
// LLM 不參與判定。

export type BondType = 'ionic' | 'covalent' | 'metallic'
export type Polarity = 'polar' | 'nonpolar'

export interface BondExample {
  formula: string // 顯示式（含下標），如 CO₂、H₂O
  name: string // 中文名
  type: BondType // 評分用：鍵的種類
  polarity?: Polarity // 分子極性（僅共價分子；供詳解，非評分）
  why: string // 詳解理由（答題後顯示）
}

export const BOND_TYPE_LABEL: Record<BondType, string> = {
  ionic: '離子鍵',
  covalent: '共價鍵',
  metallic: '金屬鍵',
}

export const BOND_EXAMPLES: BondExample[] = [
  // ── 離子鍵：金屬 + 非金屬，電負度差大，電子轉移成正負離子 ──
  { formula: 'NaCl', name: '氯化鈉', type: 'ionic', why: '金屬 Na 與非金屬 Cl，電負度差大，Na 給出電子成 Na⁺、Cl 得電子成 Cl⁻。' },
  { formula: 'KCl', name: '氯化鉀', type: 'ionic', why: '金屬 K 與非金屬 Cl 形成 K⁺、Cl⁻ 的離子晶體。' },
  { formula: 'MgO', name: '氧化鎂', type: 'ionic', why: '金屬 Mg 與非金屬 O，Mg²⁺ 與 O²⁻ 之間以強離子鍵結合（熔點極高）。' },
  { formula: 'CaO', name: '氧化鈣', type: 'ionic', why: '金屬 Ca 與非金屬 O，形成 Ca²⁺、O²⁻ 離子鍵。' },
  { formula: 'CaF₂', name: '氟化鈣', type: 'ionic', why: '金屬 Ca 與非金屬 F，Ca²⁺ 與兩個 F⁻ 結合。' },
  { formula: 'MgCl₂', name: '氯化鎂', type: 'ionic', why: '金屬 Mg 與非金屬 Cl，Mg²⁺ 與兩個 Cl⁻ 結合。' },
  { formula: 'Na₂O', name: '氧化鈉', type: 'ionic', why: '金屬 Na 與非金屬 O，兩個 Na⁺ 與一個 O²⁻ 結合。' },
  { formula: 'KBr', name: '溴化鉀', type: 'ionic', why: '金屬 K 與非金屬 Br，形成 K⁺、Br⁻ 離子鍵。' },
  { formula: 'LiF', name: '氟化鋰', type: 'ionic', why: '金屬 Li 與非金屬 F，電負度差大，典型離子化合物。' },
  { formula: 'CaCl₂', name: '氯化鈣', type: 'ionic', why: '金屬 Ca 與非金屬 Cl，Ca²⁺ 與兩個 Cl⁻ 結合。' },

  // ── 共價鍵：非金屬之間共用電子對 ──
  { formula: 'H₂', name: '氫', type: 'covalent', polarity: 'nonpolar', why: '同種非金屬共用一對電子；同核雙原子，電子均分 → 非極性。' },
  { formula: 'O₂', name: '氧', type: 'covalent', polarity: 'nonpolar', why: '兩個 O 共用電子（雙鍵）；同核 → 非極性。' },
  { formula: 'N₂', name: '氮', type: 'covalent', polarity: 'nonpolar', why: '兩個 N 以三鍵共用電子；同核 → 非極性。' },
  { formula: 'Cl₂', name: '氯', type: 'covalent', polarity: 'nonpolar', why: '兩個 Cl 共用一對電子；同核 → 非極性。' },
  { formula: 'HCl', name: '氯化氫', type: 'covalent', polarity: 'polar', why: '非金屬 H 與 Cl 共用電子，但電負度不同 → 極性共價（HCl 為分子，溶於水才解離）。' },
  { formula: 'HF', name: '氟化氫', type: 'covalent', polarity: 'polar', why: '非金屬 H 與 F 共用電子，電負度差大 → 強極性共價。' },
  { formula: 'H₂O', name: '水', type: 'covalent', polarity: 'polar', why: '非金屬 O、H 共用電子；分子彎曲（約 104.5°）不對稱 → 極性分子。' },
  { formula: 'NH₃', name: '氨', type: 'covalent', polarity: 'polar', why: '非金屬 N、H 共用電子；三角錐有孤對電子 → 極性分子。' },
  { formula: 'CO₂', name: '二氧化碳', type: 'covalent', polarity: 'nonpolar', why: '非金屬 C、O 共用電子 → 共價鍵；C＝O 鍵雖極性，但直線對稱使偶極互相抵消 → 分子非極性（經典陷阱）。' },
  { formula: 'CH₄', name: '甲烷', type: 'covalent', polarity: 'nonpolar', why: '非金屬 C、H 共用電子 → 共價鍵；正四面體對稱使偶極抵消 → 分子非極性。' },
  { formula: 'SO₂', name: '二氧化硫', type: 'covalent', polarity: 'polar', why: '非金屬 S、O 共用電子；S 有孤對使分子彎曲不對稱 → 極性分子。' },
  { formula: 'CO', name: '一氧化碳', type: 'covalent', polarity: 'polar', why: '非金屬 C、O 共用電子（三鍵）；異核 → 略帶極性。' },

  // ── 金屬鍵：金屬陽離子排列於「自由電子海」中 ──
  { formula: 'Fe', name: '鐵', type: 'metallic', why: '純金屬：Fe 陽離子浸在可自由移動的價電子海中（導電、延展）。' },
  { formula: 'Cu', name: '銅', type: 'metallic', why: '純金屬：Cu 陽離子與自由電子海形成金屬鍵（良導體）。' },
  { formula: 'Na', name: '鈉（金屬）', type: 'metallic', why: '金屬鈉本體：Na⁺ 與自由電子海 → 金屬鍵（注意：NaCl 才是離子鍵）。' },
  { formula: 'Mg', name: '鎂', type: 'metallic', why: '純金屬：Mg²⁺ 與自由電子海，金屬鍵較鈉強。' },
  { formula: 'Al', name: '鋁', type: 'metallic', why: '純金屬：Al³⁺ 與自由電子海，金屬鍵強、導電性佳。' },
  { formula: 'Zn', name: '鋅', type: 'metallic', why: '純金屬：Zn 陽離子與自由電子海形成金屬鍵。' },
  { formula: 'Au', name: '金', type: 'metallic', why: '純金屬：Au 原子以金屬鍵結合，延展性極佳。' },
]
