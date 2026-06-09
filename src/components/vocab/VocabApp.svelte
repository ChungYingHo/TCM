<script lang="ts">
  // 單字表 — browse (search / filter / sort) + flashcard study. Built on the enriched
  // vocab.json (3000 GRE/TOEFL words with phonetic + 中文 + bilingual examples).
  import type { VocabData } from '@/models/vocab'
  import { loadVocab } from '@/utils/vocabData'
  import { onMount } from 'svelte'
  import VocabCard from '@/components/vocab/VocabCard.svelte'
  import VocabStudy from '@/components/vocab/VocabStudy.svelte'

  // vocab.json is large, so it is fetched lazily (kept out of the main bundle)
  let data = $state<VocabData | null>(null)
  const words = $derived(data?.words ?? [])
  onMount(async () => {
    data = await loadVocab()
  })

  let tab = $state<'browse' | 'study'>('browse')
  let q = $state('')
  let filter = $state<'all' | 'exam' | 'gre' | 'toefl'>('all')
  let sort = $state<'exam' | 'freq' | 'alpha'>('exam')
  let limit = $state(60)

  const filtered = $derived.by(() => {
    const query = q.trim().toLowerCase()
    let list = words
    if (query) list = list.filter((w) => w.word.includes(query) || w.zh.includes(q.trim()))
    if (filter === 'exam') list = list.filter((w) => w.examCount > 0)
    else if (filter === 'gre') list = list.filter((w) => w.tags.includes('gre'))
    else if (filter === 'toefl') list = list.filter((w) => w.tags.includes('toefl'))
    const out = [...list]
    if (sort === 'exam') out.sort((a, b) => b.examCount - a.examCount || (a.frq || 1e9) - (b.frq || 1e9))
    else if (sort === 'freq') out.sort((a, b) => (a.frq || 1e9) - (b.frq || 1e9))
    else out.sort((a, b) => a.word.localeCompare(b.word))
    return out
  })
  // reset pagination whenever the query / filter / sort changes
  $effect(() => {
    void q
    void filter
    void sort
    limit = 60
  })
  const shown = $derived(filtered.slice(0, limit))

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'exam', label: '後中考過' },
    { key: 'gre', label: 'GRE' },
    { key: 'toefl', label: 'TOEFL' },
  ]
</script>

<div class="flex flex-col gap-4">
  <header class="flex flex-col gap-1">
    <h1 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">單字表</h1>
    <p class="text-sm text-base-content/55">
      {data?.count ?? '3000+'} 個 GRE／TOEFL 高頻字，附 KK 音標、中文與例句。標「後中考過」的是三校考古題實際出現過的字，最該優先背。
    </p>
  </header>

  {#if data}
  <div role="tablist" class="tabs tabs-boxed w-fit">
    <button role="tab" class="tab" class:tab-active={tab === 'browse'} onclick={() => (tab = 'browse')}>瀏覽</button>
    <button role="tab" class="tab" class:tab-active={tab === 'study'} onclick={() => (tab = 'study')}>練習（翻卡）</button>
  </div>

  {#if tab === 'browse'}
    <div class="flex flex-col gap-3">
      <input
        type="search"
        bind:value={q}
        placeholder="搜尋英文或中文…"
        class="input input-bordered w-full"
      />
      <div class="flex flex-wrap items-center gap-2">
        {#each filters as f (f.key)}
          <button class="btn btn-sm" class:btn-primary={filter === f.key} class:btn-ghost={filter !== f.key} onclick={() => (filter = f.key)}>{f.label}</button>
        {/each}
        <select bind:value={sort} class="select select-bordered select-sm ml-auto">
          <option value="exam">依後中頻率</option>
          <option value="freq">依常用度</option>
          <option value="alpha">依字母</option>
        </select>
      </div>
      <p class="text-xs text-base-content/50 tabular-nums">{filtered.length} 個字</p>

      <div class="grid gap-2.5 sm:grid-cols-2">
        {#each shown as w (w.id)}<VocabCard word={w} />{/each}
      </div>

      {#if shown.length < filtered.length}
        <button class="btn btn-ghost btn-sm self-center" onclick={() => (limit += 60)}>載入更多（還有 {filtered.length - shown.length} 個）</button>
      {/if}
    </div>
  {:else}
    <VocabStudy {words} />
  {/if}
  {:else}
    <div class="flex justify-center py-16"><span class="loading loading-spinner loading-lg text-primary"></span></div>
  {/if}
</div>
