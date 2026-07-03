<script lang="ts">
  // 單字表 —— 主體是「字根字彙」：依字首＋字根拆解記憶（現行 vocab.json，隨頁載入）。
  // 可切到「原字庫」瀏覽已下架為次要的舊 GRE/TOEFL 3240 字（vocab-legacy.json，懶載一次）。
  // 兩者都支援搜尋、瀏覽與翻卡練習；VocabCard 對兩種資料形皆相容。
  import { PREFIX_GROUPS, type VocabData } from '@/models/vocab'
  import { loadVocab, loadLegacyVocab } from '@/utils/vocabData'
  import { onMount } from 'svelte'
  import VocabCard from '@/components/vocab/VocabCard.svelte'
  import VocabStudy from '@/components/vocab/VocabStudy.svelte'
  import Segmented from '@/components/common/Segmented.svelte'

  // 字根字庫（預設、主要）—— 小份，隨頁載入。
  let data = $state<VocabData | null>(null)
  let loadError = $state(false)
  const words = $derived(data?.words ?? [])
  onMount(async () => {
    try {
      data = await loadVocab()
    } catch {
      loadError = true
    }
  })

  // 原字庫（次要）—— ~1.4MB，只有使用者切過去才抓一次。
  let legacy = $state<VocabData | null>(null)
  let legacyError = $state(false)
  async function ensureLegacy() {
    if (legacy) return
    legacyError = false
    try {
      legacy = await loadLegacyVocab()
    } catch {
      legacyError = true
    }
  }

  let corpus = $state<'roots' | 'legacy'>('roots')
  let mode = $state<'browse' | 'study'>('browse')
  $effect(() => {
    if (corpus === 'legacy') void ensureLegacy()
  })

  // ── 字根字庫瀏覽：依字首分組（老師教法原序）───────────────────────────────
  let q = $state('')
  let activePrefix = $state<string>('all')
  const availablePrefixIds = $derived(new Set(words.map((w) => w.prefixId)))
  const rootGroups = $derived.by(() => {
    const query = q.trim().toLowerCase()
    return PREFIX_GROUPS.filter((g) => activePrefix === 'all' || g.id === activePrefix)
      .map((g) => ({
        group: g,
        words: words
          .filter((w) => w.prefixId === g.id)
          .filter((w) => !query || w.word.toLowerCase().includes(query) || w.zh.includes(q.trim())),
      }))
      .filter((b) => b.words.length > 0)
  })
  const rootCount = $derived(rootGroups.reduce((n, b) => n + b.words.length, 0))

  // ── 原字庫瀏覽：沿用舊的搜尋／篩選／排序／分頁 ───────────────────────────────
  const legacyWords = $derived(legacy?.words ?? [])
  let lq = $state('')
  let lfilter = $state<'all' | 'exam' | 'gre' | 'toefl'>('all')
  let lsort = $state<'exam' | 'freq' | 'alpha'>('exam')
  let llimit = $state(60)
  const legacyFiltered = $derived.by(() => {
    const query = lq.trim().toLowerCase()
    let list = legacyWords
    if (query) list = list.filter((w) => w.word.includes(query) || w.zh.includes(lq.trim()))
    if (lfilter === 'exam') list = list.filter((w) => w.examCount > 0)
    else if (lfilter === 'gre') list = list.filter((w) => w.tags.includes('gre'))
    else if (lfilter === 'toefl') list = list.filter((w) => w.tags.includes('toefl'))
    const out = [...list]
    if (lsort === 'exam') out.sort((a, b) => b.examCount - a.examCount || (a.frq || 1e9) - (b.frq || 1e9))
    else if (lsort === 'freq') out.sort((a, b) => (a.frq || 1e9) - (b.frq || 1e9))
    else out.sort((a, b) => a.word.localeCompare(b.word))
    return out
  })
  // reset pagination whenever the query / filter / sort changes
  $effect(() => {
    void lq
    void lfilter
    void lsort
    llimit = 60
  })
  const legacyShown = $derived(legacyFiltered.slice(0, llimit))
  const legacyFilters: { key: typeof lfilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'exam', label: '後中考過' },
    { key: 'gre', label: 'GRE' },
    { key: 'toefl', label: 'TOEFL' },
  ]
</script>

