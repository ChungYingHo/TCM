<script lang="ts">
  // 完整週期表（118 元素）：每格顯示元素符號＋原子序，依「最後填入的副層」分成
  // s / p / d / f 四區上色，把週期表的形狀和電子組態連起來。點任一元素看中文名、
  // 原子序、週期/族與區塊。資料皆為靜態化學常識（符號、原子序、位置、區塊），非 LLM 生成。
  type Block = 's' | 'p' | 'd' | 'f'

  const SYMBOLS =
    'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ')

  // 中文名（1–92；93 號之後皆人造放射性元素，後中不考中文名，只顯示符號）
  const NAMES: Record<number, string> = {
    1: '氫', 2: '氦', 3: '鋰', 4: '鈹', 5: '硼', 6: '碳', 7: '氮', 8: '氧', 9: '氟', 10: '氖',
    11: '鈉', 12: '鎂', 13: '鋁', 14: '矽', 15: '磷', 16: '硫', 17: '氯', 18: '氬', 19: '鉀', 20: '鈣',
    21: '鈧', 22: '鈦', 23: '釩', 24: '鉻', 25: '錳', 26: '鐵', 27: '鈷', 28: '鎳', 29: '銅', 30: '鋅',
    31: '鎵', 32: '鍺', 33: '砷', 34: '硒', 35: '溴', 36: '氪', 37: '銣', 38: '鍶', 39: '釔', 40: '鋯',
    41: '鈮', 42: '鉬', 43: '鎝', 44: '釕', 45: '銠', 46: '鈀', 47: '銀', 48: '鎘', 49: '銦', 50: '錫',
    51: '銻', 52: '碲', 53: '碘', 54: '氙', 55: '銫', 56: '鋇', 57: '鑭', 58: '鈰', 59: '鐠', 60: '釹',
    61: '鉕', 62: '釤', 63: '銪', 64: '釓', 65: '鋱', 66: '鏑', 67: '鈥', 68: '鉺', 69: '銩', 70: '鐿',
    71: '鎦', 72: '鉿', 73: '鉭', 74: '鎢', 75: '錸', 76: '鋨', 77: '銥', 78: '鉑', 79: '金', 80: '汞',
    81: '鉈', 82: '鉛', 83: '鉍', 84: '釙', 85: '砈', 86: '氡', 87: '鍅', 88: '鐳', 89: '錒', 90: '釷',
    91: '鏷', 92: '鈾',
  }

  function blockOf(z: number): Block {
    if ((z >= 57 && z <= 71) || (z >= 89 && z <= 103)) return 'f'
    if ((z >= 21 && z <= 30) || (z >= 39 && z <= 48) || (z >= 72 && z <= 80) || (z >= 104 && z <= 112)) return 'd'
    if ((z >= 5 && z <= 10) || (z >= 13 && z <= 18) || (z >= 31 && z <= 36) || (z >= 49 && z <= 54) || (z >= 81 && z <= 86) || (z >= 113 && z <= 118)) return 'p'
    return 's'
  }

  // (period, col) in the 18-column main grid; null for f-block (rendered separately)
  function mainPos(z: number): { period: number; col: number } | null {
    if (z === 1) return { period: 1, col: 1 }
    if (z === 2) return { period: 1, col: 18 }
    if (z <= 4) return { period: 2, col: z - 2 }
    if (z <= 10) return { period: 2, col: z + 8 }
    if (z <= 12) return { period: 3, col: z - 10 }
    if (z <= 18) return { period: 3, col: z }
    if (z <= 36) return { period: 4, col: z - 18 }
    if (z <= 54) return { period: 5, col: z - 36 }
    if (z <= 56) return { period: 6, col: z - 54 }
    if (z <= 71) return null
    if (z <= 86) return { period: 6, col: z - 68 }
    if (z <= 88) return { period: 7, col: z - 86 }
    if (z <= 103) return null
    return { period: 7, col: z - 100 }
  }

  function periodOf(z: number): number {
    if (z <= 2) return 1
    if (z <= 10) return 2
    if (z <= 18) return 3
    if (z <= 36) return 4
    if (z <= 54) return 5
    if (z <= 86) return 6
    return 7
  }

  type Cell = { z: number; sym: string; block: Block; period: number; col: number }
  const main: Cell[] = []
  const lan: Cell[] = []
  const act: Cell[] = []
  SYMBOLS.forEach((sym, i) => {
    const z = i + 1
    const block = blockOf(z)
    const p = mainPos(z)
    if (p) main.push({ z, sym, block, period: p.period, col: p.col })
    else if (z <= 71) lan.push({ z, sym, block, period: 8, col: z - 54 }) // La57→col3 … Lu71→col17
    else act.push({ z, sym, block, period: 9, col: z - 86 }) // Ac89→col3 … Lr103→col17
  })

  const BLOCK_BG: Record<Block, string> = {
    s: 'color-mix(in oklab, var(--color-primary) 16%, var(--color-base-100))',
    p: 'color-mix(in oklab, var(--color-warning) 22%, var(--color-base-100))',
    d: 'color-mix(in oklab, var(--color-info) 18%, var(--color-base-100))',
    f: 'color-mix(in oklab, var(--color-secondary) 20%, var(--color-base-100))',
  }
  const BLOCK_LABEL: Record<Block, string> = {
    s: 's 區（填 s 副層）',
    p: 'p 區（填 p 副層）',
    d: 'd 區（過渡金屬，填 d 副層）',
    f: 'f 區（鑭系／錒系，填 f 副層）',
  }

  let sel = $state<number>(8) // 預設選氧，呼應前面的 1s²2s²2p⁴
  const cur = $derived.by(() => {
    const z = sel
    const block = blockOf(z)
    const group = block === 'f' ? (z <= 71 ? '鑭系' : '錒系') : `第 ${mainPos(z)!.col} 族`
    return { z, sym: SYMBOLS[z - 1], name: NAMES[z], block, period: periodOf(z), group }
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
      <div class="font-bold">{cur.name ? `${cur.name}（${cur.sym}）` : cur.sym}・原子序 {cur.z}</div>
      <div class="text-base-content/70">第 {cur.period} 週期・{cur.group}</div>
      <div class="text-base-content/70">{BLOCK_LABEL[cur.block]}</div>
    </div>
  </div>

  <!-- 表本體：固定格寬，窄螢幕水平捲動 -->
  <div class="overflow-x-auto pb-1">
    <div class="grid w-max gap-0.5" style="grid-template-columns: repeat(18, 2.15rem);">
      {#each main as c (c.z)}
        <button
          type="button"
          onclick={() => (sel = c.z)}
          style={`grid-column:${c.col};grid-row:${c.period};background:${BLOCK_BG[c.block]}`}
          class={`flex aspect-square flex-col items-center justify-center rounded-[0.3rem] leading-none transition ${sel === c.z ? 'ring-2 ring-primary' : 'hover:brightness-95'}`}
          aria-label={`${NAMES[c.z] ?? c.sym} ${c.sym}，原子序 ${c.z}`}
        >
          <span class="text-[0.5rem] text-base-content/55">{c.z}</span>
          <span class="text-[0.78rem] font-bold">{c.sym}</span>
        </button>
      {/each}
      <!-- 鑭系／錒系在主表的占位標記 -->
      <div style="grid-column:3;grid-row:6" class="flex aspect-square items-center justify-center rounded-[0.3rem] border border-dashed border-base-300 text-[0.5rem] text-base-content/55">57–71</div>
      <div style="grid-column:3;grid-row:7" class="flex aspect-square items-center justify-center rounded-[0.3rem] border border-dashed border-base-300 text-[0.5rem] text-base-content/55">89–103</div>
      <!-- f 區：鑭系、錒系，對齊主表第 3–17 欄 -->
      {#each [...lan, ...act] as c (c.z)}
        <button
          type="button"
          onclick={() => (sel = c.z)}
          style={`grid-column:${c.col};grid-row:${c.period};background:${BLOCK_BG[c.block]}`}
          class={`mt-1 flex aspect-square flex-col items-center justify-center rounded-[0.3rem] leading-none transition ${sel === c.z ? 'ring-2 ring-primary' : 'hover:brightness-95'}`}
          aria-label={`${NAMES[c.z] ?? c.sym} ${c.sym}，原子序 ${c.z}`}
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
        <span class="inline-block h-3 w-3 rounded-sm border border-base-300" style={`background:${BLOCK_BG[b]}`}></span>{label}
      </span>
    {/each}
  </div>
</div>
