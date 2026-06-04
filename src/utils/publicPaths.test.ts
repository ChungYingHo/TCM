import { describe, it, expect } from 'vitest'
import { isPublicPath } from '@/utils/publicPaths'

describe('isPublicPath', () => {
  it('allows the landing page and unlock endpoint', () => {
    expect(isPublicPath('/')).toBe(true)
    expect(isPublicPath('/api/unlock')).toBe(true)
  })

  it('allows static asset prefixes', () => {
    expect(isPublicPath('/_astro/app.abc123.js')).toBe(true)
    expect(isPublicPath('/_image')).toBe(true)
    expect(isPublicPath('/q/CMU/115/q1.webp')).toBe(true)
  })

  it('allows conventional root static files', () => {
    expect(isPublicPath('/favicon.ico')).toBe(true)
    expect(isPublicPath('/robots.txt')).toBe(true)
  })

  it('gates app pages and data/state APIs', () => {
    expect(isPublicPath('/home')).toBe(false)
    expect(isPublicPath('/study')).toBe(false)
    expect(isPublicPath('/notes/atomic-structure')).toBe(false)
    expect(isPublicPath('/api/data/ISU')).toBe(false)
    expect(isPublicPath('/api/state')).toBe(false)
  })

  it('does NOT treat an arbitrary file extension as public (the old bypass)', () => {
    // A gated route that happens to end in an extension must stay gated.
    expect(isPublicPath('/api/data/ISU.json')).toBe(false)
    expect(isPublicPath('/notes/secret.json')).toBe(false)
    expect(isPublicPath('/study.html')).toBe(false)
  })
})
