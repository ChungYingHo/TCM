<script lang="ts">
  import type { OptionLetter, QuestionRecord, School, Subject } from '@/models/question'
  import { SCHOOLS, SUBJECTS, SCHOOL_LABEL, SUBJECT_LABEL } from '@/models/question'
  import { loadSchool, deriveFacets } from '@/utils/dataset'
  import { examScoring, scoreExamPoints, isChoiceCorrect } from '@/utils/score'
  import { recordWrong } from '@/utils/wrongBook'
  import { recordAttempt } from '@/utils/progress'
  import { primaryTag, tagSlug, tagShort } from '@/models/taxonomy'
  import QuestionCard from '@/components/question/QuestionCard.svelte'

  // 考古題模式 = 還原某校某年某科真卷（依真實規則倒扣）；隨機模式 = 隨機抽 N 題練習（不倒扣）
  let mode = $state<'past' | 'random'>('past')
  let school = $state<School>('ISU')
  let year = $state<number | null>(null)
  let subject = $state<Subject>('chemistry')
  let count = $state(50) // 隨機模式題數
  let minutes = $state(0) // 0 = 不限時
  let pool = $state<QuestionRecord[]>([])
  let loading = $state(true)

  const TIME_PRESETS = [0, 50, 60, 80, 90, 100, 120]
  const COUNT_PRESETS = [20, 30, 50, 100]

  let stage = $state<'setup' | 'running' | 'done'>('setup')
  let paper = $state<QuestionRecord[]>([])
  let answers = $state<Record<string, OptionLetter | null>>({})
  let timedOut = $state(false)

  // countdown — only armed when minutes > 0
  let endAt = $state(0)
  let nowTs = $state(0)
  let ticker: ReturnType<typeof setInterval> | null = null

  function stopTicker() {
    if (ticker) { clearInterval(ticker); ticker = null }
  }
  function startTicker() {
    stopTicker()
    nowTs = Date.now()
    ticker = setInterval(() => {
      nowTs = Date.now()
      if (nowTs >= endAt) submit(true)
    }, 1000)
  }

  $effect(() => {
    const s = school
    loading = true
    loadSchool(s).then((qs) => { pool = qs }).finally(() => { loading = false })
  })
  $effect(() => () => stopTicker()) // clear timer on unmount

  const facets = $derived(deriveFacets(pool))

  // 考古題模式需要一個有效年份；資料載入後預設帶最新一年
  $effect(() => {
    if (mode === 'past' && year == null && facets.years.length) year = facets.years[0]
  })

  // 考古題模式套用該卷真實計分規則；隨機模式不倒扣
  const examRule = $derived(
    mode === 'past' && year != null
      ? examScoring(school, year)
      : { perQuestion: 2, wrongPenalty: 0, floorZero: true },
  )
  const ruleText = $derived(
    mode !== 'past' || year == null
      ? ''
      : examRule.wrongPenalty > 0
        ? `每題 ${examRule.perQuestion} 分，答錯倒扣 ${examRule.wrongPenalty} 分，未作答 0 分（倒扣至本科零分為止）`
        : `每題 ${examRule.perQuestion} 分，答錯不倒扣，未作答 0 分`,
  )
  const fmtPts = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

  function sample(arr: QuestionRecord[], n: number): QuestionRecord[] {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a.slice(0, n)
  }

  const secondsLeft = $derived(
    minutes > 0 && stage === 'running' ? Math.max(0, Math.round((endAt - nowTs) / 1000)) : null,
  )
  const timeLabel = $derived(
    secondsLeft == null
      ? null
      : `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`,
  )

  function start() {
    const subset = pool.filter(
      (q) => q.subject === subject && (mode === 'past' ? q.year === year : true),
    )
    paper =
      mode === 'past'
        ? subset.slice().sort((a, b) => a.question_number - b.question_number)
        : sample(subset, count)
    answers = {}
    timedOut = false
    current = 0
    if (!paper.length) { stage = 'setup'; return }
    stage = 'running'
    if (minutes > 0) { endAt = Date.now() + minutes * 60_000; startTicker() }
  }

  const score = $derived(scoreExamPoints(paper, answers, examRule))

  function submit(auto = false) {
    stopTicker()
    timedOut = auto === true
    const now = Date.now()
    for (const q of paper) {
      const c = answers[q.id] ?? null
      const ok = isChoiceCorrect(q, c)
      recordAttempt(q.id, ok, now)
      // only ANSWERED-wrong go to the 錯題本; unanswered (跑完沒寫到) are reported but not auto-filed
      if (!ok && c) recordWrong(q.id, [c], now)
    }
    stage = 'done'
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // answered-wrong questions → weak concepts, to steer the review after submit
  const wrongQs = $derived(
    stage === 'done'
      ? paper.filter((q) => {
          const c = answers[q.id] ?? null
          return c != null && !isChoiceCorrect(q, c)
        })
      : [],
  )
  const weakTags = $derived.by(() => {
    const m = new Map<string, number>()
    for (const q of wrongQs) {
      const t = primaryTag(q.concept_tags)
      if (t) m.set(t, (m.get(t) ?? 0) + 1)
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  })

  // keyboard drilling during the exam: J/K move, 1–5 answer current
  let current = $state(0)
  function letterAt(q: QuestionRecord, i: number): OptionLetter | null {
    const ls = q.options.length ? q.options.map((o) => o.letter) : (['A', 'B', 'C', 'D'] as OptionLetter[])
    return i >= 0 && i < ls.length ? ls[i] : null
  }
  function onKey(e: KeyboardEvent) {
    if (stage !== 'running') return
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if (e.key === 'j' || e.key === 'ArrowDown') {
      current = Math.min(current + 1, paper.length - 1); e.preventDefault()
    } else if (e.key === 'k' || e.key === 'ArrowUp') {
      current = Math.max(0, current - 1); e.preventDefault()
    } else if (/^[1-5]$/.test(e.key)) {
      const l = letterAt(paper[current], Number(e.key) - 1)
      if (l) answers = { ...answers, [paper[current].id]: l }
    } else {
      return
    }
    if (typeof document !== 'undefined')
      document.getElementById(`eq-${current}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
  $effect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
</script>

{#if stage === 'setup'}
  <div class="card mx-auto max-w-xl border border-base-300 bg-base-100">
    <div class="card-body gap-4">
      <h2 class="card-title">模擬考設定</h2>

      <div role="tablist" class="grid grid-cols-2 gap-1 rounded-box bg-base-200 p-1">
        <button
          role="tab"
          class={`rounded-[0.8rem] px-3 py-2 text-sm font-semibold transition-colors ${mode === 'past' ? 'bg-base-100 text-primary shadow-soft' : 'text-base-content/60 hover:text-base-content'}`}
          onclick={() => (mode = 'past')}
        >考古題（還原真卷）</button>
        <button
          role="tab"
          class={`rounded-[0.8rem] px-3 py-2 text-sm font-semibold transition-colors ${mode === 'random' ? 'bg-base-100 text-primary shadow-soft' : 'text-base-content/60 hover:text-base-content'}`}
          onclick={() => (mode = 'random')}
        >隨機練習</button>
      </div>
      <p class="-mt-2 text-xs text-base-content/50">
        {mode === 'past' ? '挑某校某年某科，照當年真實規則計分與倒扣。' : '從整個題庫隨機抽題，純練習、不倒扣。'}
      </p>

      <label class="form-control">
        <span class="label-text mb-1">學校</span>
        <select class="select select-bordered" bind:value={school}>
          {#each SCHOOLS as s (s)}<option value={s}>{SCHOOL_LABEL[s]}</option>{/each}
        </select>
      </label>

      {#if mode === 'past'}
        <label class="form-control">
          <span class="label-text mb-1">年份（民國）</span>
          <select class="select select-bordered" bind:value={year}>
            {#each facets.years as y (y)}<option value={y}>{y} 年</option>{/each}
          </select>
        </label>
      {/if}

      <label class="form-control">
        <span class="label-text mb-1">科目</span>
        <select class="select select-bordered" bind:value={subject}>
          {#each SUBJECTS as s (s)}<option value={s}>{SUBJECT_LABEL[s]}</option>{/each}
        </select>
      </label>

      {#if mode === 'random'}
        <label class="form-control">
          <span class="label-text mb-1">題數</span>
          <select class="select select-bordered" bind:value={count}>
            {#each COUNT_PRESETS as c (c)}<option value={c}>{c} 題</option>{/each}
          </select>
        </label>
      {/if}

      <label class="form-control">
        <span class="label-text mb-1">作答時間</span>
        <select class="select select-bordered" bind:value={minutes}>
          {#each TIME_PRESETS as m (m)}<option value={m}>{m === 0 ? '不限時' : `${m} 分鐘`}</option>{/each}
        </select>
        <span class="mt-1 text-xs text-base-content/45">時間到會自動交卷計分。</span>
      </label>

      {#if mode === 'past' && ruleText}
        <div class="rounded-box border border-primary/20 bg-primary/[0.06] px-3.5 py-2.5 text-sm text-base-content/75">
          <span class="font-semibold text-primary">計分規則</span>：{ruleText}
        </div>
      {/if}

      <button class="btn btn-primary" disabled={loading} onclick={start}>開始作答</button>
    </div>
  </div>
{:else if stage === 'running'}
  <div class="flex flex-col gap-3">
    <div class="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 rounded-b-lg bg-base-100/90 p-2 backdrop-blur">
      <span class="text-sm opacity-80">已作答 {Object.values(answers).filter(Boolean).length} / {paper.length}</span>
      <span class="hidden text-xs opacity-60 lg:inline">↑↓ / J K 移動 · 1–5 作答</span>
      <div class="flex items-center gap-2">
        {#if timeLabel}
          <span
            class={`badge badge-lg font-bold tabular-nums ${secondsLeft != null && secondsLeft <= 60 ? 'badge-error' : secondsLeft != null && secondsLeft <= 300 ? 'badge-warning' : 'badge-ghost'}`}
            role="timer"
            aria-live="off"
          >⏱ {timeLabel}</span>
        {/if}
        <button class="btn btn-sm btn-primary" onclick={() => submit()}>交卷計分</button>
      </div>
    </div>
    {#each paper as q, i (q.id)}
      <div id={`eq-${i}`}>
        <QuestionCard
          question={q}
          mode="exam"
          selected={answers[q.id] ?? null}
          revealed={false}
          active={i === current}
          onselect={(l) => (answers = { ...answers, [q.id]: l })}
        />
      </div>
    {/each}
    <button class="btn btn-primary" onclick={() => submit()}>交卷計分</button>
  </div>
{:else}
  <div class="flex flex-col gap-4">
    <div class="card border border-base-300 bg-base-100">
      <div class="card-body items-center gap-2 text-center">
        <h2 class="card-title">{mode === 'past' ? `${SCHOOL_LABEL[school]} ${year} 年 ${SUBJECT_LABEL[subject]}` : '隨機練習'} 成績</h2>
        {#if timedOut}
          <span class="badge badge-warning badge-sm">時間到・自動交卷</span>
        {/if}
        {#if mode === 'past'}
          <div class="text-5xl font-black text-primary tabular-nums">{fmtPts(score.points)}<span class="text-2xl text-base-content/40"> / {score.maxPoints}</span></div>
          {#if examRule.wrongPenalty > 0}
            <p class="text-sm text-base-content/55">含倒扣（答錯每題 −{examRule.wrongPenalty} 分）</p>
          {/if}
        {:else}
          <div class="text-5xl font-black text-primary tabular-nums">{score.correct} / {score.total}</div>
          <p class="text-sm text-base-content/55">正確率 {Math.round((score.correct / Math.max(1, score.total)) * 100)}%</p>
        {/if}
        <div class="mt-1 flex flex-wrap justify-center gap-2 text-sm">
          <span class="badge badge-ghost">對 {score.correct}</span>
          <span class="badge badge-ghost">錯 {score.wrong}</span>
          <span class="badge badge-ghost">未作答 {score.blank}</span>
        </div>
        <button class="btn btn-outline btn-sm mt-1" onclick={() => (stage = 'setup')}>再考一次</button>
      </div>
    </div>

    {#if wrongQs.length}
      <div class="rounded-box border border-warning/30 bg-warning/10 p-5">
        <p class="font-bold">交卷後的複習建議</p>
        <p class="mt-1 text-sm text-base-content/70">
          答錯 <span class="font-semibold">{wrongQs.length}</span> 題，已收進錯題本並排入「今日複習」{score.blank ? `（另有 ${score.blank} 題未作答，未列入錯題本）` : ''}。建議先讀以下考點筆記，再到複習佇列重練。
        </p>
        {#if weakTags.length}
          <div class="mt-3 flex flex-wrap gap-2">
            {#each weakTags as [tag, n] (tag)}
              {@const slug = tagSlug(tag)}
              <a
                href={slug ? `/notes/${slug}` : '/notes'}
                class="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-base-100 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-warning/15"
              >
                {tagShort(tag)}
                <span class="rounded-full bg-warning/20 px-1.5 text-xs tabular-nums text-warning-content/80">{n}</span>
              </a>
            {/each}
          </div>
        {/if}
        <a href="/review" class="btn btn-primary btn-sm mt-4">前往今日複習 →</a>
      </div>
    {:else if score.blank}
      <div class="rounded-box border border-info/30 bg-info/10 p-5 text-center">
        <p class="font-bold text-info-content/90">作答的題目全對 👍 但有 {score.blank} 題未作答，建議補完再考一次。</p>
      </div>
    {:else}
      <div class="rounded-box border border-success/30 bg-success/10 p-5 text-center">
        <p class="font-bold text-success">🎉 全部答對，這份考卷已完全掌握！</p>
      </div>
    {/if}

    {#each paper as q (q.id)}
      <QuestionCard question={q} mode="exam" selected={answers[q.id] ?? null} revealed={true} />
    {/each}
  </div>
{/if}
