<script lang="ts">
  // 同化 vs 異化：選一個代謝過程，判斷是同化（耗能、合成大分子）還是異化（放能、分解小分子）。
  type P = { name: string; ana: boolean; note: string }
  const PROCS: P[] = [
    { name: '胺基酸 → 蛋白質', ana: true, note: '小分子合成大分子、消耗 ATP' },
    { name: '光合作用（CO₂ → 葡萄糖）', ana: true, note: '把小分子組裝成醣、需要能量（光能）' },
    { name: 'DNA 複製', ana: true, note: '核苷酸合成新股、耗能' },
    { name: '肝醣 → 葡萄糖', ana: false, note: '大分子拆成小分子' },
    { name: '細胞呼吸（葡萄糖氧化 → ATP）', ana: false, note: '分解放能、產生 ATP' },
    { name: '脂肪水解 → 甘油＋脂肪酸', ana: false, note: '大分子分解' },
  ]
  let i = $state(0)
  const p = $derived(PROCS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔁</span>
    <span class="font-display font-bold">同化 vs 異化</span>
  </div>

  <div class="mb-3 flex flex-col gap-1 text-sm">
    {#each PROCS as pp, k (pp.name)}
      <button type="button" class={`rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${i === k ? 'bg-primary/15 font-semibold text-primary' : 'bg-base-200/50 hover:bg-base-200'}`} onclick={() => (i = k)}>{pp.name}</button>
    {/each}
  </div>

  <div class="flex flex-wrap items-center gap-2 rounded-box bg-base-200/60 p-3 text-sm">
    <span class={`badge font-bold ${p.ana ? 'badge-primary' : 'badge-secondary'}`}>{p.ana ? '同化作用' : '異化作用'}</span>
    <span class={`badge font-bold ${p.ana ? 'badge-error' : 'badge-success'}`}>{p.ana ? '耗能' : '放能'}</span>
    <span class="text-base-content/70">{p.ana ? '小分子 → 大分子' : '大分子 → 小分子'}</span>
  </div>
  <p class="mt-2 text-xs text-base-content/70">{p.note}</p>
  <p class="mt-2 text-xs leading-relaxed text-base-content/60">
    口訣：<b>同化＝耗能、合成大分子</b>（如合成蛋白質、光合作用）；<b>異化＝放能、分解小分子</b>（如細胞呼吸、消化水解）。
  </p>
</div>
