<script lang="ts">
  // 偏義複詞自測：先想意義偏在哪個字，再翻牌核對。
  type Card = { q: string; a: string; note: string }
  const CARDS: Card[] = [
    { q: '國家', a: '偏在「國」', note: '家為陪襯' },
    { q: '窗戶', a: '偏在「窗」', note: '戶為陪襯' },
    { q: '緩急', a: '偏在「急」', note: '指急難' },
    { q: '異同（不宜異同）', a: '偏在「異」', note: '指差異' },
    { q: '忘記', a: '偏在「忘」', note: '記為陪襯' },
    { q: '作息（晝夜勤作息）', a: '偏在「作」', note: '指勤於工作' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚖️</span>
    <span class="font-display font-bold">偏義複詞自測</span>
    <span class="ml-auto text-xs text-base-content/50">{i + 1} / {CARDS.length}</span>
  </div>

  <div class="rounded-box bg-base-200/60 p-4 text-center">
    <p class="text-lg font-bold leading-relaxed">{c.q}</p>
    {#if revealed}
      <div class="mt-3 border-t border-base-300 pt-2 text-sm">
        <span class="badge badge-success badge-lg font-bold">{c.a}</span>
        <p class="mt-2 text-base-content/75">{c.note}</p>
      </div>
    {/if}
  </div>

  <div class="mt-3 flex gap-2">
    {#if !revealed}
      <button type="button" class="btn btn-primary btn-sm flex-1" onclick={() => (revealed = true)}>看答案</button>
    {:else}
      <button type="button" class="btn btn-outline btn-sm flex-1" onclick={next}>下一題 →</button>
    {/if}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    偏義複詞兩字並列，但意義只偏一邊，另一字僅陪襯。
  </p>
</div>
