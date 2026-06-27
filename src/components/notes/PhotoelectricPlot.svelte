<script lang="ts">
  // 光電效應的招牌圖：光電子最大動能 KE_max（y）對入射光頻率 ν（x）。
  // 三條互相平行的直線（斜率都＝普朗克常數 h），各自的 x 截距＝低限頻率 ν₀=φ/h。
  // 拖頻率：頻率 < ν₀ → 再亮也不發射；≥ ν₀ → KE_max = hν − φ 隨頻率線性上升。
  // 切光強度：只改「每秒打出的電子數（光電流）」，不改每顆電子的動能。

  // 功函數 φ（eV，課本近似值）；越小越容易被光打出電子（Cs 常用於光電材料）。
  type Metal = { sym: string; name: string; phi: number; hue: number }
  const METALS: Metal[] = [
    { sym: 'Cs', name: '銫', phi: 2.1, hue: 25 }, // 紅
    { sym: 'Ca', name: '鈣', phi: 2.9, hue: 150 }, // 綠
    { sym: 'Zn', name: '鋅', phi: 4.3, hue: 250 }, // 藍紫
  ]

  // 換算：1 eV 對應的頻率 = e/h，以 ×10¹⁴ Hz 為單位 → 1.602e-19/6.626e-34/1e14 ≈ 2.418
  const HZ_PER_EV = 2.418 // ν₀(×10¹⁴Hz) = φ(eV) × 2.418
  const SLOPE = 1 / HZ_PER_EV // KE(eV) 對 ν(×10¹⁴Hz) 的斜率 ≈ 0.4136（＝h）

  const XMAX = 12 // ν 上限（×10¹⁴ Hz）
  const YMAX = 3 // KE 上限（eV）

  let mi = $state(0) // 選定金屬
  let nu = $state(8) // 頻率 ν（×10¹⁴ Hz）
  let bright = $state(1) // 光強度倍率（1 或 3）

  const metal = $derived(METALS[mi])
  const nu0 = $derived(metal.phi * HZ_PER_EV) // 低限頻率
  const ePhoton = $derived(SLOPE * nu) // 光子能量 E = hν（eV）
  const emits = $derived(nu >= nu0)
  const ke = $derived(emits ? ePhoton - metal.phi : 0) // KE_max = hν − φ
  const electrons = $derived(emits ? bright : 0) // 相對電子數（∝ 光強度）

  // ── SVG 座標 ──
  const W = 420
  const H = 300
  const ML = 46
  const MR = 14
  const MT = 14
  const MB = 38
  const px = (n: number) => ML + (n / XMAX) * (W - ML - MR)
  const py = (k: number) => MT + (1 - k / YMAX) * (H - MT - MB)
  const lineEndKE = (phi: number) => SLOPE * XMAX - phi // 直線在 ν=XMAX 處的 KE
  const guideX = $derived(px(nu))
  const dotY = $derived(py(ke))
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚡</span>
    <span class="font-display font-bold">光電效應・動能 vs 頻率</span>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="w-full" role="img" aria-label="光電子最大動能對入射光頻率的關係圖">
    <!-- 格線 -->
    {#each [1, 2, 3] as k (k)}
      <line x1={ML} y1={py(k)} x2={W - MR} y2={py(k)} stroke="currentColor" stroke-opacity="0.08" />
      <text x={ML - 6} y={py(k) + 4} text-anchor="end" font-size="11" fill="currentColor" fill-opacity="0.5">{k}</text>
    {/each}
    <!-- 軸 -->
    <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke="currentColor" stroke-opacity="0.35" />
    <line x1={ML} y1={H - MB} x2={W - MR} y2={H - MB} stroke="currentColor" stroke-opacity="0.35" />
    {#each [0, 3, 6, 9, 12] as n (n)}
      <text x={px(n)} y={H - MB + 16} text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.5">{n}</text>
    {/each}
    <text x={ML - 30} y={MT + 6} font-size="11" fill="currentColor" fill-opacity="0.65">KE</text>
    <text x={ML - 30} y={MT + 18} font-size="9" fill="currentColor" fill-opacity="0.45">(eV)</text>
    <text x={W - MR} y={H - 6} text-anchor="end" font-size="10" fill="currentColor" fill-opacity="0.55">頻率 ν (×10¹⁴ Hz)</text>

    <!-- 三條直線（平行；斜率＝h） -->
    {#each METALS as m, k (m.sym)}
      {@const active = k === mi}
      <line
        x1={px(m.phi * HZ_PER_EV)} y1={py(0)} x2={px(XMAX)} y2={py(lineEndKE(m.phi))}
        stroke={`oklch(0.62 0.17 ${m.hue})`} stroke-width={active ? 3 : 1.5} stroke-opacity={active ? 1 : 0.35}
      />
      <!-- 低限頻率記號 -->
      <circle cx={px(m.phi * HZ_PER_EV)} cy={py(0)} r={active ? 4 : 2.5} fill={`oklch(0.62 0.17 ${m.hue})`} fill-opacity={active ? 1 : 0.5} />
    {/each}

    <!-- 頻率游標 -->
    <line x1={guideX} y1={MT} x2={guideX} y2={H - MB} stroke="currentColor" stroke-opacity="0.45" stroke-dasharray="3 3" />
    {#if emits}
      <line x1={ML} y1={dotY} x2={guideX} y2={dotY} stroke="currentColor" stroke-opacity="0.2" stroke-dasharray="2 3" />
      <circle cx={guideX} cy={dotY} r="5" fill={`oklch(0.62 0.17 ${metal.hue})`} stroke="white" stroke-width="1.5" />
    {:else}
      <circle cx={guideX} cy={py(0)} r="5" fill="none" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.5" />
      <text x={guideX} y={py(0) - 8} text-anchor="middle" font-size="10" fill="currentColor" fill-opacity="0.6">ν&lt;ν₀</text>
    {/if}
    <!-- 選定金屬的 ν₀ 標籤 -->
    <text x={px(nu0)} y={H - MB - 6} text-anchor="middle" font-size="10" fill={`oklch(0.55 0.17 ${metal.hue})`} font-weight="bold">ν₀</text>
  </svg>

  <!-- 金屬選擇 -->
  <div class="mt-2 flex flex-wrap items-center gap-1.5">
    <span class="text-xs text-base-content/55">金屬</span>
    {#each METALS as m, k (m.sym)}
      <button
        type="button"
        class={`btn btn-xs ${mi === k ? 'btn-primary' : 'btn-outline'}`}
        onclick={() => (mi = k)}
      >{m.sym} {m.name}</button>
    {/each}
  </div>

  <!-- 頻率滑桿 -->
  <label class="mt-3 block">
    <span class="text-xs text-base-content/55">入射光頻率 ν＝<b class="tabular-nums text-base-content">{nu.toFixed(1)}</b> ×10¹⁴ Hz</span>
    <input type="range" min="0" max={XMAX} step="0.1" bind:value={nu} class="range range-primary range-sm mt-1 w-full" aria-label="調整入射光頻率" />
  </label>

  <!-- 強度切換 -->
  <div class="mt-2 flex items-center gap-2">
    <span class="text-xs text-base-content/55">光強度</span>
    <div class="join">
      <button type="button" class={`btn join-item btn-xs ${bright === 1 ? 'btn-primary' : 'btn-outline'}`} onclick={() => (bright = 1)}>×1</button>
      <button type="button" class={`btn join-item btn-xs ${bright === 3 ? 'btn-primary' : 'btn-outline'}`} onclick={() => (bright = 3)}>×3 更亮</button>
    </div>
  </div>

  <!-- 讀數 -->
  <div class="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
    <div class="rounded-lg bg-base-200/70 p-2 text-center">
      <div class="text-xs text-base-content/55">功函數 Φ</div>
      <div class="font-bold tabular-nums">{metal.phi.toFixed(1)} eV</div>
    </div>
    <div class="rounded-lg bg-base-200/70 p-2 text-center">
      <div class="text-xs text-base-content/55">低限頻率 ν₀</div>
      <div class="font-bold tabular-nums">{nu0.toFixed(1)}</div>
    </div>
    <div class="rounded-lg bg-base-200/70 p-2 text-center">
      <div class="text-xs text-base-content/55">光子能量 hν</div>
      <div class="font-bold tabular-nums">{ePhoton.toFixed(2)} eV</div>
    </div>
    <div class={`rounded-lg p-2 text-center ${emits ? 'bg-success/15' : 'bg-error/10'}`}>
      <div class="text-xs text-base-content/55">光電子動能 E_K</div>
      <div class={`font-bold tabular-nums ${emits ? 'text-success' : 'text-error'}`}>{emits ? `${ke.toFixed(2)} eV` : '不發射'}</div>
    </div>
  </div>

  <!-- 電子數（光電流）示意 -->
  <div class="mt-2 flex items-center gap-2 rounded-lg bg-base-200/50 p-2 text-sm">
    <span class="text-xs text-base-content/55">每秒打出電子</span>
    {#if emits}
      <span class="flex gap-0.5">
        {#each Array(electrons * 3) as _, j (j)}
          <span class="inline-block h-2.5 w-2.5 rounded-full bg-warning"></span>
        {/each}
      </span>
      <span class="text-xs text-base-content/60">強度 ×{bright} → 電子數 ×{bright}（動能不變）</span>
    {:else}
      <span class="text-xs text-error/80">0 個——頻率不夠，再亮也沒用</span>
    {/if}
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    三條線<b>互相平行</b>（斜率都是<b>普朗克常數 h</b>，與金屬無關）。每條線的 <b>x 截距＝低限頻率 ν₀＝Φ/h</b>、<b>y 截距＝−Φ</b>（直線往左延伸到 ν=0）。
    頻率<b>低於 ν₀</b> 時，光子能量不足以克服功函數 Φ，<b>無論多亮都打不出電子</b>。超過 ν₀ 後，<b>頻率決定動能</b>、<b>強度只決定電子數（光電流）</b>。
    Φ 最小的 <b>Cs</b> 連可見光都打得動，故是常用光電材料。
  </p>
</div>
