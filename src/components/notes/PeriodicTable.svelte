<script lang="ts">
  // 筆記內嵌的小週期表：每格顯示元素符號＋原子序，依「最後填入的副層」分成 s/p/d/f 四區上色，
  // 把週期表的形狀和電子組態連起來。點任一元素看中文名、原子序、週期/族、區塊與電子組態。
  // 資料全來自 @/models/elements（與 /periodic-table 工具頁共用單一資料來源）。
  // 想看電負度／半徑／游離能熱圖等完整功能，請開「週期表」工具頁。
  import { BLOCK_BG, BLOCK_LABEL, ELEMENTS, mainPos, type Block } from '@/models/elements'

  type Cell = { z: number; sym: string; block: Block; row: number; col: number }
  const main: Cell[] = []
  const fBlock: Cell[] = []
  for (const e of ELEMENTS) {
    const p = mainPos(e.z)
    if (p) main.push({ z: e.z, sym: e.sym, block: e.block, row: p.period, col: p.col })
    else if (e.z <= 71) fBlock.push({ z: e.z, sym: e.sym, block: e.block, row: 8, col: e.z - 54 })
    else fBlock.push({ z: e.z, sym: e.sym, block: e.block, row: 9, col: e.z - 86 })
  }

  let sel = $state<number>(8) // 預設選氧，呼應前面的 1s²2s²2p⁴
  const cur = $derived.by(() => {
    const e = ELEMENTS[sel - 1]
    const group = e.block === 'f' ? (e.z <= 71 ? '鑭系' : '錒系') : e.group ? `第 ${e.group} 族` : '—'
    return { ...e, groupLabel: group }
  })
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧪</span>
    <span class="font-display font-bold">元素週期表</span>
    <span class="ml-auto text-xs text-base-content/45">點元素看詳情・可左右滑動</span>
  </div>

  <!-- 詳情面板 -->
  <div class="mb-3 flex items-center gap-3 rounded-box border border-base-300 bg-base-200/50 p-3">
    <div class="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg" style={`background:${BLOCK_BG[cur.block]}`}>
      <span class="text-[0.6rem] leading-none text-base-content/60">{cur.z}</span>
      <span class="text-xl font-bold leading-tight">{cur.sym}</span>
    </div>
    <div class="min-w-0 text-sm">
      <div class="font-bold">{cur.zh ? `${cur.zh}（${cur.sym}）` : cur.sym}・原子序 {cur.z}</div>
      <div class="text-base-content/70">第 {cur.period} 週期・{cur.groupLabel}・{BLOCK_LABEL[cur.block]}</div>
      <div class="font-mono text-[0.78rem] tracking-tight text-base-content/70">
        {cur.config}　<span class="font-semibold text-primary">{cur.shorthand}</span>
      </div>
    </div>
  </div>

  <!-- 表本體：固定格寬，窄螢幕水平捲動 -->
  <div class="overflow-x-auto pb-1">
    <div class="grid w-max gap-0.5" style="grid-template-columns: repeat(18, 2.15rem);">
      {#each main as c (c.z)}
        <button
          type="button"
          onclick={() => (sel = c.z)}
          style={`grid-column:${c.col};grid-row:${c.row};background:${BLOCK_BG[c.block]}`}
          class={`flex aspect-square flex-col items-center justify-center rounded-[0.3rem] leading-none transition ${sel === c.z ? 'ring-2 ring-primary' : 'hover:brightness-95'}`}
          aria-label={`${ELEMENTS[c.z - 1].zh || ELEMENTS[c.z - 1].en} ${c.sym}，原子序 ${c.z}`}
        >
          <span class="text-[0.5rem] text-base-content/55">{c.z}</span>
          <span class="text-[0.78rem] font-bold">{c.sym}</span>
        </button>
      {/each}
      <!-- 鑭系／錒系在主表的占位標記 -->
      <div style="grid-column:3;grid-row:6" class="flex aspect-square items-center justify-center rounded-[0.3rem] border border-dashed border-base-300 text-[0.5rem] text-base-content/55">57–71</div>
      <div style="grid-column:3;grid-row:7" class="flex aspect-square items-center justify-center rounded-[0.3rem] border border-dashed border-base-300 text-[0.5rem] text-base-content/55">89–103</div>
      <!-- f 區：鑭系、錒系，對齊主表第 3–17 欄 -->
      {#each fBlock as c (c.z)}
        <button
          type="button"
          onclick={() => (sel = c.z)}
          style={`grid-column:${c.col};grid-row:${c.row};background:${BLOCK_BG[c.block]}`}
          class={`mt-1 flex aspect-square flex-col items-center justify-center rounded-[0.3rem] leading-none transition ${sel === c.z ? 'ring-2 ring-primary' : 'hover:brightness-95'}`}
          aria-label={`${ELEMENTS[c.z - 1].zh || ELEMENTS[c.z - 1].en} ${c.sym}，原子序 ${c.z}`}
        >
          <span class="text-[0.5rem] text-base-content/55">{c.z}</span>
          <span class="text-[0.78rem] font-bold">{c.sym}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- 區塊圖例 -->
  <div class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
    {#each Object.entries(BLOCK_LABEL) as [b, label] (b)}
      <span class="inline-flex items-center gap-1.5">
        <span class="inline-block h-3 w-3 rounded-sm border border-base-300" style={`background:${BLOCK_BG[b as Block]}`}></span>{label}
      </span>
    {/each}
  </div>
</div>
