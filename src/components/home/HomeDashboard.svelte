<script lang="ts">
  // 首頁指揮中心 — 今日讀書入口、距考倒數、各軌步調（單字/考點/古文）、連續天數、
  // 該補強考點、快速統計與入口。資料與「今日複習」「進度摘要 API」同源（studyPlan）。
  import type { QuestionRecord, Subject } from '@/models/question'
  import { SCHOOLS, SUBJECTS, SUBJECT_LABEL } from '@/models/question'
  import { loadSchools } from '@/utils/dataset'
  import { getAttempts } from '@/utils/progress'
  import { listWrong, dueCount } from '@/utils/wrongBook'
  import { getStreak } from '@/utils/streak'
  import { coverage, weaknessClusters, type SubjectCoverage, type WeakCluster } from '@/utils/analytics'
  import { tagSlug, tagShort } from '@/models/taxonomy'
  import { ymd } from '@/utils/date'
  import { dumpPlan, getDay } from '@/utils/dailyPlan'
  import { deriveCursors } from '@/utils/studyCursor'
  import { computeToday, type ScheduleData } from '@/utils/studyPlan'
  import scheduleJson from '@/data/schedule.json'
  import vocabJson from '@/data/vocab.json'
  import classicsJson from '@/data/classics.json'

  const schedule = scheduleJson as unknown as ScheduleData
  const vocabTotal = (vocabJson as { count: number }).count
  const classicsTotal = (classicsJson as { count: number }).count

  let loading = $state(true)
  let due = $state(0)
  let streak = $state(getStreak())
  let cov = $state<SubjectCoverage[]>([])
  let weak = $state<WeakCluster[]>([])
  let attemptedTotal = $state(0)
  let totalQuestions = $state(0)
  let planStore = $state(dumpPlan())

  let questions: QuestionRecord[] = []
  const today = ymd(Date.now())

  function refresh(qs: QuestionRecord[]) {
    const attempts = getAttempts()
    const byId = new Map(qs.map((q) => [q.id, q]))
    due = dueCount()
    streak = getStreak()
    cov = coverage(qs, attempts)
    weak = weaknessClusters(byId, listWrong()).slice(0, 6)
    attemptedTotal = Object.values(attempts).filter((a) => a.attempts > 0).length
    totalQuestions = qs.length
    planStore = dumpPlan()
  }

  $effect(() => {
    loadSchools([...SCHOOLS])
      .then((qs) => { questions = qs; refresh(qs) })
      .finally(() => { loading = false })
    const on = () => { if (questions.length) refresh(questions) }
    window.addEventListener('tcm:cloudloaded', on)
    window.addEventListener('tcm:statechange', on)
    return () => {
      window.removeEventListener('tcm:cloudloaded', on)
      window.removeEventListener('tcm:statechange', on)
    }
  })

  const tp = $derived(computeToday(schedule, planStore, today))
  const cur = $derived(deriveCursors(planStore, schedule.perDay.newVocab))
  const todayState = $derived(getDay(today))
  const todayDone = $derived.by(() => {
    const s = todayState
    const notesDone = s.notes ? Object.values(s.notes).filter(Boolean).length : 0
    return notesDone + (['quiz', 'newVocab', 'reviewVocab', 'classic', 'wrong'] as const).filter((f) => s[f]).length
  })
  const covBySubject = $derived(new Map(cov.map((c) => [c.subject, c])))
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)

  const paceBadge = $derived(
    tp.pace.aheadDays > 0
      ? { label: `超前 ${tp.pace.aheadDays} 天`, cls: 'text-success' }
      : tp.pace.aheadDays < 0
        ? { label: `落後 ${-tp.pace.aheadDays} 天`, cls: 'text-warning' }
        : { label: '準時', cls: 'text-base-content/50' },
  )

  const links = [
    { href: '/study', label: '刷題', icon: '✎', desc: '依年份／考點挑題' },
    { href: '/exam', label: '模擬考', icon: '⏱', desc: '計時整卷練習' },
    { href: '/wrongbook', label: '錯題本', icon: '★', desc: '收藏與重練' },
    { href: '/notes', label: '考點筆記', icon: '☰', desc: '觀念與解題模板' },
    { href: '/vocab', label: '單字', icon: 'A', desc: '3000 高頻字＋例句' },
    { href: '/classics', label: '古文', icon: '文', desc: '古文觀止精選' },
  ]
</script>

