<script lang="ts">
  // 介系詞搭配自測：看搭配（介系詞挖空）＋中文意思，先想介系詞，再翻牌。
  type Card = { phrase: string; blank: string; answer: string; mean: string }
  const CARDS: Card[] = [
    { phrase: 'result ___', blank: '___', answer: 'in', mean: '導致（後接結果）' },
    { phrase: 'result ___', blank: '___', answer: 'from', mean: '起因於（後接原因）' },
    { phrase: 'depend／rely ___', blank: '___', answer: 'on', mean: '依賴、取決於' },
    { phrase: 'consist ___', blank: '___', answer: 'of', mean: '由……組成' },
    { phrase: 'be categorized ___', blank: '___', answer: 'as', mean: '被歸類為（不可換 into／of）' },
    { phrase: 'be described ___', blank: '___', answer: 'as', mean: '被描述為（as 後可接 N 或 V-ing）' },
    { phrase: 'base A ___ B', blank: '___', answer: 'on', mean: '把 A 建立在 B 之上' },
    { phrase: 'be responsible ___', blank: '___', answer: 'for', mean: '負責；應歸咎於' },
    { phrase: 'dependent ___', blank: '___', answer: 'on', mean: '依賴的（形容詞）' },
    { phrase: 'frontier／market／demand ___', blank: '___', answer: 'for', mean: '對某對象的新領域／市場／需求' },
    { phrase: 'access ___', blank: '___', answer: 'to', mean: '取得……的管道' },
    { phrase: 'the most impressive ___ (the finalists)', blank: '___', answer: 'of', mean: '最高級＋of＝在……之中最……' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧲</span>
    <span class="font-display font-bold">介系詞搭配自測</span>
    <span class="ml-auto text-xs text-base-content/50">{i + 1} / {CARDS.length}</span>
  </div>

  <div class="rounded-box bg-base-200/60 p-4 text-center">
    <div class="font-mono text-xl font-bold">
      {#each c.phrase.split(c.blank) as part, k (k)}{part}{#if k === 0}<span class="text-primary">{revealed ? c.answer : '___'}</span>{/if}{/each}
    </div>
    <div class="mt-1 text-xs text-base-content/60">{c.mean}</div>
    {#if revealed}
      <div class="mt-3 border-t border-base-300 pt-2">
        <span class="badge badge-success badge-lg font-mono font-bold">{c.answer}</span>
      </div>
    {/if}
  </div>

  <div class="mt-3 flex gap-2">
    {#if !revealed}
      <button type="button" class="btn btn-primary btn-sm flex-1" onclick={() => (revealed = true)}>翻牌看介系詞</button>
    {:else}
      <button type="button" class="btn btn-outline btn-sm flex-1" onclick={next}>下一題 →</button>
    {/if}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    搭配詞要<b>整組一起記</b>，不能用「中文意思」硬推。最常考的方向陷阱：<b>result in（導致結果）↔ result from（起因於原因）</b>，兩者方向相反。
  </p>
</div>
