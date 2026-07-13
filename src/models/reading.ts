/** 英文增補廣讀（旋元佑老師編授）共用型別。R1／R2… 各自的資料檔皆用這裡的型別。 */

export interface ReadingWord {
  /** 詞條原形（忠於課本 glossary 的列法，如 glove、guess、smash）。 */
  word: string
  pos: string
  /** 英文釋義（逐字取自課本 Words in This Story）。 */
  en: string
  /** 中譯（非課本內容，我方補上，供對照）。 */
  zh: string
  /**
   * 文章中實際出現、需標底線的表面形；預設為 [word]。
   * 用於處理屈折形（文章寫 gloves／guessed／smashed，詞條卻是原形）。
   */
  match?: string[]
}

export interface ReadingArticle {
  id: number
  title: string
  /** 原作者（文學作品才有，如 Edgar Allan Poe；VOA 新聞類留空）。 */
  author?: string
  /** 主題／文類分類（badge 顯示）。 */
  topic: string
  /** 內文：段落以空行分隔；`## ` 開頭為小標。 */
  content: string
  words: ReadingWord[]
}
