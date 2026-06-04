<script lang="ts">
  // 相圖互動：拖溫度 T、壓力 P，看落在固/液/氣哪一區，並標出三相點、臨界點。
  // 切換「一般物質 / 水」——水的固液線斜率為負（增壓使冰融化），與多數物質相反。
  // 座標皆用 0–1 的示意值（非真實單位）。
  const Tt = 0.3, Pt = 0.18 // 三相點
  const Tc = 0.82, Pc = 0.78 // 臨界點
  let water = $state(false)
  let T = $state(0.55) // 0–1
  let P = $state(0.5)
  const slopeF = $derived(water ? -0.13 : 0.1) // 固液線斜率

  const tFus = (p: number) => Tt + slopeF * (p - Pt) // 固液界線溫度
  const phase = $derived.by(() => {
    if (T > Tc && P > Pc) return { name: '超臨界流體', cls: 'badge-secondary' }
    if (P >= Pt) {
      if (T < tFus(P)) return { name: '固態', cls: 'badge-info' }
      const tb = P <= Pc ? Tt + (Tc - Tt) * ((P - Pt) / (Pc - Pt)) : Tc
      if (T < tb) return { name: '液態', cls: 'badge-primary' }
      return { name: '氣態', cls: 'badge-ghost' }
    }
    const ts = Tt * (P / Pt)
    return T < ts ? { name: '固態', cls: 'badge-info' } : { name: '氣態', cls: 'badge-ghost' }
  })

  const W = 240, H = 170, PAD = 14
  const sx = (t: number) => PAD + t * (W - 2 * PAD)
  const sy = (p: number) => H - PAD - p * (H - 2 * PAD)
  const fusTop = $derived(Tt + slopeF * (1 - Pt)) // 固液線在 P=1 的 T
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">🗺️</span>
    <span class="font-display font-bold">相圖（溫度–壓力）</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${!water ? 'btn-primary' : 'btn-outline'}`} onclick={() => (water = false)}>一般物質</button>
      <button type="button" class={`btn btn-xs ${water ? 'btn-primary' : 'btn-outline'}`} onclick={() => (water = true)}>水</button>
    </div>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="w-full" role="img" aria-label="相圖">
    <!-- 區域底色 -->
    <rect x={PAD} y={PAD} width={W - 2 * PAD} height={H - 2 * PAD} class="fill-base-200/40" />
    <!-- 三條界線 -->
    <line x1={sx(0)} y1={sy(0)} x2={sx(Tt)} y2={sy(Pt)} class="stroke-base-content/45" stroke-width="1.5" />
    <line x1={sx(Tt)} y1={sy(Pt)} x2={sx(fusTop)} y2={sy(1)} class="stroke-base-content/45" stroke-width="1.5" />
    <line x1={sx(Tt)} y1={sy(Pt)} x2={sx(Tc)} y2={sy(Pc)} class="stroke-base-content/45" stroke-width="1.5" />
    <!-- 區域標籤 -->
    <text x={sx(0.13)} y={sy(0.7)} class="fill-info text-[10px] font-bold">固</text>
    <text x={sx(0.5)} y={sy(0.62)} class="fill-primary text-[10px] font-bold">液</text>
    <text x={sx(0.78)} y={sy(0.16)} class="fill-base-content/50 text-[10px] font-bold">氣</text>
    <!-- 三相點、臨界點 -->
    <circle cx={sx(Tt)} cy={sy(Pt)} r="3" class="fill-accent" />
    <text x={sx(Tt) + 4} y={sy(Pt) + 10} class="fill-accent text-[8px]">三相點</text>
    <circle cx={sx(Tc)} cy={sy(Pc)} r="3" class="fill-error" />
    <text x={sx(Tc) - 30} y={sy(Pc) - 3} class="fill-error text-[8px]">臨界點</text>
    <!-- 目前點 -->
    <circle cx={sx(T)} cy={sy(P)} r="5" class="fill-primary stroke-base-100" stroke-width="1.5" />
    <text x={PAD} y={H - 2} class="fill-base-content/45 text-[8px]">溫度 →</text>
    <text x={PAD - 10} y={PAD + 4} class="fill-base-content/45 text-[8px]" transform={`rotate(-90, ${PAD - 10}, ${PAD + 4})`}>壓力 →</text>
  </svg>

  <div class="mt-1 flex items-center gap-2">
    <span class="text-sm">目前狀態：</span>
    <span class={`badge font-bold ${phase.name === '固態' ? 'badge-info' : phase.name === '液態' ? 'badge-primary' : phase.name === '超臨界流體' ? 'badge-secondary' : 'badge-ghost'}`}>{phase.name}</span>
  </div>
  <div class="mt-2 flex flex-col gap-2">
    <label class="text-sm">溫度 <input type="range" min="0" max="1" step="0.01" bind:value={T} class="range range-primary range-xs w-full" aria-label="溫度" /></label>
    <label class="text-sm">壓力 <input type="range" min="0" max="1" step="0.01" bind:value={P} class="range range-primary range-xs w-full" aria-label="壓力" /></label>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    相圖用溫度（橫軸）和壓力（縱軸）標出固、液、氣各自穩定的範圍。<b>三相點</b>是三態同時共存的唯一一點；<b>臨界點</b>之後液氣界線消失，再加壓也無法液化（進入超臨界流體）。
    切到「水」會看到<b>固液線往左斜（斜率為負）</b>：增壓反而讓冰融化——因為冰的密度比水小，這是水的特例。
  </p>
</div>
