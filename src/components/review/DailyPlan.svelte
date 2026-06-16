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
  import { learn, dueIds, dumpVocabSrs } from '@/utils/vocabSrs'
  import { composeReview } from '@/utils/reviewSample'
  import { getAttempts } from '@/utils/progress'
  import { openNote } from '@/utils/noteDialog'
  import { touchStreak } from '@/utils/streak'
  import { ymd, zhDateLabel } from '@/utils/date'
  import type { Subject } from '@/models/question'
  import { SUBJECT_LABEL } from '@/models/question'
  import { tagShort } from '@/models/taxonomy'
  import VocabCard from '@/components/vocab/VocabCard.svelte'
  import VocabStudy from '@/components/vocab/VocabStudy.svelte'
  import ClassicReader from '@/components/classics/ClassicReader.svelte'
  import DueQuestions from '@/components/review/DueQuestions.svelte'
  import QuizQuestions from '@/components/review/QuizQuestions.svelte'
  import Icon from '@/components/common/Icon.svelte'

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
  const todayLabel = zhDateLabel()
  let planStore = $state(dumpPlan())
  let attemptsStore = $state(getAttempts())
  let reviewIds = $state<string[]>([])
  let showQuiz = $state(false)
  let showReview = $state(false)
  let openMini = $state<Partial<Record<Subject, boolean>>>({})

  // mock-day countdown (started by the user, purely informative — never blocks answering)
  let mockLeft = $state(-1) // seconds; -1 = not started
  let mockTicker: ReturnType<typeof setInterval> | null = null
  function startMockTimer(minutes: number) {
    mockLeft = minutes * 60
    if (mockTicker) clearInterval(mockTicker)
    mockTicker = setInterval(() => {
      if (mockLeft > 0) mockLeft -= 1
      else if (mockTicker) { clearInterval(mockTicker); mockTicker = null }
    }, 1000)
  }
  $effect(() => () => { if (mockTicker) clearInterval(mockTicker) })
  const mockClock = $derived(
    mockLeft < 0 ? '' : `${String(Math.floor(mockLeft / 60)).padStart(2, '0')}:${String(mockLeft % 60).padStart(2, '0')}`,
  )

  function refresh() {
    planStore = dumpPlan()
    attemptsStore = getAttempts()
    // 複習單字 = SRS 到期字優先（弱字在前）＋從已背過的字隨機抽樣補滿每日目標。
    // 以日期當種子 → 同一天內列表穩定，跨天自然輪換。
    reviewIds = composeReview(
      dueIds(),
      Object.keys(dumpVocabSrs()),
      schedule.perDay.reviewVocabTarget ?? 60,
      schedule.perDay.reviewVocabMax,
      today,
    )
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
  const plan = $derived(computeToday(schedule, planStore, today, attemptsStore))
  const st = $derived(planStore[today] ?? {})
  const newWords = $derived(plan.newVocabIds.map((id) => wordById.get(id)).filter(Boolean))
  const reviewWords = $derived(
    reviewIds.slice(0, schedule.perDay.reviewVocabMax).map((id) => wordById.get(id)).filter(Boolean),
  )
  const todayClassic = $derived(plan.classicId ? classicById.get(plan.classicId) : null)
  const notesDone = $derived(plan.notes.length > 0 && plan.notes.every((n) => st.notes?.[n.subject]))
  const reviewDigests = $derived(Object.entries(schedule.reviews))

  // sections shown today (key + whether it's done) — light/rest days drop the heavy
  // quiz/drill block, but 背單字每天都做：new vocab is carried on EVERY day (使用者要求
  // 「單字不可以放棄」)。Only the pre-exam taper stops new words (computeToday → []).
  const sections = $derived.by(() => {
    const full = plan.dayType === 'full'
    const out: { key: Section | 'notes'; done: boolean }[] = []
    out.push({ key: 'notes', done: notesDone })
    if (full) out.push({ key: 'quiz', done: !!st.quiz })
    if (plan.newVocabIds.length) out.push({ key: 'newVocab', done: !!st.newVocab })
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
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div class="flex flex-col gap-1.5">
        <p class="page-kicker tabular-nums">{todayLabel}</p>
        <h1 class="page-title">今日複習</h1>
      </div>
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="badge badge-neutral badge-sm font-medium tabular-nums" title={schedule.examWindow ?? ''}>距完課 {plan.daysToExam} 天</span>
        {#if dayBadge}<span class={`badge badge-sm font-medium ${dayBadge.cls}`}>{dayBadge.label}</span>{/if}
        {#if paceBadge}<span class={`badge badge-sm font-medium ${paceBadge.cls}`}>{paceBadge.label}</span>{/if}
      </div>
    </div>
    {#if vocab}<p class="text-sm tabular-nums text-base-content/55">今日進度 {doneCount}/{sections.length}</p>{/if}
    {#if schedule.examWindow}<p class="text-xs text-base-content/45">完課目標 {schedule.examDate}；{schedule.examWindow}</p>{/if}
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
        {#if st.rest}今天休息了 <Icon name="check" class="h-4 w-4" />{:else}我今天休息{/if}
      </button>
    </section>
  {/if}

  <!-- 複習文章（輕量日的閱讀目標）-->
  {#if plan.dayType === 'light' && reviewDigests.length}
    <section class="rounded-box border border-info/30 bg-info/[0.06] p-4 sm:p-5">
      <h2 class="section-heading mb-1">今日複習文章</h2>
      <p class="mb-3 text-sm text-base-content/60">輕量日的閱讀目標——把這陣子讀過的考點用摘要再過一遍，不必上新進度。</p>
      <div class="flex flex-col gap-2">
        {#each reviewDigests as [slug, r] (slug)}
          <button class="flex items-center justify-between gap-2 rounded-box border border-base-300 bg-base-100 p-3 text-left" onclick={() => openNote(slug, r.title)}>
            <span class="flex flex-col">
              <span class="text-xs text-base-content/50">{SUBJECT_LABEL[r.subject]}</span>
              <span class="font-medium leading-tight">{r.title}</span>
            </span>
            <span class="inline-flex shrink-0 items-center gap-0.5 text-primary">開啟 <Icon name="arrowRight" class="h-3.5 w-3.5" /></span>
          </button>
        {/each}
      </div>
    </section>
  {/if}

  <!-- 1. 今日考點 -->
  {#if plan.notes.length}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="section-heading">{plan.dayType === 'full' ? '今日考點' : '複習考點'}</h2>
        <span class="text-xs text-base-content/50">{plan.phase === 'drill' ? '第 2 輪起＝快速複習，5–10 分鐘過一篇' : '點開看筆記、不換頁'}</span>
      </div>
      <div class="grid gap-2 sm:grid-cols-2">
        {#each plan.notes as n (n.subject)}
          <div class="flex flex-col gap-2 rounded-box border border-base-300 bg-base-200/40 p-2.5">
            <div class="flex items-center gap-2">
              <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.notes?.[n.subject]} onchange={() => toggleNote(n.subject)} aria-label={`${SUBJECT_LABEL[n.subject]}考點完成`} />
              <button class="flex flex-1 items-center justify-between gap-2 text-left" onclick={() => openNote(n.slug, tagShort(n.tag))}>
                <span class="flex flex-col">
                  <span class="text-xs text-base-content/50">{SUBJECT_LABEL[n.subject]}{#if n.round > 1}　·　第 {n.round} 輪{/if}</span>
                  <span class="font-medium leading-tight">{tagShort(n.tag)}</span>
                </span>
                <span class="inline-flex shrink-0 items-center gap-0.5 text-primary">開啟 <Icon name="arrowRight" class="h-3.5 w-3.5" /></span>
              </button>
            </div>
            {#if n.miniQuizIds.length}
              <!-- 第 2 輪起＝先測後讀：答對快速掃過、答錯認真重讀 -->
              {#if openMini[n.subject]}
                <QuizQuestions ids={n.miniQuizIds} />
              {:else}
                <button class="btn btn-outline btn-primary btn-xs self-start" onclick={() => (openMini = { ...openMini, [n.subject]: true })}>
                  先測 {n.miniQuizIds.length} 題再讀 <Icon name="arrowRight" class="h-3.5 w-3.5" />
                </button>
              {/if}
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- 2. 今日考題／刷題（full day only）-->
  {#if plan.dayType === 'full' && plan.quizIds.length}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="section-heading">
          {plan.mock ? `限時模擬 · ${plan.quizIds.length} 題` : plan.phase === 'drill' ? `今日刷題 · ${plan.quizIds.length} 題` : '今日考題'}
        </h2>
        <div class="flex items-center gap-3">
          {#if plan.mock && mockLeft >= 0}
            <span class={`font-mono text-sm tabular-nums ${mockLeft === 0 ? 'font-bold text-error' : 'text-base-content/70'}`} role="timer">
              {mockLeft === 0 ? '時間到' : mockClock}
            </span>
          {/if}
          <label class="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.quiz} onchange={() => toggleSection('quiz')} />做完了
          </label>
        </div>
      </div>
      <p class="mb-3 text-sm text-base-content/55">
        {plan.mock
          ? '每月一次的限時段——比照正式考的節奏（50 題／70 分鐘），練配速、也練「倒扣之下該不該猜」的取捨。時間到只是提醒，不會中斷作答。'
          : plan.phase === 'drill'
            ? `每天一段全新考古題（年份新到舊、四科混合）${plan.quizWeakCount ? `，其中 ${plan.quizWeakCount} 題針對你正確率最低的考點` : ''}，答錯會自動進錯題本。`
            : '讀完就測——以下是今日考點的考古題，答錯會自動進錯題本。'}
      </p>
      {#if showQuiz}
        <QuizQuestions ids={plan.quizIds} />
      {:else}
        <button class="btn btn-primary btn-sm" onclick={() => { showQuiz = true; if (plan.mock) startMockTimer(70) }}>
          開始作答（{plan.quizIds.length} 題）<Icon name="arrowRight" class="h-4 w-4" />
        </button>
      {/if}
    </section>
  {/if}

  <!-- 3. 今日單字（背單字每天都做，不因輕量/放空日中斷；唯考前 taper 停新字）-->
  {#if newWords.length}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="section-heading">今日單字 · {newWords.length} 個{#if plan.dayType !== 'full'}<span class="ml-2 align-middle text-xs font-normal text-base-content/45">背單字每天不間斷</span>{/if}</h2>
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.newVocab} onchange={() => toggleSection('newVocab')} />背完了
        </label>
      </div>
      <div class="grid gap-2.5 sm:grid-cols-2">
        {#each newWords as w (w.id)}<VocabCard word={w} />{/each}
      </div>
    </section>
  {/if}

  <!-- 4. 複習單字（spaced review, calendar-based）— 翻卡作答會回寫間隔重複 -->
  {#if reviewWords.length}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="section-heading">複習單字 · {reviewWords.length} 個</h2>
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.reviewVocab} onchange={() => toggleSection('reviewVocab')} />複習完了
        </label>
      </div>
      {#if showReview}
        <VocabStudy
          words={reviewWords}
          ids={reviewWords.map((w) => w.id)}
          onfinish={() => { if (!st.reviewVocab) toggleSection('reviewVocab') }}
        />
      {:else}
        <p class="mb-3 text-sm text-base-content/55">到期的字優先、再從背過的字裡隨機抽樣補滿——翻卡作答，選「認識／不熟」會自動安排下次複習時間。</p>
        <div class="mb-3 flex flex-wrap gap-1.5">
          {#each reviewWords.slice(0, 30) as w (w.id)}
            <span class="rounded-full border border-base-300 bg-base-200/50 px-2.5 py-1 text-sm" title={w.zh}>{w.word}</span>
          {/each}
          {#if reviewWords.length > 30}<span class="px-1 py-1 text-sm text-base-content/50">…還有 {reviewWords.length - 30} 個</span>{/if}
        </div>
        <button class="btn btn-primary btn-sm" onclick={() => (showReview = true)}>開始複習（{reviewWords.length} 個）<Icon name="arrowRight" class="h-4 w-4" /></button>
      {/if}
    </section>
  {/if}

  <!-- 5. 今日古文 -->
  {#if todayClassic}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="section-heading">今日古文</h2>
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
      <h2 class="section-heading">今日錯題</h2>
      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.wrong} onchange={() => toggleSection('wrong')} />複習完了
      </label>
    </div>
    <DueQuestions />
  </section>
  {/if}
</div>
