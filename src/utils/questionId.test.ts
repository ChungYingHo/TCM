import { describe, expect, it, vi } from 'vitest'
import { parseQuestionId, schoolOf } from '@/utils/questionId'

describe('parseQuestionId', () => {
  it('parses a well-formed id', () => {
    expect(parseQuestionId('CMU-104-biology-1')).toEqual({
      school: 'CMU', year: 104, subject: 'biology', number: 1,
    })
    expect(parseQuestionId('TCU-115-chinese-80')).toEqual({
      school: 'TCU', year: 115, subject: 'chinese', number: 80,
    })
  })

  it('returns null for unknown school or subject, or wrong arity', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(parseQuestionId('XXX-104-biology-1')).toBeNull() // bad school
    expect(parseQuestionId('CMU-104-physics-1')).toBeNull() // bad subject
    expect(parseQuestionId('CMU-104-biology')).toBeNull() // too few parts
    expect(parseQuestionId('CMU-abc-biology-1')).toBeNull() // non-numeric year
    vi.restoreAllMocks()
  })

  it('schoolOf extracts the school, null when unparseable', () => {
    expect(schoolOf('ISU-110-english-12')).toBe('ISU')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(schoolOf('nope')).toBeNull()
    vi.restoreAllMocks()
  })
})
