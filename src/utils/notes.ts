// Personal notes — free-text jottings filed under a concept tag (optionally tied
// to a question). Persisted in localStorage (cached) + the Vercel DB via cloud.ts.
import type { PersonalNote } from '@/models/progress'

const KEY = 'tcm.notes.v1'

function read(): PersonalNote[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function write(list: PersonalNote[], silent = false): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(list))
  if (!silent && typeof window !== 'undefined') window.dispatchEvent(new Event('tcm:statechange'))
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function addNote(tag: string, questionId: string, text: string): PersonalNote {
  const note: PersonalNote = { id: uid(), tag, questionId, text: text.trim(), ts: Date.now() }
  const list = read()
  list.push(note)
  write(list)
  return note
}

export function updateNote(id: string, text: string): void {
  const list = read()
  const n = list.find((x) => x.id === id)
  if (n) { n.text = text.trim(); n.ts = Date.now(); write(list) }
}

export function deleteNote(id: string): void {
  write(read().filter((n) => n.id !== id))
}

export function notesByTag(tag: string): PersonalNote[] {
  return read().filter((n) => n.tag === tag).sort((a, b) => b.ts - a.ts)
}

export function notesByQuestion(questionId: string): PersonalNote[] {
  return read().filter((n) => n.questionId === questionId).sort((a, b) => b.ts - a.ts)
}

/** Raw snapshot / restore — used by the cloud layer. */
export function dumpNotes(): PersonalNote[] {
  return read()
}
export function replaceNotes(list: PersonalNote[]): void {
  write(Array.isArray(list) ? list : [], true)
}
