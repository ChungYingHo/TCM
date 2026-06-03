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
  {#if loading}
    <p class="text-sm opacity-60">載入考古題中…</p>
  {:else if shown.length === 0}
    <p class="text-sm opacity-60">目前題庫沒有標到「{tag}」的題目。</p>
  {:else}
    <p class="mb-2 text-sm opacity-60">題庫中共 {matches.length} 題標到本考點，挑出 {shown.length} 題：</p>
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
