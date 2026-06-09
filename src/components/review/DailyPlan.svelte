<script lang="ts">
  // 今日複習 — the daily study hub. Content is sliced from the schedule ORDERING by
  // the user's actual cursor (deriveCursors), so a busy/sprint day is absorbed rather
  // than desyncing. dayType drives a humane rhythm: a weekly light day reviews only,
  // a rest day just encourages rest — neither breaks the streak.
  import scheduleJson from '@/data/schedule.json'
  import classicsJson from '@/data/classics.json'
  import { onMount } from 'svelte'
  import type { ScheduleData } from '@/utils/studyPlan'
  import { computeToday } from '@/utils/studyPlan'
  import type { VocabData } from '@/models/vocab'
  import { loadVocab } from '@/utils/vocabData'
  import type { ClassicsData } from '@/models/classics'
  import { dumpPlan, getDay, setSectionDone, setNoteDone, type Section } from '@/utils/dailyPlan'
  import { learn, dueIds } from '@/utils/vocabSrs'
  import { openNote } from '@/utils/noteDialog'
  import { touchStreak } from '@/utils/streak'
  import { ymd } from '@/utils/date'
  import type { Subject } from '@/models/question'
  import { SUBJECT_LABEL } from '@/models/question'
  import { tagShort } from '@/models/taxonomy'
  import VocabCard from '@/components/vocab/VocabCard.svelte'
  import ClassicReader from '@/components/classics/ClassicReader.svelte'
  import DueQuestions from '@/components/review/DueQuestions.svelte'
  import QuizQuestions from '@/components/review/QuizQuestions.svelte'

  const schedule = scheduleJson as unknown as ScheduleData
  const classics = classicsJson as unknown as ClassicsData
  const classicById = new Map(classics.classics.map((c) => [c.id, c]))

  // vocab.json is large → fetched lazily; word cards fill in once it arrives
  let vocab = $state<VocabData | null>(null)
  const wordById = $derived(new Map((vocab?.words ?? []).map((w) => [w.id, w])))
  onMount(async () => {
    vocab = await loadVocab()
  })

  const today = ymd(Date.now())
  let planStore = $state(dumpPlan())
  let reviewIds = $state<string[]>([])
  let showQuiz = $state(false)

  function refresh() {
    planStore = dumpPlan()
    reviewIds = dueIds()
  }

  $effect(() => {
    refresh()
    const on = () => refresh()
    window.addEventListener('tcm:statechange', on)
    window.addEventListener('tcm:cloudloaded', on)
    return () => {
      window.removeEventListener('tcm:statechange', on)
      window.removeEventListener('tcm:cloudloaded', on)
    }
  })

  // today's content + completion (today excluded from cursor → stays stable as you finish it)
  const plan = $derived(computeToday(schedule, planStore, today))
  const st = $derived(planStore[today] ?? {})
  const newWords = $derived(plan.newVocabIds.map((id) => wordById.get(id)).filter(Boolean))
  const reviewWords = $derived(
    reviewIds.slice(0, schedule.perDay.reviewVocabMax).map((id) => wordById.get(id)).filter(Boolean),
  )
  const todayClassic = $derived(plan.classicId ? classicById.get(plan.classicId) : null)
  const notesDone = $derived(plan.notes.length > 0 && plan.notes.every((n) => st.notes?.[n.subject]))
  const reviewDigests = $derived(Object.entries(schedule.reviews))

  // sections shown today (key + whether it's done) — light/rest days drop new material
  const sections = $derived.by(() => {
    const full = plan.dayType === 'full'
    const out: { key: Section | 'notes'; done: boolean }[] = []
    out.push({ key: 'notes', done: notesDone })
    if (full) out.push({ key: 'quiz', done: !!st.quiz })
    if (full) out.push({ key: 'newVocab', done: !!st.newVocab })
    if (reviewWords.length) out.push({ key: 'reviewVocab', done: !!st.reviewVocab })
    if (todayClassic) out.push({ key: 'classic', done: !!st.classic })
    out.push({ key: 'wrong', done: !!st.wrong })
    return out
  })
  const doneCount = $derived(sections.filter((s) => s.done).length)
  const allDone = $derived(sections.length > 0 && doneCount === sections.length)

  function bump() {
    touchStreak() // any completion marks the day active (keeps the streak alive)
    refresh()
  }
  function toggleNote(s: Subject) {
    setNoteDone(today, s, !st.notes?.[s])
    bump()
  }
  function toggleSection(sec: Section) {
    const next = !st[sec]
    setSectionDone(today, sec, next)
    if (sec === 'newVocab' && next) learn(plan.newVocabIds) // enter SRS on completion
    bump()
  }

  const dayBadge = $derived(
    plan.dayType === 'rest'
      ? { label: '放空日 · 休息也很好', cls: 'badge-success' }
      : plan.dayType === 'light'
        ? { label: '輕量日 · 複習為主', cls: 'badge-info' }
        : plan.taper
          ? { label: '考前衝刺 · 複習為重', cls: 'badge-warning' }
          : null,
  )
  const paceBadge = $derived(
    !plan.inRange
      ? null
      : plan.pace.aheadDays > 0
        ? { label: `單字超前 ${plan.pace.aheadDays} 天`, cls: 'badge-success' }
        : plan.pace.aheadDays < 0
          ? { label: `單字落後 ${-plan.pace.aheadDays} 天`, cls: 'badge-warning' }
          : { label: '進度準時', cls: 'badge-ghost' },
  )
