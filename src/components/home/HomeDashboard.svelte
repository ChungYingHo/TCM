<script lang="ts">
  // 首頁儀表板 — 今日任務（到期複習）、連續天數、各科覆蓋、弱點考點與快速入口。
  import type { QuestionRecord } from '@/models/question'
  import { SCHOOLS, SUBJECTS, SUBJECT_LABEL } from '@/models/question'
  import { loadSchools } from '@/utils/dataset'
  import { getAttempts } from '@/utils/progress'
  import { dueCount, listWrong } from '@/utils/wrongBook'
  import { getStreak } from '@/utils/streak'
  import { coverage, weaknessClusters, type SubjectCoverage, type WeakCluster } from '@/utils/analytics'
  import { tagSlug, tagShort } from '@/models/taxonomy'
  import type { Streak } from '@/models/progress'

  let loading = $state(true)
  let due = $state(0)
  let streak = $state<Streak>({ count: 0, best: 0, lastDay: '' })
  let cov = $state<SubjectCoverage[]>([])
  let weak = $state<WeakCluster[]>([])
  let totalQuestions = $state(0)
  let attemptedTotal = $state(0)

  let questions: QuestionRecord[] = []

  function refresh(qs: QuestionRecord[]) {
    const attempts = getAttempts()
    const byId = new Map(qs.map((q) => [q.id, q]))
    due = dueCount()
    streak = getStreak()
    cov = coverage(qs, attempts)
    weak = weaknessClusters(byId, listWrong()).slice(0, 6)
    totalQuestions = qs.length
    attemptedTotal = Object.values(attempts).filter((a) => a.attempts > 0).length
  }

  $effect(() => {
    loadSchools([...SCHOOLS])
      .then((qs) => { questions = qs; refresh(qs) })
      .finally(() => { loading = false })
    const onChange = () => { if (questions.length) refresh(questions) }
    window.addEventListener('tcm:cloudloaded', onChange)
    window.addEventListener('tcm:statechange', onChange)
    return () => {
      window.removeEventListener('tcm:cloudloaded', onChange)
      window.removeEventListener('tcm:statechange', onChange)
    }
  })

  const covBySubject = $derived(new Map(cov.map((c) => [c.subject, c])))
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)

  const links = [
    { href: '/study', label: '自由刷題', icon: '✎', desc: '依年份／考點挑題' },
    { href: '/exam', label: '模擬考', icon: '⏱', desc: '計時整卷練習' },
    { href: '/wrongbook', label: '錯題本', icon: '★', desc: '收藏與重練' },
    { href: '/notes', label: '考點筆記', icon: '☰', desc: '觀念與解題模板' },
    { href: '/vocab', label: '高頻單字', icon: 'A', desc: '英文字彙表' },
    { href: '/analytics', label: '考點趨勢', icon: '◷', desc: '三校出題分析' },
  ]
</script>

<div class="flex flex-col gap-7">
  <header class="flex flex-col gap-1">
    <h1 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">學習儀表板</h1>
    <p class="text-sm text-base-content/55">先清掉今天到期的複習，再依弱點補強。</p>
  </header>

  <!-- 今日任務 + 連續天數 -->
  <section class="grid gap-3 sm:grid-cols-3">
    <a
      href="/review"
      class="panel-hover group relative flex flex-col justify-between gap-3 rounded-box border border-primary/25 bg-primary/[0.07] p-5 sm:col-span-2"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-primary/80">今日複習</p>
          <p class="mt-1 text-4xl font-bold tabular-nums text-primary">
            {loading ? '—' : due}<span class="ml-1 text-base font-medium text-base-content/50">題到期</span>
          </p>
        </div>
        <span aria-hidden="true" class="grid h-11 w-11 place-items-center rounded-2xl bg-primary/12 text-xl text-primary">↻</span>
      </div>
      <span class="inline-flex items-center gap-1 text-sm font-semibold text-primary">
        {due > 0 ? '開始複習' : '看看排程'} <span class="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </a>

    <div class="flex flex-col justify-between gap-2 rounded-box border border-base-300 bg-base-100 p-5 shadow-soft">
      <p class="text-sm font-medium text-base-content/60">連續天數</p>
      <p class="text-4xl font-bold tabular-nums">
        {loading ? '—' : streak.count}<span class="ml-1 text-base font-medium text-base-content/50">天</span>
      </p>
      <p class="text-xs text-base-content/45">最佳 {streak.best} 天 · {streak.count > 0 ? '保持下去 🔥' : '今天開始第一天'}</p>
    </div>
  </section>

  <!-- 各科覆蓋 -->
  <section class="flex flex-col gap-3">
    <div class="flex items-baseline justify-between">
      <h2 class="text-lg font-bold tracking-tight">各科覆蓋</h2>
      <p class="text-xs text-base-content/50">已練 {attemptedTotal} / {totalQuestions} 題</p>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      {#each SUBJECTS as subject (subject)}
        {@const c = covBySubject.get(subject)}
        <div class="rounded-box border border-base-300 bg-base-100 p-4 shadow-soft">
          <div class="flex items-center justify-between">
            <span class="font-semibold">{SUBJECT_LABEL[subject]}</span>
            <span class="text-xs text-base-content/50">
              {c ? `${c.practicedTags}/${c.totalTags} 考點` : '—'}
            </span>
          </div>
          <div class="mt-2.5 flex flex-col gap-1.5">
            <div class="flex items-center gap-2">
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-base-300">
                <span class="block h-full rounded-full bg-primary/70" style={`width:${c ? pct(c.practicedTags, c.totalTags) : 0}%`}></span>
              </div>
              <span class="w-9 text-right text-xs tabular-nums text-base-content/55">{c ? pct(c.practicedTags, c.totalTags) : 0}%</span>
            </div>
            <p class="text-xs text-base-content/45">
              {#if c && c.attemptedQuestions}
                答對率 {pct(c.correctQuestions, c.attemptedQuestions)}%（{c.attemptedQuestions} 題已練）
              {:else}
                尚未開始
              {/if}
            </p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- 弱點考點 -->
  {#if weak.length}
    <section class="flex flex-col gap-3">
      <h2 class="text-lg font-bold tracking-tight">該補強的考點</h2>
      <p class="-mt-2 text-xs text-base-content/50">依錯題本累計錯誤次數排序，點開直接讀該考點筆記。</p>
      <div class="flex flex-wrap gap-2">
        {#each weak as w (w.tag)}
          {@const slug = tagSlug(w.tag)}
          <a
            href={slug ? `/notes/${slug}` : '/notes'}
            class="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3.5 py-1.5 text-sm font-medium text-base-content transition-colors hover:bg-warning/20"
          >
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
        <a
          href={l.href}
          class="panel-hover flex items-center gap-3 rounded-box border border-base-300 bg-base-100 p-4 shadow-soft"
        >
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
