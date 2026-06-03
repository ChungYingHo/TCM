<script lang="ts">
  // 今日複習 — spaced-repetition queue of due wrong-book questions. Answering grades
  // the card (correct → scheduled further out; wrong → comes back soon).
  import type { QuestionRecord } from '@/models/question'
  import { SCHOOLS } from '@/models/question'
  import { loadSchools } from '@/utils/dataset'
  import { dueEntries, gradeReview } from '@/utils/wrongBook'
  import QuestionCard from '@/components/question/QuestionCard.svelte'

  let byId = $state<Map<string, QuestionRecord>>(new Map())
  let queue = $state<string[]>([])
  let done = $state(0)
  let loading = $state(true)

  function buildQueue() {
    queue = dueEntries().map((e) => e.id)
  }

  $effect(() => {
    loadSchools([...SCHOOLS])
      .then((qs) => { byId = new Map(qs.map((q) => [q.id, q])); buildQueue() })
      .finally(() => { loading = false })
    const onCloud = () => { if (done === 0) buildQueue() }
    window.addEventListener('tcm:cloudloaded', onCloud)
    return () => window.removeEventListener('tcm:cloudloaded', onCloud)
  })

  const items = $derived(queue.map((id) => byId.get(id)).filter(Boolean) as QuestionRecord[])
  const total = $derived(items.length)
  const allDone = $derived(total > 0 && done >= total)

  function grade(id: string, correct: boolean) {
    gradeReview(id, correct)
    done += 1
  }
</script>

<div class="flex flex-col gap-4">
  <header class="flex flex-wrap items-center justify-between gap-2">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">今日複習</h1>
      <p class="text-sm text-base-content/55">依遺忘曲線排程：答對的題目會隔更久再出現，答錯的很快回來。</p>
    </div>
    {#if total > 0}
      <span class="badge badge-primary badge-lg font-bold tabular-nums">{done} / {total}</span>
    {/if}
  </header>

  {#if total > 0}
    <div class="h-2 overflow-hidden rounded-full bg-base-300">
      <span class="block h-full rounded-full bg-primary transition-all" style={`width:${Math.round((done / total) * 100)}%`}></span>
    </div>
  {/if}

  {#if allDone}
    <div class="rounded-box border border-success/30 bg-success/10 p-6 text-center">
      <p class="text-lg font-bold text-success">🎉 今天的複習完成了！</p>
      <p class="mt-1 text-sm text-base-content/60">明天會依排程再給你該複習的題目。</p>
      <a href="/study" class="btn btn-primary btn-sm mt-3">繼續自由刷題 →</a>
    </div>
  {/if}

  {#if !loading && total === 0}
    <div class="flex flex-col items-center gap-3 rounded-box border border-dashed border-base-300 p-8 text-center">
      <p class="text-base-content/70">今天沒有要複習的題目 👍</p>
      <p class="text-sm text-base-content/50">刷題時答錯的會排進這裡，依間隔到期才出現。</p>
      <a href="/study" class="btn btn-primary btn-sm">去刷題 →</a>
    </div>
  {/if}

  {#each items as q (q.id)}
    <QuestionCard question={q} mode="study" onanswer={(c) => grade(q.id, c)} />
  {/each}
</div>
