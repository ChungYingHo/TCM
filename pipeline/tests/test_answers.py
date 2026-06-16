# -*- coding: utf-8 -*-
"""Answer-sheet grid parsing — the source of truth for correct answers (rule #4).
PDF-free: exercises the pure text -> {qnum: letter} parsers directly."""
from tcmpipe import answers as ans


def test_pairs_format_cmu_isu():
    # `N L` grid: integer immediately followed by its letter
    assert ans._parse_pairs('1 B 2 A 3 C'.split()) == {1: 'B', 2: 'A', 3: 'C'}


def test_pairs_skips_blank_cells():
    # a number followed by another number = blank cell, must be skipped (not mis-paired)
    assert ans._parse_pairs('1 B 2 3 C'.split()) == {1: 'B', 3: 'C'}


def test_rows_format_tcu():
    # `N N ... L L ...` grid: a run of numbers then an equal run of letters, by position
    assert ans._parse_rows('1 2 3 B A C'.split()) == {1: 'B', 2: 'A', 3: 'C'}


def test_rows_unequal_runs_map_by_min():
    # 3 numbers but only 2 letters -> only the first two map, no IndexError
    assert ans._parse_rows('1 2 3 B A'.split()) == {1: 'B', 2: 'A'}


def test_parse_block_picks_pairs_when_int_letter_dominates():
    assert ans.parse_block('1 B 2 A 3 C') == {1: 'B', 2: 'A', 3: 'C'}


def test_parse_block_picks_rows_when_int_int_dominates():
    assert ans.parse_block('1 2 3 B A C') == {1: 'B', 2: 'A', 3: 'C'}


def test_subject_of_header():
    assert ans._subject_of_header('化學試題參考答案') == 'chemistry'
    assert ans._subject_of_header('國文科答案') == 'chinese'
    assert ans._subject_of_header('生物學參考答案') == 'biology'
    assert ans._subject_of_header('沒有科目字樣') is None


def test_split_combined_splits_by_subject_header():
    text = '化學試題參考答案\n1 B 2 A\n國文科答案\n1 C 2 D'
    split = ans._split_combined(text)
    assert split['chemistry'] == {1: 'B', 2: 'A'}
    assert split['chinese'] == {1: 'C', 2: 'D'}
