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

<!-- 線上互動考古題：題幹是圖片、按鈕（看答案/錯題本/問AI）皆線上功能，列印無意義且
     題幹圖在無頭列印不載入 → 整段不印（與只含例題的化學 PDF 風格一致）。 -->
<section class="my-4 print:hidden">
  {#if loading}
    <p class="text-sm opacity-60">載入考古題中…</p>
  {:else if shown.length === 0}
    <p class="rounded-box border border-base-300 bg-base-200/40 px-4 py-3 text-sm text-base-content/60">📭 此考點在三校歷年考古題中<b>尚未考過</b>（題庫無相關題目）。</p>
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