<div class="flex flex-col gap-4">
  <header class="flex flex-col gap-1.5">
    <p class="page-kicker">字庫</p>
    <h1 class="page-title">單字表</h1>
    <p class="page-desc max-w-2xl">
      依「字首＋字根」拆解記憶單字：先看構詞，再由字根推出字義；中文只作對照、例句幫助記憶。依 {PREFIX_GROUPS.length} 種字首分類，目前收錄 {words.length} 個字（陸續擴充中）。
    </p>
  </header>

  <Segmented
    block
    ariaLabel="字庫"
    bind:value={corpus}
    options={[
      { value: 'roots', label: '字根字彙' },
      { value: 'legacy', label: '原字庫 GRE·TOEFL' },
    ]}
  />

  {#if corpus === 'roots'}
    {#if data}
      <Segmented
        ariaLabel="單字模式"
        bind:value={mode}
        options={[
          { value: 'browse', label: '瀏覽' },
          { value: 'study', label: '練習（翻卡）' },
        ]}
      />

      {#if mode === 'browse'}
        <div class="flex flex-col gap-3">
          <input type="search" bind:value={q} placeholder="搜尋英文或中文…" class="input input-bordered w-full" />
          <div class="flex flex-wrap items-center gap-2">
            <button class="btn btn-xs" class:btn-primary={activePrefix === 'all'} class:btn-ghost={activePrefix !== 'all'} onclick={() => (activePrefix = 'all')}>全部</button>
            {#each PREFIX_GROUPS as g (g.id)}
              {#if availablePrefixIds.has(g.id)}
                <button class="btn btn-xs" class:btn-primary={activePrefix === g.id} class:btn-ghost={activePrefix !== g.id} onclick={() => (activePrefix = g.id)}>{g.forms.join('/')}</button>
              {/if}
            {/each}
          </div>
          <p class="text-xs text-base-content/50 tabular-nums">{rootCount} 個字</p>

          {#if rootGroups.length}
            <div class="flex flex-col gap-6">
              {#each rootGroups as b (b.group.id)}
                <section class="flex flex-col gap-2.5">
                  <h2 class="section-heading">
                    {b.group.forms.join('、')}
                    <span class="text-sm font-normal text-base-content/55">{b.group.meaning}</span>
                    <span class="ml-auto text-xs font-normal text-base-content/40 tabular-nums">{b.words.length} 字</span>
                  </h2>
                  <div class="grid gap-2.5 sm:grid-cols-2">
                    {#each b.words as w (w.id)}<VocabCard word={w} />{/each}
                  </div>
                </section>
              {/each}
            </div>
          {:else}
            <p class="py-12 text-center text-sm text-base-content/50">找不到符合的字</p>
          {/if}
        </div>
      {:else}
        <VocabStudy {words} />
      {/if}
    {:else if loadError}
      <div class="flex flex-col items-center gap-3 py-16">
        <p class="text-sm text-base-content/60">單字資料載入失敗</p>
        <button class="btn btn-primary btn-sm" onclick={() => { loadError = false; loadVocab().then((d) => (data = d)).catch(() => (loadError = true)) }}>重試</button>
      </div>
    {:else}
      <div class="flex justify-center py-16"><span class="loading loading-spinner loading-lg text-primary"></span></div>
    {/if}
  {:else}
    <!-- 命中率為 vocab-legacy.json 一次性分析（2026-07）：examCount>0 者 1186/3240（36.6%）、
         examCorrect>0 者 605、examIds 聯集 714 題（CMU 239／ISU 211／TCU 264）。原字庫已凍結，數字不變。 -->
    <div class="rounded-box border border-base-300 bg-base-200/40 p-3 text-sm leading-relaxed text-base-content/70">
      原字庫是舊的 GRE／TOEFL 3240 字（已從主頁下架、保留備查）。其中
      <strong class="font-semibold text-base-content/90">1,186 字（36.6%）</strong>曾在後中三校考古題選項出現過、<strong class="font-semibold text-base-content/90">605 字</strong>當過正解，共觸及
      <strong class="font-semibold text-base-content/90">714 題</strong>（中國醫 239／義守 211／慈濟 264）。
    </div>

    {#if legacy}
      <Segmented
        ariaLabel="單字模式"
        bind:value={mode}
        options={[
          { value: 'browse', label: '瀏覽' },
          { value: 'study', label: '練習（翻卡）' },
        ]}
      />

      {#if mode === 'browse'}
        <div class="flex flex-col gap-3">
          <input type="search" bind:value={lq} placeholder="搜尋英文或中文…" class="input input-bordered w-full" />
          <div class="flex flex-wrap items-center gap-2">
            {#each legacyFilters as f (f.key)}
              <button class="btn btn-sm" class:btn-primary={lfilter === f.key} class:btn-ghost={lfilter !== f.key} onclick={() => (lfilter = f.key)}>{f.label}</button>
            {/each}
            <select bind:value={lsort} class="select select-bordered select-sm ml-auto">
              <option value="exam">依後中頻率</option>
              <option value="freq">依常用度</option>
              <option value="alpha">依字母</option>
            </select>
          </div>
          <p class="text-xs text-base-content/50 tabular-nums">{legacyFiltered.length} 個字</p>

          <div class="grid gap-2.5 sm:grid-cols-2">
            {#each legacyShown as w (w.id)}<VocabCard word={w} />{/each}
          </div>

          {#if legacyShown.length < legacyFiltered.length}
            <button class="btn btn-ghost btn-sm self-center" onclick={() => (llimit += 60)}>載入更多（還有 {legacyFiltered.length - legacyShown.length} 個）</button>
          {/if}
        </div>
      {:else}
        <VocabStudy words={legacyWords} />
      {/if}
    {:else if legacyError}
      <div class="flex flex-col items-center gap-3 py-16">
        <p class="text-sm text-base-content/60">原字庫載入失敗</p>
        <button class="btn btn-primary btn-sm" onclick={() => ensureLegacy()}>重試</button>
      </div>
    {:else}
      <div class="flex justify-center py-16"><span class="loading loading-spinner loading-lg text-primary"></span></div>
    {/if}
  {/if}
</div>
