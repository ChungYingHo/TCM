<script lang="ts">
  import type { QuestionRecord, School, Subject } from '@/models/question'
  import { SCHOOLS, SUBJECTS, SUBJECT_LABEL, SCHOOL_LABEL } from '@/models/question'
  import { loadSchool } from '@/utils/dataset'
  import { getAttempts } from '@/utils/progress'
  import { listWrong } from '@/utils/wrongBook'
  import { tagTrends, crossSchoolWeights, weaknessClusters, coverage, eraDistribution } from '@/utils/analytics'
  import Sparkline from '@/components/analytics/Sparkline.svelte'

  let subject = $state<Subject>('biology')
  let bySchool = $state<Partial<Record<School, QuestionRecord[]>>>({})
  let loading = $state(true)

  $effect(() => {
    Promise.all(SCHOOLS.map((s) => loadSchool(s).then((qs) => [s, qs] as const)))
      .then((pairs) => { bySchool = Object.fromEntries(pairs) })
      .finally(() => { loading = false })
  })

  const all = $derived(Object.values(bySchool).flat())
  const byId = $derived(new Map(all.map((q) => [q.id, q])))

  const trends = $derived(tagTrends(all, subject).slice(0, 12))
  const eras = $derived(subject === 'chinese' ? eraDistribution(all) : [])
  const eraMax = $derived(Math.max(1, ...eras.map((e) => e.count)))
  const cross = $derived(crossSchoolWeights(bySchool, subject).slice(0, 10))
  const weak = $derived(weaknessClusters(byId, listWrong()).slice(0, 8))
  const cover = $derived(coverage(all, getAttempts()))

  // 升 = 出題變多 → 該主攻(用品牌赭強調,非「壞」的紅);降/穩較淡
  const TREND_MARK: Record<string, string> = { up: '▲ 升溫', down: '▼ 降溫', stable: '— 持平' }
  const TREND_CLS: Record<string, string> = {
    up: 'text-accent font-semibold', down: 'opacity-45', stable: 'opacity-40',
  }
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center gap-2">
    <span class="text-sm font-semibold opacity-80">科目</span>
    <select class="select select-bordered select-sm" bind:value={subject}>
      {#each SUBJECTS as s (s)}<option value={s}>{SUBJECT_LABEL[s]}</option>{/each}
    </select>
    {#if loading}<span class="loading loading-spinner loading-sm"></span>{/if}
  </div>

  <!-- 1. 考點趨勢 -->
  <section class="card border border-base-300 bg-base-100">
    <div class="card-body gap-3 p-4">
      <h2 class="text-lg font-bold">① 考點趨勢 <span class="text-sm font-normal opacity-60">歷年出題次數</span></h2>
      <p class="text-xs opacity-60"><span class="font-semibold text-accent">升溫</span>＝近年出題變多，建議優先主攻。</p>
      <div class="grid gap-2">
        {#each trends as t (t.tag)}
          <div class="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-base-200 py-1 text-sm last:border-0">
            <span class="truncate font-medium" title={t.tag}>{t.tag}</span>
            <Sparkline points={t.points} />
            <span class={`w-12 text-right text-xs ${TREND_CLS[t.trend]}`}>{TREND_MARK[t.trend]}</span>
            <span class="w-10 text-right tabular-nums opacity-70">{t.total}</span>
          </div>
        {/each}
        {#if !loading && trends.length === 0}<p class="opacity-60">尚無資料。</p>{/if}
      </div>
    </div>
  </section>

  <!-- 1.5 國文時代分析（僅國文）-->
  {#if subject === 'chinese' && eras.length}
    <section class="card border border-base-300 bg-base-100">
      <div class="card-body gap-3 p-4">
        <h2 class="text-lg font-bold">時代分析 <span class="text-sm font-normal opacity-60">古文出自哪個朝代</span></h2>
        <p class="text-xs opacity-60">由作者／篇名判定（高精準；部分題無法判定，不計入）。<span class="font-semibold text-accent">出題最多的朝代最該優先準備古文</span>。</p>
        <div class="flex flex-col gap-2">
          {#each eras as e (e.era)}
            <div class="grid grid-cols-[5rem_1fr_4rem] items-center gap-2 text-sm">
              <span class="font-medium">{e.era}</span>
              <span class="h-2.5 overflow-hidden rounded-full bg-base-200">
                <span class="block h-full rounded-full bg-primary" style={`width:${Math.round((e.count / eraMax) * 100)}%`}></span>
              </span>
              <span class="text-right text-xs tabular-nums opacity-70">{e.count}（{e.pct}%）</span>
            </div>
          {/each}
        </div>
        <a href="/classics" class="btn btn-sm btn-primary w-fit">去讀這些朝代的古文 →</a>
      </div>
    </section>
  {/if}

  <!-- 2. 跨校比較 -->
  <section class="card border border-base-300 bg-base-100">
    <div class="card-body gap-3 p-4">
      <h2 class="text-lg font-bold">② 跨校比較 <span class="text-sm font-normal opacity-60">同一考點在各校的權重（佔該科比例）</span></h2>
      <div class="flex flex-col gap-3">
        {#each cross as row (row.tag)}
          <div>
            <div class="mb-1 text-sm font-medium">{row.tag}</div>
            <div class="grid gap-1">
              {#each SCHOOLS as s (s)}
                <div class="grid grid-cols-[3rem_1fr_3rem] items-center gap-2 text-xs">
                  <span class="opacity-70">{SCHOOL_LABEL[s]}</span>
                  <span class="h-2.5 overflow-hidden rounded-full bg-base-200">
                    <span class="block h-full rounded-full bg-primary" style={`width:${Math.min(100, (row.weights[s] ?? 0))}%`}></span>
                  </span>
                  <span class="text-right tabular-nums opacity-70">{(row.weights[s] ?? 0).toFixed(1)}%</span>
                </div>
              {/each}
            </div>
          </div>
        {/each}
        {#if !loading && cross.length === 0}<p class="opacity-60">尚無資料。</p>{/if}
      </div>
    </div>
  </section>

  <!-- 3. 個人化弱點報告 -->
  <section class="card border border-base-300 bg-base-100">
    <div class="card-body gap-3 p-4">
      <h2 class="text-lg font-bold">③ 個人化弱點報告 <span class="text-sm font-normal opacity-60">由錯題本聚類</span></h2>
      {#if weak.length === 0}
        <p class="opacity-60">還沒有足夠的錯題資料。去刷題，答錯的會自動進錯題本，這裡就會長出你的弱點地圖。</p>
      {:else}
        <p class="text-sm opacity-80">這些是你最該補強的考點，建議從第一個開始：</p>
        <ol class="flex flex-col gap-2">
          {#each weak as w, i (w.tag)}
            <li class="flex flex-wrap items-center gap-2 rounded-lg bg-base-200/60 p-2 text-sm">
              <span class="badge badge-error badge-sm">#{i + 1}</span>
              <span class="font-semibold">{w.tag}</span>
              <span class="badge badge-ghost badge-sm">{SUBJECT_LABEL[w.subject]}</span>
              <span class="opacity-60">錯 {w.wrongCount} 次・{w.questionCount} 題</span>
              <span class="ml-auto flex gap-1">
                <a class="btn btn-xs btn-primary" href={`/study?tag=${encodeURIComponent(w.tag)}`}>練這個考點</a>
                <a class="btn btn-xs btn-ghost" href="/notes">看筆記</a>
              </span>
            </li>
          {/each}
        </ol>
      {/if}
    </div>
  </section>

  <!-- 4. 覆蓋度追蹤 -->
  <section class="card border border-base-300 bg-base-100">
    <div class="card-body gap-3 p-4">
      <h2 class="text-lg font-bold">④ 覆蓋度追蹤 <span class="text-sm font-normal opacity-60">避免錯覺式複習</span></h2>
      <div class="grid gap-3 sm:grid-cols-2">
        {#each cover as c (c.subject)}
          <div class="rounded-lg border border-base-200 p-3">
            <div class="mb-2 font-semibold">{SUBJECT_LABEL[c.subject]}</div>
            <div class="flex flex-col gap-2 text-xs">
              <div>
                <div class="mb-0.5 flex justify-between"><span>已練考點</span><span>{c.practicedTags}/{c.totalTags}（{pct(c.practicedTags, c.totalTags)}%）</span></div>
                <span class="block h-2 overflow-hidden rounded-full bg-base-200"><span class="block h-full rounded-full bg-info" style={`width:${pct(c.practicedTags, c.totalTags)}%`}></span></span>
              </div>
              <div>
                <div class="mb-0.5 flex justify-between"><span>已答對考點</span><span>{c.masteredTags}/{c.totalTags}（{pct(c.masteredTags, c.totalTags)}%）</span></div>
                <span class="block h-2 overflow-hidden rounded-full bg-base-200"><span class="block h-full rounded-full bg-success" style={`width:${pct(c.masteredTags, c.totalTags)}%`}></span></span>
              </div>
              <div class="opacity-60">作答 {c.attemptedQuestions}/{c.totalQuestions} 題・答對 {c.correctQuestions} 題</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
</div>
