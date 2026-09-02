#!/usr/bin/env python3
"""把手工撰寫、經 Etymonline 查證的字根字彙來源檔組裝成網站出貨用的 src/data/vocab.json。

來源：pipeline/data/vocab_prefix/*.json（第一部分 依字首）與 pipeline/data/vocab_root/*.json
      （第二部分 依字根）。每組一個檔，檔名前綴數字定序；每字含 parts/etymology/derivatives
      與 sources 出處。兩部分共用同一個字池，每日複習才吃得到。
出貨：src/data/vocab.json（VocabData 形；剝掉 sources、補上 id 與各 exam/tag 預設值）。

原字庫（舊 ECDICT GRE/TOEFL 3240 字）已封存於 src/data/vocab-legacy.json，不由此腳本產生。

用法：python pipeline/build_vocab_prefix.py
"""
import datetime
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC_DIRS = [
    ROOT / "pipeline" / "data" / "vocab_prefix",  # 第一部分 依字首
    ROOT / "pipeline" / "data" / "vocab_root",  # 第二部分 依字根
]
OUT = ROOT / "src" / "data" / "vocab.json"


def main() -> None:
    src = []
    for d in SRC_DIRS:  # 目錄順序＝課本兩大部分的順序
        for f in sorted(d.glob("*.json")):  # 檔名前綴數字＝組內顯示順序
            src.extend(json.loads(f.read_text(encoding="utf-8")))

    # 課本兩大部分會收到同一個字（例如 disclose 既在字首 dis- 也在字根 clud），
    # 但 id 就是 word 本身、也是 SRS 的 key，重複會讓兩張卡的複習紀錄撞在一起。
    # 保留先出現的那筆（＝第一部分字首，通常已經在 Aira 的 SRS 裡有紀錄），
    # 並把捨棄的印出來——不可以靜默丟字。
    seen, unique, dropped = {}, [], []
    for e in src:
        if e["word"] in seen:
            dropped.append(f'   {e["word"]}: 保留 {seen[e["word"]]} 組，捨棄 {e["prefixId"]} 組的重複條目')
        else:
            seen[e["word"]] = e["prefixId"]
            unique.append(e)
    if dropped:
        print(f"兩部分重複、已保留先出現者（{len(dropped)}）：")
        print("\n".join(dropped))
    src = unique

    words = []
    for e in src:
        words.append(
            {
                "id": e["word"],  # 字串本身＝穩定 SRS key
                "word": e["word"],
                "phonetic": e.get("phonetic", ""),  # KK
                "zh": e.get("zh", ""),
                "pos": e.get("pos", ""),
                "tags": [],  # 字根字庫不掛 gre/toefl 標籤
                "frq": 0,
                "examCount": 0,  # 後中命中之後可再回填
                "examCorrect": 0,
                "examIds": [],
                "example": e.get("example", ""),
                "example_zh": e.get("example_zh", ""),
                "draft": bool(e.get("draft", False)),  # 例句取自課本照片者為 False
                "prefixId": e["prefixId"],
                "parts": e["parts"],
                "etymology": e.get("etymology", ""),
                "derivatives": e.get("derivatives", []),
            }
        )
    data = {
        "generated_at": datetime.date.today().isoformat(),
        "count": len(words),
        "withExamples": sum(1 for w in words if w["example"]),
        "words": words,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {len(words)} words -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
