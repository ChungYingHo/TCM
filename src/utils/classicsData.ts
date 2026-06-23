import type { ClassicsData } from '@/models/classics'

let cache: Promise<ClassicsData> | null = null

export function loadClassics(): Promise<ClassicsData> {
  if (!cache) {
    cache = import('@/data/classics.json').then((m) => m.default as ClassicsData)
    cache.catch(() => (cache = null))
  }
  return cache
}
