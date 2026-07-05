# -*- coding: utf-8 -*-
"""Guards against wrong-question explanation drafts (the 2026-06 CMU-115-biology
incident: a whole exam's AI drafts were written against the wrong questions and
went unnoticed for weeks because explanations key by positional id with no content
binding). The pure tests pin the detector; the data-contract test fails if any
committed exam cohort ever again looks wholesale-misassigned."""
import json
import os

import pytest

from tcmpipe import alignment as al
from tcmpipe import config as C

_EXOSOME = {
    'id': 'X', 'question_text': '外泌體源自多囊內體攜帶miRNA進行細胞間長距離訊息傳遞',
    'options': [{'letter': 'A', 'text': '作為細胞間訊息傳遞的載體'}],
}


def test_matching_explanation_scores_high():
    df = al.document_freq([_EXOSOME])
    coef = al.overlap_coef(al.question_text(_EXOSOME),
                           '外泌體是多囊內體釋出的囊泡,攜帶miRNA做細胞間訊息傳遞', df, 1)
    assert coef is not None and coef > 0.4


def test_wrong_topic_explanation_scores_near_zero():
    # the actual CMU-115-biology-14 failure: an exosome question, a histone answer
    df = al.document_freq([_EXOSOME])
    coef = al.overlap_coef(al.question_text(_EXOSOME),
                           'H1組蛋白結合核小體之間的DNA將染色質壓縮為30nm纖維', df, 1)
    assert coef is not None and coef < al.LOW_COEF


def test_too_few_anchors_returns_none():
    # a question with fewer than MIN_ANCHORS distinctive terms can't be judged
    q = {'id': 'X', 'question_text': '甲乙', 'options': [{'letter': 'A', 'text': '丙'}]}
    assert al.overlap_coef(al.question_text(q), '任何詳解', al.document_freq([q]), 1) is None


def test_wholesale_detector_fires_only_on_high_rate():
    # 90% (real break) flagged; 49% (calc-chemistry false-positive baseline) is not
    rates = {'CMU-115-biology': (45, 50), 'CMU-109-chemistry': (23, 47),
             'TCU-110-english': (7, 35), 'tiny': (9, 9)}
    bad = {c for c, _f, _t in al.wholesale_misassigned_cohorts(rates)}
    assert bad == {'CMU-115-biology'}


def test_no_wholesale_misassigned_cohort_in_committed_data():
    """The regression gate: run against the real committed questions + explanations."""
    questions, solutions = al.load_committed()
    if not questions or not solutions:
        pytest.skip('committed data shards / explanation cache not present')
    _, rates = al.scan(questions, solutions)
    bad = al.wholesale_misassigned_cohorts(rates)
    assert not bad, f'wrong-question explanation batch(es) detected: {bad}'
