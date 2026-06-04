<script lang="ts">
  // 高頻字自測：看英文字，先想中文與語氣（正／負／中），再翻牌。
  type Card = { word: string; zh: string; tone: '正' | '負' | '中' }
  const CARDS: Card[] = [
    { word: 'mitigate', zh: '減輕', tone: '正' },
    { word: 'alleviate', zh: '緩解', tone: '正' },
    { word: 'exacerbate', zh: '使惡化', tone: '負' },
    { word: 'aggravate', zh: '使惡化、加劇', tone: '負' },
    { word: 'stabilize', zh: '使穩定', tone: '中' },
    { word: 'benign', zh: '良性的', tone: '正' },
    { word: 'malignant', zh: '惡性的', tone: '負' },
    { word: 'feasible', zh: '可行的', tone: '正' },
    { word: 'amass', zh: '累積、聚斂', tone: '中' },
    { word: 'stimulate', zh: '促進、刺激', tone: '正' },
    { word: 'compelling / telling', zh: '有力的、具決定性的', tone: '正' },
    { word: 'omit', zh: '省略、刪去', tone: '中' },
    { word: 'imperative', zh: '必要的、迫切的', tone: '中' },
    { word: 'provoke', zh: '激起、挑釁', tone: '負' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const toneCls = $derived(c.tone === '正' ? 'badge-success' : c.tone === '負' ? 'badge-error' : 'badge-ghost')
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🃏</span>
    <span class="font-display font-bold">高頻字自測（含語氣）</span>
    <span class="ml-auto text-xs text-base-content/50">{i + 1} / {CARDS.length}</span>
  </div>

  <div class="rounded-box bg-base-200/60 p-4 text-center">
    <div class="text-2xl font-bold text-primary">{c.word}</div>
    {#if revealed}
      <div class="mt-3 border-t border-base-300 pt-2">
        <span class="text-lg font-bold">{c.zh}</span>
        <span class={`badge ml-2 font-bold ${toneCls}`}>{c.tone}面</span>
      </div>
    {/if}
  </div>

  <div class="mt-3 flex gap-2">
    {#if !revealed}
      <button type="button" class="btn btn-primary btn-sm flex-1" onclick={() => (revealed = true)}>翻牌看意思</button>
    {:else}
      <button type="button" class="btn btn-outline btn-sm flex-1" onclick={next}>下一題 →</button>
    {/if}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    字彙題先<b>判語氣</b>（句意正面→選正面字、負面→選負面字），再用刪去法。常考對：減輕＝mitigate／alleviate（正）vs 惡化＝exacerbate／aggravate（負）；良性 benign vs 惡性 malignant。
  </p>
</div>
