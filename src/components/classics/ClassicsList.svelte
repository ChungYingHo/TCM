<script lang="ts">
  // 古文 list —《古文觀止》精選，按朝代篩選；點一篇在 modal 內讀原文＋白話＋註釋。
  import classicsJson from '@/data/classics.json'
  import type { ClassicsData, Classic } from '@/models/classics'
  import Modal from '@/components/common/Modal.svelte'
  import ClassicReader from '@/components/classics/ClassicReader.svelte'

  const data = classicsJson as unknown as ClassicsData
  const all = data.classics

  const ERA_ORDER = ['先秦', '漢', '魏晉南北朝', '唐', '宋', '元', '明', '清', '近現代']
  const presentEras = ERA_ORDER.filter((e) => all.some((c) => c.era === e))

  let q = $state('')
  let era = $state('all')
  let selected = $state<Classic | null>(null)
  let open = $state(false)

  const filtered = $derived.by(() => {
    const query = q.trim()
    return all.filter((c) => {
      if (era !== 'all' && c.era !== era) return false
      if (query && !(c.title.includes(query) || c.author.includes(query))) return false
      return true
    })
  })

  function openClassic(c: Classic) {
    selected = c
    open = true
  }
</script>

<div class="flex flex-col gap-4">
  <header class="flex flex-col gap-1">
    <h1 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">古文選讀</h1>
    <p class="text-sm text-base-content/55">
      《古文觀止》精選 {data.count} 篇，原文＋白話翻譯＋註釋。點一篇即可閱讀；可依朝代篩選，配合「分析」的時代分布重點準備。
    </p>
  </header>

  <input type="search" bind:value={q} placeholder="搜尋篇名或作者…" class="input input-bordered w-full" />

  <div class="flex flex-wrap gap-1.5">
    <button class="btn btn-sm" class:btn-primary={era === 'all'} class:btn-ghost={era !== 'all'} onclick={() => (era = 'all')}>全部</button>
    {#each presentEras as e (e)}
      <button class="btn btn-sm" class:btn-primary={era === e} class:btn-ghost={era !== e} onclick={() => (era = e)}>{e}</button>
    {/each}
  </div>

  <div class="grid gap-2.5 sm:grid-cols-2">
    {#each filtered as c (c.id)}
      <button
        class="panel-hover flex flex-col items-start gap-1.5 rounded-box border border-base-300 bg-base-100 p-4 text-left shadow-soft"
        onclick={() => openClassic(c)}
      >
        <div class="flex w-full items-baseline justify-between gap-2">
          <span class="font-display text-lg font-bold tracking-tight">{c.title}</span>
          <span class="badge badge-primary badge-sm shrink-0">{c.dynasty}</span>
        </div>
        <span class="text-sm text-base-content/60">{c.author}</span>
        <div class="mt-1 flex flex-wrap items-center gap-1.5">
          {#each c.tags.slice(0, 3) as t (t)}<span class="badge badge-ghost badge-xs">{t}</span>{/each}
          {#if c.examRelevance.count}<span class="badge badge-warning badge-xs">相關題 {c.examRelevance.count}</span>{/if}
        </div>
      </button>
    {/each}
  </div>

  {#if !filtered.length}
    <p class="rounded-box border border-dashed border-base-300 p-6 text-center text-sm text-base-content/55">沒有符合的篇章。</p>
  {/if}
</div>

<Modal bind:open title={selected?.title ?? ''} size="full">
  {#if selected}<ClassicReader classic={selected} />{/if}
</Modal>