</script>

<div class="flex flex-col gap-5">
  <header class="flex flex-col gap-2">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">今日複習</h1>
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="badge badge-neutral badge-sm font-medium tabular-nums">距考試 {plan.daysToExam} 天</span>
        {#if dayBadge}<span class={`badge badge-sm font-medium ${dayBadge.cls}`}>{dayBadge.label}</span>{/if}
        {#if paceBadge}<span class={`badge badge-sm font-medium ${paceBadge.cls}`}>{paceBadge.label}</span>{/if}
      </div>
    </div>
    <p class="text-sm text-base-content/55 tabular-nums">{today}{#if vocab}　·　今日進度 {doneCount}/{sections.length}{/if}</p>
    <div class="h-2 overflow-hidden rounded-full bg-base-300">
      <span class="block h-full rounded-full bg-primary transition-all" style={`width:${vocab ? Math.round((doneCount / Math.max(sections.length, 1)) * 100) : 0}%`}></span>
    </div>
  </header>

  {#if !vocab}
    <div class="flex justify-center py-16"><span class="loading loading-spinner loading-lg text-primary"></span></div>
  {:else}

  {#if !plan.inRange}
    <div class="rounded-box border border-base-300 bg-base-100 p-4 text-sm text-base-content/70">
      讀書計畫期間為 <b>{schedule.range.start}</b> ～ <b>{schedule.range.end}</b>。目前不在計畫期內，先複習到期錯題即可。
    </div>
  {/if}

  {#if allDone}
    <div class="rounded-box border border-success/30 bg-success/10 p-5 text-center">
      <p class="text-lg font-bold text-success">🎉 今天的讀書計畫完成了！</p>
      <p class="mt-1 text-sm text-base-content/60">明天會接著你的進度繼續。早點休息，讓記憶沉澱。</p>
    </div>
  {/if}

  {#if plan.dayType === 'rest'}
    <section class="rounded-box border border-success/30 bg-success/[0.06] p-5">
      <h2 class="text-lg font-bold">今天是放空日 🌿</h2>
      <p class="mt-1 text-sm text-base-content/65">連續衝刺會累、效率也會掉。今天可以完全休息，讓前幾天讀的東西沉澱下來；想讀的話，下面是輕量複習。</p>
      <button class="btn btn-success btn-sm mt-3" class:btn-outline={!st.rest} onclick={() => toggleSection('rest')}>
        {st.rest ? '今天休息了 ✓' : '我今天休息'}
      </button>
    </section>
  {/if}

  <!-- 複習文章（輕量日的閱讀目標）-->
  {#if plan.dayType === 'light' && reviewDigests.length}
    <section class="rounded-box border border-info/30 bg-info/[0.06] p-4 sm:p-5">
      <h2 class="mb-1 text-lg font-bold tracking-tight">今日複習文章</h2>
      <p class="mb-3 text-sm text-base-content/60">輕量日的閱讀目標——把這陣子讀過的考點用摘要再過一遍，不必上新進度。</p>
      <div class="flex flex-col gap-2">
        {#each reviewDigests as [slug, r] (slug)}
          <button class="flex items-center justify-between gap-2 rounded-box border border-base-300 bg-base-100 p-3 text-left" onclick={() => openNote(slug, r.title)}>
            <span class="flex flex-col">
              <span class="text-xs text-base-content/50">{SUBJECT_LABEL[r.subject]}</span>
              <span class="font-medium leading-tight">{r.title}</span>
            </span>
            <span class="text-primary">開啟 →</span>
          </button>
        {/each}
      </div>
    </section>
  {/if}

  <!-- 1. 今日考點 -->
  {#if plan.notes.length}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="text-lg font-bold tracking-tight">{plan.dayType === 'full' ? '今日考點' : '複習考點'}</h2>
        <span class="text-xs text-base-content/50">點開看筆記、不換頁</span>
      </div>
      <div class="grid gap-2 sm:grid-cols-2">
        {#each plan.notes as n (n.subject)}
          <div class="flex items-center gap-2 rounded-box border border-base-300 bg-base-200/40 p-2.5">
            <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.notes?.[n.subject]} onchange={() => toggleNote(n.subject)} aria-label={`${SUBJECT_LABEL[n.subject]}考點完成`} />
            <button class="flex flex-1 items-center justify-between gap-2 text-left" onclick={() => openNote(n.slug, tagShort(n.tag))}>
              <span class="flex flex-col">
                <span class="text-xs text-base-content/50">{SUBJECT_LABEL[n.subject]}</span>
                <span class="font-medium leading-tight">{tagShort(n.tag)}</span>
              </span>
              <span class="text-primary">開啟 →</span>
            </button>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- 2. 今日考題（full day only）-->
  {#if plan.dayType === 'full' && plan.quizIds.length}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="text-lg font-bold tracking-tight">今日考題</h2>
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.quiz} onchange={() => toggleSection('quiz')} />做完了
        </label>
      </div>
      <p class="mb-3 text-sm text-base-content/55">讀完就測——以下是今日考點的考古題，答錯會自動進錯題本。</p>
      {#if showQuiz}
        <QuizQuestions ids={plan.quizIds} />
      {:else}
        <button class="btn btn-primary btn-sm" onclick={() => (showQuiz = true)}>開始作答（{plan.quizIds.length} 題）→</button>
      {/if}
    </section>
  {/if}

  <!-- 3. 今日單字（full day only）-->
  {#if plan.dayType === 'full' && newWords.length}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="text-lg font-bold tracking-tight">今日單字 · {newWords.length} 個</h2>
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.newVocab} onchange={() => toggleSection('newVocab')} />背完了
        </label>
      </div>
      <div class="grid gap-2.5 sm:grid-cols-2">
        {#each newWords as w (w.id)}<VocabCard word={w} />{/each}
      </div>
    </section>
  {/if}

  <!-- 4. 複習單字（spaced review, calendar-based）-->
  {#if reviewWords.length}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="text-lg font-bold tracking-tight">複習單字 · {reviewWords.length} 個</h2>
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.reviewVocab} onchange={() => toggleSection('reviewVocab')} />複習完了
        </label>
      </div>
      <div class="flex flex-wrap gap-1.5">
        {#each reviewWords as w (w.id)}
          <span class="rounded-full border border-base-300 bg-base-200/50 px-2.5 py-1 text-sm" title={w.zh}>{w.word}</span>
        {/each}
      </div>
    </section>
  {/if}

  <!-- 5. 今日古文 -->
  {#if todayClassic}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="text-lg font-bold tracking-tight">今日古文</h2>
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.classic} onchange={() => toggleSection('classic')} />讀過了
        </label>
      </div>
      <ClassicReader classic={todayClassic} open={false} />
    </section>
  {/if}

  <!-- 6. 今日錯題 -->
  <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
    <div class="mb-3 flex items-center justify-between gap-2">
      <h2 class="text-lg font-bold tracking-tight">今日錯題</h2>
      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.wrong} onchange={() => toggleSection('wrong')} />複習完了
      </label>
    </div>
    <DueQuestions />
  </section>
  {/if}
</div>
