<script lang="ts">
  import type { QuestionRecord } from '@/models/question'
  import { SCHOOLS, SUBJECTS, SUBJECT_LABEL } from '@/models/question'
  import { loadSchools } from '@/utils/dataset'
  import { getAttempts } from '@/utils/progress'
  import { listWrong, dueCount } from '@/utils/wrongBook'
  import { coverage, weaknessClusters, type SubjectCoverage, type WeakCluster } from '@/utils/analytics'
  import { tagShort } from '@/models/taxonomy'
  import { todayKey, parseYmd, zhDateLabel } from '@/utils/date'
  import Icon from '@/components/common/Icon.svelte'
  import type { IconName } from '@/utils/icons'

  let loading = $state(true)
  let due = $state(0)
  let cov = $state<SubjectCoverage[]>([])
  let weak = $state<WeakCluster[]>([])
  let attemptedTotal = $state(0)
  let totalQuestions = $state(0)

  let questions: QuestionRecord[] = []
  const today = todayKey()

  function refresh(qs: QuestionRecord[]) {
    const attempts = getAttempts()
    const byId = new Map(qs.map((q) => [q.id, q]))
    due = dueCount()
    cov = coverage(qs, attempts)
    weak = weaknessClusters(byId, listWrong()).slice(0, 6)
    attemptedTotal = Object.values(attempts).filter((a) => a.attempts > 0).length
    totalQuestions = qs.length
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

  const covBySubject = $derived(new Map(cov.map((c) => [c.subject, c])))
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)

  const dateLabel = zhDateLabel(new Date(parseYmd(today)))
  const hour = new Date().getHours()
  const greeting = hour < 5 ? '夜深了' : hour < 11 ? '早安' : hour < 18 ? '午安' : '晚安'

  const links: { href: string; label: string; icon: IconName; desc: string }[] = [
    { href: '/review', label: '練習站', icon: 'bookOpen', desc: '今日隨機練習' },
    { href: '/study', label: '刷題', icon: 'pencil', desc: '依年份／考點挑題' },
    { href: '/exam', label: '模擬考', icon: 'timer', desc: '計時整卷練習' },
    { href: '/wrongbook', label: '錯題本', icon: 'star', desc: '收藏與重練' },
    { href: '/vocab', label: '單字', icon: 'type', desc: '3000 高頻字＋例句' },
    { href: '/classics', label: '古文', icon: 'book', desc: '古文觀止精選' },
    { href: '/notes', label: '筆記', icon: 'sparkles', desc: '考點互動筆記' },
  ]
</script>

<div class="flex flex-col gap-7">
  <!-- Hero: 問候 + 練習站入口 -->
  <section>
    <a href="/review" class="panel-hover group relative flex flex-col justify-between gap-5 overflow-hidden rounded-box border border-primary/20 bg-gradient-to-br from-primary/[0.09] via-primary/[0.04] to-transparent p-5 sm:p-6">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="page-kicker">{dateLabel}</p>
          <p class="mt-2 font-display text-2xl font-bold tracking-tight sm:text-[1.7rem]">{greeting}，開始今天的練習吧</p>
        </div>
        <span aria-hidden="true" class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
          <Icon name="bookOpen" class="h-6 w-6" />
        </span>
      </div>
      <span class="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-content shadow-soft transition-all group-hover:gap-2.5">
        進入練習站
        <Icon name="arrowRight" class="h-4 w-4" stroke={2.2} />
      </span>
    </a>
  </section>

  <!-- 簡單統計 -->
  <section class="flex flex-col gap-3">
    <h2 class="section-heading">學習概況</h2>
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-box border border-base-300 bg-base-100 p-4 shadow-soft">
        <span class="text-sm font-medium text-base-content/55">已練習</span>
        <p class="mt-1 text-2xl font-bold tabular-nums">{loading ? '—' : attemptedTotal}<span class="text-base font-medium text-base-content/40"> / {totalQuestions} 題</span></p>
      </div>
      <div class="rounded-box border border-base-300 bg-base-100 p-4 shadow-soft">
        <span class="text-sm font-medium text-base-content/55">到期錯題</span>
        <p class="mt-1 text-2xl font-bold tabular-nums">{loading ? '—' : due}<span class="text-base font-medium text-base-content/40"> 題</span></p>
        <a href="/wrongbook" class="mt-2 inline-flex items-center gap-0.5 text-xs font-medium text-primary">去複習 <Icon name="arrowRight" class="h-3 w-3" /></a>
      </div>
      <div class="rounded-box border border-base-300 bg-base-100 p-4 shadow-soft">
        <span class="text-sm font-medium text-base-content/55">各科考點覆蓋</span>
        <div class="mt-2 flex flex-col gap-1.5">
          {#each SUBJECTS as s (s)}
            {@const c = covBySubject.get(s)}
            <div class="flex items-center gap-2">
              <span class="w-8 shrink-0 text-xs font-semibold">{SUBJECT_LABEL[s]}</span>
              <div class="min-w-0 flex-1">
                <div class="h-1.5 overflow-hidden rounded-full bg-base-300"><span class="block h-full rounded-full bg-primary/70" style={`width:${c ? pct(c.practicedTags, c.totalTags) : 0}%`}></span></div>
              </div>
              <span class="shrink-0 text-right text-[0.65rem] tabular-nums text-base-content/50">{c ? c.practicedTags : 0}/{c ? c.totalTags : 0}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- 該補強的考點 -->
  {#if weak.length}
    <section class="flex flex-col gap-3">
      <h2 class="section-heading">該補強的考點</h2>
      <p class="-mt-2 text-xs text-base-content/50">依錯題累計排序，點進去練習相關題目。</p>
      <div class="flex flex-wrap gap-2">
        {#each weak as w (w.tag)}
          <a href={`/study?tag=${encodeURIComponent(w.tag)}`} class="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3.5 py-1.5 text-sm font-medium text-base-content transition-colors hover:bg-warning/20">
            <span>{tagShort(w.tag)}</span>
            <span class="rounded-full bg-warning/20 px-1.5 text-xs tabular-nums text-warning-content/80">錯 {w.wrongCount}</span>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- 快速入口 -->
  <section class="flex flex-col gap-3">
    <h2 class="section-heading">快速入口</h2>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {#each links as l (l.href)}
        <a href={l.href} class="panel-hover group flex items-center gap-3 rounded-box border border-base-300 bg-base-100 p-4 shadow-soft">
          <span aria-hidden="true" class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <Icon name={l.icon} class="h-[1.15rem] w-[1.15rem]" />
          </span>
          <span class="flex min-w-0 flex-col">
            <span class="font-semibold leading-tight">{l.label}</span>
            <span class="truncate text-xs text-base-content/50">{l.desc}</span>
          </span>
        </a>
      {/each}
    </div>
  </section>
</div>
