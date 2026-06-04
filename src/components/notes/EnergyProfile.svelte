<script lang="ts">
  // 反應能量圖互動：調活化能 Ea、反應熱 ΔH，看反應物→過渡態→產物的能量曲線。
  // 催化劑開關：降低峰高（Ea 變小）→ 反應加快，但 ΔH、產物能量不變。
  let Ea = $state(50)
  let dH = $state(-20)
  let cat = $state(false)

  const Er = 28 // 反應物能量基準（任意刻度）
  const EaEff = $derived(cat ? Ea * 0.5 : Ea)
  const peak = $derived(Er + EaEff)
  const prod = $derived(Er + dH)
  const EaRev = $derived(peak - prod) // 逆反應活化能

  const W = 250, H = 150, PAD = 16, EMAX = 120
  const eY = (e: number) => H - PAD - (e / EMAX) * (H - 2 * PAD)
  const xR1 = PAD, xR2 = PAD + 45, xPk = W / 2, xP1 = W - PAD - 45, xP2 = W - PAD
  const curve = (pk: number) =>
    `M ${xR1},${eY(Er)} L ${xR2},${eY(Er)} C ${xR2 + 18},${eY(Er)} ${xPk - 18},${eY(pk)} ${xPk},${eY(pk)} C ${xPk + 18},${eY(pk)} ${xP1 - 18},${eY(prod)} ${xP1},${eY(prod)} L ${xP2},${eY(prod)}`
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">⛰️</span>
    <span class="font-display font-bold">反應能量圖：Ea 與 ΔH</span>
    <label class="ml-auto flex cursor-pointer items-center gap-1.5 text-sm">
      <input type="checkbox" bind:checked={cat} class="toggle toggle-primary toggle-sm" />催化劑
    </label>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="w-full" role="img" aria-label="反應能量圖">
    <!-- 無催化劑曲線（有催化劑時變淡虛線當對照） -->
    {#if cat}
      <path d={curve(Er + Ea)} fill="none" class="stroke-base-content/25" stroke-width="1.5" stroke-dasharray="4 3" />
    {/if}
    <path d={curve(peak)} fill="none" class="stroke-primary" stroke-width="2.5" />
    <!-- Ea 箭頭（反應物 → 峰） -->
    <line x1={xR2 + 8} y1={eY(Er)} x2={xR2 + 8} y2={eY(peak)} class="stroke-accent" stroke-width="1" stroke-dasharray="2 2" />
    <text x={xR2 + 11} y={(eY(Er) + eY(peak)) / 2} class="fill-accent text-[8px]">Ea</text>
    <!-- ΔH 箭頭（反應物 → 產物） -->
    <line x1={xP2 - 6} y1={eY(Er)} x2={xP2 - 6} y2={eY(prod)} class="stroke-info" stroke-width="1" stroke-dasharray="2 2" />
    <text x={xP2 - 26} y={(eY(Er) + eY(prod)) / 2} class="fill-info text-[8px]">ΔH</text>
    <text x={xR1} y={eY(Er) - 4} class="fill-base-content/55 text-[8px]">反應物</text>
    <text x={xPk - 12} y={eY(peak) - 4} class="fill-base-content/55 text-[8px]">過渡態</text>
    <text x={xP2 - 18} y={eY(prod) + 10} class="fill-base-content/55 text-[8px]">產物</text>
  </svg>

  <div class="mt-2 grid grid-cols-3 gap-2 text-sm">
    <div class="rounded-lg bg-base-200/70 p-2 text-center"><div class="text-xs text-base-content/55">正向 Ea</div><div class="font-bold tabular-nums text-accent">{EaEff.toFixed(0)}</div></div>
    <div class="rounded-lg bg-base-200/70 p-2 text-center"><div class="text-xs text-base-content/55">ΔH</div><div class={`font-bold tabular-nums ${dH < 0 ? 'text-success' : 'text-error'}`}>{dH > 0 ? '+' : ''}{dH}</div></div>
    <div class="rounded-lg bg-base-200/70 p-2 text-center"><div class="text-xs text-base-content/55">{dH < 0 ? '放熱' : dH > 0 ? '吸熱' : '無熱效應'}</div><div class="font-bold">{dH < 0 ? '↓' : dH > 0 ? '↑' : '—'}</div></div>
  </div>

  <div class="mt-2 flex flex-col gap-2">
    <label class="text-sm">活化能 Ea = <b class="tabular-nums">{Ea}</b><input type="range" min="15" max="80" step="1" bind:value={Ea} class="range range-primary range-xs w-full" aria-label="活化能" /></label>
    <label class="text-sm">反應熱 ΔH = <b class="tabular-nums">{dH > 0 ? '+' : ''}{dH}</b><input type="range" min="-30" max="30" step="1" bind:value={dH} class="range range-primary range-xs w-full" aria-label="反應熱" /></label>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>Ea（活化能）＝過渡態 − 反應物</b>（峰高），決定<b>速率</b>：峰越高、反應越慢。<b>ΔH＝產物 − 反應物</b>，決定<b>吸放熱</b>（與峰高無關）。
    開<b>催化劑</b>：提供另一條低 Ea 的路徑（峰下降）→ 正逆反應都加快，但 <b>ΔH 和產物能量不變、平衡位置不移動</b>。
  </p>
</div>
