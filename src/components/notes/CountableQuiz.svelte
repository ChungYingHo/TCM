<script lang="ts">
  // 可數還是不可數自測：先判斷，再翻牌看用法提醒。
  type Card = { q: string; a: string; note: string }
  const CARDS: Card[] = [
    { q: 'information', a: '不可數', note: '用 a piece of information；無複數' },
    { q: 'advice', a: '不可數', note: 'a piece of advice' },
    { q: 'equipment', a: '不可數', note: '無複數，用 much / a piece of' },
    { q: 'furniture', a: '不可數', note: '無複數' },
    { q: 'suggestion', a: '可數', note: 'a suggestion / two suggestions' },
    { q: 'news', a: '不可數', note: 'The news is good.（動詞單數）' },
    { q: 'homework', a: '不可數', note: '無複數' },
    { q: 'job', a: '可數', note: 'a job / two jobs（work 才是不可數）' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔢</span>
    <span class="font-display font-bold">可數還是不可數</span>
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
    <b>fewer + 可數、less + 不可數</b>；不可數名詞不加 a、不加複數。
  </p>
</div>
