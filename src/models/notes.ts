export interface NoteEntry {
  id: string
  href: string
  title: string
  subject: NoteSubject
  tags: string[]
  desc: string
  /** 筆記分類；省略視為「考點筆記」。「快速複習」放純表格速查/總表。 */
  category?: NoteCategory
  /** 大分類/章：把相關筆記歸在同一標題下（如「細胞學」「量子論與原子結構」）。省略＝不分組。 */
  group?: string
}

export type NoteSubject = '化學' | '生物' | '國文' | '英文'

export const NOTE_SUBJECTS: NoteSubject[] = ['化學', '生物', '國文', '英文']

export type NoteCategory = '考點筆記' | '快速複習'

// 顯示順序：快速複習在最上面（速查優先、且通常已讀過想快速回顧）。
export const NOTE_CATEGORIES: NoteCategory[] = ['快速複習', '考點筆記']

export const DEFAULT_CATEGORY: NoteCategory = '考點筆記'

export function noteCategory(n: NoteEntry): NoteCategory {
  return n.category ?? DEFAULT_CATEGORY
}

export const NOTES: NoteEntry[] = [
  {
    id: 'periodic-table',
    href: '/periodic-table',
    title: '元素週期表',
    subject: '化學',
    tags: ['基礎-週期表'],
    group: '化學工具',
    desc: '必背速查表、自由練習、完整互動週期表（電子組態、電負度/半徑/游離能熱圖）',
  },
  {
    id: 'amino-acids',
    href: '/amino-acids',
    title: '20 種胺基酸',
    subject: '化學',
    tags: ['基礎-胺基酸'],
    group: '化學工具',
    desc: '五大分類、側鏈結構圖、必需胺基酸、簡寫對照',
  },
  {
    id: 'chem-atomic-theory',
    href: '/chem-atomic-theory',
    title: '學說與理論',
    subject: '化學',
    tags: ['基礎-原子結構'],
    group: '基礎化學',
    desc: '原子模型演進（湯木生→密立根→拉塞福→莫色勒→質譜儀）、五大定律＋坎尼札洛、次原子粒子、同位素／同素異形體／異構物',
  },
  {
    id: 'chem-units',
    href: '/chem-units',
    title: '化學上重要的單位',
    subject: '化學',
    tags: ['基礎-單位因次'],
    group: '基礎化學',
    desc: '莫耳/amu/莫耳質量、unit factor、長度/壓力/溫度/能量/濃度、化學常用數學、有效數字',
  },
  {
    id: 'chem-molecules',
    href: '/chem-molecules',
    title: '化學分子表達',
    subject: '化學',
    tags: ['基礎-化學鍵'],
    group: '基礎化學',
    desc: 'AXₙEₘ 與八隅體電子數公式、VSEPR 形狀/鍵角、σ/π 鍵、極性、氫化物/含氧酸/自由基/官能基',
  },
  {
    id: 'chem-stoichiometry',
    href: '/chem-stoichiometry',
    title: '化學反應方程式與化學計量',
    subject: '化學',
    tags: ['基礎-化學計量'],
    group: '基礎化學',
    desc: '平衡（觀察法）、係數比意義、計量總流程、限量試劑、理論產量、產率、原子經濟性',
  },
  {
    id: 'chem-thermo',
    href: '/chem-thermo',
    title: '熱力學',
    subject: '化學',
    tags: ['基礎-熱力學'],
    group: '基礎化學',
    desc: '自發性、熵與亂度、系統/外界/宇宙熵（第二定律）、ΔH·ΔS 四種組合與臨界溫度',
  },
  {
    id: 'chem-quantum',
    href: '/chem-quantum',
    title: '光電效應與量子論：黑體輻射、電磁輻射模型、物質波',
    subject: '化學',
    tags: ['量子力學'],
    group: '量子論與原子結構',
    desc: '黑體輻射(只看溫度)與能量量子化、波動模型 c=νλ、光電效應(E_K=hν−Φ、低限頻率、功函數圖)、電磁波譜與化學用途、德布羅意物質波、波粒二象性與測不準',
  },
  {
    id: 'chem-atomic-spectra',
    href: '/chem-atomic-spectra',
    title: '原子光譜與波耳模型',
    subject: '化學',
    tags: ['原子光譜'],
    group: '量子論與原子結構',
    desc: '連續/線/吸收光譜、焰色試驗(IA/IIA)、氫原子發射光譜與五大系列、能量-頻率-波長計算(H 與類氫 Z²)、波耳能階與軌道半徑',
  },
  {
    id: 'chem-orbitals',
    href: '/chem-orbitals',
    title: '量子力學與原子軌域',
    subject: '化學',
    tags: ['原子軌域'],
    group: '量子論與原子結構',
    desc: '一維/三維盒中質點與零點能量、氫原子波函數與軌域、s/p/d/f 形狀與節點(n−ℓ−1、ℓ)、徑向分布函數、四個量子數與 Pauli',
  },
  {
    id: 'chem-electron-config',
    href: '/chem-electron-config',
    title: '原子軌域能階與電子組態',
    subject: '化學',
    tags: ['電子組態'],
    group: '量子論與原子結構',
    desc: '單/多電子軌域能階(n、n+l、穿透遮蔽)、填電子三大規則與基態激發態、電中性原子組態、第四週期 A 族與過渡金屬(Cr/Cu 例外)、電子組態通式',
  },
  {
    id: 'chem-ions-magnetism',
    href: '/chem-ions-magnetism',
    title: '帶電離子的電子組態與磁光行為',
    subject: '化學',
    tags: ['離子與電子行為'],
    group: '量子論與原子結構',
    desc: '陽/陰離子組態、特殊 A 族惰性電子對效應與假惰性氣體組態、等電子、過渡金屬陽離子與氧化態、順磁反磁、螢光與磷光',
  },
  {
    id: 'chem-periodicity',
    href: '/chem-periodicity',
    title: '週期表與週期性',
    subject: '化學',
    tags: ['週期性'],
    group: '量子論與原子結構',
    desc: '週期表結構與元素分類、各週期填入的軌域、金屬與非金屬性、有效核電荷 Zeff、游離能定義與逐步游離能、週期趨勢與 Be→B/N→O 兩個例外',
  },
  {
    id: 'chem-periodic-trends',
    href: '/chem-periodic-trends',
    title: '週期性趨勢：原子半徑、電子親和力與電負度',
    subject: '化學',
    tags: ['週期趨勢'],
    group: '量子論與原子結構',
    desc: '原子半徑（A 族與過渡金屬、鑭系收縮、波耳半徑）、電子親和力（正負符號與三例外）、離子半徑四結論、電負度趨勢，以及 Zeff／IE／EA／電負度綜合複習與週期性綜合考題',
  },
  {
    id: 'chem-chemical-bonding',
    href: '/chem-chemical-bonding',
    title: '化學鍵與分子結構',
    subject: '化學',
    tags: ['基礎-化學鍵'],
    group: '化學鍵與分子結構',
    desc: '離子化合物、多原子離子、Lewis 結構、形式電荷、共振、混成、VSEPR、分子偶極與分子間作用力',
  },
  {
    id: 'bio-cell-1',
    href: '/bio-cell-1',
    title: '概論、顯微鏡與原核／真核',
    subject: '生物',
    tags: ['細胞-原核與真核'],
    group: '細胞學',
    desc: '細胞學說與共同特徵、光學／電子／共軛焦顯微鏡與細胞大小、細胞分離、原核 vs 真核與細菌構造（質體、肽聚醣、內共生）',
  },
  {
    id: 'bio-cell-2',
    href: '/bio-cell-2',
    title: '細胞核、內膜系統與能量胞器',
    subject: '生物',
    tags: ['細胞-細胞核與胞器'],
    group: '細胞學',
    desc: '動植物細胞全景、細胞核與核糖體、內膜系統七成員（ER／高基氏體／溶體／液泡）、分泌路徑、粒線體／葉綠體／過氧化體／蛋白酶體',
  },
  {
    id: 'bio-cell-3',
    href: '/bio-cell-3',
    title: '細胞骨架與細胞外連結',
    subject: '生物',
    tags: ['細胞-骨架與連結'],
    group: '細胞學',
    desc: '微管・微絲・中間絲的直徑/組成/功能、中心粒與纖毛鞭毛的 9×3 與 9+2、細胞外基質與整聯蛋白、四種細胞間連結',
  },
  {
    id: 'bio-cell-4',
    href: '/bio-cell-4',
    title: '細胞膜（構造與功能）',
    subject: '生物',
    tags: ['細胞-細胞膜'],
    group: '細胞膜',
    desc: '磷脂雙層與兩性分子、流體鑲嵌模型、膜流動性（飽和／不飽和、鏈長、溫度、膽固醇）、膜蛋白種類分布與六大功能、細胞間辨識、選擇性通透與運輸蛋白',
  },
  {
    id: 'bio-cell-5',
    href: '/bio-cell-5',
    title: '跨膜運輸與囊泡運輸',
    subject: '生物',
    tags: ['細胞-物質運輸'],
    group: '細胞膜',
    desc: '擴散與滲透、張力與質壁分離、促進性擴散與水孔蛋白、鈉鉀幫浦與膜電位、次級主動運輸與共同運輸、胞吞與胞吐',
  },
  {
    id: 'bio-cell-6',
    href: '/bio-cell-6',
    title: '細胞訊號傳遞',
    subject: '生物',
    tags: ['細胞-訊號傳遞'],
    group: '細胞訊號傳遞',
    desc: '訊號傳遞三階段、四類受體（GPCR／RTK／離子通道／細胞內）、Gα 亞型分流、cAMP 與 IP₃／DAG／Ca²⁺、磷酸化級聯與訊號終止、細胞凋亡',
  },
  {
    id: 'bio-tissue-1',
    href: '/bio-tissue-1',
    title: '組織與體內恆定',
    subject: '生物',
    tags: ['組織與恆定'],
    group: '動物的形態與功能',
    desc: '四大組織（上皮／結締／肌肉／神經）、上皮的極性與分類、細胞骨架撐起的上皮特化、體內恆定的調控迴路與負回饋、正回饋',
  },
  {
    id: 'bio-sense-1',
    href: '/bio-sense-1',
    title: '視覺',
    subject: '生物',
    tags: ['視覺'],
    group: '感覺與運動',
    desc: '光線經過的七個構造、眼球壁三層、視網膜分層與兩條路徑、視紫質與光轉導五步、暗亮相反的膜電位、側抑制與接受域、視覺傳導五站與視野缺損、六條眼外肌與瞳孔水晶體的調控',
  },
  {
    id: 'bio-sense-2',
    href: '/bio-sense-2',
    title: '感覺的共同原理與皮膚感覺',
    subject: '生物',
    tags: ['感覺總論'],
    group: '感覺與運動',
    desc: '感覺四步驟與受器電位、刺激強度的頻率編碼、擴增與感覺適應、五類感覺受器、皮膚三層與六種觸壓受器、背根神經節與前角、皮節、感覺送到腦的路線',
  },
  {
    id: 'bio-nerve-1',
    href: '/bio-nerve-1',
    title: '十二對腦神經',
    subject: '生物',
    tags: ['腦神經'],
    group: '感覺與運動',
    desc: '腦神經與脊神經的差別、十二對總表、純感覺／純運動／混合三類、腦幹起源 1-1-2-4-4、四對副交感、三對控眼、損傷表現與瞳孔光反射對角膜反射',
  },
  {
    id: 'bio-summary',
    href: '/bio-summary',
    title: '生物・速查總表',
    subject: '生物',
    tags: ['總表'],
    desc: '筆記索引＋細胞學純表格（原核真核／胞器／內膜系統／骨架／連結／動植物／顯微鏡）＋跨篇整合（膜三篇怎麼串、內膜系統接訊號傳遞）',
    category: '快速複習',
  },
  {
    id: 'chem-summary',
    href: '/chem-summary',
    title: '化學・速查總表',
    subject: '化學',
    tags: ['總表'],
    desc: '筆記索引＋公式總表（三種能階模型別搞混、量子論五式同源、Zeff 帶動四趨勢、計量與單位骨架、結構判斷三層順序）',
    category: '快速複習',
  },
  {
    id: 'cn-summary',
    href: '/cn-summary',
    title: '國文・速查總表',
    subject: '國文',
    tags: ['總表'],
    desc: '筆記索引＋查證的權威分工（字義查重編、讀音查簡編）＋字的三層判讀順序與韻文共通框架',
    category: '快速複習',
  },
  {
    id: 'en-summary',
    href: '/en-summary',
    title: '英文・速查總表',
    subject: '英文',
    tags: ['總表'],
    desc: '筆記索引＋三條字彙路線的分工（字首字根／廣讀／考古題）＋遇到生字的拆解順序與讀文章的取捨',
    category: '快速複習',
  },
  {
    id: 'cn-radicals',
    href: '/cn-radicals',
    title: '部首總表',
    subject: '國文',
    tags: ['部首'],
    group: '字詞基礎',
    desc: '康熙 214 部首一頁速查：部首、讀音、意思、例字，標出變形／難讀／自成／形近部首',
  },
  {
    id: 'cn-shijing-qiyue',
    href: '/cn-shijing-qiyue',
    title: '詩經・七月',
    subject: '國文',
    tags: ['詩經'],
    group: '韻文',
    desc: '《詩經・豳風・七月》農事詩：夏曆與周曆兩套曆法、七月流火正解，加詩經六義、四家詩等常考重點',
  },
  {
    id: 'reading-r1',
    href: '/readings/r1',
    title: '增補廣讀 R1：VOA 字彙',
    subject: '英文',
    tags: ['廣讀'],
    desc: '7 篇 VOA 中級文章 + 47 個重點字彙（旋元佑老師編授）',
  },
  {
    id: 'reading-r2',
    href: '/readings/r2',
    title: '增補廣讀 R2：VOA 字彙',
    subject: '英文',
    tags: ['廣讀'],
    desc: '4 篇 VOA 進階短篇小說 + 26 個重點字彙（旋元佑老師編授）',
  },
]

