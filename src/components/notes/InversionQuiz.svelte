<script lang="ts">
  // 倒裝還原自測：看完整 if 句，先想倒裝寫法，再翻牌核對。
  type Card = { full: string; inverted: string }
  const CARDS: Card[] = [
    { full: 'If I were rich …', inverted: 'Were I rich …' },
    { full: 'If he had known the risk …', inverted: 'Had he known the risk …' },
    { full: 'If you should need help …', inverted: 'Should you need help …' },
    { full: 'If it were not for water …', inverted: 'Were it not for water …' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔁</span>
    <span class="font-display font-bold">倒裝還原自測</span>
    <span class="ml-auto text-xs text-base-content/50">{i + 1} / {CARDS.length}</span>
  </div>

  <div class="rounded-box bg-base-200/60 p-4 text-center">
    <p class="text-base font-bold leading-relaxed">{c.full}</p>
    {#if revealed}
      <div class="mt-3 border-t border-base-300 pt-2 text-sm">
        <span class="badge badge-success badge-lg font-bold">{c.inverted}</span>
        <p class="mt-2 text-base-content/75">省略 if，把 Had / Were / Should 提到主詞前面。</p>
      </div>
    {/if}
  </div>

  <div class="mt-3 flex gap-2">
    {#if !revealed}
      <button type="button" class="btn btn-primary btn-sm flex-1" onclick={() => (revealed = true)}>看倒裝寫法</button>
    {:else}
      <button type="button" class="btn btn-outline btn-sm flex-1" onclick={next}>下一題 →</button>
    {/if}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    句首 <b>Had / Were / Should + 主詞</b> = 省略 if 的倒裝假設句。
  </p>
</div>
