#!/usr/bin/env python3
"""把手工撰寫、經 Etymonline 查證的字根字彙來源檔組裝成網站出貨用的 src/data/vocab.json。

來源：pipeline/data/vocab_prefix/*.json（每組字首一個檔，檔名前綴數字定序；每字含
      parts/etymology/derivatives 與 sources 出處）。
出貨：src/data/vocab.json（VocabData 形；剝掉 sources、補上 id 與各 exam/tag 預設值）。

原字庫（舊 ECDICT GRE/TOEFL 3240 字）已封存於 src/data/vocab-legacy.json，不由此腳本產生。

用法：python pipeline/build_vocab_prefix.py
"""
import datetime
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "pipeline" / "data" / "vocab_prefix"
OUT = ROOT / "src" / "data" / "vocab.json"


def main() -> None:
    src = []
    for f in sorted(SRC_DIR.glob("*.json")):  # 檔名前綴數字＝字首顯示順序
        src.extend(json.loads(f.read_text(encoding="utf-8")))
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
