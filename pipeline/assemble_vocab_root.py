"""Assemble pipeline/data/vocab_root/NN-<root>.json from two inputs.

  1. vocab_root_wordlist.md  — the fixed word list the MAIN agent transcribed from the
     textbook photos (headword, pos, zh, derivatives, example sentences, page).
  2. vocab_verify/<group>.json — what each verification subagent returned from
     Etymonline + Wiktionary (parts, etymology, us_ipa, etymonline_url, notes).

US IPA is converted to KK with the mapping in the /vocab skill 附錄 B. The conversion is
mechanical, so anything it is not sure about is reported for the main agent to eyeball
rather than silently guessed.

Chinese example translations come from vocab_root_example_zh.json (authored by the main
agent) — the skill requires those to be disclosed as hand-translated.

Usage:  python assemble_vocab_root.py [--write]
"""
import json
import os
import re
import sys
import unicodedata

sys.stdout.reconfigure(encoding='utf-8')

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.join(REPO, 'pipeline', 'data')  # 字表、譯文、查證結果都放這
VERIFY_DIR = os.path.join(HERE, 'vocab_verify')
GLOSS_FILE = os.path.join(HERE, 'vocab_root_gloss_fix.json')
GLOSS_MAX = 12  # chip 上的字義字數上限，超過在卡片上會爆版
OUT_DIR = os.path.join(HERE, 'vocab_root')

# 第一批：書頁 67–80。group id -> 檔名前綴數字（＝vocab.ts 的 order）
GROUPS_B1 = [
    ('loc', 62), ('centr', 63), ('circum', 64), ('found', 65), ('radic', 66),
    ('maxi', 67), ('aug', 68), ('grand', 69), ('medi', 70), ('mini', 71),
    ('brev', 72), ('meter', 73), ('mod', 74), ('plet', 75), ('vac', 76), ('neg', 77),
]
# 課本標題（小寫、冒號前）-> group id
HEADINGS_B1 = {
    'loc': 'loc', 'centr': 'centr', 'circum (circul)': 'circum', 'found': 'found',
    'radic (rudi)': 'radic', 'maxi (magn, maj)': 'maxi', 'aug': 'aug', 'grand': 'grand',
    'medi (midi)': 'medi', 'mini': 'mini', 'brev, brid': 'brev', 'meter': 'meter',
    'mod': 'mod', 'plet (plen)': 'plet', 'vac (van, vain)': 'vac', 'neg (nil, nul)': 'neg',
}

# 第二批：書頁 81–106
GROUPS_B2 = [
    ('neo', 78), ('prim', 79), ('val', 80), ('dign', 81), ('forc', 82), ('dur', 83),
    ('dynam', 84), ('potent', 85), ('salut', 86), ('luc', 87), ('grav', 88), ('lev', 89),
    ('stig', 90), ('acr', 91), ('punct', 92), ('sign', 93), ('cas', 94), ('fin', 95),
    ('term', 96), ('clud', 97), ('flu', 98), ('und', 99), ('cur', 100), ('fund', 101),
    ('lav', 102), ('spars', 103), ('enni', 104), ('chron', 105), ('journ', 106),
]
HEADINGS_B2 = {
    'neo (nov)': 'neo', 'prim': 'prim', 'val (vail)': 'val', 'dign': 'dign',
    'forc (fort)': 'forc', 'dur': 'dur', 'dynam': 'dynam', 'potent': 'potent',
    'salut (san)': 'salut', 'luc, lumin': 'luc', 'grav': 'grav', 'lev': 'lev',
    'stig (sting, stinct)': 'stig', 'acr (acu)': 'acr', 'punct': 'punct', 'sign': 'sign',
    'cas (cad, cid)': 'cas', 'fin': 'fin', 'term (termin)': 'term', 'clud (clus)': 'clud',
    'flu': 'flu', 'und (ound)': 'und', 'cur, cour': 'cur', 'fund, fus': 'fund',
    'lav, luv': 'lav', 'spars (spers)': 'spars', 'enni (annu)': 'enni', 'chron': 'chron',
    'journ (urn)': 'journ',
}

