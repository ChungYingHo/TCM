// 康熙 214 部首共用資料 —— 單一資料來源（部首總表筆記與日後任何部首 UI 共用）。
//
// 非 LLM 生成：
//   - 注音：教育部《國語小字典·部首字音讀表》(dict.mini.moe.edu.tw/SearchIndex/RadicalsTable)
//     為準（逐段查證、總數核對＝214）。
//   - 本義／義類：教育部《重編國語辭典修訂本》(dict.revised.moe.edu.tw) 為準。
//   - 變形寫法、部首歸屬：對照康熙部首與教育部辭典部首索引。
//
// 記號（供 RadicalTable 上色與 icon）：
//   variant    ★ 有偏旁變形（如 水→氵、心→忄）
//   hardRead   ⚠ 讀音易錯（多數人不會唸或會唸錯）
//   standalone ● 自成部首（整字即部首，查字典時別拆去查偏旁）
//   lookalike  🔁 與某部首形近易混（值＝相混的那個部首）

export interface Radical {
  /** 康熙部首序號 1–214（＝依筆畫排序） */
  num: number
  /** 部首正體 */
  char: string
  /** 筆畫數 */
  strokes: number
  /** 當偏旁時的變形寫法（如 氵、灬、忄㣺）；無則省略 */
  variant?: string
  /** 注音（部首字音讀表） */
  zhuyin: string
  /** 一句本義／該部字多與什麼有關 */
  meaning: string
  /** 例字（2–3 個常見字） */
  examples: string
  /** ⚠ 讀音易錯 */
  hardRead?: boolean
  /** ● 自成部首（整字即部首、別拆） */
  standalone?: boolean
  /** 🔁 與此部首形近易混 */
  lookalike?: string
}

