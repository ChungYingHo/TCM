<script lang="ts">
  // 軌域填充箱圖（↑↓ 箭頭）。拖原子序或按「▶ 逐顆填入」，一次看懂三原則：
  //   遞建 Aufbau（4s 先於 3d）、洪德 Hund（先各放一個再配對）、包立 Pauli（每格最多 2 個、自旋相反）。
  // Cr / Cu 兩個半滿/全滿例外會在填到該元素時自動修正，避免教錯組態。
  type Orb = { label: string; n: number; l: number }
  const ORDER: Orb[] = [
    { label: '1s', n: 1, l: 0 }, { label: '2s', n: 2, l: 0 }, { label: '2p', n: 2, l: 1 },
    { label: '3s', n: 3, l: 0 }, { label: '3p', n: 3, l: 1 }, { label: '4s', n: 4, l: 0 },
    { label: '3d', n: 3, l: 2 }, { label: '4p', n: 4, l: 1 },
  ]
  const SYM = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al',
    'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni',
    'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr']
  // 半滿/全滿例外：把一個 4s 電子讓給 3d
  const EXCEPTION: Record<number, Record<string, number>> = {
    24: { '4s': 1, '3d': 5 }, // Cr [Ar]3d⁵4s¹
    29: { '4s': 1, '3d': 10 }, // Cu [Ar]3d¹⁰4s¹
  }
  const sup = (x: number) => String(x).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])

  let z = $state(8)
  let shown = $state(8) // 目前畫面顯示到第幾顆（動畫用）
  let playing = $state(false)
  let timer: ReturnType<typeof setInterval> | undefined

  function stop() {
    if (timer) clearInterval(timer)
    timer = undefined
    playing = false
  }
  function play() {
    stop()
    shown = 0
    playing = true
    timer = setInterval(() => {
      if (shown >= z) { stop(); return }
      shown += 1
    }, 170)
  }
  function onSlide() {
    stop()
    shown = z
  }
  $effect(() => { if (!playing) shown = z }) // 拖動 z 時即時同步
  $effect(() => () => stop()) // 卸載時清掉計時器

  // 把 e 顆電子依 ORDER 填入，回傳每個有電子的副層 + 各軌域的 ↑↓ 狀態
  const groups = $derived.by(() => {
    const isFinal = shown >= z
    const ex = isFinal ? EXCEPTION[z] : undefined
    let left = shown
    const out: { label: string; n: number; boxes: { up: boolean; down: boolean }[]; count: number }[] = []
    for (const o of ORDER) {
      if (left <= 0) break
      const orbs = 2 * o.l + 1
      const cap = 2 * orbs
      let got = Math.min(cap, left)
      left -= got
      if (ex && ex[o.label] !== undefined) got = ex[o.label] // 套用例外
      const ups = Math.min(got, orbs)
      const downs = Math.max(0, got - orbs) // 先各放一個 ↑（洪德），剩下才配 ↓
      const boxes = Array.from({ length: orbs }, (_, i) => ({ up: i < ups, down: i < downs }))
      out.push({ label: o.label, n: o.n, boxes, count: got })
    }
    return out
  })
  const config = $derived(groups.filter((g) => g.count > 0).map((g) => `${g.label}${sup(g.count)}`).join(' '))
  const valence = $derived.by(() => {
    if (!groups.length) return 0
    const maxN = Math.max(...groups.map((g) => g.n))
    return groups.filter((g) => g.n === maxN).reduce((s, g) => s + g.count, 0)
  })
  const isException = $derived(shown >= z && EXCEPTION[z] !== undefined)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
    <span class="font-display font-bold">軌域填充箱圖</span>
    <span class="badge badge-primary badge-lg font-bold">{SYM[z] ?? '?'}</span>
    <button type="button" class="btn btn-sm btn-outline ml-auto gap-1 print:hidden" onclick={play} disabled={playing}>
      ▶ 逐顆填入
    </button>
  </div>

  <label class="mb-1 flex items-center gap-2 text-sm print:hidden">
    原子序 Z
    <input type="number" min="1" max="36" bind:value={z} oninput={onSlide} class="input input-bordered input-sm w-20" />
    <span class="text-base-content/55">（1–36）</span>
  </label>
  <input type="range" min="1" max="36" step="1" bind:value={z} oninput={onSlide}
    class="range range-primary range-sm w-full print:hidden" aria-label="調整原子序" />

  <!-- 箱圖 -->
  <div class="mt-4 flex flex-wrap items-end gap-x-3 gap-y-3">
    {#each groups as g (g.label)}
      <div class="flex flex-col items-center gap-1">
        <div class="flex gap-0.5">
          {#each g.boxes as b, i (i)}
            <div class="flex h-9 w-7 items-center justify-center rounded border border-base-300 bg-base-200/60 text-sm font-bold leading-none text-primary">
              {b.up && b.down ? '↑↓' : b.up ? '↑' : b.down ? '↓' : ''}
            </div>
          {/each}
        </div>
        <span class="font-mono text-xs text-base-content/70">{g.label}</span>
      </div>
    {/each}
  </div>

  <div class="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
    <span class="text-base-content/55">填入順序組態：</span>
    <span class="font-mono font-semibold">{config}</span>
  </div>
  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    最外層（價電子）共 <b class="text-accent">{valence}</b> 個。
    第四週期注意 <b>4s 先於 3d 填入</b>。同副層 <b>先各放一個 ↑（洪德）</b>，排滿才回頭配 ↓。
  </p>
  {#if isException}
    <p class="mt-2 rounded-lg border border-accent/30 bg-accent/10 p-2.5 text-xs leading-relaxed text-accent">
      ⚠ <b>{SYM[z]}</b> 是半滿／全滿例外：照遞建會預測 {z === 24 ? '3d⁴4s²' : '3d⁹4s²'}，
      但實際是 <b>{z === 24 ? '3d⁵4s¹' : '3d¹⁰4s¹'}</b>（半滿/全滿較穩定，4s 讓一個電子給 3d）。Cr、Cu 是最常考的兩個。
    </p>
  {/if}
</div>
