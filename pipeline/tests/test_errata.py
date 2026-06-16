# -*- coding: utf-8 -*-
"""Errata helper functions — normalization, subject detection, column mapping,
and the keyword regexes that decide whether an answer is 送分 / 更正 / 維持."""
from tcmpipe import errata as err


def test_norm_folds_fullwidth_letters_and_parens():
    # PDFs encode option letters as full-width Ｃ / fancy brackets — must normalize
    assert err._norm('（Ｃ）') == '(C)'
    assert err.LETTER_RE.findall(err._norm('（Ａ）（Ｃ）')) == ['A', 'C']


def test_letter_re_matches_bracket_variants():
    assert err.LETTER_RE.findall('【B】') == ['B']
    assert err.LETTER_RE.findall('[D]') == ['D']


def test_subject_code():
    assert err._subject_code('化學') == 'chemistry'
    assert err._subject_code('生物學') == 'biology'
    assert err._subject_code('國文') == 'chinese'
    assert err._subject_code('英文') == 'english'
    assert err._subject_code('無關文字') is None


def test_classify_columns_standard_header():
    header = ['科目', '題號', '釋疑答覆', '釋疑結果']
    assert err._classify_columns(header) == {'subject': 0, 'qnum': 1, 'reason': 2, 'result': 3}


def test_classify_columns_variant_keywords():
    # alternate header wording (考科 for 科目, 結果 for 釋疑結果) still classifies
    header = ['考科', '題號', '釋疑答覆', '結果']
    cols = err._classify_columns(header)
    assert cols['subject'] == 0 and cols['qnum'] == 1 and cols['result'] == 3


def test_classify_columns_handles_internal_spaces():
    # spaced headers (PDF table cells sometimes render '題 號' / '科 目') must still match
    header = ['科 目', '題 號', '釋疑答覆', '釋疑結果']
    assert err._classify_columns(header) == {'subject': 0, 'qnum': 1, 'reason': 2, 'result': 3}


def test_classify_row_award():
    award, changed, _ = err._classify_row('送分', '本題一律給分')
    assert award is True and changed is False


def test_classify_row_change_from_result_column():
    award, changed, letters = err._classify_row('答案更正為(C)', '經查選項…')
    assert changed is True and letters == ['C']


def test_classify_row_ignores_change_verb_in_reason_only():
    # 改為 only in the reason prose (hypothetical) → NOT an auto-change (stays card answer)
    _, changed, letters = err._classify_row('(B)', '若改為 C 則亦可')
    assert changed is False and letters == ['B']


def test_classify_row_keep_suppresses_change():
    _, changed, _ = err._classify_row('更正為(C)', '經討論維持原答案')
    assert changed is False


def test_classify_row_letters_prefer_result_cell():
    _, _, letters = err._classify_row('(A)', '(B)')
    assert letters == ['A']


def test_award_keywords():
    assert err.AWARD_RE.search('本題送分')
    assert err.AWARD_RE.search('一律給分')
    assert not err.AWARD_RE.search('維持原答案')


def test_change_and_keep_keywords():
    assert err.CHANGE_RE.search('答案更正為(C)')
    assert err.KEEP_RE.search('維持原答案')
    assert err.KEEP_RE.search('無須修正')
