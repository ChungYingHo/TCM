<script lang="ts">
  // 黑體輻射曲線：強度(intensity / energy density)對波長 λ。拖溫度 →
  // ① 峰值往短波(藍)移 ② 整條曲線變高(總強度大) ③ 短波端強度趨近 0。
  // 重點不是維因公式，而是「光譜只由溫度決定」這個曲線形狀。
  const planck = (lamNm: number, T: number) => {
    // 普朗克分布(任意單位)：B ∝ (1/λ⁵)/(e^{hc/λkT} − 1)，hc/k = 1.43877×10⁷ nm·K
    const x = 1.43877e7 / (lamNm * T)
    const d = Math.exp(x) - 1
    return d > 0 ? 1 / (Math.pow(lamNm, 5) * d) : 0
  }
  const LAMS = Array.from({ length: 96 }, (_, i) => 120 + i * 18) // 120–1830 nm
  // 用最高溫(7000K)的峰值當固定基準 → 低溫曲線就會明顯比較矮(強度小)
  const REF = Math.max(...LAMS.map((l) => planck(l, 7000)))

  let T = $state(5500) // K

  // SVG 座標
  const W = 420, H = 250, ML = 30, MR = 14, MT = 14, MB = 32
  const px = (lam: number) => ML + ((lam - 120) / (1830 - 120)) * (W - ML - MR)
  const py = (v: number) => MT + (1 - Math.min(v, 1.04)) * (H - MT - MB)
  const path = (temp: number) =>
    LAMS.map((l, i) => `${i ? 'L' : 'M'}${px(l).toFixed(1)} ${py(planck(l, temp) / REF).toFixed(1)}`).join(' ')

  const cur = $derived(path(T))
  const peakLam = $derived(LAMS.reduce((a, b) => (planck(b, T) > planck(a, T) ? b : a), LAMS[0]))
  const peakV = $derived(planck(peakLam, T) / REF)
  // 曲線顏色隨溫度：冷→紅、熱→藍白
  const hue = $derived(20 + ((T - 3000) / 4000) * 230)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔥</span>
    <span class="font-display font-bold">黑體輻射曲線・強度 vs 波長</span>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="w-full" role="img" aria-label="黑體輻射強度對波長的關係曲線">
    <!-- 可見光區(400–700 nm)上色，連結「越熱峰值越偏藍」 -->
    <defs>
      <linearGradient id="bbvis" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="#8a3fd6" /><stop offset="35%" stop-color="#2a6fdb" />
        <stop offset="55%" stop-color="#3cb043" /><stop offset="72%" stop-color="#f5d21a" />
        <stop offset="100%" stop-color="#e23b3b" />
      </linearGradient>
    </defs>
    <rect x={px(400)} y={MT} width={px(700) - px(400)} height={H - MT - MB} fill="url(#bbvis)" opacity="0.14" />
    <text x={(px(400) + px(700)) / 2} y={H - MB - 4} text-anchor="middle" font-size="9" fill="currentColor" fill-opacity="0.5">可見光</text>

    <!-- 軸 -->
    <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke="currentColor" stroke-opacity="0.35" />
    <line x1={ML} y1={H - MB} x2={W - MR} y2={H - MB} stroke="currentColor" stroke-opacity="0.35" />
    {#each [400, 700, 1000, 1500] as l (l)}
      <text x={px(l)} y={H - MB + 14} text-anchor="middle" font-size="10" fill="currentColor" fill-opacity="0.5">{l}</text>
    {/each}
    <text x={W - MR} y={H - 4} text-anchor="end" font-size="10" fill="currentColor" fill-opacity="0.55">波長 λ (nm)</text>
    <text x={ML - 22} y={MT + 8} font-size="9" fill="currentColor" fill-opacity="0.55" transform={`rotate(-90 ${ML - 22} ${MT + 8})`}>強度</text>

    <!-- 參考曲線(固定 4000K / 6500K，淡) -->
    <path d={path(4000)} fill="none" stroke="currentColor" stroke-opacity="0.16" stroke-width="1.5" />
    <path d={path(6500)} fill="none" stroke="currentColor" stroke-opacity="0.16" stroke-width="1.5" />
    <!-- 目前溫度曲線 -->
    <path d={cur} fill="none" stroke={`oklch(0.62 0.18 ${hue})`} stroke-width="2.5" />
    <!-- 峰值 -->
    <line x1={px(peakLam)} y1={py(peakV)} x2={px(peakLam)} y2={H - MB} stroke={`oklch(0.62 0.18 ${hue})`} stroke-opacity="0.4" stroke-dasharray="3 3" />
    <circle cx={px(peakLam)} cy={py(peakV)} r="4" fill={`oklch(0.62 0.18 ${hue})`} stroke="white" stroke-width="1.5" />
  </svg>

  <label class="mt-2 block">
    <span class="text-xs text-base-content/55">溫度 T＝<b class="tabular-nums text-base-content">{T}</b> K</span>
    <input type="range" min="3000" max="7000" step="100" bind:value={T} class="range range-primary range-sm mt-1 w-full" aria-label="調整黑體溫度" />
    <div class="flex justify-between text-[0.65rem] text-base-content/45"><span>3000 K 偏紅</span><span>7000 K 偏藍白</span></div>
  </label>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    黑體輻射光譜<b>只由溫度決定</b>，與材質、形狀、顏色無關。溫度<b>越高</b>：① 峰值波長<b>越短</b>（往藍移）② 整條曲線<b>越高</b>（總強度越大）。
    兩端注意：<b>極短波長處強度趨近 0</b>（古典理論卻預測會發散＝紫外災變，靠「能量量子化」才修正）。
  </p>
</div>
