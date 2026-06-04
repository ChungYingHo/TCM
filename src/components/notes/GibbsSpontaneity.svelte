<script lang="ts">
  // 自發性互動：設 ΔH、ΔS、T，算 ΔG = ΔH − TΔS，判斷自發／平衡／不自發。
  // 並畫 ΔG 對 T 的直線，標出「翻轉溫度」T* = ΔH/ΔS（ΔG 在此變號）。
  let dH = $state(-100) // kJ/mol
  let dS = $state(-200) // J/(mol·K)
  let T = $state(300) // K

  const dG = $derived(dH - (T * dS) / 1000) // kJ/mol
  const spont = $derived.by(() => {
    if (Math.abs(dG) < 0.5) return { t: '平衡', cls: 'badge-warning' }
    return dG < 0 ? { t: '自發', cls: 'badge-success' } : { t: '不自發', cls: 'badge-error' }
  })
  // 四種組合
  const quad = $derived.by(() => {
    if (dH < 0 && dS > 0) return '永遠自發（ΔH−、ΔS+）'
    if (dH > 0 && dS < 0) return '永遠不自發（ΔH+、ΔS−）'
    if (dH < 0 && dS < 0) return '低溫自發（ΔH−、ΔS−）'
    return '高溫自發（ΔH+、ΔS+）'
  })
  const Tstar = $derived(dS !== 0 ? (dH * 1000) / dS : null) // K
  const flips = $derived(Tstar !== null && Tstar > 0)

  // ΔG–T 圖
  const W = 250, H = 110, PAD = 10
  const TMAX = 1000
  const g = (t: number) => dH - (t * dS) / 1000
  const gs = $derived([g(0), g(TMAX)])
  const yLo = $derived(Math.min(0, ...gs) - 5)
  const yHi = $derived(Math.max(0, ...gs) + 5)
  const sx = (t: number) => PAD + (t / TMAX) * (W - 2 * PAD)
  const sy = (val: number) => H - PAD - ((val - yLo) / (yHi - yLo || 1)) * (H - 2 * PAD)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚖️</span>
    <span class="font-display font-bold">ΔG = ΔH − TΔS：自發性</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
    <label class="flex items-center gap-1.5">ΔH
      <input type="number" step="10" bind:value={dH} class="input input-bordered input-sm w-20" /> kJ/mol
    </label>
    <label class="flex items-center gap-1.5">ΔS
      <input type="number" step="10" bind:value={dS} class="input input-bordered input-sm w-20" /> J/(mol·K)
    </label>
  </div>
  <label class="mb-3 block text-sm">溫度 T = <b class="tabular-nums">{T}</b> K
    <input type="range" min="0" max="1000" step="5" bind:value={T} class="range range-primary range-sm w-full" aria-label="溫度" />
  </label>

  <!-- ΔG–T 圖 -->
  <svg viewBox={`0 0 ${W} ${H}`} class="w-full" role="img" aria-label="ΔG 對 T">
    <line x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} class="stroke-base-content/30" stroke-width="1" stroke-dasharray="3 3" />
    <text x={W - PAD - 2} y={sy(0) - 2} text-anchor="end" class="fill-base-content/40 text-[8px]">ΔG = 0</text>
    <line x1={sx(0)} y1={sy(g(0))} x2={sx(TMAX)} y2={sy(g(TMAX))} class="stroke-primary" stroke-width="2.5" />
    {#if flips && Tstar <= TMAX}
      <line x1={sx(Tstar)} y1={PAD} x2={sx(Tstar)} y2={H - PAD} class="stroke-accent" stroke-width="1" stroke-dasharray="2 2" />
      <text x={sx(Tstar)} y={H - 1} text-anchor="middle" class="fill-accent text-[8px]">T*</text>
    {/if}
    <circle cx={sx(Math.min(T, TMAX))} cy={sy(g(T))} r="4" class="fill-primary stroke-base-100" stroke-width="1.5" />
    <text x={PAD} y={PAD + 2} class="fill-base-content/40 text-[8px]">ΔG</text>
  </svg>

  <div class="mt-2 flex flex-wrap items-center gap-2 text-sm">
    <span>ΔG = <b class="tabular-nums">{dG.toFixed(1)}</b> kJ/mol</span>
    <span class={`badge font-bold ${spont.cls}`}>{spont.t}</span>
  </div>
  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    類型：<b>{quad}</b>。{#if flips}翻轉溫度 <b>T* = ΔH/ΔS ≈ {Tstar.toFixed(0)} K</b>：{dS > 0 ? 'T 高於' : 'T 低於'} T* 才自發。{:else}ΔH 與 ΔS 一好一壞，與溫度無關。{/if}
  </p>
  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    <b>ΔG &lt; 0 自發、= 0 平衡、&gt; 0 不自發</b>。ΔH（放熱有利，負）和 ΔS（亂度增有利，正）拉鋸，溫度 T 決定誰贏：T 越大，TΔS 那一項影響越大。
  </p>
</div>
