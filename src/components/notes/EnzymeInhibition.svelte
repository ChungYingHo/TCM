<script lang="ts">
  // 酵素抑制：切換 無抑制 / 競爭性 / 非競爭性，看 Michaelis-Menten 曲線怎麼變。
  // 競爭性：Vmax 不變、Km↑（曲線變慢到頂）；非競爭性：Vmax↓、Km 不變。
  type Mode = 'none' | 'comp' | 'non'
  let mode = $state<Mode>('comp')
  const PARAM: Record<Mode, { vmax: number; km: number; label: string }> = {
    none: { vmax: 100, km: 25, label: '無抑制' },
    comp: { vmax: 100, km: 60, label: '競爭性（Km↑、Vmax 不變）' },
    non: { vmax: 60, km: 25, label: '非競爭性（Vmax↓、Km 不變）' },
  }
  const p = $derived(PARAM[mode])
  const SMAX = 220, W = 250, H = 150, PAD = 18
  const v = (s: number, vmax: number, km: number) => (vmax * s) / (km + s)
  const sx = (s: number) => PAD + (s / SMAX) * (W - 2 * PAD)
  const sy = (val: number) => H - PAD - (val / 110) * (H - 2 * PAD)
  const curve = (vmax: number, km: number) => {
    let d = ''
    for (let i = 0; i <= 60; i++) { const s = (i / 60) * SMAX; d += `${i === 0 ? 'M' : 'L'}${sx(s).toFixed(1)},${sy(v(s, vmax, km)).toFixed(1)} ` }
    return d
  }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">🧫</span>
    <span class="font-display font-bold">酵素抑制：競爭性 vs 非競爭性</span>
  </div>

  <div class="join mb-3">
    {#each Object.entries(PARAM) as [k, val] (k)}
      <button type="button" class={`btn join-item btn-xs ${mode === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (mode = k as Mode)}>{val.label.split('（')[0]}</button>
    {/each}
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="w-full" role="img" aria-label="酵素動力學曲線">
    <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} class="stroke-base-content/25" />
    <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} class="stroke-base-content/25" />
    <!-- Vmax 參考線 -->
    <line x1={PAD} y1={sy(p.vmax)} x2={W - PAD} y2={sy(p.vmax)} class="stroke-accent/50" stroke-dasharray="3 3" />
    <text x={W - PAD} y={sy(p.vmax) - 2} text-anchor="end" class="fill-accent text-[8px]">Vmax</text>
    <!-- 無抑制對照（淡） -->
    {#if mode !== 'none'}
      <path d={curve(PARAM.none.vmax, PARAM.none.km)} fill="none" class="stroke-base-content/25" stroke-width="1.5" stroke-dasharray="4 3" />
    {/if}
    <path d={curve(p.vmax, p.km)} fill="none" class="stroke-primary" stroke-width="2.5" />
    <text x={W / 2} y={H - 3} text-anchor="middle" class="fill-base-content/40 text-[8px]">受質濃度 [S] →</text>
    <text x={PAD - 2} y={PAD} text-anchor="end" class="fill-base-content/40 text-[8px]">v</text>
  </svg>

  <div class="mt-2 flex flex-wrap gap-1.5 text-sm">
    <span class="badge badge-primary font-bold">{p.label}</span>
  </div>
  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    <b>競爭性</b>：抑制劑搶活性部位，<b>加大量受質可贏回</b> → <b>Vmax 不變、Km 變大</b>。<b>非競爭性</b>：抑制劑結合別處改變構形，加受質沒用 → <b>Vmax 降低、Km 不變</b>。（淡虛線是無抑制的對照曲線。）
  </p>
</div>
