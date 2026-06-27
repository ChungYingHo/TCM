import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createJsonStore } from '@/utils/localStore'

beforeEach(() => localStorage.clear())

describe('createJsonStore', () => {
  it('reads back what it writes and persists to localStorage', () => {
    const s = createJsonStore<Record<string, number>>('k.rw')
    s.write({ a: 1 })
    expect(s.read()).toEqual({ a: 1 })
    expect(JSON.parse(localStorage.getItem('k.rw')!)).toEqual({ a: 1 })
  })

  it('returns the fallback for a missing key', () => {
    const s = createJsonStore<Record<string, number>>('k.missing')
    expect(s.read()).toEqual({})
    const s2 = createJsonStore<{ n: number }>('k.fallback', () => ({ n: 7 }))
    expect(s2.read()).toEqual({ n: 7 })
  })

  it('falls back on corrupt JSON instead of throwing', () => {
    localStorage.setItem('k.corrupt', '{not json')
    const s = createJsonStore<Record<string, number>>('k.corrupt')
    expect(s.read()).toEqual({})
  })

  it('falls back when stored value is not an object', () => {
    localStorage.setItem('k.scalar', '42')
    const s = createJsonStore<Record<string, number>>('k.scalar')
    expect(s.read()).toEqual({})
  })

  it('invalidates the cache when the key is removed externally', () => {
    const s = createJsonStore<Record<string, number>>('k.cache')
    s.write({ a: 1 })
    expect(s.read()).toEqual({ a: 1 })
    localStorage.clear() // external removal (e.g. another tab / reset)
    expect(s.read()).toEqual({})
  })

  it('fires tcm:statechange on write, but not on a silent write', () => {
    const s = createJsonStore<Record<string, number>>('k.event')
    const spy = vi.fn()
    window.addEventListener('tcm:statechange', spy)
    s.write({ a: 1 })
    expect(spy).toHaveBeenCalledTimes(1)
    s.write({ a: 2 }, true)
    expect(spy).toHaveBeenCalledTimes(1)
    window.removeEventListener('tcm:statechange', spy)
  })
})