# --b2 切到第二批；預設是第一批
B2 = '--b2' in sys.argv
WORDLIST = os.path.join(HERE, 'vocab_root_wordlist_b2.md' if B2 else 'vocab_root_wordlist.md')
ZH_FILE = os.path.join(HERE, 'vocab_root_example_zh_b2.json' if B2 else 'vocab_root_example_zh.json')
GROUPS = GROUPS_B2 if B2 else GROUPS_B1
HEADING_TO_GROUP = HEADINGS_B2 if B2 else HEADINGS_B1

# ── US IPA → KK（/vocab skill 附錄 B）───────────────────────────────────────────
# 長度順序很重要：雙字母的組合要先換掉，否則會被單字母規則吃掉。
IPA_KK = [
    ('eɪ', 'e'), ('oʊ', 'o'), ('oː', 'o'),
    ('iː', 'i'), ('uː', 'u'), ('ɑː', 'ɑ'), ('ɔː', 'ɔ'), ('ɜː', 'ɝ'),
    ('l̩', 'əl'), ('n̩', 'ən'), ('m̩', 'əm'),
    ('ɹ', 'r'), ('ɡ', 'g'), ('ʔ', ''), ('ː', ''),
    ('͡', ''), ('͜', ''), ('.', ''),  # 連音符與音節點，KK 不寫
]

# 字典給了多個變體、腳本挑錯時，由主 agent 在這裡指定要用哪一個（值＝US IPA）。
# 每一條都要寫清楚為什麼，不可無來源硬改。
IPA_OVERRIDE = {
    # Wiktionary 第一個變體 /mɪˈtɪkjɪlɪs/ 是弱化拼法，取第二個；Merriam-Webster
    # 亦作 \mə-ˈti-kyə-ləs\，第二變體較接近一般美式讀法。
    'meticulous': '/mɪˈtɪkjuləs/',
}
# 這些留原樣：æ ɛ ɪ ʊ ʌ ə ɔ ɑ aɪ aʊ ɔɪ ɝ ɚ ˈ ˌ
KK_OK = set('æɛɪʊʌəɔɑaɪʊɝɚˈˌbdfhjklmnprstvwzðθʃʒŋtʃdʒeiuog.')


def to_kk(ipa: str) -> tuple[str, str]:
    """回傳 (KK, 疑慮說明)。疑慮不空時由主 agent 人工確認。"""
    s = unicodedata.normalize('NFC', ipa or '').strip()
    notes = []
    # worker 有時會在 IPA 欄位加註解（「/ˈmɑdərət/（形容詞）；/ˈmɑdəreɪt/（動詞）」），
    # 先把第一組斜線內的音標切出來，其餘一律當註解丟掉。
    slashed = re.findall(r'/([^/]+)/', s)
    if slashed:
        if len(slashed) > 1 or re.search(r'[一-鿿]', s):
            notes.append(f'原欄位有多個讀音或中文註解，只取第一個 /{slashed[0]}/')
        s = slashed[0]
    if ',' in s or ' ' in s:
        notes.append('原 IPA 給了多個讀音，只取第一個')
        s = re.split(r'[,\s]+', s)[0]
    s = s.strip().strip('/[]')
    if '(' in s or ')' in s:
        notes.append('原 IPA 有可省略音節的括號，已取括號內的音')
        s = s.replace('(', '').replace(')', '')
    for a, b in IPA_KK:
        s = s.replace(a, b)
    # 字尾 -i（來自 -y）在傳統 KK 寫 ɪ
    if s.endswith('i') and not s.endswith('aɪ'):
        s = s[:-1] + 'ɪ'
    unknown = sorted({c for c in s if c not in KK_OK and not c.isalpha()})
    if unknown:
        notes.append('未在對照表中的符號：' + ' '.join(unknown))
    return s, '；'.join(notes)


# ── worker 回來的中文要過一次專案文風 ────────────────────────────────────────
# worker 是外包的，不會記得專案規則：中文散文一律全形標點、**零分號**（AGENTS.md
# 反覆糾正過的雷點）、中文與英數之間空一格。這一關由主 agent 的腳本統一收，
# 不要指望每個 worker 都寫對。
CJK = r'一-鿿'  # 漢字本身，用來決定中英之間要不要空格
# 逗號前面可能是漢字，也可能是全形引號／括號（「」『』（）等），兩者都要吃到
CJKP = r'一-鿿　-〿＀-￯'


