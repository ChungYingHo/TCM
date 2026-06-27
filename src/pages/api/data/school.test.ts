import { describe, expect, it } from 'vitest'
import { GET } from '@/pages/api/data/[school]'

const get = (school: string) => GET({ params: { school } } as never)

describe('GET /api/data/[school]', () => {
  it('returns the matching school shard for a known code', async () => {
    const res = await get('CMU')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.school).toBeTruthy()
    expect(Array.isArray(body.questions)).toBe(true)
    expect(body.questions.length).toBeGreaterThan(0)
  })

  it('404s an unknown school instead of touching the filesystem (no traversal)', async () => {
    for (const bad of ['XYZ', '../CMU', '__proto__', '']) {
      const res = await get(bad)
      expect(res.status, bad).toBe(404)
      expect(await res.json(), bad).toEqual({ error: 'unknown school' })
    }
  })

  it('strips heavy server-only fields from the payload', async () => {
    const body = await (await get('ISU')).json()
    const q = body.questions[0]
    for (const k of ['ocr_text', 'source_pdf', 'source_answer_pdf', 'errata_reason_image_url']) {
      expect(q, k).not.toHaveProperty(k)
    }
  })

  it('serves private, cacheable JSON', async () => {
    const res = await get('TCU')
    expect(res.headers.get('content-type')).toContain('application/json')
    expect(res.headers.get('cache-control')).toContain('private')
  })
})
