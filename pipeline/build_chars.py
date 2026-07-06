"""build_chars.py — 產生「查字」用的單字資料 src/data/chars.json。

來源：教育部《重編國語辭典修訂本》，經 g0v 萌典整理成 JSON（dict-revised）。
    授權 CC BY-ND 3.0 臺灣（著作權屬教育部）；依教育部解釋，ND 僅限制改寫「文字本身」，
    不限制格式轉換與後續應用，故可抽取欄位重組成本檔（定義文字一律照抄不改）。
    原始資料：https://github.com/g0v/moedict-data (dict-revised.json.xz)

每個單字條目本身就帶 radical(部首)＋heteronyms[].bopomofo(注音)＋definitions[].def(字義)，
一個來源即可，不需 Unihan。部首字對應 src/models/radicals.ts 的 214 部首。

用法：`cd pipeline && python build_chars.py`
    下載快取放 pipeline/_chars/（gitignored），輸出 src/data/chars.json（committed）。
"""

import json
import lzma
import os
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.join(HERE, "_chars")
XZ_PATH = os.path.join(CACHE_DIR, "dict-revised.json.xz")
OUT_PATH = os.path.join(HERE, "..", "src", "data", "chars.json")
SRC_URL = "https://raw.githubusercontent.com/g0v/moedict-data/master/dict-revised.json.xz"


def download() -> None:
    os.makedirs(CACHE_DIR, exist_ok=True)
    if os.path.exists(XZ_PATH) and os.path.getsize(XZ_PATH) > 1_000_000:
        print(f"cached: {XZ_PATH} ({os.path.getsize(XZ_PATH)} bytes)")
        return
    print(f"downloading {SRC_URL} …")
    req = urllib.request.Request(SRC_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=180) as r, open(XZ_PATH, "wb") as f:
        f.write(r.read())
    print(f"saved: {XZ_PATH} ({os.path.getsize(XZ_PATH)} bytes)")


def is_common_cjk(ch: str) -> bool:
    """CJK 統一表意文字基本區（涵蓋所有常用與大部分次常用字）。"""
    return 0x4E00 <= ord(ch) <= 0x9FFF


def build() -> None:
    with lzma.open(XZ_PATH) as f:
        data = json.load(f)

    out: dict[str, dict] = {}
    for e in data:
        t = e.get("title")
        if not (isinstance(t, str) and len(t) == 1 and is_common_cjk(t)):
            continue
        radical = (e.get("radical") or "").strip()  # 萌典的 radical 尾端帶空格，需 strip
        heteronyms = []
        for h in e.get("heteronyms", []):
            bopomofo = (h.get("bopomofo") or "").strip()
            first_def = ""
            for d in h.get("definitions") or []:
                if d.get("def"):
                    first_def = d["def"].strip()  # 照抄第一條定義，不改寫
                    break
            if bopomofo or first_def:
                heteronyms.append({"b": bopomofo, "d": first_def})
        if radical and heteronyms:
            out[t] = {"r": radical, "h": heteronyms}

    out_path = os.path.normpath(OUT_PATH)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    size = os.path.getsize(out_path)
    print(f"wrote {out_path}: {len(out)} chars, {size} bytes (~{size / 1e6:.2f} MB)")


if __name__ == "__main__":
    download()
    build()
