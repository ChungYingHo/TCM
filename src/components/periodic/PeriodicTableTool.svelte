<script lang="ts">
  // 元素週期表查詢工具（獨立頁 /periodic-table）。
  // 切換檢視：電子組態（依 s/p/d/f 區塊上色）、電負度／原子半徑／第一游離能／電子親和力（整表熱圖）、
  // 金屬性（金屬↔非金屬對角分界）。點任一元素看完整資料＋組態（含簡寫）＋價電子＋常見氧化態。
  // 資料全來自 @/models/elements（靜態化學常識，非 LLM 生成）。
  import {
    BLOCK_BG,
    BLOCK_LABEL,
    CATEGORY_LABEL,
    ELEMENTS,
    mainPos,
    type Block,
    type Element,
  } from '@/models/elements'

  type Trend = 'eneg' | 'radius' | 'ie' | 'ea'
  type Mode = Trend | 'config' | 'metal'

  const MODES: { key: Mode; label: string }[] = [
    { key: 'config', label: '電子組態' },
    { key: 'eneg', label: '電負度' },
    { key: 'radius', label: '原子半徑' },
    { key: 'ie', label: '游離能' },
    { key: 'ea', label: '電子親和力' },
    { key: 'metal', label: '金屬性' },
  ]

  let mode = $state<Mode>('config')
  let sel = $state(8) // 預設氧，呼應筆記裡的 1s²2s²2p⁴
  const cur = $derived(ELEMENTS[sel - 1])

  const isTrend = (m: Mode): m is Trend => m === 'eneg' || m === 'radius' || m === 'ie' || m === 'ea'

  // 取某元素在某趨勢下的數值
  function trendVal(e: Element, m: Mode): number | null {
    if (m === 'eneg') return e.eneg
    if (m === 'radius') return e.radius
    if (m === 'ie') return e.ie1
    if (m === 'ea') return e.ea
    return null
  }
  function trendText(v: number | null, m: Mode): string {
    if (v == null) return '—'
    return m === 'eneg' ? v.toFixed(2) : String(v)
  }
  const fmtOx = (n: number) => (n > 0 ? `+${n}` : String(n)) // 0 不會出現在資料

  const TREND_META: Record<Trend, {
    name: string; unit: string; right: string; down: string; big: string; why: string
  }> = {
    eneg: {
      name: '電負度', unit: '', right: '變大', down: '變小',
      big: 'F（右上角）最大＝3.98；惰性氣體一般不列入比較',
      why: '原子在鍵結中「搶共用電子」的能力。往右核電荷↑、抓得更緊 → 變大；往下外層更遠 → 變小。趨勢與游離能一致。',
    },
    radius: {
      name: '原子半徑', unit: ' pm', right: '變小', down: '變大',
      big: '左下角（Cs、Fr）最大、右上角最小',
      why: '往右：有效核電荷 Zeff↑ 把同層電子拉得更緊 → 變小；往下：多一層電子、離核更遠 → 變大。（此處採共價半徑，重點看趨勢。）離子半徑考點：陽離子＜原子＜陰離子；等電子數時，質子越多半徑越小（如 O²⁻＞F⁻＞Na⁺＞Mg²⁺＞Al³⁺）。',
    },
    ie: {
      name: '第一游離能', unit: ' kJ/mol', right: '變大', down: '變小',
      big: '右上角（He）最大、鹼金屬最小',
      why: '拔走最外層第一個電子所需能量。往右更難拔 → 變大；往下外層更遠、易拔 → 變小。著名小逆轉：N＞O、Be＞B（半滿／全空較穩定）。',
    },
    ea: {
      name: '電子親和力', unit: ' kJ/mol', right: '變大', down: '變小',
      big: '鹵素最大；著名例外 Cl（349）＞F（328）',
      why: '原子得到一個電子所放出的能量，越大越想得電子；趨勢與電負度一致。F 因半徑太小、加入的電子受既有電子排斥，反而略小於 Cl。第 2、18 族與 N 加電子不放熱（留白）。',
    },
  }

  // 趨勢數值的範圍（用於熱圖）
  const range = $derived.by(() => {
    if (!isTrend(mode)) return null
    const vals = ELEMENTS.map((e) => trendVal(e, mode)).filter((v): v is number => v != null)
    return { min: Math.min(...vals), max: Math.max(...vals) }
  })

  // ── 顏色（區塊底色 BLOCK_BG 由 @/models/elements 共用） ──
  type MetalClass = 'metal' | 'metalloid' | 'nonmetal' | 'noble'
  function metalClass(e: Element): MetalClass {
    if (e.category === 'noble') return 'noble'
    if (e.category === 'metalloid') return 'metalloid'
    if (e.category === 'nonmetal' || e.category === 'halogen') return 'nonmetal'
    return 'metal'
  }
  const METAL_BG: Record<MetalClass, string> = {
    metal: 'color-mix(in oklab, var(--color-warning) 26%, var(--color-base-100))',
    metalloid: 'color-mix(in oklab, var(--color-secondary) 30%, var(--color-base-100))',
    nonmetal: 'color-mix(in oklab, var(--color-info) 22%, var(--color-base-100))',
    noble: 'color-mix(in oklab, var(--color-primary) 16%, var(--color-base-100))',
  }
  const METAL_LABEL: Record<MetalClass, string> = {
    metal: '金屬', metalloid: '類金屬', nonmetal: '非金屬', noble: '惰性氣體',
  }

  // 熱圖 0–1 → primary 濃度
  function heat(v: number | null): number | null {
    if (v == null || !range) return null
    return (v - range.min) / (range.max - range.min || 1)
  }
  function cellBg(e: Element): string {
    if (mode === 'config') return BLOCK_BG[e.block]
    if (mode === 'metal') return METAL_BG[metalClass(e)]
    const t = heat(trendVal(e, mode))
    if (t == null) return 'color-mix(in oklab, var(--color-base-content) 6%, var(--color-base-100))'
    return `color-mix(in oklab, var(--color-primary) ${Math.round(10 + t * 78)}%, var(--color-base-100))`
  }
  // 熱圖深色格用淺字
  function lightText(e: Element): boolean {
    if (!isTrend(mode)) return false
    const t = heat(trendVal(e, mode))
    return t != null && t > 0.52
  }

  // ── 版面：主表 + 鑭系／錒系兩列 ──
  type Cell = { e: Element; row: number; col: number }
  const mainCells: Cell[] = []
  const fCells: Cell[] = []
  for (const e of ELEMENTS) {
    const p = mainPos(e.z)
    if (p) mainCells.push({ e, row: p.period, col: p.col })
    else if (e.z <= 71) fCells.push({ e, row: 8, col: e.z - 54 }) // La57→col3 … Lu71→col17
    else fCells.push({ e, row: 9, col: e.z - 86 }) // Ac89→col3 … Lr103→col17
  }

  const groupLabel = (e: Element) =>
    e.block === 'f' ? (e.z <= 71 ? '鑭系' : '錒系') : e.group ? `第 ${e.group} 族` : '—'

  // ── 搜尋跳轉：符號／中英名／原子序 ──
  let query = $state('')
  const match = $derived.by(() => {
    const raw = query.trim()
    if (!raw) return null
    const q = raw.toLowerCase()
    const n = Number(raw)
    if (Number.isInteger(n) && n >= 1 && n <= 118) return ELEMENTS[n - 1]
    return (
      ELEMENTS.find((e) => e.sym.toLowerCase() === q) ??
      ELEMENTS.find((e) => e.zh === raw) ??
      ELEMENTS.find((e) => e.en.toLowerCase() === q) ??
      ELEMENTS.find((e) => e.en.toLowerCase().startsWith(q)) ??
      ELEMENTS.find((e) => e.sym.toLowerCase().startsWith(q)) ??
      null
    )
  })
  function jumpTo(z: number) {
    sel = z
    requestAnimationFrame(() =>
      document.querySelector(`[data-z="${z}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }),
    )
  }
  function onSearch(e: SubmitEvent) {
    e.preventDefault()
    if (match) {
      jumpTo(match.z)
      query = ''
    }
  }

  // ── 價電子的 Lewis 電子點式（主族；四邊先各放一點，再配對） ──
  const lewis = $derived.by(() => {
    if (cur.valence === null) return null
    const s = [0, 0, 0, 0] // 上、右、下、左
    for (let i = 0; i < cur.valence; i++) s[i % 4]++
    return { top: s[0], right: s[1], bottom: s[2], left: s[3] }
  })

  // ── 鍵型判斷器：兩元素電負度差 → 鍵型 ──
  const enElements = ELEMENTS.filter((e) => e.eneg !== null)
  let bondA = $state(11) // Na
  let bondB = $state(17) // Cl
  const dEN = $derived.by(() => {
    const a = ELEMENTS[bondA - 1].eneg
    const b = ELEMENTS[bondB - 1].eneg
    return a !== null && b !== null ? Math.abs(a - b) : null
  })
  const bondType = $derived.by(() => {
    const d = dEN
    if (d === null) return null
    if (d >= 1.7) return { label: '離子鍵', desc: '電負度差大，電子幾乎完全被搶走', tone: 'text-error' }
    if (d >= 0.4) return { label: '極性共價鍵', desc: '電子偏向電負度較大的一方', tone: 'text-warning' }
    return { label: '非極性共價鍵', desc: '電子幾乎平均共用', tone: 'text-success' }
  })
  const bothMetal = $derived(
    !['nonmetal', 'halogen', 'noble', 'metalloid'].includes(ELEMENTS[bondA - 1].category) &&
      !['nonmetal', 'halogen', 'noble', 'metalloid'].includes(ELEMENTS[bondB - 1].category),
  )
</script>

<div class="flex flex-col gap-5">
  <!-- 搜尋跳轉 -->
  <form class="flex items-center gap-2" onsubmit={onSearch}>
    <label class="input input-bordered input-sm flex flex-1 items-center gap-2 sm:max-w-xs">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 opacity-50" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" stroke-linecap="round" />
      </svg>
      <input type="search" bind:value={query} placeholder="搜尋：符號 / 中英名 / 原子序" class="grow" aria-label="搜尋元素" />
    </label>
    {#if query.trim()}
      {#if match}
        <button type="submit" class="btn btn-primary btn-sm">前往 {match.zh || match.sym} →</button>
      {:else}
        <span class="text-sm text-base-content/45">查無此元素</span>
      {/if}
    {/if}
  </form>

  <!-- 檢視切換 -->
  <div role="group" aria-label="週期表檢視" class="flex flex-wrap gap-1.5">
    {#each MODES as m (m.key)}
      <button
        type="button"
        aria-pressed={mode === m.key}
        class={`btn btn-sm ${mode === m.key ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
        onclick={() => (mode = m.key)}
      >
        {m.label}
      </button>
    {/each}
  </div>

  <!-- 詳情 + 趨勢解說 -->
  <div class="grid gap-3 lg:grid-cols-2">
    <!-- 選定元素詳情 -->
    <div class="rounded-box border border-base-300 bg-base-100 p-4">
      <div class="flex gap-3.5">
        <div
          class="grid h-20 w-20 shrink-0 place-items-center rounded-xl text-center leading-none"
          style={`background:${cellBg(cur)};${lightText(cur) ? 'color:var(--color-primary-content)' : ''}`}
        >
          <div>
            <div class="text-[0.65rem] opacity-70">{cur.z}</div>
            <div class="text-2xl font-bold">{cur.sym}</div>
            {#if isTrend(mode)}
              <div class="text-[0.6rem] opacity-80">{trendText(trendVal(cur, mode), mode)}{TREND_META[mode].unit}</div>
            {/if}
          </div>
        </div>
        <div class="min-w-0">
          <div class="text-lg font-bold leading-tight">
            {cur.zh ? `${cur.zh} ` : ''}<span class="text-base-content/70">{cur.en}</span>
          </div>
          <div class="mt-0.5 text-sm text-base-content/65">
            原子序 {cur.z}・原子量 {cur.mass.toFixed(2)}・第 {cur.period} 週期・{groupLabel(cur)}
          </div>
          <div class="mt-1.5 flex flex-wrap gap-1">
            <span class="badge badge-sm" style={`background:${BLOCK_BG[cur.block]};border:none`}>{cur.block} 區</span>
            <span class="badge badge-ghost badge-sm">{CATEGORY_LABEL[cur.category]}</span>
          </div>
        </div>
      </div>

      <!-- 電子組態 -->
      <dl class="mt-3.5 space-y-1.5 text-sm">
        <div class="flex items-baseline gap-2">
          <dt class="w-14 shrink-0 text-xs text-base-content/55">完整組態</dt>
          <dd class="font-mono tracking-tight">{cur.config}</dd>
        </div>
        <div class="flex items-baseline gap-2">
          <dt class="w-14 shrink-0 text-xs text-base-content/55">簡寫</dt>
          <dd class="font-mono tracking-tight font-semibold text-primary">{cur.shorthand}</dd>
        </div>
      </dl>

      <!-- 價電子＋常見氧化態（考試高頻） -->
      <div class="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
        {#if cur.valence !== null && lewis}
          <span class="inline-flex items-center gap-2">
            <span class="text-xs text-base-content/55">價電子</span>
            <b class="tabular-nums">{cur.valence}</b>
            <!-- Lewis 電子點式 -->
            <span class="relative grid h-9 w-9 place-items-center" aria-label={`${cur.sym} 的路易士電子點式`}>
              <span class="text-sm font-bold">{cur.sym}</span>
              <span class="absolute inset-x-0 top-0 flex justify-center gap-0.5">
                {#each Array(lewis.top) as _, i (i)}<span class="h-1 w-1 rounded-full bg-base-content"></span>{/each}
              </span>
              <span class="absolute inset-x-0 bottom-0 flex justify-center gap-0.5">
                {#each Array(lewis.bottom) as _, i (i)}<span class="h-1 w-1 rounded-full bg-base-content"></span>{/each}
              </span>
              <span class="absolute inset-y-0 left-0 flex flex-col justify-center gap-0.5">
                {#each Array(lewis.left) as _, i (i)}<span class="h-1 w-1 rounded-full bg-base-content"></span>{/each}
              </span>
              <span class="absolute inset-y-0 right-0 flex flex-col justify-center gap-0.5">
                {#each Array(lewis.right) as _, i (i)}<span class="h-1 w-1 rounded-full bg-base-content"></span>{/each}
              </span>
            </span>
          </span>
        {/if}
        {#if cur.ox.length}
          <span class="flex flex-wrap items-center gap-1.5">
            <span class="text-xs text-base-content/55">常見氧化態</span>
            {#each cur.ox as o (o)}
              <span class={`badge badge-sm border-none tabular-nums ${o < 0 ? 'bg-info/15 text-info' : 'bg-primary/15 text-primary'}`}>{fmtOx(o)}</span>
            {/each}
          </span>
        {:else if cur.category === 'noble'}
          <span><span class="text-xs text-base-content/55">常見氧化態</span> <b>0</b>（鈍氣）</span>
        {/if}
      </div>

      <!-- 常見離子顏色（定性分析考點，多為過渡金屬） -->
      {#if cur.ions.length}
        <div class="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
          <span class="text-xs text-base-content/55">離子顏色</span>
          {#each cur.ions as ion (ion.ion)}
            <span class="inline-flex items-center gap-1.5">
              <span class="inline-block h-3.5 w-3.5 rounded-full border border-base-300" style={`background:${ion.css}`}></span>
              <span class="font-mono text-xs">{ion.ion}</span><span class="text-xs text-base-content/60">{ion.name}</span>
            </span>
          {/each}
        </div>
      {/if}

      <!-- 四個週期性質（當前檢視高亮） -->
      <div class="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        {#each [
          { m: 'eneg' as const, label: '電負度', v: cur.eneg, unit: '' },
          { m: 'radius' as const, label: '原子半徑', v: cur.radius, unit: ' pm' },
          { m: 'ie' as const, label: '游離能', v: cur.ie1, unit: '' },
          { m: 'ea' as const, label: '電子親和力', v: cur.ea, unit: '' },
        ] as t (t.m)}
          <div class={`rounded-lg p-2 ${mode === t.m ? 'bg-primary/12 ring-1 ring-primary/40' : 'bg-base-200/60'}`}>
            <div class="text-[0.65rem] text-base-content/55">{t.label}</div>
            <div class="text-sm font-bold tabular-nums">
              {t.v == null ? '—' : t.m === 'eneg' ? t.v.toFixed(2) : t.v}<span class="text-[0.6rem] font-normal opacity-60">{t.unit}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- 解說：依檢視切換 -->
    <div class="rounded-box border border-base-300 bg-base-100 p-4 text-sm">
      {#if mode === 'config'}
        <p class="font-display font-bold">區塊 ＝ 最後填入的副層</p>
        <p class="mt-1.5 leading-relaxed text-base-content/70">
          每個元素「最後一個電子填進哪個副層」決定它的區塊；週期表的形狀就是電子組態畫出來的。<b>位置 ↔ 組態可互推</b>：知道週期與族就能寫出外層組態，反之亦然。
        </p>
        <div class="mt-3 grid grid-cols-2 gap-1.5 text-xs">
          {#each Object.entries(BLOCK_LABEL) as [b, label] (b)}
            <span class="inline-flex items-center gap-1.5">
              <span class="inline-block h-3 w-3 rounded-sm" style={`background:${BLOCK_BG[b as Block]}`}></span>{label}
            </span>
          {/each}
        </div>
      {:else if mode === 'metal'}
        <p class="font-display font-bold">金屬性：往左下越強</p>
        <p class="mt-1.5 leading-relaxed text-base-content/70">
          沿著 <b>B–Si–As–Te</b> 一線的階梯狀對角線分界：左下方是<b>金屬</b>（易失電子、游離能小），右上方是<b>非金屬</b>（易得電子、電負度大），交界的階梯上是<b>類金屬</b>。金屬性與游離能、電負度的趨勢恰好相反。
        </p>
        <div class="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs">
          {#each Object.entries(METAL_LABEL) as [k, label] (k)}
            <span class="inline-flex items-center gap-1.5">
              <span class="inline-block h-3 w-3 rounded-sm" style={`background:${METAL_BG[k as MetalClass]}`}></span>{label}
            </span>
          {/each}
        </div>
      {:else}
        {@const meta = TREND_META[mode]}
        <p class="font-display font-bold">{meta.name}的週期趨勢</p>
        <div class="mt-2 grid grid-cols-2 gap-2">
          <div class="rounded-lg bg-base-200/60 p-2.5">
            <div class="text-xs text-base-content/55">同週期往右 →</div>
            <div class="font-bold text-primary">{meta.right}</div>
          </div>
          <div class="rounded-lg bg-base-200/60 p-2.5">
            <div class="text-xs text-base-content/55">同族往下 ↓</div>
            <div class="font-bold text-primary">{meta.down}</div>
          </div>
        </div>
        <p class="mt-2.5 leading-relaxed text-base-content/70"><b>{meta.big}</b>。{meta.why}</p>
        {#if mode === 'ie'}
          <a href="/notes/atomic-structure" class="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">用「連續游離能暴增」找價電子數 →</a>
        {/if}
        {#if range}
          <div class="mt-3">
            <div class="h-2.5 w-full rounded-full" style="background:linear-gradient(to right, color-mix(in oklab, var(--color-primary) 10%, var(--color-base-100)), color-mix(in oklab, var(--color-primary) 88%, var(--color-base-100)))"></div>
            <div class="mt-1 flex justify-between text-[0.65rem] text-base-content/55">
              <span>低 {range.min}{meta.unit}</span>
              <span>高 {range.max}{meta.unit}</span>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>

  <!-- 單格（主表與 f 區共用；非趨勢檢視時底部顯示原子量，趨勢檢視顯示該性質數值） -->
  {#snippet cellBtn(c: Cell, extra: string)}
    <button
      type="button"
      data-z={c.e.z}
      onclick={() => (sel = c.e.z)}
      style={`grid-column:${c.col};grid-row:${c.row};background:${cellBg(c.e)};${lightText(c.e) ? 'color:var(--color-primary-content)' : ''}`}
      class={`flex aspect-square flex-col items-center justify-center rounded-[0.35rem] leading-none transition ${extra} ${sel === c.e.z ? 'ring-2 ring-primary ring-offset-1 ring-offset-base-100' : 'hover:brightness-95'}`}
      aria-label={`${c.e.zh || c.e.en} ${c.e.sym}，原子序 ${c.e.z}`}
      aria-pressed={sel === c.e.z}
    >
      <span class="text-[0.5rem] opacity-60">{c.e.z}</span>
      <span class="text-[0.82rem] font-bold">{c.e.sym}</span>
      {#if isTrend(mode)}
        <span class="hidden text-[0.5rem] tabular-nums opacity-75 sm:block">{trendText(trendVal(c.e, mode), mode)}</span>
      {:else}
        <span class="hidden text-[0.46rem] tabular-nums opacity-55 sm:block">{c.e.mass.toFixed(c.e.mass >= 100 ? 0 : 1)}</span>
      {/if}
    </button>
  {/snippet}

  <!-- 週期表本體 -->
  <div class="overflow-x-auto pb-1">
    <div class="grid w-max gap-[3px]" style="grid-template-columns: repeat(18, 2.5rem);">
      {#each mainCells as c (c.e.z)}
        {@render cellBtn(c, '')}
      {/each}
      <!-- 主表中鑭系／錒系的占位 -->
      <div style="grid-column:3;grid-row:6" class="flex aspect-square items-center justify-center rounded-[0.35rem] border border-dashed border-base-300 text-[0.5rem] text-base-content/55">57–71</div>
      <div style="grid-column:3;grid-row:7" class="flex aspect-square items-center justify-center rounded-[0.35rem] border border-dashed border-base-300 text-[0.5rem] text-base-content/55">89–103</div>
      <!-- f 區兩列 -->
      {#each fCells as c (c.e.z)}
        {@render cellBtn(c, 'mt-1')}
      {/each}
    </div>
  </div>

  <!-- 鍵型判斷器：電負度差 → 鍵型 -->
  <div class="rounded-box border border-base-300 bg-base-100 p-4">
    <div class="mb-2.5 flex items-center gap-2">
      <span aria-hidden="true">🔗</span>
      <span class="font-display font-bold">鍵型判斷器</span>
      <span class="ml-auto text-xs text-base-content/45">電負度差 ΔEN → 鍵型</span>
    </div>
    <div class="flex flex-wrap items-end gap-2.5">
      <label class="text-sm">
        <span class="mb-1 block text-xs text-base-content/55">元素 A</span>
        <select class="select select-bordered select-sm" bind:value={bondA} aria-label="鍵型元素 A">
          {#each enElements as e (e.z)}<option value={e.z}>{e.zh || e.sym} {e.sym}（{e.eneg}）</option>{/each}
        </select>
      </label>
      <span class="pb-2 text-base-content/40">＋</span>
      <label class="text-sm">
        <span class="mb-1 block text-xs text-base-content/55">元素 B</span>
        <select class="select select-bordered select-sm" bind:value={bondB} aria-label="鍵型元素 B">
          {#each enElements as e (e.z)}<option value={e.z}>{e.zh || e.sym} {e.sym}（{e.eneg}）</option>{/each}
        </select>
      </label>
    </div>
    {#if dEN !== null && bondType}
      <div class="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
        <span class="text-sm">ΔEN ＝ <b class="tabular-nums">{dEN.toFixed(2)}</b></span>
        <span class={`text-lg font-bold ${bondType.tone}`}>{bondType.label}</span>
        <span class="text-sm text-base-content/60">{bondType.desc}</span>
      </div>
      {#if bothMetal}
        <p class="mt-1.5 text-xs text-base-content/55">＊兩者皆為金屬，實際以<b>金屬鍵</b>結合（ΔEN 規則用於含非金屬的鍵）。</p>
      {/if}
      <p class="mt-2 text-xs leading-relaxed text-base-content/55">判準（約略）：<b>ΔEN ≥ 1.7</b> 離子鍵、<b>0.4–1.7</b> 極性共價、<b>＜ 0.4</b> 非極性共價；臨界值因教材略有出入。</p>
    {/if}
  </div>

  <p class="text-xs text-base-content/45">
    點元素看詳情・窄螢幕可左右滑動。數值為教科書標準值（電負度 Pauling／半徑為共價半徑 pm／游離能·電子親和力 kJ/mol，電子親和力取放熱為正／原子量為標準原子量，放射性元素取最穩定同位素質量數），不同資料來源末位略有差異；常見氧化態與離子顏色為考點導向、非窮舉（顏色為約略示意）；93 號以後為人造放射性元素，組態以理論值為準、不附中文名。
  </p>
</div>
