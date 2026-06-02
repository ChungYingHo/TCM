import type { School, Subject } from '@/models/question'

export interface QueryFilter {
  schools: School[]
  years: number[]
  subjects: Subject[]
  tags: string[]
}

export const EMPTY_FILTER: QueryFilter = {
  schools: [],
  years: [],
  subjects: [],
  tags: [],
}
