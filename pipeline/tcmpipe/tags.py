#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Offline concept tagging from extracted text (deterministic, no LLM).

A controlled per-subject vocabulary maps keyword triggers -> concept tags. This
guarantees the tag filter works without any API dependency and never hallucinates.
An LLM pass can refine these later, but correctness never depends on tags.
"""
from __future__ import annotations

# subject -> list of (tag, [keyword triggers])
TAG_RULES: dict[str, list[tuple[str, list[str]]]] = {
    'biology': [
        ('光合作用', ['光合', 'photosynth', '卡爾文', 'Calvin', '葉綠']),
        ('C4與CAM植物', ['C4', 'CAM', '景天', '維管束鞘', 'PEP']),
        ('細胞呼吸', ['呼吸作用', '糖解', '檸檬酸', '克氏循環', '電子傳遞', 'ATP', '粒線體']),
        ('細胞分裂', ['有絲分裂', '減數分裂', '染色體', '紡錘', 'mitosis', 'meiosis']),
        ('分子遺傳', ['DNA', 'RNA', '轉錄', '轉譯', '複製', '基因表現', 'mRNA']),
        ('遺傳學', ['孟德爾', '顯性', '隱性', '對偶基因', '基因型', '表現型', '遺傳']),
        ('演化', ['演化', '天擇', '物種形成', '達爾文', 'evolution']),
        ('神經系統', ['神經', '動作電位', '突觸', '神經元', '神經傳遞']),
        ('內分泌', ['激素', '荷爾蒙', '內分泌', '腦下垂體', '甲狀腺', '胰島素']),
        ('免疫', ['免疫', '抗體', '抗原', '淋巴', '疫苗', 'T細胞', 'B細胞']),
        ('循環系統', ['心臟', '血液', '循環', '血壓', '動脈', '靜脈']),
        ('酵素', ['酵素', '酶', 'enzyme', '受質', '催化']),
        ('生態學', ['生態', '族群', '群落', '食物鏈', '能量塔', '生物多樣']),
        ('微生物', ['病毒', '細菌', '原核', '質體', '噬菌體']),
        ('植物生理', ['蒸散', '氣孔', '木質部', '韌皮部', '植物激素', '生長素']),
    ],
    'chemistry': [
        ('酸鹼平衡', ['酸鹼', 'pH', 'pKa', '緩衝', '解離', 'Arrhenius', '中和']),
        ('氧化還原', ['氧化', '還原', '氧化數', 'redox', '半反應']),
        ('電化學', ['電池', '電解', '電位', '陽極', '陰極', 'Nernst', '伏特']),
        ('熱力學', ['焓', '熵', '自由能', '熱力學', 'enthalpy', 'entropy', 'ΔG', 'ΔH']),
        ('化學平衡', ['平衡常數', '勒沙特列', 'Le Chatelier', 'Kc', 'Kp', '平衡']),
        ('反應速率', ['速率', '動力學', '活化能', '反應級數', '催化劑']),
        ('有機化學', ['有機', '烷', '烯', '炔', '醇', '醛', '酮', '羧酸', '酯', '苯', '官能基']),
        ('立體化學', ['鏡像', '掌性', '對掌', '立體', 'R/S', '異構物', 'chiral']),
        ('光譜', ['NMR', 'IR', '質譜', '光譜', 'spectr', 'chemical shift']),
        ('氣體', ['理想氣體', '氣體常數', '分壓', '蒸氣壓', 'mmHg', 'atm', 'PV']),
        ('溶液', ['莫耳濃度', '濃度', '溶解', '溶度積', 'Ksp', '滲透壓', '沉澱']),
        ('原子結構', ['電子組態', '軌域', '量子數', '原子', '同位素', '電子']),
        ('週期性', ['週期表', '游離能', '電負度', '原子半徑']),
        ('化學鍵', ['共價', '離子鍵', '氫鍵', '路易斯', '混成', 'VSEPR', '鍵結']),
    ],
    'chinese': [
        ('字音字形', ['字音', '字形', '讀音', '錯別字', '注音']),
        ('字詞義', ['字義', '詞義', '解釋', '意思相同', '用法']),
        ('成語', ['成語', '熟語', '俗諺']),
        ('修辭', ['修辭', '譬喻', '轉化', '映襯', '排比', '誇飾', '對偶']),
        ('文法句構', ['文法', '句型', '詞性', '倒裝', '語法']),
        ('文學常識', ['作者', '著作', '文學', '流派', '體裁', '文體']),
        ('古文閱讀', ['世說新語', '史記', '左傳', '文言', '下列敘述', '根據本文']),
        ('詩詞曲', ['詩', '詞', '曲', '律詩', '絕句', '對仗', '平仄']),
        ('應用文', ['題辭', '對聯', '輓聯', '書信', '柬帖', '公文']),
        ('國學常識', ['四書', '五經', '經史子集', '六書', '部首']),
    ],
    'english': [
        ('字彙', ['vocab', 'word', '_____', '字彙']),
        ('文法', ['grammar', 'tense', 'clause', 'preposition', '文法']),
        ('克漏字', ['cloze', 'passage', 'blank']),
        ('閱讀測驗', ['reading', 'According to', 'passage', 'author', 'paragraph']),
        ('片語慣用', ['idiom', 'phrase', 'phrasal']),
    ],
}

MAX_TAGS = 3


def assign_tags(subject: str, text: str) -> list[str]:
    rules = TAG_RULES.get(subject, [])
    if not text:
        return []
    low = text.lower()
    scored: list[tuple[int, str]] = []
    for tag, kws in rules:
        hits = sum(1 for kw in kws if (kw.lower() in low if kw.isascii() else kw in text))
        if hits:
            scored.append((hits, tag))
    scored.sort(key=lambda s: -s[0])
    return [t for _, t in scored[:MAX_TAGS]]
