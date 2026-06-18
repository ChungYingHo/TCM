<script lang="ts">
  // 今日複習 — the daily study hub. Content is sliced from the schedule ORDERING by the
  // user's actual cursor (deriveCursors), so the plan is a ROLLING sequence: a busy day is
  // absorbed, not desynced. Weekday vs weekend is read from the real clock — weekdays are
  // full study days (one subject PAIR's notes + quiz), weekends are buffer days (catch up
  // if behind, otherwise rest). 單字/古文/元素 run every day; only the pre-exam taper stops new words.
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
  import { dueCount as elementDueCount } from '@/utils/elementSrs'
  import { learn as learnClassic, grade as gradeClassic, dueIds as classicDueIds } from '@/utils/classicSrs'
  import { dueCount as wrongDueCount } from '@/utils/wrongBook'
  import { composeReview } from '@/utils/reviewSample'
  import { getAttempts } from '@/utils/progress'
  import { openNote } from '@/utils/noteDialog'
  import { touchStreak } from '@/utils/streak'
  import { noteReadDates } from '@/utils/studyCursor'
  import { todayKey, parseYmd, mdShort, zhDateLabel, dayKind, type DayKind } from '@/utils/date'
  import type { Subject } from '@/models/question'
  import { SUBJECT_LABEL } from '@/models/question'
  import { tagShort } from '@/models/taxonomy'
  import VocabCard from '@/components/vocab/VocabCard.svelte'
  import VocabStudy from '@/components/vocab/VocabStudy.svelte'
  import ElementQuiz from '@/components/element/ElementQuiz.svelte'
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

  const today = todayKey() // 5 AM rollover (see date.ts)
  const todayLabel = zhDateLabel(new Date(parseYmd(today)))
  let planStore = $state(dumpPlan())
  let attemptsStore = $state(getAttempts())
  let reviewIds = $state<string[]>([])
  let showQuiz = $state(false)
  let showReview = $state(false)
  let showElement = $state(false)
  let openMini = $state<Partial<Record<Subject, boolean>>>({})
  // due-review backlog (for the weekend 落後清單) + the soonest-due 古文 to re-read
  let dueCounts = $state({ vocab: 0, element: 0, wrong: 0, classic: 0 })
  let reviewClassicId = $state<string | null>(null)

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
    const dueClassics = classicDueIds()
    dueCounts = { vocab: dueIds().length, element: elementDueCount(), wrong: wrongDueCount(), classic: dueClassics.length }
    reviewClassicId = dueClassics[0] ?? null // soonest-due 古文 to re-read
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
  // slug → first-read date for the「讀完 M/D」chip on each note card
  const readDates = $derived(noteReadDates(planStore, schedule.tracks.notes))
  const reviewClassic = $derived(reviewClassicId ? classicById.get(reviewClassicId) : null)
  const behindTotal = $derived(dueCounts.vocab + dueCounts.element + dueCounts.wrong + dueCounts.classic)

  // Weekday = full study day; weekend = buffer (catch up if behind, else rest). Read from the clock.
  const kind = $derived(dayKind(today, schedule.examDate))
  const isWeekend = $derived(plan.dayType === 'weekend')

  // sections shown today (key + whether it's done). Notes = today's subject pair; quiz only on
  // weekdays; 單字/複習/元素/古文/錯題 every day. Weekends keep all of these for catch-up.
  const sections = $derived.by(() => {
    const out: { key: Section | 'notes'; done: boolean }[] = []
    if (plan.notes.length) out.push({ key: 'notes', done: notesDone })
    if (plan.dayType === 'full') out.push({ key: 'quiz', done: !!st.quiz })
    if (plan.newVocabIds.length) out.push({ key: 'newVocab', done: !!st.newVocab })
    if (reviewWords.length) out.push({ key: 'reviewVocab', done: !!st.reviewVocab })
    out.push({ key: 'elementQuiz', done: !!st.elementQuiz })
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
    if (sec === 'newVocab' && next) learn(plan.newVocabIds) // 完成即進 SRS
    if (sec === 'classic' && next && todayClassic) learnClassic([todayClassic.id]) // 古文進 SRS，日後間隔重現
    bump()
  }
  function gradeReviewClassic(known: boolean) {
    if (reviewClassicId) gradeClassic(reviewClassicId, known)
    bump() // refresh → 已評分的篇章離開到期清單
  }

  // day-kind → badge. Shares dayKind with the home dashboard so the two never drift.
  const DAY_BADGES: Record<DayKind, { label: string; cls: string } | null> = {
    weekend: { label: '週末緩衝日', cls: 'badge-info' },
    taper: { label: '考前衝刺 · 複習為重', cls: 'badge-warning' },
    full: null,
  }
  const dayBadge = $derived(DAY_BADGES[kind])
  const paceBadge = $derived(
    !plan.inRange
      ? null
      : plan.pace.onTrack
        ? { label: '單字跟得上考期', cls: 'badge-success' }
        : { label: `單字需加速 · 每天約 ${plan.pace.neededPerDay} 個`, cls: 'badge-warning' },
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
      讀書計畫到完課目標 <b>{schedule.examDate}</b> 為止。已過完課日，之後以複習到期錯題與單字為主即可。
    </div>
  {/if}

  {#if allDone}
    <div class="rounded-box border border-success/30 bg-success/10 p-5 text-center">
      <p class="text-lg font-bold text-success">🎉 今天的讀書計畫完成了！</p>
      <p class="mt-1 text-sm text-base-content/60">明天會接著你的進度繼續。早點休息，讓記憶沉澱。</p>
    </div>
  {/if}

  <!-- 週末緩衝日：具體列出落後什麼（一鍵跳到該段）＋ 限時模擬入口；跟上就休息 -->
  {#if isWeekend}
    <section class="rounded-box border border-info/30 bg-info/[0.06] p-5">
      <h2 class="text-lg font-bold">週末緩衝日 🌿</h2>
      {#if behindTotal === 0 && plan.pace.onTrack}
        <p class="mt-1 text-sm text-base-content/65">進度都跟上了，今天好好休息、讓記憶沉澱；想加碼就往下繼續。</p>
      {:else}
        <p class="mt-1 mb-2 text-sm text-base-content/65">趁今天把落後的補一補，跟上了就休息：</p>
        <ul class="flex flex-col gap-1.5 text-sm">
          {#if !plan.pace.onTrack}
            <li class="flex items-center gap-1.5 font-medium text-warning"><Icon name="flame" class="h-4 w-4" filled /> 單字進度需加速 · 每天約 {plan.pace.neededPerDay} 個</li>
          {/if}
          {#if dueCounts.vocab && reviewWords.length}<li><a class="link link-primary" href="#sec-reviewVocab">單字到期複習 {dueCounts.vocab} 個 →</a></li>{/if}
          {#if dueCounts.element}<li><a class="link link-primary" href="#sec-element">元素到期 {dueCounts.element} 個 →</a></li>{/if}
          {#if dueCounts.classic}<li><a class="link link-primary" href="#sec-reviewClassic">古文待複習 {dueCounts.classic} 篇 →</a></li>{/if}
          {#if dueCounts.wrong}<li><a class="link link-primary" href="#sec-wrong">錯題到期 {dueCounts.wrong} 題 →</a></li>{/if}
        </ul>
      {/if}
      <a href="/exam" class="btn btn-outline btn-sm mt-3 gap-1">練配速 · 限時整卷模擬 <Icon name="timer" class="h-4 w-4" /></a>
    </section>
  {/if}

  <!-- 週末複習文章（跨考點摘要；把這陣子讀過的再過一遍）-->
  {#if isWeekend && reviewDigests.length}
    <section class="rounded-box border border-info/30 bg-info/[0.06] p-4 sm:p-5">
      <h2 class="section-heading mb-1">週末複習文章</h2>
      <p class="mb-3 text-sm text-base-content/60">把這陣子讀過的考點用摘要再過一遍，串起整體脈絡。</p>
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

  <!-- 1. 今日考點（今天這一對科目；週末＝補進度）-->
  {#if plan.notes.length}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="section-heading">{isWeekend ? '週末緩衝 · 補進度' : '今日考點'}</h2>
        <span class="text-xs text-base-content/50">{isWeekend ? '趁週末把落後的考點補上' : plan.phase === 'drill' ? '第 2 輪起＝快速複習，5–10 分鐘過一篇' : '今天兩科 · 點開看筆記、不換頁'}</span>
      </div>
      <div class="grid gap-2 sm:grid-cols-2">
        {#each plan.notes as n (n.subject)}
          <div class="flex flex-col gap-2 rounded-box border border-base-300 bg-base-200/40 p-2.5">
            <div class="flex items-center gap-2">
              <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.notes?.[n.subject]} onchange={() => toggleNote(n.subject)} aria-label={`${SUBJECT_LABEL[n.subject]}考點完成`} />
              <button class="flex flex-1 items-center justify-between gap-2 text-left" onclick={() => openNote(n.slug, tagShort(n.tag))}>
                <span class="flex flex-col">
                  <span class="text-xs text-base-content/50">
                    {SUBJECT_LABEL[n.subject]}{#if n.round > 1}　·　第 {n.round} 輪{/if}{#if readDates[n.slug]}<span class="ml-1 rounded-full bg-success/15 px-1.5 py-0.5 text-[0.65rem] font-medium text-success">讀完 {mdShort(readDates[n.slug])}</span>{/if}
                  </span>
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

  <!-- 2. 今日考題／刷題（只在平日；週末靠「先測再讀」＋今日錯題複習）-->
  {#if plan.dayType === 'full' && plan.quizIds.length}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="section-heading">
          {plan.phase === 'drill' ? `今日刷題 · ${plan.quizIds.length} 題` : '今日考題'}
        </h2>
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.quiz} onchange={() => toggleSection('quiz')} />做完了
        </label>
      </div>
      <p class="mb-3 text-sm text-base-content/55">
        {plan.phase === 'drill'
          ? `每天一段全新考古題（年份新到舊、四科混合）${plan.quizWeakCount ? `，其中 ${plan.quizWeakCount} 題針對你正確率最低的考點` : ''}，答錯會自動進錯題本。`
          : '讀完就測——以下是今日考點的考古題，答錯會自動進錯題本。'}
      </p>
      {#if showQuiz}
        <QuizQuestions ids={plan.quizIds} />
      {:else}
        <button class="btn btn-primary btn-sm" onclick={() => (showQuiz = true)}>
          開始作答（{plan.quizIds.length} 題）<Icon name="arrowRight" class="h-4 w-4" />
        </button>
      {/if}
    </section>
  {/if}

  <!-- 3. 今日單字（每天都做，不因週末中斷；唯考前 taper 停新字）-->
  {#if newWords.length}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="section-heading">今日單字 · {newWords.length} 個{#if isWeekend}<span class="ml-2 align-middle text-xs font-normal text-base-content/45">背單字每天不間斷</span>{/if}</h2>
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
    <section id="sec-reviewVocab" class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
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
        <p class="mb-3 text-sm text-base-content/55">每天隨機抽一批（最多 {schedule.perDay.reviewVocabTarget} 個、到期的優先），不是一次全部——沒抽到的改天會輪到。翻卡作答，選「認識／不熟」會自動安排下次複習時間。</p>
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

  <!-- 5. 今日元素小遊戲（每天的輕量練習）-->
  <section id="sec-element" class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
    <div class="mb-3 flex items-center justify-between gap-2">
      <h2 class="section-heading">今日元素 · 小遊戲</h2>
      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.elementQuiz} onchange={() => toggleSection('elementQuiz')} />玩過了
      </label>
    </div>
    {#if showElement}
      <ElementQuiz onfinish={() => { if (!st.elementQuiz) toggleSection('elementQuiz') }} />
    {:else}
      <p class="mb-3 text-sm text-base-content/55">每天幾題，把元素的原子序、電子組態、價電子、族週期與鍵別練成反射——化學的地基。題型與作答方式（選擇／填充）隨機輪換，答對自動排進間隔複習。</p>
      <button class="btn btn-primary btn-sm" onclick={() => (showElement = true)}>開始遊戲 <Icon name="sparkles" class="h-4 w-4" /></button>
    {/if}
  </section>

  <!-- 6. 今日古文（主動回想：先讀原文回想，再翻開白話對照；讀過進 SRS） -->
  {#if todayClassic}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="section-heading">今日古文</h2>
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.classic} onchange={() => toggleSection('classic')} />讀過了
        </label>
      </div>
      <p class="mb-3 text-sm text-base-content/55">先讀原文、試著回想語意與讀音，再翻開「白話翻譯」對照——主動回想比直接看翻譯更記得住。讀過之後它會隔幾天回來讓你複習。</p>
      <ClassicReader classic={todayClassic} open={false} />
    </section>
  {/if}

  <!-- 6.5 複習古文（SRS 到期；先回想再翻譯，選記得／不熟安排下次。只在有到期時出）-->
  {#if reviewClassic}
    <section id="sec-reviewClassic" class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <h2 class="section-heading mb-1">複習古文</h2>
      <p class="mb-3 text-sm text-base-content/55">之前讀過、今天該回顧的一篇——先讀原文回想語意與讀音，再翻開對照，然後選「記得／不熟」安排下次複習。</p>
      <ClassicReader classic={reviewClassic} open={false} />
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button class="btn btn-outline btn-error" onclick={() => gradeReviewClassic(false)}>不熟</button>
        <button class="btn btn-success" onclick={() => gradeReviewClassic(true)}>記得 <Icon name="check" class="h-4 w-4" /></button>
      </div>
    </section>
  {/if}

  <!-- 7. 今日錯題 -->
  <section id="sec-wrong" class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
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
