import { describe, it, expect } from 'vitest'
import { needsPassageContext, earlierImageUrl } from '@/utils/passageContext'

describe('needsPassageContext', () => {
  it('flags cloze/reading tags and 依據X文 stems', () => {
    expect(needsPassageContext({ question_text: '', concept_tags: ['克漏字'], question_number: 12 })).toBe(true)
    expect(needsPassageContext({ question_text: 'Which is correct?', concept_tags: ['閱讀測驗'], question_number: 32 })).toBe(true)
    expect(needsPassageContext({ question_text: '依據乙文，下列敘述最不適當的是：', concept_tags: ['閱讀理解綜合'], question_number: 41 })).toBe(true)
    expect(needsPassageContext({ question_text: '承上題，下列何者正確？', concept_tags: [], question_number: 8 })).toBe(true)
  })

  it('stays quiet for self-contained questions and the first question of a paper', () => {
    expect(needsPassageContext({ question_text: '下列「」內字音相同的是：', concept_tags: ['字音字形'], question_number: 3 })).toBe(false)
    expect(needsPassageContext({ question_text: '依據上文，……', concept_tags: ['克漏字'], question_number: 1 })).toBe(false)
  })
})

describe('earlierImageUrl', () => {
  const q = { question_image_url: '/q/CMU/113/chinese/41.webp', question_number: 41 }
  it('steps back through the same paper and stops at question 1', () => {
    expect(earlierImageUrl(q, 1)).toBe('/q/CMU/113/chinese/40.webp')
    expect(earlierImageUrl(q, 2)).toBe('/q/CMU/113/chinese/39.webp')
    expect(earlierImageUrl(q, 41)).toBeNull()
  })
})
