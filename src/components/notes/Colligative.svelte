<script lang="ts">
  // 依數性質互動：選溶質（決定 i 因子）、調重量莫耳濃度 m，看水的沸點升高、凝固點下降。
  // 溫度線上同時畫出純水(0、100°C)與溶液的凝固點/沸點，凸顯「粒子越多、液態範圍越寬」。
  const Kb = 0.512, Kf = 1.86 // 水的常數 °C·kg/mol
  type Solute = { name: string; i: number }
  const SOLUTES: Solute[] = [
    { name: '蔗糖', i: 1 }, // 非電解質
    { name: 'NaCl', i: 2 },
    { name: 'CaCl₂', i: 3 },
    { name: 'Na₂SO₄', i: 3 },
  ]
  let idx = $state(1) // 預設 NaCl
  let m = $state(1) // 重量莫耳濃度 mol/kg

  const sol = $derived(SOLUTES[idx])
  const dTb = $derived(Kb * m * sol.i)
  const dTf = $derived(Kf * m * sol.i)
  const bp = $derived(100 + dTb)
  const fp = $derived(0 - dTf)

  const LO = -15, HI = 115
  const xp = (t: number) => ((t - LO) / (HI - LO)) * 100
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🌡️</span>
    <span class="font-display font-bold">依數性質：沸點升、凝固點降</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each SOLUTES as s, k (s.name)}
      <button type="button" class={`btn btn-xs ${idx === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (idx = k)}>{s.name}（i={s.i}）</button>
    {/each}
  </div>

  <label class="mb-3 block text-sm">重量莫耳濃度 m = <b class="tabular-nums">{m.toFixed(2)}</b> mol/kg
    <input type="range" min="0" max="2" step="0.05" bind:value={m} class="range range-primary range-sm w-full" aria-label="重量莫耳濃度" />
  </label>

  <!-- 溫度線 -->
  <div class="relative mt-2 h-12">
    <div class="absolute top-5 right-0 left-0 h-1.5 rounded-full bg-base-300/60"></div>
    <!-- 溶液液態範圍 -->
    <div class="absolute top-5 h-1.5 rounded-full bg-primary/40" style={`left:${xp(fp)}%;width:${xp(bp) - xp(fp)}%`}></div>
    {#each [{ t: 0, c: 'base-content/40', lab: '純水凝固 0°' }, { t: 100, c: 'base-content/40', lab: '純水沸騰 100°' }] as mk (mk.t)}
      <div class="absolute top-3 h-5 w-px bg-base-content/30" style={`left:${xp(mk.t)}%`}></div>
    {/each}
    <div class="absolute top-2 flex -translate-x-1/2 flex-col items-center" style={`left:${xp(fp)}%`}>
      <div class="h-6 w-0.5 bg-info"></div>
      <span class="whitespace-nowrap text-[0.6rem] font-bold text-info">凝固 {fp.toFixed(1)}°</span>
    </div>
    <div class="absolute top-2 flex -translate-x-1/2 flex-col items-center" style={`left:${xp(bp)}%`}>
      <div class="h-6 w-0.5 bg-error"></div>
      <span class="whitespace-nowrap text-[0.6rem] font-bold text-error">沸騰 {bp.toFixed(1)}°</span>
    </div>
  </div>

  <div class="mt-2 grid grid-cols-3 gap-2 text-sm">
    <div class="rounded-lg bg-base-200/70 p-2 text-center"><div class="text-xs text-base-content/55">i 因子</div><div class="font-bold tabular-nums">{sol.i}</div></div>
    <div class="rounded-lg bg-base-200/70 p-2 text-center"><div class="text-xs text-base-content/55">凝固點下降 ΔTf</div><div class="font-bold tabular-nums text-info">{dTf.toFixed(2)}°</div></div>
    <div class="rounded-lg bg-base-200/70 p-2 text-center"><div class="text-xs text-base-content/55">沸點上升 ΔTb</div><div class="font-bold tabular-nums text-error">{dTb.toFixed(2)}°</div></div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>ΔTf = Kf·m·i、ΔTb = Kb·m·i</b>（水的 Kf=1.86、Kb=0.512）。溶質讓<b>凝固點下降、沸點上升</b>，液態範圍變寬。
    相同 m 下，<b>解離出越多粒子（i 越大）效果越強</b>：CaCl₂（i=3）> NaCl（i=2）> 蔗糖（i=1）。
  </p>
</div>
