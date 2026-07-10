<script lang="ts">
  // 極簡靜態週期表：每格只放元素符號＋原子序，依 s/p/d/f 區塊上色。純 SSR、PDF 完整。
  // 可用 props 反白某週期、某區塊或某幾個原子序，讓筆記各段落隨手對位。
  // 資料全來自 @/models/elements（單一資料來源，勿另建）。
  import { BLOCK_BG, ELEMENTS, mainPos, type Block } from '@/models/elements'

  let { period, block, zs = [], title }: { period?: number; block?: Block; zs?: number[]; title?: string } = $props()

  type Cell = { z: number; sym: string; block: Block; row: number; col: number }
  const main: Cell[] = []
  const fBlock: Cell[] = []
  for (const e of ELEMENTS) {
    const p = mainPos(e.z)
    if (p) main.push({ z: e.z, sym: e.sym, block: e.block, row: p.period, col: p.col })
    else if (e.z <= 71) fBlock.push({ z: e.z, sym: e.sym, block: e.block, row: 8, col: e.z - 54 })
    else fBlock.push({ z: e.z, sym: e.sym, block: e.block, row: 9, col: e.z - 86 })
  }

  const hiZs: number[] = [...zs]
  for (const e of ELEMENTS) {
    if (period && e.period === period) hiZs.push(e.z)
    if (block && e.block === block) hiZs.push(e.z)
  }
  const hasHi = hiZs.length > 0
  const dim = (z: number) => hasHi && !hiZs.includes(z)
  const on = (z: number) => hasHi && hiZs.includes(z)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-3 sm:p-4">
  {#if title}
    <div class="mb-2 text-sm font-semibold text-base-content/75">{title}</div>
  {/if}
  <div class="overflow-x-auto pb-1 print:overflow-visible">
    <div class="grid gap-0.5" style="grid-template-columns: repeat(18, minmax(0, 1fr)); min-width: 22rem;">
      {#each main as c (c.z)}
        <div
          style={`grid-column:${c.col};grid-row:${c.row};background:${BLOCK_BG[c.block]}`}
          class={`flex aspect-square flex-col items-center justify-center rounded-[0.25rem] leading-none ${dim(c.z) ? 'opacity-25' : ''} ${on(c.z) ? 'ring-2 ring-inset ring-primary' : ''}`}
        >
          <span class="text-[0.4rem] text-base-content/55">{c.z}</span>
          <span class="text-[0.6rem] font-bold">{c.sym}</span>
        </div>
      {/each}
      <div style="grid-column:3;grid-row:6" class="flex aspect-square items-center justify-center rounded-[0.25rem] border border-dashed border-base-300 text-[0.38rem] text-base-content/50">La</div>
      <div style="grid-column:3;grid-row:7" class="flex aspect-square items-center justify-center rounded-[0.25rem] border border-dashed border-base-300 text-[0.38rem] text-base-content/50">Ac</div>
      {#each fBlock as c (c.z)}
        <div
          style={`grid-column:${c.col};grid-row:${c.row};background:${BLOCK_BG[c.block]}`}
          class={`mt-1 flex aspect-square flex-col items-center justify-center rounded-[0.25rem] leading-none ${dim(c.z) ? 'opacity-25' : ''} ${on(c.z) ? 'ring-2 ring-inset ring-primary' : ''}`}
        >
          <span class="text-[0.4rem] text-base-content/55">{c.z}</span>
          <span class="text-[0.6rem] font-bold">{c.sym}</span>
        </div>
      {/each}
    </div>
  </div>
</div>
