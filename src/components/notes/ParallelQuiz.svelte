<script lang="ts">
  // 平行結構糾錯：看錯誤句，先想怎麼改，再翻牌看正解。
  type Card = { q: string; a: string; note: string }
  const CARDS: Card[] = [
    { q: 'She likes swimming and to run.', a: 'She likes swimming and running.', note: 'and 前後須同為動名詞' },
    { q: 'The job is challenging but rewards.', a: 'The job is challenging but rewarding.', note: 'but 前後須同為形容詞' },
    { q: 'He is honest, kind, and works hard.', a: 'He is honest, kind, and hardworking.', note: '三項並列須同詞性（皆形容詞）' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔗</span>
    <span class="font-display font-bold">平行結構糾錯</span>
    <span class="ml-auto text-xs text-base-content/50">{i + 1} / {CARDS.length}</span>
  </div>

  <div class="rounded-box bg-base-200/60 p-4">
    <p class="text-center text-base font-bold leading-relaxed text-error/80">✗ {c.q}</p>
    {#if revealed}
      <div class="mt-3 border-t border-base-300 pt-2 text-sm">
        <p class="text-center"><span class="badge badge-success badge-lg font-bold">✓ {c.a}</span></p>
        <p class="mt-2 text-base-content/75">{c.note}</p>
      </div>
    {/if}
  </div>

  <div class="mt-3 flex gap-2">
    {#if !revealed}
      <button type="button" class="btn btn-primary btn-sm flex-1" onclick={() => (revealed = true)}>看正確說法</button>
    {:else}
      <button type="button" class="btn btn-outline btn-sm flex-1" onclick={next}>下一題 →</button>
    {/if}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    and / or / but、not only…but also 連接的成分，詞性與結構必須一致。
  </p>
</div>
