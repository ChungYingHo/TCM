<script lang="ts">
  // 馬克斯威爾–波茲曼速率分佈互動：拖溫度 T 與分子量 M，看曲線怎麼變。
  // 溫度↑ → 矮而寬、右移；分子量↑ → 高而窄、左移。Y 軸用固定比例，才看得出高矮變化。
  const R = 8.314 // J/(mol·K)
  const VMAX = 2600 // m/s（橫軸上限）
  const N = 80

  let T = $state(300) // K
  let M = $state(32) // g/mol（預設 O₂）
  const GASES: [string, number][] = [['H₂', 2], ['He', 4], ['O₂', 32], ['CO₂', 44]]

  const f = (v: number, t: number, mg: number) =>
    4 * Math.PI * Math.pow(mg / (2 * Math.PI * R * t), 1.5) * v * v * Math.exp((-mg * v * v) / (2 * R * t))

  // 固定 Y 比例：用「最冷最重」當最高的參考，避免每次重新縮放、看不出高矮
  const FREF = (() => {
    const mg = 44 / 1000, t = 150
    let mx = 0
    for (let i = 0; i <= N; i++) { const v = (i / N) * VMAX; mx = Math.max(mx, f(v, t, mg)) }
    return mx
  })()

  const W = 280, H = 150, PAD = 4
  const path = $derived.by(() => {
    const mg = M / 1000
    let d = ''
    for (let i = 0; i <= N; i++) {
      const v = (i / N) * VMAX
      const y = f(v, T, mg)
      const px = PAD + (v / VMAX) * (W - 2 * PAD)
      const py = H - PAD - (y / FREF) * (H - 2 * PAD) * 0.96
      d += `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${Math.max(PAD, py).toFixed(1)} `
    }
    return d
  })
  const vp = $derived(Math.sqrt((2 * R * T) / (M / 1000))) // 最可能速率 m/s
  const vpX = $derived(PAD + (Math.min(vp, VMAX) / VMAX) * (W - 2 * PAD))
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📈</span>
    <span class="font-display font-bold">速率分佈（馬克斯威爾–波茲曼）</span>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="w-full" role="img" aria-label="氣體速率分佈曲線">
    <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} class="stroke-base-content/25" stroke-width="1" />
    <path d={path} fill="none" class="stroke-primary" stroke-width="2.5" />
    <line x1={vpX} y1={PAD} x2={vpX} y2={H - PAD} class="stroke-accent" stroke-width="1.5" stroke-dasharray="3 3" />
    <text x={Math.min(vpX + 3, W - 60)} y={PAD + 10} class="fill-accent text-[9px]">最可能速率</text>
  </svg>
  <div class="flex justify-between px-1 text-[0.65rem] text-base-content/45"><span>0</span><span>分子速率 →</span><span>{VMAX} m/s</span></div>

  <div class="mt-3 flex flex-col gap-2.5">
    <label class="text-sm">溫度 T = <b class="tabular-nums">{T}</b> K
      <input type="range" min="100" max="1200" step="10" bind:value={T} class="range range-primary range-xs w-full" aria-label="溫度" />
    </label>
    <div>
      <div class="text-sm">分子量 M = <b class="tabular-nums">{M}</b> g/mol</div>
      <input type="range" min="2" max="44" step="1" bind:value={M} class="range range-primary range-xs w-full" aria-label="分子量" />
      <div class="mt-1 flex gap-1">
        {#each GASES as [sym, mm] (sym)}
          <button type="button" class={`btn btn-xs ${M === mm ? 'btn-primary' : 'btn-outline'}`} onclick={() => (M = mm)}>{sym}</button>
        {/each}
      </div>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    一群氣體分子的速率不是定值，而是一個分佈（有快有慢）。<b>溫度↑</b>：分子普遍變快、分佈變散 → 曲線<b>矮而寬、往右移</b>。<b>分子量↑</b>（同溫）：重的跑得慢 → 曲線<b>高而窄、偏左</b>。分佈形狀只跟溫度與分子量有關，<b>與壓力無關</b>。
  </p>
</div>