def normalize_zh(text: str) -> str:
    if not text:
        return ''
    s = text
    s = s.replace(';', '。').replace('；', '。')  # 零分號：拆成兩句
    s = re.sub(rf'(?<=[{CJKP}]),\s*', '，', s)  # 中文之間的半形逗號
    s = re.sub(rf',(?=[{CJKP}])', '，', s)
    s = re.sub(rf'(?<=[{CJKP}])\s*:\s*', '：', s)
    s = re.sub(rf'(?<=[{CJKP}])\.(?=\s|$)', '。', s)
    s = s.replace('。。', '。')
    # 中文散文的括號用全形（既有 vocab_prefix 的字源也都是全形，保持一致）
    if re.search(rf'[{CJK}]', s):
        s = s.replace('(', '（').replace(')', '）')
    # 中文與英數之間空一格（全形標點與引號不算，故只認漢字本身）
    s = re.sub(rf'(?<=[{CJK}])(?=[A-Za-z0-9])', ' ', s)
    s = re.sub(rf'(?<=[A-Za-z0-9])(?=[{CJK}])', ' ', s)
    return re.sub(r'[ 	]{2,}', ' ', s).strip()


def pick_example(word: str, examples: list[str]) -> tuple[str, list[str]]:
    """挑真正示範這個字的例句。

    課本一則字底下的句子，有些其實在示範【衍】的衍生字（如 location 那一則的頭兩句
    講的是 locate）。直接取第一句會讓卡片正面是 location、例句裡卻找不到它。
    規則：先找含這個字本身的句子，再找含字幹的（吃得下 -ed/-ing/-s 之類的變化），
    都沒有才退回第一句。回傳 (選中的句子, 其餘句子)。
    """
    if not examples:
        return '', []
    lower = word.lower()
    stem = lower[: max(4, len(lower) - 3)]
    for probe in (lower, stem):
        for i, ex in enumerate(examples):
            if probe in ex.lower():
                return ex, examples[:i] + examples[i + 1 :]
    return examples[0], examples[1:]


# ── 解析主 agent 的固定字清單 ──────────────────────────────────────────────────
HEAD_RE = re.compile(r'^\s*\d+\.\s+\*\*(?P<word>[^*]+)\*\*\s+\((?P<pos>[^)]*)\)\s*(?P<zh>.*)$')
DERIV_RE = re.compile(r'^\s*-\s*【衍】(?P<body>.+)$')
NOTE_RE = re.compile(r'^\s*-\s*※')
BULLET_RE = re.compile(r'^\s*-\s+(?P<body>.+)$')
PAGE_RE = re.compile(r'^##\s*書頁\s*(?P<page>\d+)（(?P<img>IMG_\d+)）')
GROUP_RE = re.compile(r'^###\s*(?P<spec>[^:：]+?)(?::|：)')


def parse_wordlist() -> list[dict]:
    words, cur, page, img, group = [], None, None, None, None
    for line in open(WORDLIST, encoding='utf-8'):
        if m := PAGE_RE.match(line):
            page, img = m.group('page'), m.group('img')
            continue
        if line.startswith('### '):
            spec = GROUP_RE.match(line)
            # 有冒號時取冒號前，沒冒號時（如「circum (circul)（續）」）整行都是字根名
            key = (spec.group('spec') if spec else line[4:]).replace('（續）', '').strip().lower()
            group = HEADING_TO_GROUP.get(key)
            if group is None:
                raise SystemExit(f'未知的字根標題：{key!r}（第 {len(words)} 字之後）')
            continue
        if m := HEAD_RE.match(line):
            cur = {
                'word': m.group('word').strip(), 'pos': m.group('pos').strip(),
                'zh': m.group('zh').strip(), 'derivatives': [], 'examples': [],
                'group': group, 'page': img, 'bookPage': page,
            }
            words.append(cur)
            continue
        if cur is None:
            continue
        if NOTE_RE.match(line):
            continue
        if m := DERIV_RE.match(line):
            for part in re.split(r'[、,]\s*(?=[A-Za-z])', m.group('body').strip()):
                if d := re.match(r'^([A-Za-z][A-Za-z-]*)\s*\(([^)]*)\)\s*(.*)$', part.strip()):
                    cur['derivatives'].append(
                        {'word': d.group(1), 'pos': d.group(2).strip(), 'zh': d.group(3).strip()}
                    )
            continue
        if m := BULLET_RE.match(line):
            body = m.group('body').strip()
            if re.match(r'^[A-Z"\']', body):  # 例句一律以大寫或引號開頭
                cur['examples'].append(body)
    return words


