<script lang="ts">
  // Interactive monohybrid Punnett square — pick each parent's genotype and see
  // the offspring grid + genotype/phenotype ratios update live.
  const GENOS = ['AA', 'Aa', 'aa'] as const
  let p1 = $state<'AA' | 'Aa' | 'aa'>('Aa')
  let p2 = $state<'AA' | 'Aa' | 'aa'>('Aa')

  const cells = $derived.by(() => {
    const a = p1.split('')
    const b = p2.split('')
    const grid: string[][] = []
    for (const x of a) {
      const row: string[] = []
      for (const y of b) row.push([x, y].sort().join('')) // A before a
      grid.push(row)
    }
    return grid
  })

  const ratio = $derived.by(() => {
    const g: Record<string, number> = {}
    let dom = 0, rec = 0
    for (const row of cells)
      for (const c of row) {
        g[c] = (g[c] ?? 0) + 1
        if (c.includes('A')) dom++; else rec++
      }
    return { geno: g, dom, rec }
  })
</script>

<div class="my-4 rounded-box border border-base-300 bg-base-100 p-4">
  <div class="mb-3 flex flex-wrap items-center gap-3">
    <label class="flex items-center gap-1.5 text-sm">親代①
      <select bind:value={p1} class="select select-bordered select-sm">{#each GENOS as g}<option>{g}</option>{/each}</select>
    </label>
    <span class="opacity-50">×</span>
    <label class="flex items-center gap-1.5 text-sm">親代②
      <select bind:value={p2} class="select select-bordered select-sm">{#each GENOS as g}<option>{g}</option>{/each}</select>
    </label>
  </div>

  <div class="inline-grid grid-cols-3 gap-1 text-center text-sm font-bold">
    <div></div>
    {#each p2.split('') as y, i (i)}<div class="rounded bg-primary/15 p-2 text-primary">{y}</div>{/each}
    {#each cells as row, r (r)}
      <div class="flex items-center justify-center rounded bg-primary/15 p-2 text-primary">{p1[r]}</div>
      {#each row as c, ci (ci)}
        <div class={`rounded p-2 ${c.includes('A') ? 'bg-secondary/15' : 'bg-base-300/60'}`}>{c}</div>
      {/each}
    {/each}
  </div>

  <div class="mt-3 flex flex-wrap gap-2 text-sm">
    <span class="badge badge-ghost">基因型 {Object.entries(ratio.geno).map(([k, v]) => `${k}:${v}`).join('　')}</span>
    <span class="badge badge-success">表現型 顯性:隱性 = {ratio.dom}:{ratio.rec}</span>
  </div>
  <p class="mt-2 text-xs opacity-70">A 為顯性、a 為隱性。Aa × Aa 即經典的<b>基因型 1:2:1、表現型 3:1</b>。</p>
</div>
