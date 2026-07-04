<script lang="ts">
  import type { QuestionRecord } from '@/models/question'
  import { SCHOOLS } from '@/models/question'
  import { loadSchools } from '@/utils/dataset'
  import QuestionCard from '@/components/question/QuestionCard.svelte'

  // `also` lets a merged note (covers multiple concept tags) surface questions from all of
  // them — e.g. atomic-structure covers 週期性 + 化學鍵與分子結構.
  // `offset` lets a multi-part note series (細胞一/二/三 共用同一 concept tag) each show a
  // different window of the same pool instead of repeating the first N.
  let { tag, also = [], limit = 3, offset = 0 }: { tag: string; also?: string[]; limit?: number; offset?: number } = $props()

  let matches = $state<QuestionRecord[]>([])
  let loading = $state(true)

  $effect(() => {
    const wanted = new Set([tag, ...also])
    loadSchools([...SCHOOLS])
      .then((qs) => { matches = qs.filter((q) => q.concept_tags.some((t) => wanted.has(t))) })
      .finally(() => { loading = false })
  })

  // window into the pool; wrap so an over-large offset still yields questions
  const start = $derived(matches.length ? offset % matches.length : 0)
  const shown = $derived(matches.slice(start, start + limit))
</script>

<!-- 考古題：螢幕為互動作答（選項／看答案／錯題本／問AI）；QuestionCard 另有 hidden print:block
     靜態版，PDF 會印出題幹圖＋選項＋正解＋詳解（見 QuestionCard、AnswerReveal）。 -->
<section class="my-4">
  {#if loading}
    <p class="text-sm opacity-60 print:hidden">載入考古題中…</p>
  {:else if shown.length === 0}
    <p class="rounded-box border border-base-300 bg-base-200/40 px-4 py-3 text-sm text-base-content/60">📭 此考點在三校歷年考古題中<b>尚未考過</b>（題庫無相關題目）。</p>
  {:else}
    <p class="mb-2 text-sm opacity-60">題庫中共 {matches.length} 題標到本考點，挑出 {shown.length} 題：</p>
    <div class="flex flex-col gap-3">
      {#each shown as q (q.id)}
        <QuestionCard question={q} mode="study" printable />
      {/each}
    </div>
    {#if matches.length > shown.length}
      <a class="btn btn-outline btn-sm mt-3 print:hidden" href={`/study?tag=${encodeURIComponent(tag)}`}>
        看全部 {matches.length} 題 →
      </a>
    {/if}
  {/if}
</section>
