<script lang="ts">
  // 慣用語分類：點一個主題，看該組慣用語與意思。依情境分類記比較有效。
  type Cat = { name: string; items: { phrase: string; mean: string }[] }
  const CATS: Cat[] = [
    { name: '時間', items: [
      { phrase: 'on time', mean: '準時（符合時刻表）' },
      { phrase: 'in time', mean: '及時（還來得及）' },
      { phrase: 'at the moment', mean: '此刻' },
      { phrase: 'sooner or later', mean: '遲早' },
    ] },
    { name: '讓步／不管如何', items: [
      { phrase: 'in spite of／despite', mean: '儘管' },
      { phrase: 'regardless of', mean: '不管' },
      { phrase: 'after all', mean: '畢竟' },
    ] },
    { name: '動作＋名詞片語', items: [
      { phrase: 'take center stage', mean: '成為焦點、登場主角' },
      { phrase: 'take … by storm', mean: '席捲、轟動' },
      { phrase: 'come in (forms)', mean: '以…形式存在、有不同種類' },
      { phrase: 'speed up', mean: '加快' },
    ] },
    { name: '因果／結果', items: [
      { phrase: 'as a result', mean: '因此' },
      { phrase: 'lead to／result in', mean: '導致' },
      { phrase: 'owing to／due to', mean: '由於' },
    ] },
    { name: '程度', items: [
      { phrase: 'to some extent', mean: '某種程度上' },
      { phrase: 'by no means', mean: '絕非（強烈否定）' },
      { phrase: 'to a large degree', mean: '在很大程度上' },
    ] },
  ]
  let i = $state(0)
  const c = $derived(CATS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🗃️</span>
    <span class="font-display font-bold">慣用語分類記憶</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each CATS as ca, k (ca.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{ca.name}</button>
    {/each}
  </div>

  <div class="space-y-1.5">
    {#each c.items as it (it.phrase)}
      <div class="flex flex-wrap items-center gap-2 rounded-box bg-base-200/60 p-2 text-sm">
        <span class="badge badge-sm badge-primary shrink-0 font-mono">{it.phrase}</span>
        <span class="text-base-content/75">{it.mean}</span>
      </div>
    {/each}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    依情境<b>分類記</b>一次記一組。最常混淆：<b>on time（準時／按表）vs in time（及時／還來得及）</b>。整組「動詞＋名詞」（take center stage、by storm）當一個慣用語記，別逐字翻。
  </p>
</div>
