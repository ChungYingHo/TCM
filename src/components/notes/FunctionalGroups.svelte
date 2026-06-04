<script lang="ts">
  // 官能基優先順序階梯：由高到低排，點一個看結構、字尾與當主官能基時的命名。
  // 優先順序決定誰當「主官能基」（用字尾），其餘改成字首。
  type FG = { name: string; struct: string; suffix: string; prefix: string }
  const FGS: FG[] = [
    { name: '羧酸 carboxylic acid', struct: '–COOH', suffix: '-oic acid', prefix: 'carboxy-' },
    { name: '酯 ester', struct: '–COO–', suffix: '-oate', prefix: '(alkoxycarbonyl)-' },
    { name: '醛 aldehyde', struct: '–CHO', suffix: '-al', prefix: 'oxo-' },
    { name: '酮 ketone', struct: 'C=O（鏈中）', suffix: '-one', prefix: 'oxo-' },
    { name: '醇 alcohol', struct: '–OH', suffix: '-ol', prefix: 'hydroxy-' },
    { name: '胺 amine', struct: '–NH₂', suffix: '-amine', prefix: 'amino-' },
    { name: '烯 alkene', struct: 'C=C', suffix: '-ene', prefix: '—' },
    { name: '烷 alkane', struct: 'C–C', suffix: '-ane', prefix: '—' },
  ]
  let i = $state(0)
  const f = $derived(FGS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-1 flex items-center gap-2">
    <span aria-hidden="true">🏷️</span>
    <span class="font-display font-bold">官能基優先順序</span>
  </div>
  <p class="mb-3 text-xs text-base-content/55">↑ 上面優先（當主官能基、用字尾）</p>

  <div class="flex flex-col gap-1">
    {#each FGS as fg, k (fg.name)}
      <button type="button" class={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${i === k ? 'bg-primary/15 font-bold text-primary' : 'bg-base-200/50 hover:bg-base-200'}`} onclick={() => (i = k)}>
        <span>{k + 1}. {fg.name}</span>
        <span class="font-mono text-xs">{fg.struct}</span>
      </button>
    {/each}
  </div>

  <div class="mt-3 grid grid-cols-2 gap-2 rounded-box bg-base-200/60 p-3 text-sm">
    <div><span class="text-xs text-base-content/55">當主官能基（字尾）</span><div class="font-mono font-bold text-primary">{f.suffix}</div></div>
    <div><span class="text-xs text-base-content/55">當取代基（字首）</span><div class="font-mono">{f.prefix}</div></div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    一個分子同時有多種官能基時，<b>優先順序最高的當主官能基</b>（放在名字字尾、編號使它位號最小），其餘改成字首。氧化程度越高、優先越高：<b>羧酸 &gt; 酯 &gt; 醛 &gt; 酮 &gt; 醇 &gt; 胺 &gt; 烯/炔 &gt; 烷</b>。
  </p>
</div>
