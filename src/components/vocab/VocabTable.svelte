<script lang="ts">
  // High-frequency English vocabulary table — sortable / searchable / theme-
  // filterable. "考過次數" = times the word appeared as an option; "當正解" =
  // times it was the correct answer (memorise these first). Each row links to
  // the questions that used it.
  interface Word { word: string; count: number; correct: number; theme: string; ids: string[] }
  let { words = [] }: { words?: Word[] } = $props()

  const THEMES: { key: string; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'medical', label: '醫學/健康' },
    { key: 'adjective', label: '進階形容詞' },
    { key: 'verb', label: '學術動詞' },
    { key: 'general', label: '一般' },
  ]
  const THEME_LABEL: Record<string, string> = {
    medical: '醫學', adjective: '形容詞', verb: '動詞', general: '一般',
  }
  const THEME_CLS: Record<string, string> = {
    medical: 'badge-error', adjective: 'badge-secondary', verb: 'badge-info', general: 'badge-ghost',
  }

  let term = $state('')
  let theme = $state('all')
  let sort = $state<'count' | 'correct' | 'alpha'>('count')
  let limit = $state(80)

  const filtered = $derived.by(() => {
    const t = term.trim().toLowerCase()
    let out = words.filter((w) =>
      (theme === 'all' || w.theme === theme) && (!t || w.word.includes(t)),
    )
    out = [...out].sort((a, b) =>
      sort === 'alpha' ? a.word.localeCompare(b.word)
      : sort === 'correct' ? b.correct - a.correct || b.count - a.count
      : b.count - a.count || b.correct - a.correct,
    )
    return out
  })
  const visible = $derived(filtered.slice(0, limit))

  $effect(() => { void (term, theme, sort); limit = 80 })
</script>

<div class="flex flex-col gap-3">
  <div class="flex flex-wrap items-center gap-2">
    <input type="search" bind:value={term} placeholder="搜尋單字…"
      class="input input-bordered input-sm w-full sm:w-48" />
    <div class="flex flex-wrap gap-1">
      {#each THEMES as t (t.key)}
        <button type="button" class={`badge badge-lg cursor-pointer ${theme === t.key ? 'badge-primary' : 'badge-outline'}`} onclick={() => (theme = t.key)}>{t.label}</button>
      {/each}
    </div>
  </div>

  <div class="flex items-center gap-2 text-xs">
    <span class="opacity-60">排序：</span>
    <button type="button" class={`btn btn-xs ${sort === 'count' ? 'btn-primary' : 'btn-ghost'}`} onclick={() => (sort = 'count')}>考過最多</button>
    <button type="button" class={`btn btn-xs ${sort === 'correct' ? 'btn-primary' : 'btn-ghost'}`} onclick={() => (sort = 'correct')}>當正解最多</button>
    <button type="button" class={`btn btn-xs ${sort === 'alpha' ? 'btn-primary' : 'btn-ghost'}`} onclick={() => (sort = 'alpha')}>字母</button>
    <span class="ml-auto opacity-60">{filtered.length} 字</span>
  </div>

  <ul class="divide-y divide-base-300 rounded-box border border-base-300 bg-base-100">
    {#each visible as w (w.word)}
      <li class="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5">
        <a class="flex-1 text-base font-bold lowercase hover:text-primary hover:underline" href={`/study?q=${encodeURIComponent(w.word)}`} title="看考過這個字的題目">{w.word}</a>
        <span class={`badge badge-sm ${THEME_CLS[w.theme]}`}>{THEME_LABEL[w.theme]}</span>
        <span class="badge badge-ghost badge-sm" title="出現在選項的次數">考 {w.count}</span>
        {#if w.correct > 0}
          <span class="badge badge-success badge-sm" title="當過正確答案的次數">正解 {w.correct}</span>
        {/if}
      </li>
    {/each}
  </ul>

  {#if visible.length < filtered.length}
    <button class="btn btn-outline btn-sm" onclick={() => (limit += 80)}>顯示更多（{filtered.length - visible.length}）</button>
  {/if}
  {#if filtered.length === 0}
    <p class="rounded-lg border border-dashed border-base-300 p-6 text-center text-sm opacity-60">沒有符合的單字。</p>
  {/if}
</div>
