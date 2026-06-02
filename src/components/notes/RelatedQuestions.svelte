<script lang="ts">
  import type { QuestionRecord } from '@/models/question'
  import { SCHOOLS } from '@/models/question'
  import { loadSchools } from '@/utils/dataset'
  import QuestionCard from '@/components/question/QuestionCard.svelte'

  let { tag, limit = 3 }: { tag: string; limit?: number } = $props()

  let matches = $state<QuestionRecord[]>([])
  let loading = $state(true)

  $effect(() => {
    loadSchools([...SCHOOLS])
      .then((qs) => { matches = qs.filter((q) => q.concept_tags.includes(tag)) })
      .finally(() => { loading = false })
  })

  const shown = $derived(matches.slice(0, limit))
</script>

<section class="my-4">
  <h3 class="mb-2 flex items-center gap-1.5 text-base font-bold">
    <span aria-hidden="true">📝</span>相關例題
    {#if !loading}<span class="text-sm font-normal opacity-60">（共 {matches.length} 題）</span>{/if}
  </h3>
  {#if loading}
    <p class="text-sm opacity-60">載入例題中…</p>
  {:else if shown.length === 0}
    <p class="text-sm opacity-60">目前題庫沒有標到「{tag}」的題目。</p>
  {:else}
    <div class="flex flex-col gap-3">
      {#each shown as q (q.id)}
        <QuestionCard question={q} mode="study" />
      {/each}
    </div>
    {#if matches.length > shown.length}
      <a class="btn btn-outline btn-sm mt-3" href={`/study?tag=${encodeURIComponent(tag)}`}>
        看全部 {matches.length} 題 →
      </a>
    {/if}
  {/if}
</section>