/** 某分類底下、某科目的筆記（分類省略視為「考點筆記」）。 */
export function notesIn(category: NoteCategory, subject: NoteSubject): NoteEntry[] {
  return NOTES.filter((n) => noteCategory(n) === category && n.subject === subject)
}

/** 一科一份的速查總表（category＝快速複習）。寫完新筆記要回去更新它——由 notes.test.ts 守。 */
export function subjectSummary(subject: NoteSubject): NoteEntry | undefined {
  return NOTES.find((n) => n.subject === subject && noteCategory(n) === '快速複習')
}

/** 某分類＋科目下，依 group 分組（保 NOTES 順序）；無 group 者歸在 key '' 之下。 */
export function noteGroupsIn(
  category: NoteCategory,
  subject: NoteSubject,
): { group: string; notes: NoteEntry[] }[] {
  const order: string[] = []
  const map = new Map<string, NoteEntry[]>()
  for (const n of notesIn(category, subject)) {
    const g = n.group ?? ''
    const arr = map.get(g)
    if (arr) {
      arr.push(n)
    } else {
      map.set(g, [n])
      order.push(g)
    }
  }
  return order.map((g) => ({ group: g, notes: map.get(g) ?? [] }))
}

/** 依 href 找出當前筆記與其「同分類同科目」的上一篇/下一篇（依 NOTES 排序＝閱讀順序）。 */
export function siblingNotes(href: string): {
  current?: NoteEntry
  prev?: NoteEntry
  next?: NoteEntry
} {
  const current = NOTES.find((n) => n.href === href)
  if (!current) return {}
  const group = notesIn(noteCategory(current), current.subject)
  const i = group.findIndex((n) => n.id === current.id)
  return { current, prev: group[i - 1], next: group[i + 1] }
}
