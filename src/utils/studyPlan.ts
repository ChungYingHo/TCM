// Compute "today's study plan" from the schedule ORDERING + the user's actual cursor.
// Pure + shared by the daily page, the home dashboard, and the progress-summary API,
// so all three agree on what today is and whether you're on pace.
import type { DailyPlanStore, Attempt } from '@/models/progress'
import type { Subject } from '@/models/question'
import { SUBJECTS } from '@/models/question'
import { deriveCursors } from '@/utils/studyCursor'
import { ymd, parseYmd, dayDiff, dayType, fullStudyDays, isTaper, isMockDay, type DayType, type Rhythm } from '@/utils/date'

export interface ScheduleData {
  range: { start: string; end: string; days: number }
  examDate: string
  examWindow?: string
  perDay: {
    notesPerSubject: number
    quiz: number
    quizDrill?: number // drill-phase quiz size (defaults to `quiz` when absent)
    quizWeak?: number // of quizDrill, how many target the user's weakest tags (default 0)
    quizMock?: number // timed-block size on a ~monthly mock day (default = quizDrill)
    newVocab: number
    reviewVocabMax: number
    reviewVocabTarget?: number // daily review size; due first, random learned words fill up
  }
  rhythm: Rhythm
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
  dayType: DayType
  taper: boolean
  daysToExam: number
  phase: PlanPhase
  mock: boolean // ~monthly timed-block day (drill phase only)
  notes: PlanNote[]
  quizIds: string[]
  quizWeakCount: number // how many of quizIds were drawn from the user's weakest tags
  newVocabIds: string[]
  classicId: string | null
  pace: { vocabDone: number; vocabExpected: number; aheadDays: number }
}

