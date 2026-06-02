<script lang="ts">
  import type { QuestionRecord } from '@/models/question'
  import { SCHOOLS } from '@/models/question'
  import { loadSchools } from '@/utils/dataset'
  import { listWrong, clearWrongBook, removeWrong } from '@/utils/wrongBook'
  import QuestionCard from '@/components/question/QuestionCard.svelte'

  let byId = $state<Map<string, QuestionRecord>>(new Map())
  let entries = $state(listWrong())
  let loading = $state(true)

  $effect(() => {
    loadSchools([...SCHOOLS])
      .then((qs) => { byId = new Map(qs.map((q) => [q.id, q])) })
      .finally(() => { loading = false })
  })

  const items = $derived(
    entries.map((e) => ({ entry: e, q: byId.get(e.id) })).filter((x) => x.q),
  )

  function refresh() { entries = listWrong() }
  function drop(id: string) { removeWrong(id); refresh() }
  function clearAll() {
    if (confirm('確定清空整本錯題本？')) { clearWrongBook(); refresh() }
  }
</script>

<div class="flex flex-col gap-3">
  <div class="flex items-center justify-between">
    <p class="text-sm opacity-80">
      {#if loading}載入中…{:else}共 <b>{items.length}</b> 題，依錯誤次數排序{/if}
    </p>
    {#if entries.length}
      <button class="btn btn-ghost btn-sm" onclick={clearAll}>清空</button>
    {/if}
  </div>

  {#if !loading && items.length === 0}
    <div class="rounded-lg border border-dashed border-base-300 p-8 text-center opacity-70">
      錯題本還是空的。去刷題吧！答錯的題目會自動收進來。
    </div>
  {/if}

  {#each items as { entry, q } (entry.id)}
    <div class="relative">
      <div class="absolute right-2 top-2 z-10 flex items-center gap-2">
        <span class="badge badge-error" title="錯誤次數">錯 {entry.wrongCount} 次</span>
        <button class="btn btn-ghost btn-xs" onclick={() => drop(entry.id)}>移除</button>
      </div>
      <QuestionCard question={q!} mode="study" />
    </div>
  {/each}
</div>
