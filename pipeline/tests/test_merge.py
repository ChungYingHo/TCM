# -*- coding: utf-8 -*-
"""build._merge_one — the card + errata -> QuestionRecord merge. This is where
answer correctness is decided (rule #4: answers come ONLY from card + errata),
so its contract is pinned here. Image writing + tagging are stubbed so the merge
logic is tested in isolation (no PDFs, no file I/O)."""
from types import SimpleNamespace

import pytest

from tcmpipe import build
from tcmpipe.errata import Errata


def _ex(num=1, letters='ABCD'):
    return SimpleNamespace(
        num=num, stem='題幹',
        options=[{'letter': L, 'text': f'opt{L}'} for L in letters],
        image_bytes=b'', image_w=10, image_h=10,
    )


@pytest.fixture(autouse=True)
def _no_side_effects(monkeypatch):
    monkeypatch.setattr(build, '_write_image', lambda *a, **k: 'img.webp')
    monkeypatch.setattr(build.tg, 'assign_tags', lambda *a, **k: [])


def test_no_errata_uses_card_answer():
    rec = build._merge_one('CMU', 110, 'chemistry', _ex(), {1: 'B'}, 'src.pdf', None)
    assert rec.correct_answer == ['B']
    assert rec.original_answer == ['B']
    assert rec.errata_applied is False
    assert rec.award_all is False
    assert rec.needs_review is False


def test_award_all_marks_every_letter_but_preserves_original():
    e = Errata(subject='chemistry', qnum=1, award_all=True)
    rec = build._merge_one('CMU', 110, 'chemistry', _ex(letters='ABCD'), {1: 'B'}, 'src.pdf', e)
    assert rec.award_all is True
    assert rec.errata_applied is True
    assert set(rec.correct_answer) == set('ABCD')
    assert rec.original_answer == ['B']  # 送分 must not lose the original card answer


def test_changed_overrides_answer_preserving_original():
    e = Errata(subject='chemistry', qnum=1, changed=True, letters=['C'])
    rec = build._merge_one('CMU', 110, 'chemistry', _ex(), {1: 'B'}, 'src.pdf', e)
    assert rec.correct_answer == ['C']
    assert rec.original_answer == ['B']  # original preserved even when corrected
    assert rec.errata_applied is True


def test_official_letter_when_card_lacked_answer():
    e = Errata(subject='chemistry', qnum=1, letters=['D'])
    rec = build._merge_one('CMU', 110, 'chemistry', _ex(), {}, 'src.pdf', e)
    assert rec.correct_answer == ['D']
    assert rec.original_answer == []


def test_keep_result_but_letter_disagrees_flags_without_changing():
    e = Errata(subject='chemistry', qnum=1, changed=False, letters=['C'])
    rec = build._merge_one('CMU', 110, 'chemistry', _ex(), {1: 'B'}, 'src.pdf', e)
    assert rec.correct_answer == ['B']  # answer NOT changed on a mere disagreement
    assert rec.needs_review is True


def test_keep_result_multi_letter_disagreement_flags_even_when_first_letter_matches():
    # errata lists [B, C] but the card says B; first-letter-only comparison missed this —
    # set comparison catches it. Answer stays the card's (only flagged for review).
    e = Errata(subject='chemistry', qnum=1, changed=False, letters=['B', 'C'])
    rec = build._merge_one('CMU', 110, 'chemistry', _ex(), {1: 'B'}, 'src.pdf', e)
    assert rec.needs_review is True
    assert rec.correct_answer == ['B']


def test_keep_result_matching_letter_does_not_flag():
    e = Errata(subject='chemistry', qnum=1, changed=False, letters=['B'])
    rec = build._merge_one('CMU', 110, 'chemistry', _ex(), {1: 'B'}, 'src.pdf', e)
    assert rec.needs_review is False


def test_no_answer_anywhere_flags_needs_review():
    rec = build._merge_one('CMU', 110, 'chemistry', _ex(), {}, 'src.pdf', None)
    assert rec.correct_answer == []
    assert rec.needs_review is True


# _ensure_answer_selectable: every correct letter must be a clickable option.
# This is the mechanism that handles E answers whose 5th option is image-only.

def test_ensure_selectable_pads_options_up_to_an_E_answer():
    # card answer is E but only A–D options were extracted (the 5th is image-only):
    # options must grow to A–E so the E answer is actually selectable in the UI.
    rec = build._merge_one('CMU', 110, 'chemistry', _ex(letters='ABCD'), {1: 'E'}, 'src.pdf', None)
    assert rec.correct_answer == ['E']
    build._ensure_answer_selectable(rec)
    assert [o.letter for o in rec.options] == ['A', 'B', 'C', 'D', 'E']
    assert rec.options[-1].text == ''  # padded E carries no text (the image is the source of truth)


def test_ensure_selectable_is_a_noop_when_answer_is_within_options():
    rec = build._merge_one('CMU', 110, 'chemistry', _ex(letters='ABCD'), {1: 'B'}, 'src.pdf', None)
    build._ensure_answer_selectable(rec)
    assert [o.letter for o in rec.options] == ['A', 'B', 'C', 'D']


def test_ensure_selectable_skips_award_all():
    # 送分: the UI credits ANY rendered option (score.isChoiceCorrect short-circuits on
    # award_all), so we must NOT invent a blank E on a genuine 4-option question — that
    # would render an empty 5th button. Options stay exactly as extracted.
    e = Errata(subject='chemistry', qnum=1, award_all=True)
    rec = build._merge_one('CMU', 110, 'chemistry', _ex(letters='ABCD'), {1: 'B'}, 'src.pdf', e)
    build._ensure_answer_selectable(rec)
    assert [o.letter for o in rec.options] == ['A', 'B', 'C', 'D']