const DAY_MS = 86_400_000
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
  for (const id of ids) (buckets[id.slice(0, 3)] ?? extra).push(id)
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
  const { tracks, perDay, rhythm, range, examDate } = schedule
  const noteLens = Object.fromEntries(SUBJECTS.map((s) => [s, (tracks.notes[s] || []).length]))
  const cur = deriveCursors(plan, perDay.newVocab, today, noteLens, rhythm, range.start) // cursor BEFORE today
  const inRange = today >= range.start && today <= range.end
  const tdy = dayType(today, range.start, rhythm)
  // Review days (weekly light day / weekend / rest) re-read notes you've ALREADY finished —
  // you can only review what you've actually read. Full days advance to the next new note.
  const reviewDay = tdy === 'light' || tdy === 'rest'
  const reviewSeed = Math.abs(dayDiff(range.start, today)) // rotates the reviewed note day to day

  // One note per subject. Full day = the next note from the cursor (forward progress).
  // Review day = a note already finished (rotated by date), or nothing for a subject with none
  // finished yet. Round 1 = deep read; a re-read (round ≥2) OR any review-day note is
  // test-then-read — 3 retrieval questions first, so it's active recall not passive re-reading.
  const notes: PlanNote[] = SUBJECTS.map((s, si) => {
    const list = tracks.notes[s] || []
    if (!list.length) return null
    const read = Math.min(cur.notes[s], list.length) // # distinct notes finished in this subject
    if (reviewDay && read === 0) return null // nothing finished yet → nothing to review here
    const idx = reviewDay ? (reviewSeed + si) % read : cur.notes[s] % list.length
    const slug = list[idx]
    const tag = schedule.noteTags[slug] || ''
    const round = Math.floor(cur.notes[s] / list.length) + 1
    const miniQuizIds =
      reviewDay || round > 1 ? rotatePick(schoolInterleave(schedule.quizPoolByTag[tag] || []), 3, idx) : []
    return { subject: s, slug, tag, round, miniQuizIds }
  }).filter((n): n is PlanNote => n !== null)

  // Phase: learn = some subject is still on its first note pass; drill = all done.
  const drillTrack = tracks.drill || []
  const firstPassDone = SUBJECTS.every((s) => !noteLens[s] || cur.notes[s] >= noteLens[s])
  const phase: PlanPhase = firstPassDone && drillTrack.length ? 'drill' : 'learn'
  const mock = phase === 'drill' && isMockDay(today, range.start, rhythm)

  // Today's quiz —
  //  learn phase: questions tagged to today's notes, rotated so repeats bring new items.
  //  drill phase: a sequential window over the bank (newest years first) + a few slots
  //  re-targeted at the user's weakest tags; a ~monthly mock day upgrades the whole
  //  block to a timed quizMock-sized window. Window position is replayed from the
  //  drill-day dates, since mock days consume more of the track than normal days.
  let quizIds: string[]
  let quizWeakCount = 0
  if (phase === 'drill') {
    const total = perDay.quizDrill ?? perDay.quiz
    const mockN = perDay.quizMock ?? total
    const weakN = Math.min(perDay.quizWeak ?? 0, total)
    const seqN = mock ? mockN : total - weakN
    const consumed = cur.drillDates.reduce(
      (a, d) => a + (isMockDay(d, range.start, rhythm) ? mockN : total - weakN),
      0,
    )
    const start = consumed % drillTrack.length
    const window = Array.from({ length: Math.min(seqN, drillTrack.length) }, (_, i) => drillTrack[(start + i) % drillTrack.length])
    // Group the day's window by subject (stable) so passage-group questions (長閱讀/
    // 克漏字, consecutive numbers within a paper) sit next to each other instead of
    // being interleaved with the other three subjects.
    const subjOrder = (id: string) => SUBJECTS.indexOf(id.split('-')[2] as Subject)
    const seq = window.map((id, i) => ({ id, i })).sort((a, b) => subjOrder(a.id) - subjOrder(b.id) || a.i - b.i).map((x) => x.id)
    const weak: string[] = []
    if (!mock && weakN > 0) {
      const taken = new Set(seq)
      // 2 questions from each of the weakest tags; today's note tags (always
      // available) pad the remaining slots when graded history is still thin.
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
    // learn phase: balance across the day's subjects AND the 3 schools. (Previously a
    // contiguous slice of a subject-grouped union → day 1 came out all-chemistry,
    // all-CMU.) Each subject contributes a fair share, school-interleaved within its
    // pool; the per-subject seed rotates so repeats bring fresh questions.
    const per = Math.ceil(perDay.quiz / Math.max(notes.length, 1))
    quizIds = notes.flatMap((n, ni) =>
      rotatePick(schoolInterleave(schedule.quizPoolByTag[n.tag] || []), per, (cur.notes[n.subject] || 0) + ni),
    )
  }

  // Pre-exam taper = review only: stop introducing new words (notes/classics keep
  // cycling, which is itself review). New material is sized to finish by taper start.
  const taper = isTaper(today, examDate, rhythm)
  const newVocabIds = taper ? [] : tracks.vocab.slice(cur.vocab, cur.vocab + perDay.newVocab)
  const classicId = tracks.classics.length ? tracks.classics[cur.classics % tracks.classics.length] : null

  // Pace: where the vocab cursor should be, counting only full study days before today.
  // Capped at the track length so finishing the list never reads as "behind".
  const yesterday = ymd(parseYmd(today) - DAY_MS)
  const expectedDays = inRange && yesterday >= range.start ? fullStudyDays(range.start, yesterday, rhythm) : 0
  const vocabExpected = Math.min(tracks.vocab.length, expectedDays * perDay.newVocab)
  const aheadDays = perDay.newVocab ? Math.round((cur.vocab - vocabExpected) / perDay.newVocab) : 0
  const daysToExam = Math.max(0, Math.round((parseYmd(examDate) - parseYmd(today)) / DAY_MS))

  return {
    date: today,
    inRange,
    dayType: tdy,
    taper,
    daysToExam,
    phase,
    mock,
    notes,
    quizIds,
    quizWeakCount,
    newVocabIds,
    classicId,
    pace: { vocabDone: cur.vocab, vocabExpected, aheadDays },
  }
}