export const RADICALS: Radical[] = [
  // ── 1 畫 ──
  { num: 1, char: '一', strokes: 1, zhuyin: 'ㄧ', meaning: '數目、整體', examples: '一、三、丙' },
  { num: 2, char: '丨', strokes: 1, zhuyin: 'ㄍㄨㄣˇ', meaning: '上下貫通', examples: '中、串', hardRead: true },
  { num: 3, char: '丶', strokes: 1, zhuyin: 'ㄓㄨˇ', meaning: '點、標記', examples: '丸、丹、主', hardRead: true },
  { num: 4, char: '丿', strokes: 1, zhuyin: 'ㄆㄧㄝˇ', meaning: '向左下的撇筆', examples: '乃、久、之', hardRead: true },
  { num: 5, char: '乙', strokes: 1, zhuyin: 'ㄧˇ', meaning: '天干第二', examples: '九、也、乳' },
  { num: 6, char: '亅', strokes: 1, zhuyin: 'ㄐㄩㄝˊ', meaning: '鉤', examples: '了、事', hardRead: true },

  // ── 2 畫 ──
  { num: 7, char: '二', strokes: 2, zhuyin: 'ㄦˋ', meaning: '數目二', examples: '五、些' },
  { num: 8, char: '亠', strokes: 2, zhuyin: 'ㄊㄡˊ', meaning: '構字部件（俗稱文字頭）', examples: '亡、交、京', hardRead: true },
  { num: 9, char: '人', strokes: 2, variant: '亻', zhuyin: 'ㄖㄣˊ', meaning: '人', examples: '仁、休、位' },
  { num: 10, char: '儿', strokes: 2, zhuyin: 'ㄖㄣˊ', meaning: '人（在字下）', examples: '元、兄、光' },
  { num: 11, char: '入', strokes: 2, zhuyin: 'ㄖㄨˋ', meaning: '進入', examples: '內、全、兩' },
  { num: 12, char: '八', strokes: 2, zhuyin: 'ㄅㄚ', meaning: '分別', examples: '公、六、共' },
  { num: 13, char: '冂', strokes: 2, zhuyin: 'ㄐㄩㄥ', meaning: '遠界、城外', examples: '冊、再、冒', hardRead: true },
  { num: 14, char: '冖', strokes: 2, zhuyin: 'ㄇㄧˋ', meaning: '覆蓋（禿寶蓋）', examples: '冠、冢', hardRead: true },
  { num: 15, char: '冫', strokes: 2, zhuyin: 'ㄅㄧㄥ', meaning: '冰、寒冷（兩點水）', examples: '冰、冷、凍', hardRead: true, lookalike: '氵' },
  { num: 16, char: '几', strokes: 2, zhuyin: 'ㄐㄧ', meaning: '小桌', examples: '凡、凳' },
  { num: 17, char: '凵', strokes: 2, zhuyin: 'ㄎㄢˇ', meaning: '張口容器、坎', examples: '凶、出、函', hardRead: true },
  { num: 18, char: '刀', strokes: 2, variant: '刂', zhuyin: 'ㄉㄠ', meaning: '刀、切割', examples: '分、刻、刑' },
  { num: 19, char: '力', strokes: 2, zhuyin: 'ㄌㄧˋ', meaning: '力氣', examples: '加、助、勞' },
  { num: 20, char: '勹', strokes: 2, zhuyin: 'ㄅㄠ', meaning: '包裹（包字頭）', examples: '勺、勾、包', hardRead: true },
  { num: 21, char: '匕', strokes: 2, zhuyin: 'ㄅㄧˇ', meaning: '湯匙、短刀', examples: '化、北' },
  { num: 22, char: '匚', strokes: 2, zhuyin: 'ㄈㄤ', meaning: '方形盛器', examples: '匠、匣、匡', hardRead: true, lookalike: '匸' },
  { num: 23, char: '匸', strokes: 2, zhuyin: 'ㄒㄧˋ', meaning: '隱藏', examples: '匿、區', hardRead: true, lookalike: '匚' },
  { num: 24, char: '十', strokes: 2, zhuyin: 'ㄕˊ', meaning: '數目十', examples: '千、卉、協' },
  { num: 25, char: '卜', strokes: 2, zhuyin: 'ㄅㄨˇ', meaning: '占卜', examples: '卡、占' },
  { num: 26, char: '卩', strokes: 2, zhuyin: 'ㄐㄧㄝˊ', meaning: '符節', examples: '印、危、卻', hardRead: true },
  { num: 27, char: '厂', strokes: 2, zhuyin: 'ㄏㄢˇ', meaning: '山崖', examples: '厚、原、厄', hardRead: true },
  { num: 28, char: '厶', strokes: 2, zhuyin: 'ㄙ', meaning: '私', examples: '去、參', hardRead: true },
  { num: 29, char: '又', strokes: 2, zhuyin: 'ㄧㄡˋ', meaning: '手', examples: '反、取、叔' },

  // ── 3 畫 ──
  { num: 30, char: '口', strokes: 3, zhuyin: 'ㄎㄡˇ', meaning: '嘴、開口', examples: '名、同、呼' },
  { num: 31, char: '囗', strokes: 3, zhuyin: 'ㄨㄟˊ', meaning: '圍（國字框）', examples: '因、國、圍', hardRead: true },
  { num: 32, char: '土', strokes: 3, zhuyin: 'ㄊㄨˇ', meaning: '土地', examples: '地、坐、城' },
  { num: 33, char: '士', strokes: 3, zhuyin: 'ㄕˋ', meaning: '男子、讀書人', examples: '壯、壽、壺' },
  { num: 34, char: '夂', strokes: 3, zhuyin: 'ㄓˇ', meaning: '從後至', examples: '各、冬', hardRead: true, lookalike: '夊' },
  { num: 35, char: '夊', strokes: 3, zhuyin: 'ㄙㄨㄟ', meaning: '緩行', examples: '夏', hardRead: true, lookalike: '夂' },
  { num: 36, char: '夕', strokes: 3, zhuyin: 'ㄒㄧˋ', meaning: '傍晚', examples: '外、多、夜', hardRead: true },
  { num: 37, char: '大', strokes: 3, zhuyin: 'ㄉㄚˋ', meaning: '大', examples: '天、夫、央' },
  { num: 38, char: '女', strokes: 3, zhuyin: 'ㄋㄩˇ', meaning: '女子', examples: '好、媽、妹' },
  { num: 39, char: '子', strokes: 3, zhuyin: 'ㄗˇ', meaning: '孩子', examples: '孔、字、學' },
  { num: 40, char: '宀', strokes: 3, zhuyin: 'ㄇㄧㄢˊ', meaning: '房屋（寶蓋頭）', examples: '安、家、宅', hardRead: true },
  { num: 41, char: '寸', strokes: 3, zhuyin: 'ㄘㄨㄣˋ', meaning: '寸、法度', examples: '寺、封、射' },
  { num: 42, char: '小', strokes: 3, zhuyin: 'ㄒㄧㄠˇ', meaning: '微小', examples: '少、尖' },
  { num: 43, char: '尢', strokes: 3, zhuyin: 'ㄨㄤ', meaning: '跛、彎曲', examples: '尬、尷', hardRead: true },
  { num: 44, char: '尸', strokes: 3, zhuyin: 'ㄕ', meaning: '屍體、身體', examples: '尺、尾、居', hardRead: true },
  { num: 45, char: '屮', strokes: 3, zhuyin: 'ㄔㄜˋ', meaning: '初生草', examples: '屯', hardRead: true },
  { num: 46, char: '山', strokes: 3, zhuyin: 'ㄕㄢ', meaning: '山', examples: '岡、岩、峰' },
  { num: 47, char: '巛', strokes: 3, zhuyin: 'ㄔㄨㄢ', meaning: '河川', examples: '巡、州', hardRead: true },
  { num: 48, char: '工', strokes: 3, zhuyin: 'ㄍㄨㄥ', meaning: '工具、工作', examples: '左、巧、巨' },
  { num: 49, char: '己', strokes: 3, zhuyin: 'ㄐㄧˇ', meaning: '自己、天干', examples: '已、巷' },
  { num: 50, char: '巾', strokes: 3, zhuyin: 'ㄐㄧㄣ', meaning: '布、毛巾', examples: '布、帆、席' },
  { num: 51, char: '干', strokes: 3, zhuyin: 'ㄍㄢ', meaning: '盾、干犯', examples: '平、年、幸' },
  { num: 52, char: '幺', strokes: 3, zhuyin: 'ㄧㄠ', meaning: '細小', examples: '幼、幻、幾', hardRead: true },
  { num: 53, char: '广', strokes: 3, zhuyin: 'ㄧㄢˇ', meaning: '依崖蓋的屋', examples: '序、床、庫', hardRead: true },
  { num: 54, char: '廴', strokes: 3, zhuyin: 'ㄧㄣˇ', meaning: '長行（建之底）', examples: '廷、延、建', hardRead: true, lookalike: '辶' },
  { num: 55, char: '廾', strokes: 3, zhuyin: 'ㄍㄨㄥˇ', meaning: '兩手捧', examples: '弄、弊', hardRead: true },
  { num: 56, char: '弋', strokes: 3, zhuyin: 'ㄧˋ', meaning: '帶繩的箭', examples: '式、弒', hardRead: true },
  { num: 57, char: '弓', strokes: 3, zhuyin: 'ㄍㄨㄥ', meaning: '弓', examples: '引、弟、張' },
  { num: 58, char: '彐', strokes: 3, zhuyin: 'ㄐㄧˋ', meaning: '豬頭', examples: '彗、彙', hardRead: true },
  { num: 59, char: '彡', strokes: 3, zhuyin: 'ㄕㄢ', meaning: '毛飾、花紋', examples: '形、彩、彬', hardRead: true },
  { num: 60, char: '彳', strokes: 3, zhuyin: 'ㄔˋ', meaning: '小步行（雙人旁）', examples: '往、待、彼', hardRead: true },

  // ── 4 畫 ──
  { num: 61, char: '心', strokes: 4, variant: '忄㣺', zhuyin: 'ㄒㄧㄣ', meaning: '心理、情緒', examples: '忘、思、快' },
  { num: 62, char: '戈', strokes: 4, zhuyin: 'ㄍㄜ', meaning: '兵器', examples: '成、我、戰' },
  { num: 63, char: '戶', strokes: 4, zhuyin: 'ㄏㄨˋ', meaning: '門戶', examples: '房、所、扇' },
  { num: 64, char: '手', strokes: 4, variant: '扌', zhuyin: 'ㄕㄡˇ', meaning: '手、動作', examples: '打、扶、提' },
  { num: 65, char: '支', strokes: 4, zhuyin: 'ㄓ', meaning: '分支', examples: '支、攲' },
  { num: 66, char: '攴', strokes: 4, variant: '攵', zhuyin: 'ㄆㄨ', meaning: '輕敲、打（反文旁）', examples: '收、改、政', hardRead: true, lookalike: '夂' },
  { num: 67, char: '文', strokes: 4, zhuyin: 'ㄨㄣˊ', meaning: '花紋、文字', examples: '斑、斐' },
  { num: 68, char: '斗', strokes: 4, zhuyin: 'ㄉㄡˇ', meaning: '量器', examples: '料、斜' },
  { num: 69, char: '斤', strokes: 4, zhuyin: 'ㄐㄧㄣ', meaning: '斧、重量', examples: '斥、斧、新' },
  { num: 70, char: '方', strokes: 4, zhuyin: 'ㄈㄤ', meaning: '方向、並船', examples: '於、施、旅' },
  { num: 71, char: '无', strokes: 4, zhuyin: 'ㄨˊ', meaning: '無', examples: '既', hardRead: true },
  { num: 72, char: '日', strokes: 4, zhuyin: 'ㄖˋ', meaning: '太陽、時間', examples: '明、春、時' },
  { num: 73, char: '曰', strokes: 4, zhuyin: 'ㄩㄝ', meaning: '說（與「日」區別）', examples: '曲、更、書', hardRead: true, lookalike: '日' },
  { num: 74, char: '月', strokes: 4, zhuyin: 'ㄩㄝˋ', meaning: '月亮、時間', examples: '有、朋、朝', lookalike: '肉' },
  { num: 75, char: '木', strokes: 4, zhuyin: 'ㄇㄨˋ', meaning: '樹木', examples: '本、村、林' },
  { num: 76, char: '欠', strokes: 4, zhuyin: 'ㄑㄧㄢˋ', meaning: '張口出氣', examples: '次、歌、歡' },
  { num: 77, char: '止', strokes: 4, zhuyin: 'ㄓˇ', meaning: '腳、停止', examples: '正、步、武' },
  { num: 78, char: '歹', strokes: 4, zhuyin: 'ㄉㄞˇ', meaning: '殘骨、死亡', examples: '死、殘、殃', hardRead: true },
  { num: 79, char: '殳', strokes: 4, zhuyin: 'ㄕㄨ', meaning: '兵器、打擊', examples: '段、殺', hardRead: true },
  { num: 80, char: '毋', strokes: 4, zhuyin: 'ㄨˊ', meaning: '禁止', examples: '母、每、毒', hardRead: true },
  { num: 81, char: '比', strokes: 4, zhuyin: 'ㄅㄧˇ', meaning: '並列、比較', examples: '毖' },
  { num: 82, char: '毛', strokes: 4, zhuyin: 'ㄇㄠˊ', meaning: '毛髮', examples: '毫、毯' },
  { num: 83, char: '氏', strokes: 4, zhuyin: 'ㄕˋ', meaning: '姓氏、宗族', examples: '民' },
  { num: 84, char: '气', strokes: 4, zhuyin: 'ㄑㄧˋ', meaning: '雲氣', examples: '氛、氣、氧' },
  { num: 85, char: '水', strokes: 4, variant: '氵', zhuyin: 'ㄕㄨㄟˇ', meaning: '水、液體', examples: '江、河、流', lookalike: '冫' },
  { num: 86, char: '火', strokes: 4, variant: '灬', zhuyin: 'ㄏㄨㄛˇ', meaning: '火、熱', examples: '炎、烈、煮' },
  { num: 87, char: '爪', strokes: 4, variant: '爫', zhuyin: 'ㄓㄠˇ', meaning: '爪、抓', examples: '爬、爭、爵' },
  { num: 88, char: '父', strokes: 4, zhuyin: 'ㄈㄨˋ', meaning: '父親', examples: '爸、爹' },
  { num: 89, char: '爻', strokes: 4, zhuyin: 'ㄧㄠˊ', meaning: '卦爻', examples: '爽、爾', hardRead: true },
  { num: 90, char: '爿', strokes: 4, zhuyin: 'ㄑㄧㄤˊ', meaning: '床的左片', examples: '牀、牆', hardRead: true },
  { num: 91, char: '片', strokes: 4, zhuyin: 'ㄆㄧㄢˋ', meaning: '薄片', examples: '版、牌' },
  { num: 92, char: '牙', strokes: 4, zhuyin: 'ㄧㄚˊ', meaning: '牙齒', examples: '牙、牚' },
  { num: 93, char: '牛', strokes: 4, variant: '牜', zhuyin: 'ㄋㄧㄡˊ', meaning: '牛', examples: '牧、物、特' },
  { num: 94, char: '犬', strokes: 4, variant: '犭', zhuyin: 'ㄑㄩㄢˇ', meaning: '狗、獸', examples: '狀、狗、狼' },

  // ── 5 畫 ──
  { num: 95, char: '玄', strokes: 5, zhuyin: 'ㄒㄩㄢˊ', meaning: '深黑、玄妙', examples: '率', hardRead: true },
  { num: 96, char: '玉', strokes: 5, variant: '王', zhuyin: 'ㄩˋ', meaning: '玉石、珍寶', examples: '理、珠、環' },
  { num: 97, char: '瓜', strokes: 5, zhuyin: 'ㄍㄨㄚ', meaning: '瓜果', examples: '瓢、瓣' },
  { num: 98, char: '瓦', strokes: 5, zhuyin: 'ㄨㄚˇ', meaning: '陶器', examples: '瓶、甄' },
  { num: 99, char: '甘', strokes: 5, zhuyin: 'ㄍㄢ', meaning: '甜', examples: '甚、甜' },
  { num: 100, char: '生', strokes: 5, zhuyin: 'ㄕㄥ', meaning: '生長', examples: '產、甦' },
  { num: 101, char: '用', strokes: 5, zhuyin: 'ㄩㄥˋ', meaning: '使用', examples: '甩、甫' },
  { num: 102, char: '田', strokes: 5, zhuyin: 'ㄊㄧㄢˊ', meaning: '田地', examples: '男、界、留' },
  { num: 103, char: '疋', strokes: 5, zhuyin: 'ㄕㄨ', meaning: '布匹、腳', examples: '疑、疏', hardRead: true },
  { num: 104, char: '疒', strokes: 5, zhuyin: 'ㄔㄨㄤˊ', meaning: '疾病（病字旁）', examples: '病、症、疼', hardRead: true },
  { num: 105, char: '癶', strokes: 5, zhuyin: 'ㄅㄛ', meaning: '兩腳分張（登字頭）', examples: '癸、登、發', hardRead: true },
  { num: 106, char: '白', strokes: 5, zhuyin: 'ㄅㄞˊ', meaning: '白色、明亮', examples: '百、的、皆' },
  { num: 107, char: '皮', strokes: 5, zhuyin: 'ㄆㄧˊ', meaning: '皮膚', examples: '皴、皺' },
  { num: 108, char: '皿', strokes: 5, zhuyin: 'ㄇㄧㄣˇ', meaning: '器皿', examples: '盆、盤、益', hardRead: true, lookalike: '目' },
  { num: 109, char: '目', strokes: 5, zhuyin: 'ㄇㄨˋ', meaning: '眼睛', examples: '看、眉、睛', lookalike: '皿' },
  { num: 110, char: '矛', strokes: 5, zhuyin: 'ㄇㄠˊ', meaning: '兵器矛', examples: '矜' },
  { num: 111, char: '矢', strokes: 5, zhuyin: 'ㄕˇ', meaning: '箭', examples: '知、矩、短' },
  { num: 112, char: '石', strokes: 5, zhuyin: 'ㄕˊ', meaning: '石頭', examples: '砂、研、破' },
  { num: 113, char: '示', strokes: 5, variant: '礻', zhuyin: 'ㄕˋ', meaning: '神明、祭祀', examples: '社、神、祝', lookalike: '衣' },
  { num: 114, char: '禸', strokes: 5, zhuyin: 'ㄖㄡˊ', meaning: '獸足踐地', examples: '禹、禽', hardRead: true },
  { num: 115, char: '禾', strokes: 5, zhuyin: 'ㄏㄜˊ', meaning: '穀物', examples: '秋、科、種' },
  { num: 116, char: '穴', strokes: 5, zhuyin: 'ㄒㄩㄝˋ', meaning: '洞穴', examples: '究、空、窗' },
  { num: 117, char: '立', strokes: 5, zhuyin: 'ㄌㄧˋ', meaning: '站立', examples: '站、童、競' },

  // ── 6 畫 ──
  { num: 118, char: '竹', strokes: 6, variant: '⺮', zhuyin: 'ㄓㄨˊ', meaning: '竹', examples: '笑、笛、答' },
  { num: 119, char: '米', strokes: 6, zhuyin: 'ㄇㄧˇ', meaning: '稻米', examples: '粉、粒、糧' },
  { num: 120, char: '糸', strokes: 6, variant: '糹', zhuyin: 'ㄇㄧˋ', meaning: '絲線、織物', examples: '紅、細、線', hardRead: true },
  { num: 121, char: '缶', strokes: 6, zhuyin: 'ㄈㄡˇ', meaning: '瓦器', examples: '缸、缺、罐', hardRead: true },
  { num: 122, char: '网', strokes: 6, variant: '罒', zhuyin: 'ㄨㄤˇ', meaning: '網、羅捕', examples: '罪、罰、置', lookalike: '皿' },
  { num: 123, char: '羊', strokes: 6, zhuyin: 'ㄧㄤˊ', meaning: '羊', examples: '美、群、羨' },
  { num: 124, char: '羽', strokes: 6, zhuyin: 'ㄩˇ', meaning: '羽毛', examples: '翁、習、翻' },
  { num: 125, char: '老', strokes: 6, variant: '耂', zhuyin: 'ㄌㄠˇ', meaning: '年老', examples: '考、者、耆' },
  { num: 126, char: '而', strokes: 6, zhuyin: 'ㄦˊ', meaning: '鬍鬚、連接詞', examples: '耐、耍', hardRead: true },
  { num: 127, char: '耒', strokes: 6, zhuyin: 'ㄌㄟˇ', meaning: '農具', examples: '耕、耘', hardRead: true },
  { num: 128, char: '耳', strokes: 6, zhuyin: 'ㄦˇ', meaning: '耳朵', examples: '聞、聊、聲' },
  { num: 129, char: '聿', strokes: 6, zhuyin: 'ㄩˋ', meaning: '筆', examples: '肅、肇', hardRead: true },
  { num: 130, char: '肉', strokes: 6, variant: '⺼', zhuyin: 'ㄖㄡˋ', meaning: '身體器官', examples: '肝、肺、胃', lookalike: '月' },
  { num: 131, char: '臣', strokes: 6, zhuyin: 'ㄔㄣˊ', meaning: '臣子', examples: '臥、臧' },
  { num: 132, char: '自', strokes: 6, zhuyin: 'ㄗˋ', meaning: '鼻、自己', examples: '臭、臬' },
  { num: 133, char: '至', strokes: 6, zhuyin: 'ㄓˋ', meaning: '到達', examples: '致、臺' },
  { num: 134, char: '臼', strokes: 6, zhuyin: 'ㄐㄧㄡˋ', meaning: '舂米器', examples: '舅、興', hardRead: true },
  { num: 135, char: '舌', strokes: 6, zhuyin: 'ㄕㄜˊ', meaning: '舌頭', examples: '舍、舐' },
  { num: 136, char: '舛', strokes: 6, zhuyin: 'ㄔㄨㄢˇ', meaning: '相違、錯', examples: '舜、舞', hardRead: true },
  { num: 137, char: '舟', strokes: 6, zhuyin: 'ㄓㄡ', meaning: '船', examples: '航、般、船' },
  { num: 138, char: '艮', strokes: 6, zhuyin: 'ㄍㄣˋ', meaning: '卦名、止', examples: '良、艱', hardRead: true },
  { num: 139, char: '色', strokes: 6, zhuyin: 'ㄙㄜˋ', meaning: '顏色、神情', examples: '艷' },
  { num: 140, char: '艸', strokes: 6, variant: '艹', zhuyin: 'ㄘㄠˇ', meaning: '草木', examples: '花、草、菜' },
  { num: 141, char: '虍', strokes: 6, zhuyin: 'ㄏㄨ', meaning: '虎紋（虎字頭）', examples: '虎、虐、虛', hardRead: true },
  { num: 142, char: '虫', strokes: 6, zhuyin: 'ㄏㄨㄟˇ', meaning: '蟲、爬蟲', examples: '虹、蚊、蛇', hardRead: true },
  { num: 143, char: '血', strokes: 6, zhuyin: 'ㄒㄧㄝˇ', meaning: '血', examples: '衄、衊', hardRead: true },
  { num: 144, char: '行', strokes: 6, zhuyin: 'ㄒㄧㄥˊ', meaning: '行走、道路', examples: '街、衛、衝' },
  { num: 145, char: '衣', strokes: 6, variant: '衤', zhuyin: 'ㄧ', meaning: '衣物', examples: '初、被、裙', lookalike: '示' },
  { num: 146, char: '襾', strokes: 6, zhuyin: 'ㄧㄚˋ', meaning: '覆蓋', examples: '西、要、覆', hardRead: true },

  // ── 7 畫 ──
  { num: 147, char: '見', strokes: 7, zhuyin: 'ㄐㄧㄢˋ', meaning: '看見', examples: '規、視、覺' },
  { num: 148, char: '角', strokes: 7, zhuyin: 'ㄐㄧㄠˇ', meaning: '角、獸角', examples: '解、觸' },
  { num: 149, char: '言', strokes: 7, variant: '訁', zhuyin: 'ㄧㄢˊ', meaning: '言語', examples: '記、說、話' },
  { num: 150, char: '谷', strokes: 7, zhuyin: 'ㄍㄨˇ', meaning: '山谷', examples: '谿、豁' },
  { num: 151, char: '豆', strokes: 7, zhuyin: 'ㄉㄡˋ', meaning: '食器、豆', examples: '豈、豐' },
  { num: 152, char: '豕', strokes: 7, zhuyin: 'ㄕˇ', meaning: '豬', examples: '象、豪、豬', hardRead: true },
  { num: 153, char: '豸', strokes: 7, zhuyin: 'ㄓˋ', meaning: '無腳蟲、猛獸', examples: '豹、貓、貌', hardRead: true },
  { num: 154, char: '貝', strokes: 7, zhuyin: 'ㄅㄟˋ', meaning: '錢財', examples: '財、貴、買' },
  { num: 155, char: '赤', strokes: 7, zhuyin: 'ㄔˋ', meaning: '紅色', examples: '赦、赧' },
  { num: 156, char: '走', strokes: 7, zhuyin: 'ㄗㄡˇ', meaning: '行走', examples: '起、超、越' },
  { num: 157, char: '足', strokes: 7, variant: '⻊', zhuyin: 'ㄗㄨˊ', meaning: '腳、行動', examples: '跑、跳、路' },
  { num: 158, char: '身', strokes: 7, zhuyin: 'ㄕㄣ', meaning: '身體', examples: '躬、躲' },
  { num: 159, char: '車', strokes: 7, zhuyin: 'ㄔㄜ', meaning: '車', examples: '軌、軍、輪' },
  { num: 160, char: '辛', strokes: 7, zhuyin: 'ㄒㄧㄣ', meaning: '辛辣、罪', examples: '辜、辣、辦' },
  { num: 161, char: '辰', strokes: 7, zhuyin: 'ㄔㄣˊ', meaning: '時辰、星', examples: '辱、農' },
  { num: 162, char: '辵', strokes: 7, variant: '辶', zhuyin: 'ㄔㄨㄛˋ', meaning: '行走（走之底）', examples: '迎、近、道', lookalike: '廴' },
  { num: 163, char: '邑', strokes: 7, variant: '⻏', zhuyin: 'ㄧˋ', meaning: '城邑、地名（在字右）', examples: '都、郡、邦', hardRead: true },
  { num: 164, char: '酉', strokes: 7, zhuyin: 'ㄧㄡˇ', meaning: '酒', examples: '配、酌、醉', hardRead: true },
  { num: 165, char: '釆', strokes: 7, zhuyin: 'ㄅㄧㄢˋ', meaning: '辨別（非「采」）', examples: '采、釋', hardRead: true },
  { num: 166, char: '里', strokes: 7, zhuyin: 'ㄌㄧˇ', meaning: '里、居所', examples: '重、野、量' },

  // ── 8 畫 ──
  { num: 167, char: '金', strokes: 8, variant: '釒', zhuyin: 'ㄐㄧㄣ', meaning: '金屬', examples: '針、銀、鋼' },
  { num: 168, char: '長', strokes: 8, zhuyin: 'ㄔㄤˊ', meaning: '長、生長', examples: '長' },
  { num: 169, char: '門', strokes: 8, zhuyin: 'ㄇㄣˊ', meaning: '門', examples: '閃、間、開' },
  { num: 170, char: '阜', strokes: 8, variant: '⻖', zhuyin: 'ㄈㄨˋ', meaning: '土山、高地（在字左）', examples: '防、陽、陰', hardRead: true },
  { num: 171, char: '隶', strokes: 8, zhuyin: 'ㄉㄞˋ', meaning: '及、逮', examples: '隸', hardRead: true },
  { num: 172, char: '隹', strokes: 8, zhuyin: 'ㄓㄨㄟ', meaning: '短尾鳥', examples: '雀、雄、集', hardRead: true },
  { num: 173, char: '雨', strokes: 8, zhuyin: 'ㄩˇ', meaning: '雨、氣象', examples: '雪、雲、電' },
  { num: 174, char: '青', strokes: 8, zhuyin: 'ㄑㄧㄥ', meaning: '青色', examples: '靖、靜' },
  { num: 175, char: '非', strokes: 8, zhuyin: 'ㄈㄟ', meaning: '違背、否定', examples: '靠、靡' },

  // ── 9 畫 ──
  { num: 176, char: '面', strokes: 9, zhuyin: 'ㄇㄧㄢˋ', meaning: '臉', examples: '靨、靦' },
  { num: 177, char: '革', strokes: 9, zhuyin: 'ㄍㄜˊ', meaning: '皮革', examples: '靴、鞋、鞭' },
  { num: 178, char: '韋', strokes: 9, zhuyin: 'ㄨㄟˊ', meaning: '皮繩、違背', examples: '韓、韜', hardRead: true },
  { num: 179, char: '韭', strokes: 9, zhuyin: 'ㄐㄧㄡˇ', meaning: '韭菜', examples: '韭、齏', hardRead: true },
  { num: 180, char: '音', strokes: 9, zhuyin: 'ㄧㄣ', meaning: '聲音', examples: '韻、響' },
  { num: 181, char: '頁', strokes: 9, zhuyin: 'ㄧㄝˋ', meaning: '頭', examples: '頂、順、頭', hardRead: true },
  { num: 182, char: '風', strokes: 9, zhuyin: 'ㄈㄥ', meaning: '風', examples: '颱、颳' },
  { num: 183, char: '飛', strokes: 9, zhuyin: 'ㄈㄟ', meaning: '飛', examples: '飛、飜' },
  { num: 184, char: '食', strokes: 9, variant: '飠', zhuyin: 'ㄕˊ', meaning: '食物', examples: '飯、飲、餓' },
  { num: 185, char: '首', strokes: 9, zhuyin: 'ㄕㄡˇ', meaning: '頭', examples: '首、馗' },
  { num: 186, char: '香', strokes: 9, zhuyin: 'ㄒㄧㄤ', meaning: '香氣', examples: '馨、馥' },

  // ── 10 畫 ──
  { num: 187, char: '馬', strokes: 10, zhuyin: 'ㄇㄚˇ', meaning: '馬', examples: '馳、駐、騎' },
  { num: 188, char: '骨', strokes: 10, zhuyin: 'ㄍㄨˇ', meaning: '骨頭', examples: '骼、髓、體', standalone: true },
  { num: 189, char: '高', strokes: 10, zhuyin: 'ㄍㄠ', meaning: '高', examples: '高' },
  { num: 190, char: '髟', strokes: 10, zhuyin: 'ㄅㄧㄠ', meaning: '長髮（髮字頭）', examples: '髮、鬢、鬍', hardRead: true },
  { num: 191, char: '鬥', strokes: 10, zhuyin: 'ㄉㄡˋ', meaning: '爭鬥', examples: '鬧、鬨', hardRead: true },
  { num: 192, char: '鬯', strokes: 10, zhuyin: 'ㄔㄤˋ', meaning: '香酒', examples: '鬱', hardRead: true },
  { num: 193, char: '鬲', strokes: 10, zhuyin: 'ㄌㄧˋ', meaning: '鼎類炊器', examples: '融、鬻', hardRead: true },
  { num: 194, char: '鬼', strokes: 10, zhuyin: 'ㄍㄨㄟˇ', meaning: '鬼神', examples: '魂、魄、魅' },

  // ── 11 畫 ──
  { num: 195, char: '魚', strokes: 11, zhuyin: 'ㄩˊ', meaning: '魚', examples: '鮮、鯨' },
  { num: 196, char: '鳥', strokes: 11, zhuyin: 'ㄋㄧㄠˇ', meaning: '鳥', examples: '鳴、鴉、鵝' },
  { num: 197, char: '鹵', strokes: 11, zhuyin: 'ㄌㄨˇ', meaning: '鹽鹼地', examples: '鹹、鹽', hardRead: true },
  { num: 198, char: '鹿', strokes: 11, zhuyin: 'ㄌㄨˋ', meaning: '鹿', examples: '麗、麒', standalone: true },
  { num: 199, char: '麥', strokes: 11, zhuyin: 'ㄇㄞˋ', meaning: '麥', examples: '麵、麴' },
  { num: 200, char: '麻', strokes: 11, zhuyin: 'ㄇㄚˊ', meaning: '麻', examples: '麼、麾' },

  // ── 12 畫 ──
  { num: 201, char: '黃', strokes: 12, zhuyin: 'ㄏㄨㄤˊ', meaning: '黃色', examples: '黃', standalone: true },
  { num: 202, char: '黍', strokes: 12, zhuyin: 'ㄕㄨˇ', meaning: '黍米', examples: '黎、黏', hardRead: true },
  { num: 203, char: '黑', strokes: 12, zhuyin: 'ㄏㄟ', meaning: '黑色', examples: '默、點、黨', standalone: true },
  { num: 204, char: '黹', strokes: 12, zhuyin: 'ㄓˇ', meaning: '縫紉、刺繡', examples: '黼、黻', hardRead: true },

  // ── 13 畫 ──
  { num: 205, char: '黽', strokes: 13, zhuyin: 'ㄇㄧㄣˇ', meaning: '蛙類', examples: '黿、鼇', hardRead: true },
  { num: 206, char: '鼎', strokes: 13, zhuyin: 'ㄉㄧㄥˇ', meaning: '鼎', examples: '鼎、鼐', standalone: true },
  { num: 207, char: '鼓', strokes: 13, zhuyin: 'ㄍㄨˇ', meaning: '鼓', examples: '鼓', standalone: true },
  { num: 208, char: '鼠', strokes: 13, zhuyin: 'ㄕㄨˇ', meaning: '鼠', examples: '鼬、鼯', standalone: true },

  // ── 14 畫 ──
  { num: 209, char: '鼻', strokes: 14, zhuyin: 'ㄅㄧˊ', meaning: '鼻', examples: '鼾', standalone: true },
  { num: 210, char: '齊', strokes: 14, zhuyin: 'ㄑㄧˊ', meaning: '整齊', examples: '齋', standalone: true },

  // ── 15 畫 ──
  { num: 211, char: '齒', strokes: 15, zhuyin: 'ㄔˇ', meaning: '牙齒', examples: '齡、齦', standalone: true },

  // ── 16 畫 ──
  { num: 212, char: '龍', strokes: 16, zhuyin: 'ㄌㄨㄥˊ', meaning: '龍', examples: '龔、龐', standalone: true },
  { num: 213, char: '龜', strokes: 16, zhuyin: 'ㄍㄨㄟ', meaning: '龜', examples: '龜', standalone: true },

  // ── 17 畫 ──
  { num: 214, char: '龠', strokes: 17, zhuyin: 'ㄩㄝˋ', meaning: '管樂器', examples: '龢', hardRead: true },
]

/** 依筆畫分組（1→17），保留 num 順序。供部首總表按筆畫分段渲染。 */
export function radicalsByStroke(): { strokes: number; items: Radical[] }[] {
  const order: number[] = []
  const map = new Map<number, Radical[]>()
  for (const r of RADICALS) {
    const arr = map.get(r.strokes)
    if (arr) {
      arr.push(r)
    } else {
      map.set(r.strokes, [r])
      order.push(r.strokes)
    }
  }
  return order.map((s) => ({ strokes: s, items: map.get(s) ?? [] }))
}

/** 自成部首（整字即部首、別拆）速查。 */
export const STANDALONE_RADICALS: Radical[] = RADICALS.filter((r) => r.standalone)

/** 讀音易錯部首速查。 */
export const HARD_READ_RADICALS: Radical[] = RADICALS.filter((r) => r.hardRead)
