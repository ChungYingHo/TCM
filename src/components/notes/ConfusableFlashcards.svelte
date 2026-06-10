<script lang="ts">
  // 選對字自測：先選空格該填的字，再翻牌核對。
  type Card = { q: string; a: string; note: string }
  const CARDS: Card[] = [
    { q: 'Lack of sleep can ___ concentration.', a: 'affect', note: '需動詞「影響」→ affect（effect 多為名詞）' },
    { q: 'To cut costs, we should use ___ paper.', a: 'less', note: 'paper 不可數 → less（可數才用 fewer）' },
    { q: 'Honesty is an important ___.', a: 'principle', note: '原則 = principle（principal 是校長）' },
    { q: 'Body temperature tends to ___ at night.', a: 'rise', note: '無受詞 → 不及物 rise（raise 要受詞）' },
    { q: 'The nurse gently ___ the baby in the cot.', a: 'laid', note: '有受詞 → 及物 lay 的過去式 laid' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🎯</span>
    <span class="font-display font-bold">選對字自測</span>
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
    看空格要動詞還是名詞、有沒有受詞、可數還是不可數，就能分辨。
  </p>
</div>
