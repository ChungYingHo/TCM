#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Offline concept tagging from extracted text (deterministic, no LLM).

Tag STRINGS here are the single source the UI mirrors in
``src/models/taxonomy.ts`` — keep both in sync. Tagging is correctness-neutral:
it never decides the answer, only the study category. Strategy per subject:

* chemistry / biology — multi-label substring scoring over curated keyword
  lists (top-3 by hit count). ASCII triggers are curated to avoid short
  fragments that appear inside unrelated English words.
* chinese — priority-ordered concept rules; if none match, the question is
  reading-comprehension and falls to the 閱讀理解綜合 default (→ 100% coverage).
* english — structural: option-shape (preposition / relative / connective /
  inflection ratios) + stem question-frames; single-word options default to
  字彙. Cloze blanks are detected with neighbour context via ``cloze_ids``.

CJK triggers match by substring on the raw text; ASCII triggers match
case-insensitively. Image-only chemistry structure questions legitimately stay
untagged — we never guess a category from an image.
"""
from __future__ import annotations
import re

MAX_TAGS = 3

# --- chemistry / biology: (tag, [keyword triggers]) -------------------------

CHEM_RULES: list[tuple[str, list[str]]] = [
    ('原子結構與核化學', ['量子數', '軌域', 'orbital', '電子組態', '電子排列', '基態', '激發態',
        '能階', '氫原子', '德布羅意', '普朗克', '光電效應', '波耳', '波函數', '節點', '自旋',
        '包立', '洪德', '遞建', '主量子', '半衰期', '放射性', '放射', '衰變', '核反應', '核種',
        '同位素', '質子', '中子', '電子數', '原子序', '價電子', '不成對電子', '核融合',
        '核分裂', 'amu', '原子核', '居里', '貝克', '焰色', '發射光譜', '吸收光譜', '譜線']),
    ('週期性', ['游離能', '離子化能', '電負度', '電子親和', '原子半徑', '離子半徑', '週期表',
        '有效核電荷', '屏蔽', '金屬性', '非金屬性', 'periodic']),
    ('化學鍵與分子結構', ['路易士', 'lewis', '共價', '離子鍵', '離子化合物', '離子溶液',
        '金屬鍵', '混成', 'hybrid',
        'sp3', 'sp2', 'vsepr', '鍵角', '分子形狀', '分子幾何', '偶極', '極性', '鍵能', '鍵長',
        '鍵級', '共振', 'resonance', '正式電荷', '八隅體', '分子軌域', '順磁', '反磁', '晶格',
        '晶體']),
    ('化學計量', ['莫耳', 'mole', 'g/mol', '實驗式', '分子式', '質量百分', '百分組成',
        '限量試劑', '過量', '理論產率', '產率', '當量', '化學式量', '燃燒分析', '亞佛加厥',
        'avogadro', '係數', '整數比', '有效位數', '有效數字']),
    ('氣體', ['理想氣體', 'pv=nrt', '分壓', '道耳吞', 'dalton', '格雷姆', '逸散', '擴散', 'effusion',
        '均方根', '氣體密度', '大氣壓', 'atm', 'mmhg', '凡得瓦', '真實氣體', '動力論', '波以耳', '查理']),
    ('溶液與依數性質', ['莫耳濃度', 'molarity', 'molality', '重量莫耳', '體積莫耳', '稀釋',
        '質量分率', '莫耳分率', '溶質', '溶劑', '凝固點下降', '沸點上升', '凝固點', '沸點',
        '蒸氣壓', '滲透壓', '拉午耳', 'raoult', '依數', '凡特荷', '冰點']),
    ('相變與分子間作用力', ['氫鍵', '分子間作用', '倫敦力', 'london', '偶極-偶極', '相圖',
        '三相點', '臨界點', '昇華', '汽化熱', '熔化熱', '熔點', '沸點', '熔化', '凝固',
        '物質狀態', '液態', '固態', '氣態', '克勞修斯', '黏度', '表面張力', '膠體']),
    ('熱力學', ['焓', 'enthalpy', '赫斯', 'hess', '熵', 'entropy', '吉布斯', 'gibbs', '自由能',
        '生成熱', '燃燒熱', '比熱', '熱容', '自發', '卡計', '量熱', '內能', '熱力學',
        '狀態函數', '能量守恆']),
    ('反應速率', ['速率', 'rate constant', '反應級數', '速率常數', '活化能', 'arrhenius',
        '阿瑞尼', '催化', 'catalyst', '反應機構', '決速', '碰撞理論', '過渡態', '一級反應',
        '二級反應']),
    ('化學平衡', ['平衡常數', 'keq', 'kc', 'kp', '勒沙特列', '勒沙特', '反應商', '正反應',
        '逆反應', '平衡移動', '化學平衡', '達平衡', '達到平衡', '平衡時', '平衡狀態',
        '平衡', '改變壓力']),
    ('酸鹼平衡', ['ph', 'poh', 'pka', 'pkb', '酸鹼', '布忍斯特', 'bronsted', '弱酸', '弱鹼',
        '強酸', '強鹼', '水解', '兩性', '共軛酸', '共軛鹼', '解離常數', '鹼性', '酸性',
        '鹼度', '酸度']),
    ('水溶液離子平衡', ['緩衝', 'buffer', 'henderson', '滴定', '當量點', '終點', '指示劑',
        '中和', '滴定曲線', '半當量', '溶解度積', 'ksp', '溶度積', '沉澱', '難溶', '共同離子',
        '同離子效應', '選擇性沉澱']),
    ('氧化還原', ['氧化數', '氧化態', '氧化還原', '氧化劑', '還原劑', '半反應', '配平', '歧化',
        '得電子', '失電子']),
    ('電化學', ['電池', '電解', '電極', '陽極', '陰極', '還原電位', '標準電位', '法拉第',
        'faraday', '伽凡尼', '電動勢', '能斯特', 'nernst', '鹽橋', '電鍍', '腐蝕', '伏打']),
    ('配位化合物', ['配位基', '配位數', '錯合', '錯離子', 'ligand', '晶體場', '配位場', '螯合',
        '中心金屬', '高自旋', '低自旋', '[co', '[fe', '[ni', '[cr', '[cu', '[pt', '[ag',
        '[zn', '[mn', '[pd', '[ru', '[ti', '[v(', '[zn', 'en)3', 'nh3)6', 'nh3)5', 'nh3)4']),
    ('有機命名與官能基', ['iupac', '官能基', '醇', '醚', '醛', '酮', '羧酸', '酯類', '醯胺',
        '醯氯', '酸酐', '羰基', '胺基', '胺類', '腈', '鹵烷', '不飽和', '構造式', '烷', '烯', '炔']),
    ('有機反應與機構', ['主要產物', '親核', '親電', '取代反應', 'sn1', 'sn2', 'e1反應', '加成反應',
        '消去反應', '重排', '碳陽離子', '自由基', 'markovnikov', 'grignard', '格里納', 'diels',
        '硝化', '磺化', '酯化', '皂化', 'aldol', '聚合', '高分子', '單體', 'monomer', 'polymer',
        '加成聚合', '縮合聚合', '尼龍', '聚酯']),
    ('芳香族化學', ['芳香', '苯', 'aromatic', '休克爾', 'hückel', '活化基', '鈍化基',
        '定位基', '鄰對位', '間位', '酚', '甲苯', '萘', '吡啶', '雜環']),
    ('立體化學', ['立體', '鏡像', '對掌', '掌性', 'chiral', '旋光', '比旋光', '構型', '對映',
        '非對映', '內消旋', 'meso', '順反異構', 'cis-', 'trans-', '費雪', 'fischer', '紐曼',
        '椅式', '構形', '光學活性', '異構物', '同分異構', '構造異構', '幾何異構']),
    ('生物有機分子', ['胺基酸', '胜肽', 'peptide', '蛋白質結構', '單醣', '雙醣', '多醣', '核酸',
        '核苷', '脂肪酸', '脂質', '葡萄糖', '果糖', '蔗糖', '澱粉', '纖維素', '維生素']),
    ('光譜分析', ['nmr', '核磁', '質譜', '紅外', 'ir光譜', '紫外光', '可見光譜', '化學位移',
        '耦合常數', '吸收峰', '吸收波長', '波數', '分子離子峰', '去屏蔽', 'm/z']),
]

# weak fallback for image-only organic questions (text carries no other signal):
# most untagged chemistry items are organic reaction/structure questions whose
# chemistry lives only in the rendered image ("下列反應式何者正確?"). Route them
# to 有機反應與機構 — a suitable category — before the final 化學綜合 catch-all.
CHEM_ORGANIC_FALLBACK = ['下列化合物', '下列結構', '下列分子', '最終產物', '預期產物',
    '反應後生成', '最佳試劑', '之結構為', '主要產物', '反應式', '反應方程式', '試劑',
    '下列反應', '產物', '化合物', '預期', '結構何者', '取代', '加成']

BIO_RULES: list[tuple[str, list[str]]] = [
    ('生命分子與生物化學', ['胺基酸', '胜肽', 'peptide', '醣類', '多醣', '脂肪酸', '磷脂',
        '核苷酸', 'nucleotide', '緩衝溶液', '膠原', 'collagen', '巨分子', '雙醣', '單醣',
        '肝醣', '熱力學', '水分子', '水的特性', '能量守恆', '第一定律']),
    ('細胞構造與胞器', ['胞器', '粒線體', 'mitochond', '內質網', 'endoplasmic', '高基氏', 'golgi',
        '溶體', '核糖體', 'ribosom', '細胞壁', '液胞', '過氧化體', '細胞骨架', '微管', '顯微鏡',
        'microscop', '流體鑲嵌', '中心體', '細胞凋亡', 'apoptosis', 'caspase', '細胞外基質']),
    ('細胞膜與物質運輸', ['主動運輸', '被動運輸', '幫浦', '滲透作用', '擴散作用', 'diffusion',
        '胞吞', '胞吐', '鈉鉀', '通道蛋白', '載體蛋白', '半透膜', '溶質勢', '水勢', '膨壓',
        '促進性擴散', '細胞連接', '緊密連接', '間隙連接', '胞間連絲', '胞橋']),
    ('酵素', ['酵素', '酶', 'enzyme', '催化', 'catalyst', '活性部位', '受質', 'substrate',
        '輔酶', 'coenzyme', '輔因子', '抑制劑', 'inhibitor', '米氏', 'michaelis', '回饋抑制',
        '最適溫度', '最適ph']),
    ('細胞呼吸與能量代謝', ['細胞呼吸', '糖解', 'glycoly', '克氏循環', 'krebs', '檸檬酸循環',
        '電子傳遞鏈', '氧化磷酸化', '發酵', 'fermentation', '糖質新生', 'gluconeogen', '呼吸熵',
        '丙酮酸', 'pyruvate', '乙醯輔酶', '脂肪酸氧化', 'oxidation', '基礎代謝', '代謝率', 'bmr']),
    ('光合作用與C4/CAM', ['光合', 'photosynthesis', '卡爾文', 'calvin', '光反應', '暗反應',
        '葉綠素', 'chlorophyll', '類囊體', 'thylakoid', '光系統', 'rubisco', '碳固定',
        '光呼吸', 'c4植物', 'cam植物', '維管束鞘', 'bundle sheath', '景天酸', 'pep羧化',
        'c3植物', '克蘭茲', '葉綠體']),
    ('細胞分裂', ['細胞分裂', '有絲分裂', 'mitosis', '減數分裂', 'meiosis', '細胞週期',
        '染色分體', '紡錘', 'spindle', '聯會', '間期', '胞質分裂', '著絲點', '四分體',
        '巴爾氏體', '巴爾小體', 'barr body', '核型', 'karyotype']),
    ('孟德爾遺傳', ['孟德爾', '顯性', '隱性', '基因型', '表現型', '對偶基因', '同型合子',
        '異型合子', '分離律', '自由組合', '回交', 'testcross', '自交', '子代比例', '譜系',
        'pedigree', '血型遺傳', '連鎖', '互換', '性聯', 'sex-linked', '旁氏', 'punnett',
        '鐮刀', '帶因者', 'carrier', '重組頻率', '圖譜單位', 'map unit', '遺傳疾病',
        '遺傳性疾病', '血友病', '發生率', '外表型', '基因座', '突變導致', '多基因',
        '性別決定', 'sry', '近親', '著色性乾皮', 'xeroderma', '色盲']),
    ('分子遺傳：DNA複製與染色體', ['dna複製', '半保留', 'semiconservative', '端粒', 'telomere',
        '岡崎', 'okazaki', '解旋酶', 'helicase', 'dna聚合酶', 'dna polymerase', '引子',
        '基因組', 'genome', '核小體', '組蛋白', 'histone', '雙螺旋', 'chargaff', '嘌呤',
        '嘧啶', '腺嘌呤', '鳥糞嘌呤', '胞嘧啶', '胸腺嘧啶', '鹼基對', '鹼基配對']),
    ('基因表現：轉錄轉譯與調控', ['轉錄', 'transcription', '轉譯', 'translation', 'mrna', 'trna',
        'rrna', '密碼子', 'codon', '反密碼子', '遺傳密碼', '剪接', 'splicing', '內含子',
        'intron', '外顯子', 'exon', '蛋白質合成', '中心法則', '基因調控', 'operon', '操縱組',
        '啟動子', 'promoter', '增強子', '轉錄因子', '表觀遺傳', '表徵遺傳', '甲基化', 'microrna']),
    ('生物技術與分子工具', ['pcr', '重組dna', 'recombinant', '質體', 'plasmid', '限制酶',
        'restriction enzyme', '選殖', 'cloning', '基因轉殖', 'transgenic', 'crispr', '定序',
        'sequencing', '電泳', 'electrophoresis', '墨點法', '逆轉錄', '幹細胞', 'stem cell',
        '單株抗體', '基因探針', '資料庫', '生物資訊', 'bioinformatic', '基因庫', '序列分析']),
    ('演化與生命起源', ['演化', 'evolution', '天擇', '物種形成', 'speciation', '生殖隔離',
        '哈溫', 'hardy-weinberg', '基因頻率', '遺傳漂變', 'genetic drift', '趨同演化', '化石',
        'fossil', '大滅絕', '達爾文', 'darwin', '盤古大陸', '生命起源', '古人類', '智人',
        '半衰期', '放射性定年', '定年']),
    ('分類與生物多樣性', ['分類學', 'classification', 'taxonom', '親緣', 'phylogen', '分類群',
        'clade', '界門綱目', '二名法', 'binomial', '親緣關係樹', '簡約法', 'parsimony', '原口',
        'protostome', '後口', 'deuterostome', '脊索動物', '節肢動物', '分類階層', '動物門',
        '階層關係', '脊椎動物', '無脊椎']),
    ('微生物', ['病毒', 'virus', '噬菌體', 'bacteriophage', '反轉錄病毒', 'retrovirus', 'capsid',
        '溶裂', 'lytic', '溶原', 'lysogenic', '普恩蛋白', 'prion', '細菌', 'bacteria', '原核生物',
        'prokary', '革蘭', '古菌', 'archaea', '真菌', 'fungi', '酵母菌', '黴菌', '藻類', 'algae',
        '原生生物', 'protist', '原生動物', '變形蟲', '草履蟲', '眼蟲', '滴蟲', '孢子',
        '菌絲', '地衣', '放線菌', '接合作用', 'conjugation']),
    ('植物構造與組織', ['維管束', 'vascular', '木質部', 'xylem', '韌皮部', 'phloem', '篩管',
        '分生組織', 'meristem', '形成層', 'cambium', '薄壁細胞', '厚壁細胞', '厚角細胞',
        'parenchyma', '表皮細胞', '氣孔', 'stomata', '次生生長', '年輪', '石細胞', '保衛細胞',
        '葉序', '葉脈']),
    ('植物生理', ['植物激素', '生長素', 'auxin', '吉貝素', 'gibberell', '細胞分裂素', 'cytokinin',
        '離層酸', 'abscisic', '乙烯', 'ethylene', '向性', 'tropism', '光週期', 'photoperiod',
        '春化', '光敏素', 'phytochrome', '短日照', '長日照', '休眠', 'dormancy', '授粉',
        'pollinat', '花粉', '雙重受精', '胚珠', '種子', '果實', '世代交替', '配子體', '孢子體',
        '蒸散', 'transpiration', '菌根', '單性花', '植物賀爾蒙', '花序', '報春花', '礦物質',
        '微量元素', '植物營養', '表皮毛', '毛狀體', 'trichome']),
    ('神經系統與行為', ['神經元', 'neuron', '突觸', 'synap', '動作電位', 'action potential',
        '靜止電位', '神經傳遞', 'neurotransmit', '髓鞘', 'myelin', '軸突', 'axon', '樹突',
        '中樞神經', '大腦', '小腦', '脊髓', '反射弧', '視網膜', '錐細胞', '視桿', '去極化',
        '銘印', 'imprinting', '制約', 'conditioning', '本能行為', '費洛蒙', 'pheromone',
        '求偶', '巴夫洛夫', '印痕', '生物時鐘', 'circadian', '晝夜節律', '聽覺', '視覺',
        '嗅覺', '味覺', '感覺受器']),
    ('內分泌系統', ['內分泌', 'endocrine', '激素', 'hormone', '腦下腺', 'pituitary', '甲狀腺',
        'thyroid', '胰島素', 'insulin', '升糖素', '腎上腺', 'adrenal', '皮質醇', '腎上腺素',
        'epinephrine', '下視丘', 'hypothalamus', '負回饋', '雌激素', 'estrogen', '睪固酮',
        '褪黑激素', '荷爾蒙', '賀爾蒙', '內在因子']),
    ('循環與呼吸', ['循環系統', 'circulat', '血液', '心臟', '動脈', '靜脈', '微血管', 'capillary',
        '紅血球', '白血球', '血紅素', 'hemoglobin', '血漿', '血壓', '凝血', '淋巴', 'lymph',
        '瓣膜', '心房', '心室', 'ventricle', '呼吸系統', '肺泡', 'alveol', '支氣管', '氣管',
        '氣體交換', '換氣', 'ventilation', '橫膈', '氧合', '肺活量', '血基質', '心搏', '心率']),
    ('免疫系統', ['免疫', 'immun', '抗體', 'antibody', '抗原', 'antigen', '淋巴球', 'lymphocyte',
        't細胞', 'b細胞', '巨噬細胞', 'macrophage', '吞噬', 'phagocyt', '疫苗', 'vaccine',
        '過敏', 'allerg', '發炎反應', '補體', 'mhc', '干擾素', '自體免疫']),
    ('消化與營養', ['消化系統', '消化道', 'digest', '小腸', '大腸', '胃液', '胃壁', 'stomach',
        '肝臟', '胰臟', 'pancrea', '膽汁', '膽鹽', '胃蛋白酶', 'pepsin', '唾液', '絨毛', 'villi',
        '蠕動', '乳糜', 'chylomicron', '膽固醇', 'cholesterol', '腸上皮', '營養素',
        '維生素', 'vitamin', '維他命']),
    ('排泄與滲透調節', ['排泄', 'excret', '腎臟', 'kidney', 'nephron', '腎元', '腎絲球',
        'glomerul', '腎小管', '泌尿', '尿液', '膀胱', '再吸收', 'reabsorption', '近曲小管',
        '遠曲小管', '亨耳', 'henle', '含氮廢物', '尿素', 'urea', '尿酸', '滲透調節', '鹽腺',
        '抗利尿']),
    ('骨骼與肌肉運動', ['骨骼', 'skeleton', '骨頭', '肌肉', 'muscle', '肌凝蛋白', 'myosin',
        '肌動蛋白', 'actin', '肌原纖維', '肌節', 'sarcomere', '橫紋肌', '平滑肌', '心肌',
        '肌肉收縮', '關節', '軟骨', 'cartilage', '滑動學說']),
    ('動物生殖與發育', ['生殖系統', '受精作用', 'fertiliz', '精子', 'sperm', '卵子', '胚胎',
        'embryo', '發育', '胚層', 'germ layer', '囊胚', '原腸', 'gastrula', '子宮', '胎盤',
        'placenta', '卵巢', '睪丸', '排卵', '卵裂', '懷孕', '妊娠']),
    ('生態學', ['生態', 'ecolog', '族群', 'population', '群落', '群聚', 'community', '生態系',
        'ecosystem', '食物鏈', '食物網', 'food web', '營養階', 'trophic', '演替', 'succession',
        '共生', 'symbiosis', '互利', 'mutualism', '寄生', '掠食', 'predat', '碳循環', '氮循環',
        'nitrogen cycle', '生物多樣', 'biodivers', '棲位', 'niche', '負荷量', '生存曲線',
        'survivorship', '相剋', '珊瑚白化', '生物相', 'biome', '關鍵物種', 'keystone', '保育',
        '瀕臨', '滅絕', '珊瑚礁', '藻礁', '紅樹林', '河口', '潮差', '濕地', '海水', '海洋',
        '人口', '污染', '聖嬰', '國家公園', '棲地', '入侵種']),
]


def _keyword_tags(rules: list[tuple[str, list[str]]], text: str) -> list[tuple[int, str]]:
    low = text.lower()
    scored: list[tuple[int, str]] = []
    for tag, kws in rules:
        hits = sum(1 for kw in kws if (kw in low if kw.isascii() else kw in text))
        if hits:
            scored.append((hits, tag))
    scored.sort(key=lambda s: -s[0])
    return scored


# --- chinese: priority-ordered concept rules (regex) ------------------------

CHINESE_RULES: list[tuple[str, list[str]]] = [
    ('字音字形', [r'讀音', r'字音', r'注音', r'破音', r'聲調', r'同音', r'讀作', r'寫成國字',
        r'錯別字', r'別字', r'字形', r'偏旁', r'部首', r'形(似|近)字', r'沒有錯字',
        r'沒有錯別字', r'用字(完全)?正確', r'寫法(完全)?正確']),
    ('字詞義訓詁', [r'詞語.{0,8}(意思|解釋|意義|相同|不同)', r'意(思|義).{0,3}(相同|不同|相異|相近)',
        r'前後.{0,4}(相同|不同|相異)', r'實詞', r'虛詞', r'詞性相同', r'偏義複詞', r'一字多義',
        r'古今異義', r'訓詁', r'同義詞', r'反義詞', r'詞義', r'字義', r'釋義', r'意涵', r'涵義']),
    ('成語熟語', [r'成語', r'熟語', r'俗諺', r'諺語', r'歇後語', r'慣用語']),
    ('修辭格', [r'修辭', r'譬喻', r'轉化', r'擬人', r'映襯', r'借代', r'誇飾', r'排比', r'對偶',
        r'類疊', r'摹寫', r'頂真', r'設問', r'轉品', r'互文', r'雙關', r'示現', r'層遞', r'婉曲',
        r'呼告']),
    ('詞性語法句構', [r'文法', r'語法', r'句構', r'句型', r'語病', r'詞類', r'倒裝', r'省略主語',
        r'構詞', r'語素', r'單句', r'複句', r'被動句']),
    ('應用文書信', [r'書信', r'題辭', r'對聯', r'輓聯', r'柬帖', r'公文', r'稱謂', r'提稱語',
        r'敬辭', r'謙辭', r'信封', r'春聯', r'賀辭', r'喜帖', r'訃聞', r'匾額', r'啟事', r'便條',
        r'名片', r'(開業|結婚|祝賀|喬遷).{0,8}題辭']),
    ('古典韻文', [r'律詩', r'絕句', r'平仄', r'押韻', r'韻腳', r'對仗', r'近體詩', r'古體詩',
        r'樂府', r'詞牌', r'曲牌', r'散曲', r'長短句', r'這首詩', r'此詩', r'本詩', r'這闋',
        r'此闋', r'一首.{0,2}(詩|詞)', r'詩中', r'詞中', r'曲中', r'詠.{1,4}詩', r'〈.{1,14}〉',
        r'賦.{0,2}體']),
    ('古典散文文言閱讀', [r'語譯', r'翻譯', r'文言文', r'句中.{0,8}(意思|解釋|主旨)',
        r'這段(文字|話).{0,8}(主旨|意思|意涵|旨)', r'根據(上文|本文|此文|這段|這篇|甲文|乙文|丙文)',
        r'文中.{0,12}(意思|主旨)', r'詮釋', r'旨在說明']),
    ('文學史常識', [r'作者(是|為)', r'作家', r'何人(所)?(作|著|寫)', r'出自', r'文學史', r'流派',
        r'文壇', r'代表作', r'時代.{0,2}先後', r'現代詩', r'新詩', r'白話文學', r'文學運動',
        r'紅樓夢', r'何書', r'哪一(本|部)書']),
    ('文化教材思想', [r'論語', r'孟子', r'《大學》', r'中庸', r'孔子', r'孟子曰', r'《老子》',
        r'莊子', r'荀子', r'墨子', r'韓非', r'諸子', r'老莊', r'儒家', r'道家', r'四書', r'子曰']),
    ('國學常識', [r'六書', r'說文解字', r'文字學', r'目錄學', r'經史子集', r'十三經', r'四庫',
        r'爾雅', r'聲韻', r'楚辭', r'詩經', r'史記', r'漢書', r'左傳', r'尚書', r'周易', r'禮記',
        r'《春秋》', r'編年體', r'紀傳體', r'二十四史']),
]
CHINESE_DEFAULT = '閱讀理解綜合'


def _chinese_tags(text: str) -> list[str]:
    out: list[str] = []
    for tag, pats in CHINESE_RULES:
        if any(re.search(p, text) for p in pats):
            out.append(tag)
        if len(out) >= MAX_TAGS:
            break
    return out or [CHINESE_DEFAULT]


# --- english: structural classification -------------------------------------

_PREP = {'to', 'of', 'in', 'on', 'at', 'by', 'for', 'from', 'with', 'as', 'into',
    'onto', 'off', 'over', 'under', 'about', 'against', 'between', 'through',
    'during', 'within', 'without', 'upon', 'toward', 'towards', 'among', 'beyond'}
_REL = {'who', 'whom', 'whose', 'which', 'that', 'what', 'where', 'when', 'why',
    'whoever', 'whomever', 'whatever', 'whichever'}
_CONN = {'because', 'however', 'therefore', 'although', 'though', 'since',
    'moreover', 'thus', 'nevertheless', 'whereas', 'while', 'furthermore',
    'meanwhile', 'consequently', 'otherwise', 'hence', 'besides', 'yet',
    'nonetheless', 'accordingly', 'thereby'}
_SYN_FRAMES = ['closestinmeaning', 'nearestinmeaning', 'similarinmeaning',
    'oppositeinmeaning', 'synonym', 'antonym', 'closestto', 'nearestto',
    'oppositeto', 'sameinmeaning', 'meanings', 'underlinedword']
_READ_FRAMES = ['accordingto', 'thepassage', 'thispassage', 'canbeinferred',
    'canbeconcluded', 'isimplied', 'implies', 'mainidea', 'maintopic', 'besttitle',
    'theauthor', 'thefollowingstatement', 'followingistrue', 'mentionedinthe',
    'thewriter', 'purposeofthe', 'toneofthe', 'inferredfrom']
_WH = ('what', 'which', 'why', 'how', 'where', 'when', 'who', 'whose')


def _word(opt: str) -> str:
    return re.sub(r'[^a-z]', '', opt.strip().lower())


def _english_tags(stem: str, options: list[str]) -> list[str]:
    opts = [o for o in (options or []) if o and o.strip()]
    ns = re.sub(r'\s+', '', stem).lower()

    # stem-frame checks first — work even when options failed to extract
    if any(f in ns for f in _SYN_FRAMES):
        return ['同義反義與字根字首']
    sentence_like = sum(1 for o in opts if o.count(' ') >= 3 or len(o) > 28)
    if (ns.startswith(_WH) or any(f in ns for f in _READ_FRAMES)
            or (opts and sentence_like >= max(2, len(opts) // 2))):
        return ['閱讀測驗']

    if opts:
        words = [_word(o) for o in opts]
        n = len(opts)
        prep = sum(1 for w in words if w in _PREP)
        rel = sum(1 for w in words if w in _REL)
        conn = sum(1 for w in words if w in _CONN)
        if prep / n >= 0.6:
            return ['文法：介系詞與片語']
        if rel / n >= 0.5:
            return ['文法：子句與關係代名詞']
        if conn / n >= 0.5:
            return ['句構與語意連貫']
        # tense/voice: most options are inflections of one verb (share a 4-char root)
        roots = [w[:4] for w in words if len(w) >= 4]
        if roots and max(roots.count(r) for r in roots) >= max(3, n - 1):
            return ['文法：時態與語態']
        multiword = sum(1 for o in opts if 1 <= o.strip().count(' ') <= 2 and len(o) <= 22)
        if multiword >= max(2, len(opts) // 2):
            return ['片語動詞與慣用語']

    # default: long passage-style stem → reading; otherwise vocabulary (incl.
    # single-blank sentences and items whose options didn't extract).
    return ['閱讀測驗'] if len(ns) > 140 else ['字彙']


# --- public API -------------------------------------------------------------

def assign_tags(subject: str, stem: str, options: list[str] | None = None) -> list[str]:
    """Concept tags for one question (correctness-neutral, multi-label)."""
    options = options or []
    if subject == 'english':
        return _english_tags(stem or '', options)
    if subject == 'chinese':
        return _chinese_tags((stem or '') + ' ' + ' '.join(options))
    text = (stem or '') + ' ' + ' '.join(options)
    rules = CHEM_RULES if subject == 'chemistry' else BIO_RULES if subject == 'biology' else []
    scored = _keyword_tags(rules, text)
    tags = [t for _, t in scored[:MAX_TAGS]]
    # guarantee every chemistry/biology question gets a category (no untagged):
    # try a suitable specific fallback first, else the subject's catch-all.
    if not tags:
        if subject == 'chemistry':
            tags = ['有機反應與機構'] if any(p in text for p in CHEM_ORGANIC_FALLBACK) else ['化學綜合']
        elif subject == 'biology':
            tags = ['生物學綜合']
    return tags


def cloze_ids(view: list[dict]) -> set[str]:
    """English cloze blanks: runs of >=4 consecutive same-exam questions whose
    stems are (near-)empty — the passage lives off the individual records.
    ``view`` items need keys: id, school, year, subject, question_number,
    question_text. Returns the ids to mark as 克漏字 (primary)."""
    groups: dict[tuple, list[dict]] = {}
    for r in view:
        if r.get('subject') != 'english':
            continue
        groups.setdefault((r['school'], r['year']), []).append(r)
    out: set[str] = set()
    for items in groups.values():
        items.sort(key=lambda r: r['question_number'])
        run: list[dict] = []

        def flush(run):
            if len(run) >= 4:
                out.update(r['id'] for r in run)
        prev = None
        for r in items:
            empty = len(re.sub(r'\s+', '', r.get('question_text') or '')) < 8
            contiguous = prev is None or r['question_number'] == prev + 1
            if empty and contiguous:
                run.append(r)
            else:
                flush(run)
                run = [r] if empty else []
            prev = r['question_number']
        flush(run)
    return out
