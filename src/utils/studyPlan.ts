// Compute "today's study plan" from the schedule ORDERING + the user's actual cursor.
// Pure + shared by the daily page, the home dashboard, and the progress-summary API,
// so all three agree on what today is and whether you're on pace.
//
// The plan is a ROLLING sequence consumed at the user's real pace (cursor-driven), not a
// calendar with pre-assigned dates. Each STUDY day (weekday) advances one subject PAIR
// (e.g. 生物+英文, then 化學+國文) so the daily note load is light; WEEKENDS are buffer days
// for catching up (or resting). 單字/古文 run every non-taper day. The exam date is the only
// real deadline — it drives the pre-exam taper and the "will I finish in time?" pace.
import type { DailyPlanStore, Attempt } from '@/models/progress'
import type { Subject } from '@/models/question'
import { SUBJECTS } from '@/models/question'
import { deriveCursors } from '@/utils/studyCursor'
import { dayDiff, dayType, isTaper, TAPER_DAYS, type DayType } from '@/utils/date'
import { parseQuestionId, schoolOf } from '@/utils/questionId'

export interface ScheduleData {
  examDate: string
  examWindow?: string
  horizonDays?: number // nominal rolling length (a sizing hint for gen_schedule; not enforced)
  perDay: {
    notesPerSubject: number
    quiz: number
    quizDrill?: number // drill-phase quiz size (defaults to `quiz` when absent)
    quizWeak?: number // of quizDrill, how many target the user's weakest tags (default 0)
    newVocab: number
    reviewVocabMax: number
    reviewVocabTarget?: number // daily review size; due first, random learned words fill up
  }
  // Subject pairs rotated one-per-study-day (cursor-driven). Absent → all subjects each day.
  pairs?: Subject[][]
  tracks: { vocab: string[]; notes: Record<Subject, string[]>; classics: string[]; drill?: string[] }
  noteTags: Record<string, string>
  quizPoolByTag: Record<string, string[]>
  reviews: Record<string, { title: string; subject: Subject; covers: string[] }>
}

export interface PlanNote {
  subject: Subject
  slug: string
  tag: string
  round: number // 1-based pass over this subject's note track (1 = first read)
  miniQuizIds: string[] // round ≥2: 3 retrieval questions to answer BEFORE re-reading
}

/** learn = first note pass in progress (quiz targets today's notes);
 *  drill = every subject's first pass done (quiz walks the whole bank sequentially). */
export type PlanPhase = 'learn' | 'drill'

export interface TodayPlan {
  date: string
  inRange: boolean
  dayType: DayType // 'full' (weekday study) | 'weekend' (buffer)
  taper: boolean
  daysToExam: number
  phase: PlanPhase
  notes: PlanNote[]
  quizIds: string[]
  quizWeakCount: number // how many of quizIds were drawn from the user's weakest tags
  newVocabIds: string[]
  classicId: string | null
  // "Will I finish the new-material (vocab) track before the taper?" — rolling pace.
  pace: { vocabDone: number; vocabTotal: number; vocabLeft: number; neededPerDay: number; perDay: number; onTrack: boolean }
}

const MIN_TAG_ATTEMPTS = 6 // need this many graded answers before a tag can count as "weak"
const WEAK_ACCURACY = 0.7 // below this accuracy a tag qualifies for targeted drilling

/** Deterministically pick n items from a list, rotating the window by `seed`. */
function rotatePick(list: string[], n: number, seed: number): string[] {
  if (list.length <= n) return [...list]
  const start = (Math.abs(seed) * n) % list.length
  return Array.from({ length: n }, (_, i) => list[(start + i) % list.length])
}

/** Reorder a tag's pool so any contiguous window spans the 3 schools evenly
 *  (CMU₀, ISU₀, TCU₀, CMU₁, …) — keeps a rotatePick'd quiz school-balanced. */
function schoolInterleave(ids: string[]): string[] {
  const order = ['CMU', 'ISU', 'TCU']
  const buckets: Record<string, string[]> = { CMU: [], ISU: [], TCU: [] }
  const extra: string[] = []
  for (const id of ids) (buckets[schoolOf(id) ?? ''] ?? extra).push(id)
  const max = Math.max(0, ...order.map((s) => buckets[s].length))
  const out: string[] = []
  for (let i = 0; i < max; i++) for (const s of order) if (buckets[s][i] !== undefined) out.push(buckets[s][i])
  return [...out, ...extra]
}

/** Tags ranked weakest-first by the user's own accuracy over that tag's question pool. */
function weakestTags(
  quizPoolByTag: Record<string, string[]>,
  attempts: Record<string, Attempt>,
): string[] {
  const ranked: { tag: string; acc: number }[] = []
  for (const [tag, ids] of Object.entries(quizPoolByTag)) {
    let n = 0
    let correct = 0
    for (const id of ids) {
      const a = attempts[id]
      if (a) {
        n += a.attempts
        correct += a.correct
      }
    }
    if (n >= MIN_TAG_ATTEMPTS && correct / n < WEAK_ACCURACY) ranked.push({ tag, acc: correct / n })
  }
  return ranked.sort((a, b) => a.acc - b.acc).map((r) => r.tag)
}

