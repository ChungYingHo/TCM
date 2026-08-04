<script lang="ts">
  import type { QuestionRecord } from '@/models/question'
  import { loadByIds } from '@/utils/dataset'
  import { listWrong, clearWrongBook, removeWrong } from '@/utils/wrongBook'
  import QuestionCard from '@/components/question/QuestionCard.svelte'
  import Icon from '@/components/common/Icon.svelte'

  let byId = $state<Map<string, QuestionRecord>>(new Map())
  let entries = $state(listWrong())
  let loading = $state(true)

  // Resolve question bodies for the current wrong-book entries; reruns (cheap, cached)
  // whenever the entry set changes so a freshly-added id is always covered.
  $effect(() => {
    loadByIds(entries.map((e) => e.id)).then((m) => { byId = m }).finally(() => { loading = false })
  })

  // refresh when the cloud copy loads, or the user answers elsewhere
  $effect(() => {
    const refresh = () => { entries = listWrong() }
    window.addEventListener('tcm:cloudloaded', refresh)
    window.addEventListener('tcm:statechange', refresh)
    return () => {
      window.removeEventListener('tcm:cloudloaded', refresh)
      window.removeEventListener('tcm:statechange', refresh)
    }
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
    <p class="text-sm text-base-content/70">
      {#if loading}載入中…{:else}共 <b>{items.length}</b> 題，依錯誤次數排序{/if}
    </p>
    {#if entries.length}
      <button class="btn btn-ghost btn-sm" onclick={clearAll}>清空</button>
    {/if}
  </div>

  {#if !loading && items.length === 0}
    <div class="flex flex-col items-center gap-3 rounded-box border border-dashed border-base-300 p-8 text-center">
      <p class="opacity-70">錯題本還是空的。答錯的題目會自動收進來。</p>
      <a href="/exam" class="btn btn-primary btn-sm">去考一份 <Icon name="arrowRight" class="h-4 w-4" /></a>
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
