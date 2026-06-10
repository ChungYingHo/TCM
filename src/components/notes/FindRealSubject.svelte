<script lang="ts">
  // 找真主詞自測：先判斷該填單數還是複數動詞，再翻牌核對。
  type Card = { q: string; a: string; note: string }
  const CARDS: Card[] = [
    { q: 'The box of apples ___ on the table.', a: 'is', note: '真主詞是 box（單數），of apples 只是修飾' },
    { q: 'A number of patients ___ waiting.', a: 'are', note: 'a number of = 許多 → 複數' },
    { q: 'Each of the results ___ to be checked.', a: 'needs', note: 'each 恆單數' },
    { q: 'Neither the patients nor the doctor ___ available.', a: 'is', note: '就近原則：最近的 doctor 是單數' },
    { q: 'The number of patients ___ rising.', a: 'is', note: 'the number of = 數量 → 單數' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔎</span>
    <span class="font-display font-bold">找真主詞自測</span>
    <span class="ml-auto text-xs text-base-content/50">{i + 1} / {CARDS.length}</span>
  </div>

  <div class="rounded-box bg-base-200/60 p-4 text-center">
    <p class="text-base font-bold leading-relaxed">{c.q}</p>
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
    先略過修飾找真主詞；<b>each / a number of / 就近原則</b>是三大陷阱。
  </p>
</div>
