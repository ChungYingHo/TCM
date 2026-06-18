// Read-only learning summary, so ANY later session (not necessarily this one) can
// pull it and adjust the schedule. Self-authenticates with the site password via the
// `x-tcm-key` header (or ?key=) so it can live on the public-paths allowlist and be
// curl-ed headlessly:  curl -H "x-tcm-key: $SITE_PASSWORD" <site>/api/progress-summary
import type { APIRoute } from 'astro'
import type { SyncState } from '@/models/progress'
import type { QuestionRecord, Subject } from '@/models/question'
import { kvEnabled, kvGet } from '@/utils/kv'
import { checkPassword } from '@/utils/authToken'
import { todayKey } from '@/utils/date'
import { deriveCursors } from '@/utils/studyCursor'
import { computeToday, type ScheduleData } from '@/utils/studyPlan'
import scheduleJson from '@/data/schedule.json'
import vocabJson from '@/data/vocab.json'
import classicsJson from '@/data/classics.json'
import CMU from '@/data/CMU.json'
import ISU from '@/data/ISU.json'
import TCU from '@/data/TCU.json'

export const prerender = false

const KEY = 'tcm:state:v1'
const schedule = scheduleJson as unknown as ScheduleData
const vocabCount = (vocabJson as { count: number }).count
const classicsCount = (classicsJson as { count: number }).count

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), { status, headers: { 'content-type': 'application/json' } })

// id -> { subject, tags } for weak-tag attribution (server-side only, shards not shipped here)
const QMAP = new Map<string, { subject: Subject; tags: string[] }>()
for (const shard of [CMU, ISU, TCU] as unknown as { questions: QuestionRecord[] }[]) {
  for (const q of shard.questions) QMAP.set(q.id, { subject: q.subject, tags: q.concept_tags })
}

function authed(request: Request): boolean {
  const key = request.headers.get('x-tcm-key') || new URL(request.url).searchParams.get('key') || ''
  return checkPassword(key)
}

export const GET: APIRoute = async ({ request }) => {
  if (!authed(request)) return json({ error: 'unauthorized', hint: 'send x-tcm-key: <SITE_PASSWORD>' }, 401)

  let state: Partial<SyncState> = {}
  if (kvEnabled()) {
    try {
      const raw = await kvGet(KEY)
      if (raw) state = JSON.parse(raw) as SyncState
    } catch {
      return json({ error: 'kv_unavailable' }, 502)
    }
  }

  const plan = state.plan ?? {}
  const wrongbook = state.wrongbook ?? {}
  const progress = state.progress ?? {}
  const vocabSrs = state.vocabSrs ?? {}
  const streak = state.streak ?? { count: 0, best: 0, lastDay: '' }

  const now = Date.now()
  const today = new URL(request.url).searchParams.get('today') || todayKey(now)
  const tp = computeToday(schedule, plan, today)
  const total = deriveCursors(plan, schedule.perDay.newVocab)

  // accuracy
  let attempted = 0
  let correct = 0
  for (const a of Object.values(progress)) {
    if (a.attempts > 0) attempted += 1
    if (a.correct > 0) correct += 1
  }

  // wrong-book: size + due now
  const wrongEntries = Object.values(wrongbook)
  const dueWrong = wrongEntries.filter((e) => (e.due ?? e.lastWrongAt) <= now).length

  // vocab SRS: due now
  const dueVocab = Object.values(vocabSrs).filter((c) => c.due <= now).length

  // weak tags by wrong count
  const tagAgg = new Map<string, { subject: Subject; wrong: number; qs: Set<string> }>()
  for (const e of wrongEntries) {
    const q = QMAP.get(e.id)
    if (!q) continue
    for (const tag of q.tags) {
      const cur = tagAgg.get(tag) ?? { subject: q.subject, wrong: 0, qs: new Set<string>() }
      cur.wrong += e.wrongCount
      cur.qs.add(e.id)
      tagAgg.set(tag, cur)
    }
  }
  const weakTags = [...tagAgg.entries()]
    .map(([tag, v]) => ({ tag, subject: v.subject, wrongCount: v.wrong, questions: v.qs.size }))
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, 8)

  // recent activity: last 14 dates present in the plan, # sections done each
  const recent = Object.keys(plan)
    .filter((d) => d <= today)
    .sort()
    .slice(-14)
    .map((d) => {
      const s = plan[d]
      const notesDone = s.notes ? Object.values(s.notes).filter(Boolean).length : 0
      const flags = ['quiz', 'newVocab', 'reviewVocab', 'classic', 'elementQuiz', 'wrong', 'rest'] as const
      const done = notesDone + flags.filter((f) => s[f]).length
      return { date: d, done }
    })

  const notesProgress = Object.fromEntries(
    (Object.keys(schedule.tracks.notes) as Subject[]).map((s) => [
      s,
      { done: total.notes[s] ?? 0, total: schedule.tracks.notes[s].length },
    ]),
  )

  return json({
    asOf: today,
    exam: { date: schedule.examDate, daysLeft: tp.daysToExam, window: schedule.examWindow ?? null },
    dayType: tp.dayType,
    taper: tp.taper,
    streak: { count: streak.count, best: streak.best },
    vocab: {
      learned: total.vocab,
      total: vocabCount,
      left: tp.pace.vocabLeft,
      neededPerDay: tp.pace.neededPerDay,
      dailyQuota: tp.pace.perDay,
      onTrack: tp.pace.onTrack,
      srsTracked: Object.keys(vocabSrs).length,
      dueNow: dueVocab,
    },
    notes: notesProgress,
    classics: { read: total.classics, total: classicsCount },
    questions: { attempted, correct, accuracyPct: attempted ? Math.round((correct / attempted) * 100) : 0 },
    wrongbook: { size: wrongEntries.length, dueNow: dueWrong },
    weakTags,
    recentDays: recent,
    todayPreview: {
      notes: tp.notes.map((n) => ({ subject: n.subject, tag: n.tag })),
      newVocabCount: tp.newVocabIds.length,
      quizCount: tp.quizIds.length,
      classicId: tp.classicId,
    },
  })
}
