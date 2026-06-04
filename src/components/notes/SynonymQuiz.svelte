<script lang="ts">
  // 同義字自測：看難字，先想同義字與中文，再翻牌。
  type Card = { word: string; syn: string; zh: string }
  const CARDS: Card[] = [
    { word: 'putrefy', syn: 'decay', zh: '腐爛（屍體腐敗）' },
    { word: 'dispute', syn: 'quarrel', zh: '爭吵、爭論' },
    { word: 'recount', syn: 'narrate', zh: '敘述、講述' },
    { word: 'perpetual', syn: 'everlasting', zh: '永久的、不斷的' },
    { word: 'significantly', syn: 'importantly', zh: '重要地、值得注意地' },
    { word: 'affordable', syn: 'inexpensive', zh: '負擔得起的（不是 useful）' },
    { word: 'literal', syn: 'word-for-word', zh: '逐字的（不是 literary 文學的）' },
    { word: 'benevolent', syn: 'charitable', zh: '善意的、慈善的（反義：malicious）' },
    { word: 'saddle (with)', syn: 'burden', zh: '使承擔（不是 mount 騎乘）' },
    { word: 'exacerbate', syn: 'aggravate', zh: '使惡化、加劇' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔀</span>
    <span class="font-display font-bold">同義字自測</span>
    <span class="ml-auto text-xs text-base-content/50">{i + 1} / {CARDS.length}</span>
  </div>

  <div class="rounded-box bg-base-200/60 p-4 text-center">
    <div class="text-2xl font-bold text-primary">{c.word}</div>
    {#if revealed}
      <div class="mt-3 border-t border-base-300 pt-2">
        <span class="text-base-content/55">≈ </span><span class="badge badge-success badge-lg font-bold">{c.syn}</span>
        <p class="mt-2 text-sm text-base-content/75">{c.zh}</p>
      </div>
    {/if}
  </div>

  <div class="mt-3 flex gap-2">
    {#if !revealed}
      <button type="button" class="btn btn-primary btn-sm flex-1" onclick={() => (revealed = true)}>翻牌看同義字</button>
    {:else}
      <button type="button" class="btn btn-outline btn-sm flex-1" onclick={next}>下一題 →</button>
    {/if}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    破題四步：①鎖定被問的字 ②<b>用中文說出它在句中的意思</b> ③用字根字首推義 ④比對選項找最接近（同義）或相反（反義）。看到 <b>opposite／NOT／antonym</b> 要選相反的，別選最像的！
  </p>
</div>