<div class="flex flex-col gap-7">
  <!-- Hero: 今日複習 + 倒數 -->
  <section class="grid gap-3 sm:grid-cols-3">
    <a href="/review" class="panel-hover group relative flex flex-col justify-between gap-3 rounded-box border border-primary/25 bg-primary/[0.07] p-5 sm:col-span-2">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-primary/80">今日複習</p>
          <p class="mt-1 text-2xl font-bold text-primary">打開今天的讀書計畫</p>
          <p class="mt-1 text-sm text-base-content/60">
            {#if tp.dayType === 'rest'}今天是放空日，休息也很好 🌿
            {:else if tp.dayType === 'light'}輕量日 · 複習為主
            {:else}今日進度 {todayDone} 段{/if}
          </p>
        </div>
        <span aria-hidden="true" class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-xl text-primary">↻</span>
      </div>
      <span class="inline-flex items-center gap-1 text-sm font-semibold text-primary">開始讀書 <span class="transition-transform group-hover:translate-x-0.5">→</span></span>
    </a>

    <div class="flex flex-col justify-between gap-1 rounded-box border border-base-300 bg-base-100 p-5 shadow-soft">
      <p class="text-sm font-medium text-base-content/60">距離考試</p>
      <p class="text-4xl font-bold tabular-nums">{tp.daysToExam}<span class="ml-1 text-base font-medium text-base-content/50">天</span></p>
      <p class="text-xs text-base-content/45">連續 {streak.count} 天 · 最佳 {streak.best} 天</p>
    </div>
  </section>

  <!-- 步調總覽 -->
  <section class="flex flex-col gap-3">
    <h2 class="text-lg font-bold tracking-tight">讀書進度</h2>
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-box border border-base-300 bg-base-100 p-4 shadow-soft">
        <div class="flex items-baseline justify-between">
          <span class="font-semibold">單字</span>
          <span class={`text-xs font-medium ${paceBadge.cls}`}>{paceBadge.label}</span>
        </div>
        <p class="mt-1 text-2xl font-bold tabular-nums">{cur.vocab}<span class="text-base font-medium text-base-content/40">/{vocabTotal}</span></p>
        <div class="mt-2 h-2 overflow-hidden rounded-full bg-base-300"><span class="block h-full rounded-full bg-primary" style={`width:${pct(cur.vocab, vocabTotal)}%`}></span></div>
      </div>

      <div class="rounded-box border border-base-300 bg-base-100 p-4 shadow-soft">
        <span class="font-semibold">古文</span>
        <p class="mt-1 text-2xl font-bold tabular-nums">{cur.classics}<span class="text-base font-medium text-base-content/40">/{classicsTotal}</span></p>
        <div class="mt-2 h-2 overflow-hidden rounded-full bg-base-300"><span class="block h-full rounded-full bg-primary" style={`width:${pct(cur.classics, classicsTotal)}%`}></span></div>
      </div>

      <div class="rounded-box border border-base-300 bg-base-100 p-4 shadow-soft">
        <span class="font-semibold">到期錯題</span>
        <p class="mt-1 text-2xl font-bold tabular-nums">{loading ? '—' : due}<span class="text-base font-medium text-base-content/40"> 題</span></p>
        <a href="/review" class="mt-2 inline-block text-xs font-medium text-primary">去複習 →</a>
      </div>
    </div>

    <div class="grid gap-2 sm:grid-cols-2">
      {#each SUBJECTS as s (s)}
        {@const c = covBySubject.get(s)}
        <div class="flex items-center gap-3 rounded-box border border-base-300 bg-base-100 p-3 shadow-soft">
          <span class="w-10 shrink-0 text-sm font-semibold">{SUBJECT_LABEL[s]}</span>
          <div class="flex-1">
            <div class="h-2 overflow-hidden rounded-full bg-base-300"><span class="block h-full rounded-full bg-primary/70" style={`width:${c ? pct(c.practicedTags, c.totalTags) : 0}%`}></span></div>
          </div>
          <span class="w-24 text-right text-xs tabular-nums text-base-content/55">考點 {c ? c.practicedTags : 0}/{c ? c.totalTags : 0}</span>
        </div>
      {/each}
    </div>
    <p class="text-xs text-base-content/45">已練 {attemptedTotal} / {totalQuestions} 題</p>
  </section>

  <!-- 該補強的考點 -->
  {#if weak.length}
    <section class="flex flex-col gap-3">
      <h2 class="text-lg font-bold tracking-tight">該補強的考點</h2>
      <p class="-mt-2 text-xs text-base-content/50">依錯題累計排序，點開直接讀該考點筆記。</p>
      <div class="flex flex-wrap gap-2">
        {#each weak as w (w.tag)}
          {@const slug = tagSlug(w.tag)}
          <a href={slug ? `/notes/${slug}` : '/notes'} class="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3.5 py-1.5 text-sm font-medium text-base-content transition-colors hover:bg-warning/20">
            <span>{tagShort(w.tag)}</span>
            <span class="rounded-full bg-warning/20 px-1.5 text-xs tabular-nums text-warning-content/80">錯 {w.wrongCount}</span>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- 快速入口 -->
  <section class="flex flex-col gap-3">
    <h2 class="text-lg font-bold tracking-tight">快速入口</h2>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {#each links as l (l.href)}
        <a href={l.href} class="panel-hover flex items-center gap-3 rounded-box border border-base-300 bg-base-100 p-4 shadow-soft">
          <span aria-hidden="true" class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-base text-primary">{l.icon}</span>
          <span class="flex flex-col">
            <span class="font-semibold leading-tight">{l.label}</span>
            <span class="text-xs text-base-content/50">{l.desc}</span>
          </span>
        </a>
      {/each}
    </div>
  </section>
</div>