def main() -> None:
    write = '--write' in sys.argv
    words = parse_wordlist()
    verify = {}
    for g, _ in GROUPS:
        p = os.path.join(VERIFY_DIR, f'{g}.json')
        if os.path.exists(p):
            for e in json.load(open(p, encoding='utf-8')):
                verify[e['word']] = e
    zh = json.load(open(ZH_FILE, encoding='utf-8')) if os.path.exists(ZH_FILE) else {}
    gloss_fix = json.load(open(GLOSS_FILE, encoding='utf-8')) if os.path.exists(GLOSS_FILE) else {}

    missing_verify = [w['word'] for w in words if w['word'] not in verify]
    missing_zh = [w['word'] for w in words if w['word'] not in zh]
    print(f'字表 {len(words)} 字｜已查證 {len(words) - len(missing_verify)}｜已翻例句 {len(words) - len(missing_zh)}')
    if missing_verify:
        print(f'  尚未查證（{len(missing_verify)}）：' + ' '.join(missing_verify))
    if missing_zh:
        print(f'  尚未翻譯（{len(missing_zh)}）：' + ' '.join(missing_zh))

    by_group, kk_review = {}, []
    for w in words:
        v = verify.get(w['word'])
        if not v:
            continue
        example, rest = pick_example(w['word'], w['examples'])
        raw_ipa = IPA_OVERRIDE.get(w['word'], v.get('us_ipa', ''))
        kk, note = to_kk(raw_ipa)
        if note:
            kk_review.append(f"{w['word']}: {v.get('us_ipa')} -> {kk}｜{note}")
        entry = {
            'word': w['word'], 'prefixId': w['group'], 'pos': w['pos'], 'phonetic': kk,
            'zh': w['zh'],
            'parts': [
                {
                    'text': (t := p['text'].strip().rstrip('-')),
                    'gloss': gloss_fix.get(f"{w['word']}/{t}", normalize_zh(p['gloss'])),
                }
                for p in v.get('parts', [])
            ],
            'etymology': normalize_zh(v.get('etymology', '')),
            'derivatives': w['derivatives'],
            'example': example,
            'example_zh': zh.get(w['word'], ''),
            'sources': {
                'page': w['page'], 'etymonline': v.get('etymonline_url', ''),
                'ipa': raw_ipa, 'ipaSource': 'Wiktionary',
                'phoneticNote': 'KK 自 US IPA 轉寫（skill 附錄 B 對照）',
                'example': 'photo',
            },
        }
        if v.get('notes'):
            entry['sources']['rootNote'] = normalize_zh(v['notes'])
        if rest:
            entry['sources']['extraExamples'] = rest
        by_group.setdefault(w['group'], []).append(entry)

    if kk_review:
        print(f'\nKK 轉寫需人工確認（{len(kk_review)}）：')
        for r in kk_review:
            print('  ', r)

    # chip 上的字義要短。worker 有時會把整段說明塞進 gloss，那在卡片上會爆版，
    # 該說明本來就該寫在 etymology／notes 裡。
    long_gloss = [
        (e['word'], p['text'], p['gloss'])
        for items in by_group.values()
        for e in items
        for p in e['parts']
        if len(p['gloss']) > GLOSS_MAX
    ]
    if long_gloss:
        print(f'\nchip 字義過長（超過 {GLOSS_MAX} 字，需主 agent 縮寫）：')
        for w, t, g in long_gloss:
            print(f'   {w} / {t}：{g}')

    print()
    for g, n in GROUPS:
        items = by_group.get(g, [])
        print(f'  {n:02d}-{g}: {len(items)} 字')
        if write and items:
            os.makedirs(OUT_DIR, exist_ok=True)
            dest = os.path.join(OUT_DIR, f'{n:02d}-{g}.json')
            with open(dest, 'w', encoding='utf-8') as f:
                json.dump(items, f, ensure_ascii=False, indent=2)
                f.write('\n')
    if write:
        print(f'\nwrote -> {OUT_DIR}')


if __name__ == '__main__':
    main()