export function computeToday(
  schedule: ScheduleData,
  plan: DailyPlanStore,
  today: string,
  attempts: Record<string, Attempt> = {},
): TodayPlan {
  const { tracks, perDay, examDate } = schedule
  const noteLens = Object.fromEntries(SUBJECTS.map((s) => [s, (tracks.notes[s] || []).length]))
  const cur = deriveCursors(plan, perDay.newVocab, today, noteLens) // cursor BEFORE today
  const daysToExam = Math.max(0, dayDiff(today, examDate))
  const inRange = today <= examDate
  const tdy = dayType(today) // 'full' weekday | 'weekend' buffer
  const taper = isTaper(today, examDate)

  // Today's subject pair, chosen by how many note-days are already done — so a missed day
  // just repeats the same pair (the sequence rolls forward, never skips a subject's turn).
  const pairs: Subject[][] = schedule.pairs && schedule.pairs.length ? schedule.pairs : [SUBJECTS]
  const activeSubjects = pairs[cur.noteDays % pairs.length]

  // One note per active subject: the next unread (forward progress). Weekends show the same
  // next-unread so they're genuine catch-up. A re-read (round ≥2, after wrapping the track)
  // is test-then-read: 3 retrieval questions first, so it's active recall not passive re-reading.
  const notes: PlanNote[] = activeSubjects
    .map((s) => {
      const list = tracks.notes[s] || []
      if (!list.length) return null
      const idx = cur.notes[s] % list.length
      const slug = list[idx]
      const tag = schedule.noteTags[slug] || ''
      const round = Math.floor(cur.notes[s] / list.length) + 1
      const miniQuizIds =
        round > 1 ? rotatePick(schoolInterleave(schedule.quizPoolByTag[tag] || []), 3, idx) : []
      return { subject: s, slug, tag, round, miniQuizIds }
    })
    .filter((n): n is PlanNote => n !== null)

  // Phase: learn = some subject still on its first note pass; drill = all done.
  const drillTrack = tracks.drill || []
  const firstPassDone = SUBJECTS.every((s) => !noteLens[s] || cur.notes[s] >= noteLens[s])
  const phase: PlanPhase = firstPassDone && drillTrack.length ? 'drill' : 'learn'

  // Today's quiz —
  //  learn phase: questions tagged to today's notes, rotated so repeats bring new items.
  //  drill phase: a sequential window over the bank (newest years first) + a few slots
  //  re-targeted at the user's weakest tags. Window position replays from completed drill days.
  let quizIds: string[]
  let quizWeakCount = 0
  if (phase === 'drill') {
    const total = perDay.quizDrill ?? perDay.quiz
    const weakN = Math.min(perDay.quizWeak ?? 0, total)
    const seqN = total - weakN
    const consumed = cur.drill * seqN
    const start = drillTrack.length ? consumed % drillTrack.length : 0
    const window = Array.from({ length: Math.min(seqN, drillTrack.length) }, (_, i) => drillTrack[(start + i) % drillTrack.length])
    // Group the day's window by subject (stable) so passage-group questions (長閱讀/克漏字,
    // consecutive numbers within a paper) sit next to each other.
    const subjOrder = (id: string) => {
      const p = parseQuestionId(id)
      return p ? SUBJECTS.indexOf(p.subject) : SUBJECTS.length
    }
    const seq = window.map((id, i) => ({ id, i })).sort((a, b) => subjOrder(a.id) - subjOrder(b.id) || a.i - b.i).map((x) => x.id)
    const weak: string[] = []
    if (weakN > 0) {
      const taken = new Set(seq)
      // 2 questions from each weakest tag; today's note tags pad the rest when history is thin.
      const sources = [...new Set([...weakestTags(schedule.quizPoolByTag, attempts), ...notes.map((n) => n.tag)])]
      for (const tag of sources) {
        if (weak.length >= weakN) break
        for (const id of rotatePick(schedule.quizPoolByTag[tag] || [], 2, cur.drill)) {
          if (weak.length < weakN && !taken.has(id)) {
            weak.push(id)
            taken.add(id)
          }
        }
      }
      quizWeakCount = weak.length
    }
    quizIds = [...seq, ...weak]
  } else {
    // learn phase: balance across the day's subjects AND the 3 schools.
    const per = Math.ceil(perDay.quiz / Math.max(notes.length, 1))
    quizIds = notes.flatMap((n, ni) =>
      rotatePick(schoolInterleave(schedule.quizPoolByTag[n.tag] || []), per, (cur.notes[n.subject] || 0) + ni),
    )
  }

  // Pre-exam taper = review only: stop introducing new words (notes/classics keep cycling,
  // which is itself review). New material is sized to finish by taper start.
  const newVocabIds = taper || !inRange ? [] : tracks.vocab.slice(cur.vocab, cur.vocab + perDay.newVocab)
  const classicId = tracks.classics.length ? tracks.classics[cur.classics % tracks.classics.length] : null

  // Pace = "will I finish the new-material (vocab) track before the taper?" Vocab runs EVERY
  // non-taper day (incl. weekends — 單字每天不可斷), so calendar days until taper is the runway.
  // If behind, neededPerDay climbs above the daily quota (treadmill) → the UI nudges to catch up.
  const runway = Math.max(1, daysToExam - TAPER_DAYS)
  const vocabTotal = tracks.vocab.length
  const vocabLeft = Math.max(0, vocabTotal - cur.vocab)
  const neededPerDay = Math.ceil(vocabLeft / runway)
  // During the taper new vocab has stopped (it's review-only) → never nag "需加速".
  const onTrack = taper || neededPerDay <= perDay.newVocab

  return {
    date: today,
    inRange,
    dayType: tdy,
    taper,
    daysToExam,
    phase,
    notes,
    quizIds,
    quizWeakCount,
    newVocabIds,
    classicId,
    pace: { vocabDone: cur.vocab, vocabTotal, vocabLeft, neededPerDay, perDay: perDay.newVocab, onTrack },
  }
}
