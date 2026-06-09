<script lang="ts">
  // The spaced-repetition queue of due wrong-book questions, extracted from the old
  // ReviewApp so the daily plan can embed it as one section. Answering grades the card.
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
  {#if total > 0}
    <div class="flex items-center justify-between gap-2">
      <p class="text-sm text-base-content/55">依遺忘曲線排程：答對的隔更久再出現，答錯的很快回來。</p>
      <span class="badge badge-primary font-bold tabular-nums">{done} / {total}</span>
    </div>
    <div class="h-2 overflow-hidden rounded-full bg-base-300">
      <span class="block h-full rounded-full bg-primary transition-all" style={`width:${Math.round((done / total) * 100)}%`}></span>
    </div>
  {/if}

  {#if allDone}
    <div class="rounded-box border border-success/30 bg-success/10 p-5 text-center">
      <p class="font-bold text-success">🎉 到期錯題都複習完了！</p>
    </div>
  {/if}

  {#if !loading && total === 0}
    <div class="flex flex-col items-center gap-2 rounded-box border border-dashed border-base-300 p-6 text-center">
      <p class="text-base-content/70">今天沒有到期的錯題 👍</p>
      <p class="text-sm text-base-content/50">刷題答錯的會排進這裡，依間隔到期才回來。</p>
    </div>
  {/if}

  {#each items as q (q.id)}
    <QuestionCard question={q} mode="study" onanswer={(c) => grade(q.id, c)} />
  {/each}
</div>
