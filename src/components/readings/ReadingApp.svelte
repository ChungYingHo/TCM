<script lang="ts">
  import type { ReadingArticle } from '@/models/reading'

  interface Props {
    articles: ReadingArticle[]
  }
  const { articles }: Props = $props()

  let idx = $state(0)
  const article = $derived(articles[idx])

  let showZh = $state(true)
  let vocabOpen = $state(true)

  // 需標底線的表面形（屈折形用 word.match，預設用詞條原形）；去重避免同形重複包 <mark>
  const forms = $derived([...new Set(article.words.flatMap((w) => w.match ?? [w.word]))])

  function parseContent(raw: string) {
    return raw.split('\n\n').map((block) => {
      const trimmed = block.trim()
      if (trimmed.startsWith('## ')) return { t: 'h' as const, text: trimmed.slice(3) }
      return { t: 'p' as const, text: trimmed }
    })
  }

  const blocks = $derived(parseContent(article.content))

  function highlightWords(text: string): string {
    if (forms.length === 0) return text
    const sorted = [...forms].sort((a, b) => b.length - a.length)
    let result = text
    for (const f of sorted) {
      const escaped = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(`\\b(${escaped})\\b`, 'gi')
      result = result.replace(re, '<mark class="vocab-hl">$1</mark>')
    }
    return result
  }

  function prev() { if (idx > 0) idx-- }
  function next() { if (idx < articles.length - 1) idx++ }
</script>

<!-- 文章選擇器 -->
<div class="mb-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
  {#each articles as a, i (a.id)}
    <button
      class="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors {i === idx
        ? 'bg-primary/12 text-primary font-semibold'
        : 'bg-base-content/6 text-base-content/55 hover:bg-base-content/10 hover:text-base-content'}"
      onclick={() => (idx = i)}
    >
      {i + 1}
    </button>
  {/each}
  <span class="shrink-0 text-xs text-base-content/40">共 {articles.length} 篇</span>
</div>

<!-- 文章卡 -->
<article class="rounded-box border border-base-300 bg-base-100 shadow-soft">
  <!-- 標題 -->
  <header class="border-b border-base-200 px-4 py-4 sm:px-6">
    <span class="mb-1.5 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
      {article.topic}
    </span>
    <h2 class="font-display text-lg font-bold leading-snug sm:text-xl">{article.title}</h2>
    {#if article.author}
      <p class="mt-0.5 text-sm italic text-base-content/55">by {article.author}</p>
    {/if}
    <p class="mt-1 text-xs text-base-content/45">
      Article {article.id} of {articles.length} · {article.words.length} vocabulary words
    </p>
  </header>

  <!-- 文章內容 -->
  <div class="px-4 py-5 sm:px-6">
    <div class="reading-body max-w-none text-[0.95rem] leading-[1.85] text-base-content/85 sm:text-base">
      {#each blocks as block (block.text)}
        {#if block.t === 'h'}
          <h3 class="mb-2 mt-6 font-display text-base font-bold text-base-content first:mt-0">{block.text}</h3>
        {:else}
          <p class="mb-4 last:mb-0">{@html highlightWords(block.text)}</p>
        {/if}
      {/each}
    </div>
  </div>

  <!-- 字彙表 -->
  <div class="border-t border-base-200">
    <div class="flex w-full items-center gap-3 px-4 py-3.5 sm:px-6">
      <button
        class="flex items-center gap-3 text-left transition-colors hover:opacity-80"
        onclick={() => (vocabOpen = !vocabOpen)}
      >
        <span
          class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 transition-transform"
          class:rotate-90={vocabOpen}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 text-primary">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
        <span class="font-display text-sm font-bold">Words in This Story</span>
        <span class="rounded-full bg-base-content/8 px-2 py-0.5 text-xs font-medium tabular-nums text-base-content/55">
          {article.words.length}
        </span>
      </button>
      <button
        class="ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors {showZh
          ? 'bg-primary/12 text-primary'
          : 'bg-base-content/8 text-base-content/50 hover:bg-base-content/12'}"
        onclick={() => (showZh = !showZh)}
      >
        {showZh ? '隱藏中文' : '顯示中文'}
      </button>
    </div>

    {#if vocabOpen}
      <div class="border-t border-base-200 px-4 pb-4 pt-3 sm:px-6">
        <div class="flex flex-col gap-3">
          {#each article.words as w (w.word)}
            <div class="flex flex-col gap-0.5">
              <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span class="font-semibold text-base-content">{w.word}</span>
                <span class="text-xs text-base-content/40">{w.pos}</span>
              </div>
              {#if w.en}
                <p class="text-sm leading-relaxed text-base-content/65">{w.en}</p>
              {/if}
              {#if showZh}
                <p class="text-sm font-medium text-primary/80">{w.zh}</p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</article>

<!-- 上下篇切換 -->
<nav class="mt-5 flex items-center justify-between">
  <button
    class="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors {idx > 0
      ? 'bg-base-content/6 text-base-content/70 hover:bg-base-content/10'
      : 'cursor-not-allowed text-base-content/25'}"
    disabled={idx === 0}
    onclick={prev}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><polyline points="15 18 9 12 15 6"></polyline></svg>
    上一篇
  </button>
  <span class="text-sm tabular-nums text-base-content/45">{idx + 1} / {articles.length}</span>
  <button
    class="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors {idx < articles.length - 1
      ? 'bg-base-content/6 text-base-content/70 hover:bg-base-content/10'
      : 'cursor-not-allowed text-base-content/25'}"
    disabled={idx === articles.length - 1}
    onclick={next}
  >
    下一篇
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><polyline points="9 18 15 12 9 6"></polyline></svg>
  </button>
</nav>

<style>
  :global(.vocab-hl) {
    background: transparent;
    color: inherit;
    border-bottom: 2px solid oklch(0.65 0.18 165 / 0.5);
    padding-bottom: 1px;
    border-radius: 0;
  }
  :global([data-reading='dim'] .vocab-hl) {
    border-bottom-color: oklch(0.65 0.18 165 / 0.35);
  }
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
</style>
