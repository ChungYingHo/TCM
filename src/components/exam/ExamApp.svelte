<script lang="ts">
  import type { OptionLetter, QuestionRecord, School, Subject } from '@/models/question'
  import { SCHOOLS, SUBJECTS, SCHOOL_LABEL, SUBJECT_LABEL } from '@/models/question'
  import { loadSchool, deriveFacets } from '@/utils/dataset'
  import { scoreExam, isChoiceCorrect } from '@/utils/score'
  import { recordWrong } from '@/utils/wrongBook'
  import { recordAttempt } from '@/utils/progress'
  import QuestionCard from '@/components/question/QuestionCard.svelte'

  let school = $state<School>('ISU')
  let year = $state<number | null>(null)
  let subject = $state<Subject>('chemistry')
  let pool = $state<QuestionRecord[]>([])
  let loading = $state(true)

  let stage = $state<'setup' | 'running' | 'done'>('setup')
  let paper = $state<QuestionRecord[]>([])
  let answers = $state<Record<string, OptionLetter | null>>({})

  $effect(() => {
    const s = school
    loading = true
    loadSchool(s).then((qs) => { pool = qs }).finally(() => { loading = false })
  })

  const facets = $derived(deriveFacets(pool))

  function start() {
    paper = pool
      .filter((q) => (year ? q.year === year : true) && q.subject === subject)
      .sort((a, b) => a.question_number - b.question_number)
    answers = {}
    stage = paper.length ? 'running' : 'setup'
  }

  const result = $derived(scoreExam(paper, answers))

  function submit() {
    const now = Date.now()
    for (const q of paper) {
      const c = answers[q.id] ?? null
      const ok = isChoiceCorrect(q, c)
      recordAttempt(q.id, ok, now)
      if (!ok) recordWrong(q.id, c ? [c] : [], now)
    }
    stage = 'done'
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }
</script>

{#if stage === 'setup'}
  <div class="card mx-auto max-w-xl border border-base-300 bg-base-100">
    <div class="card-body gap-4">
      <h2 class="card-title">模擬考設定</h2>
      <label class="form-control">
        <span class="label-text mb-1">學校</span>
        <select class="select select-bordered" bind:value={school}>
          {#each SCHOOLS as s (s)}<option value={s}>{SCHOOL_LABEL[s]}</option>{/each}
        </select>
      </label>
      <label class="form-control">
        <span class="label-text mb-1">年份（民國）</span>
        <select class="select select-bordered" bind:value={year}>
          <option value={null}>全部年份</option>
          {#each facets.years as y (y)}<option value={y}>{y}</option>{/each}
        </select>
      </label>
      <label class="form-control">
        <span class="label-text mb-1">科目</span>
        <select class="select select-bordered" bind:value={subject}>
          {#each SUBJECTS as s (s)}<option value={s}>{SUBJECT_LABEL[s]}</option>{/each}
        </select>
      </label>
      <button class="btn btn-primary" disabled={loading} onclick={start}>開始作答</button>
    </div>
  </div>
{:else if stage === 'running'}
  <div class="flex flex-col gap-3">
    <div class="sticky top-0 z-10 flex items-center justify-between rounded-b-lg bg-base-100/90 p-2 backdrop-blur">
      <span class="text-sm opacity-80">已作答 {Object.values(answers).filter(Boolean).length} / {paper.length}</span>
      <button class="btn btn-sm btn-primary" onclick={submit}>交卷計分</button>
    </div>
    {#each paper as q (q.id)}
      <QuestionCard
        question={q}
        mode="exam"
        selected={answers[q.id] ?? null}
        revealed={false}
        onselect={(l) => (answers = { ...answers, [q.id]: l })}
      />
    {/each}
    <button class="btn btn-primary" onclick={submit}>交卷計分</button>
  </div>
{:else}
  <div class="flex flex-col gap-4">
    <div class="card border border-base-300 bg-base-100">
      <div class="card-body items-center text-center">
        <h2 class="card-title">成績</h2>
        <div class="text-5xl font-black text-primary">{result.correct} / {result.total}</div>
        <p class="opacity-70">作答 {result.answered} 題・正確率 {Math.round((result.correct / Math.max(1, result.total)) * 100)}%</p>
        <button class="btn btn-outline btn-sm" onclick={() => (stage = 'setup')}>再考一次</button>
      </div>
    </div>
    {#each paper as q (q.id)}
      <QuestionCard question={q} mode="exam" selected={answers[q.id] ?? null} revealed={true} />
    {/each}
  </div>
{/if}
