<script lang="ts">
  // 冠詞選用自測：先想填 a / an / the / 零冠詞，再翻牌核對。
  type Card = { q: string; a: string; note: string }
  const CARDS: Card[] = [
    { q: 'I saw ___ dog.（第一次提到）', a: 'a', note: '首次提到、不特定的單數可數名詞' },
    { q: '___ dog was barking.（再次提到）', a: 'the', note: '再次提到、雙方已知的特定物' },
    { q: '___ sun rises in the east.', a: 'the', note: '獨一無二' },
    { q: 'She is ___ nurse.', a: 'a', note: '職業，單數可數' },
    { q: '___ water is essential to life.', a: '(不加冠詞)', note: '不可數泛指 → 零冠詞' },
    { q: 'It took ___ hour.', a: 'an', note: 'hour 的 h 不發音，母音開頭' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🅰️</span>
    <span class="font-display font-bold">冠詞選用自測</span>
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
    首次 <b>a/an</b>、再次或已知 <b>the</b>、獨一無二 <b>the</b>、不可數泛指零冠詞；a/an 看發音。
  </p>
</div>
