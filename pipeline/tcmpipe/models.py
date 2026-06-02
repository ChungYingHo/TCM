#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Pydantic schema — mirror of src/models/question.ts (the website's TS type)."""
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


class Option(BaseModel):
    letter: str                      # 'A'..'E'
    text: str = ''                   # may be empty (chemistry: rely on image)


class QuestionRecord(BaseModel):
    id: str                          # `${school}-${year}-${subject}-${num}`
    school: str                      # 'CMU' | 'ISU' | 'TCU'  (isolation key = shard)
    year: int
    subject: str                     # 'chemistry' | 'chinese' | 'biology' | 'english'
    question_number: int
    question_image_url: str          # faithful display crop (incl. diagrams)
    question_text: str = ''          # extracted stem (search / tagging)
    options: list[Option] = Field(default_factory=list)
    correct_answer: list[str] = Field(default_factory=list)   # POST-errata
    original_answer: list[str] = Field(default_factory=list)  # pre-errata (answer sheet)
    errata_applied: bool = False
    errata_reason_image_url: Optional[str] = None
    award_all: bool = False          # 送分 / 一律給分
    concept_tags: list[str] = Field(default_factory=list)     # non-critical
    explanation: Optional[str] = None                         # from errata reasoning
    source_pdf: str = ''
    source_answer_pdf: str = ''
    needs_review: bool = False
    image_w: int = 0
    image_h: int = 0


class SchoolShard(BaseModel):
    school: str
    generated_at: str
    schema_version: int = 1
    questions: list[QuestionRecord]
