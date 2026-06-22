<script lang="ts">
  // 今日複習 — the daily study hub, pared to the three things done EVERY day: 單字、古文、元素.
  // 筆記閱讀／刷題／錯題已移出每日排程（仍可從導覽列的筆記、刷題、錯題本進入）。內容仍由
  // schedule 的順序 + 使用者游標切出（computeToday）：忙碌的一天會被吸收、隔天接著走；
  // 唯考前 taper 會停新單字。
  import scheduleJson from '@/data/schedule.json'
  import classicsJson from '@/data/classics.json'
  import { onMount } from 'svelte'
  import type { ScheduleData } from '@/utils/studyPlan'
  import { computeToday } from '@/utils/studyPlan'
  import type { VocabData } from '@/models/vocab'
  import { loadVocab } from '@/utils/vocabData'
  import type { ClassicsData } from '@/models/classics'
  import { dumpPlan, setSectionDone, type Section } from '@/utils/dailyPlan'
  import { learn, dueIds, dumpVocabSrs } from '@/utils/vocabSrs'
  import { learn as learnClassic, grade as gradeClassic, dueIds as classicDueIds } from '@/utils/classicSrs'
  import { composeReview } from '@/utils/reviewSample'
  import { touchStreak } from '@/utils/streak'
  import { todayKey, parseYmd, zhDateLabel } from '@/utils/date'
  import VocabCard from '@/components/vocab/VocabCard.svelte'
  import VocabStudy from '@/components/vocab/VocabStudy.svelte'
  import ElementQuiz from '@/components/element/ElementQuiz.svelte'
  import AminoAcidQuiz from '@/components/amino/AminoAcidQuiz.svelte'
  import ClassicReader from '@/components/classics/ClassicReader.svelte'
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
  let reviewIds = $state<string[]>([])
  let showReview = $state(false)
  let showElement = $state(false)
  let showAmino = $state(false)
  let reviewClassicId = $state<string | null>(null) // soonest-due 古文 to re-read

  function refresh() {
    planStore = dumpPlan()
    // 複習單字 = SRS 到期字優先（弱字在前）＋從已背過的字隨機抽樣補滿每日目標。
    // 以日期當種子 → 同一天內列表穩定，跨天自然輪換。
    reviewIds = composeReview(
      dueIds(),
      Object.keys(dumpVocabSrs()),
      schedule.perDay.reviewVocabTarget ?? 60,
      schedule.perDay.reviewVocabMax,
      today,
    )
    reviewClassicId = classicDueIds()[0] ?? null
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

  // today's content + completion (today excluded from cursor → stays stable as you finish it).
  // computeToday is the shared engine (首頁 + progress-summary API 共用)：此頁只取 newVocabIds／
  // classicId／pace／daysToExam／taper；它一併算出的 notes/quizIds 本頁不顯示（首頁與 API 才用）。
  const plan = $derived(computeToday(schedule, planStore, today))
  const st = $derived(planStore[today] ?? {})
  const newWords = $derived(plan.newVocabIds.map((id) => wordById.get(id)).filter(Boolean))
  const reviewWords = $derived(
    reviewIds.slice(0, schedule.perDay.reviewVocabMax).map((id) => wordById.get(id)).filter(Boolean),
  )
  const todayClassic = $derived(plan.classicId ? classicById.get(plan.classicId) : null)
  const reviewClassic = $derived(reviewClassicId ? classicById.get(reviewClassicId) : null)

  // sections shown today (key + whether it's done) → drives 今日進度 X/Y. 元素每天都有；單字/古文視內容。
  const sections = $derived.by(() => {
    const out: { key: Section; done: boolean }[] = []
    if (plan.newVocabIds.length) out.push({ key: 'newVocab', done: !!st.newVocab })
    if (reviewWords.length) out.push({ key: 'reviewVocab', done: !!st.reviewVocab })
    out.push({ key: 'elementQuiz', done: !!st.elementQuiz })
    out.push({ key: 'aminoAcid', done: !!st.aminoAcid })
    if (todayClassic) out.push({ key: 'classic', done: !!st.classic })
    return out
  })
  const doneCount = $derived(sections.filter((s) => s.done).length)
  const allDone = $derived(sections.length > 0 && doneCount === sections.length)

  function bump() {
    touchStreak() // any completion marks the day active (keeps the streak alive)
    refresh()
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
        {#if plan.taper}<span class="badge badge-warning badge-sm font-medium">考前衝刺 · 複習為重</span>{/if}
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
      讀書計畫到完課目標 <b>{schedule.examDate}</b> 為止。已過完課日，之後以單字、古文、元素複習為主即可。
    </div>
  {/if}

  {#if allDone}
    <div class="rounded-box border border-success/30 bg-success/10 p-5 text-center">
      <p class="text-lg font-bold text-success">🎉 今天的讀書計畫完成了！</p>
      <p class="mt-1 text-sm text-base-content/60">明天會接著你的進度繼續。早點休息，讓記憶沉澱。</p>
    </div>
  {/if}

  <!-- 1. 今日單字（每天都做，不間斷；唯考前 taper 停新字）-->
  {#if newWords.length}
    <section class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="section-heading">今日單字 · {newWords.length} 個</h2>
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.newVocab} onchange={() => toggleSection('newVocab')} />背完了
        </label>
      </div>
      <div class="grid gap-2.5 sm:grid-cols-2">
        {#each newWords as w (w.id)}<VocabCard word={w} />{/each}
      </div>
    </section>
  {/if}

  <!-- 2. 複習單字（spaced review, calendar-based）— 翻卡作答會回寫間隔重複 -->
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

  <!-- 3. 今日元素 · 週期表地基（測驗＝SRS 抽考；背誦＝一族/一週期/一系列填符號）-->
  <section id="sec-element" class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
    <div class="mb-3 flex items-center justify-between gap-2">
      <h2 class="section-heading">今日元素 · 週期表地基</h2>
      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.elementQuiz} onchange={() => toggleSection('elementQuiz')} />練過了
      </label>
    </div>
    <p class="mb-3 text-sm text-base-content/55">把元素表練成反射——原子序↔元素、A 族價電子、8A 原子序、族與週期、常用原子量、英中符號、3d/4d/5d 系列。每天抽考，答對自動排間隔複習。</p>
    {#if showElement}
      <ElementQuiz onfinish={() => { if (!st.elementQuiz) toggleSection('elementQuiz') }} />
    {:else}
      <button class="btn btn-primary btn-sm" onclick={() => (showElement = true)}>開始測驗 <Icon name="sparkles" class="h-4 w-4" /></button>
    {/if}
  </section>

  <!-- 3.5 今日胺基酸（看結構↔名、中文↔代號、分類；完整結構參考在 化學工具→胺基酸）-->
  <section id="sec-amino" class="rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
    <div class="mb-3 flex items-center justify-between gap-2">
      <h2 class="section-heading">今日胺基酸 · 結構對照</h2>
      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked={!!st.aminoAcid} onchange={() => toggleSection('aminoAcid')} />練過了
      </label>
    </div>
    <p class="mb-3 text-sm text-base-content/55"><b>結構 ↔ 中文 ↔ 英文 ↔ 簡寫</b> 四者互相對照（看結構猜名、看名選結構…）——把 20 個胺基酸練熟，答對自動排間隔複習。完整結構參考在 <a class="link link-primary" href="/amino-acids">化學工具 → 胺基酸</a>。</p>
    {#if showAmino}
      <AminoAcidQuiz onfinish={() => { if (!st.aminoAcid) toggleSection('aminoAcid') }} />
    {:else}
      <button class="btn btn-primary btn-sm" onclick={() => (showAmino = true)}>開始測驗 <Icon name="sparkles" class="h-4 w-4" /></button>
    {/if}
  </section>

  <!-- 4. 今日古文（主動回想：先讀原文回想，再翻開白話對照；讀過進 SRS） -->
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

  <!-- 4.5 複習古文（SRS 到期；先回想再翻譯，選記得／不熟安排下次。只在有到期時出）-->
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
  {/if}
</div>
