<script lang="ts">
  // 波的圖解：① 一條波標出波長 λ(相鄰兩波峰距離)、振幅；② 建設性/破壞性重疊。
  // 純靜態示意，給「波長與頻率定義」「干涉重疊」當圖解。
  const W = 420, midY = 46, A = 24, x0 = 28, x1 = 400, lam = 88
  // 由 x0 起的正弦波路徑，amp、phase(以波長為單位) 可調
  const wave = (amp: number, phase: number, y0 = midY) => {
    let d = ''
    for (let x = x0; x <= x1; x += 4) {
      const y = y0 - amp * Math.sin((2 * Math.PI * (x - x0)) / lam + phase * 2 * Math.PI)
      d += `${x === x0 ? 'M' : 'L'}${x} ${y.toFixed(1)} `
    }
    return d
  }
  // 波峰位置：sin=1 → (x-x0)/lam = 1/4 + k
  const crest1 = x0 + lam * 0.25
  const crest2 = crest1 + lam
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-2 flex items-center gap-2">
    <span aria-hidden="true">〰️</span>
    <span class="font-display font-bold">波的圖解：波長、頻率、重疊</span>
  </div>

  <!-- 單一波：標 λ 與振幅 -->
  <svg viewBox="0 0 420 92" class="w-full" role="img" aria-label="一條波標示波長與振幅">
    <line x1={x0} y1={midY} x2={x1} y2={midY} stroke="currentColor" stroke-opacity="0.2" stroke-dasharray="3 3" />
    <path d={wave(A, 0)} fill="none" stroke="oklch(0.6 0.17 250)" stroke-width="2.5" />
    <!-- λ：兩波峰之間 -->
    <line x1={crest1} y1={midY - A - 6} x2={crest2} y2={midY - A - 6} stroke="currentColor" stroke-opacity="0.6" />
    <line x1={crest1} y1={midY - A - 10} x2={crest1} y2={midY - A - 2} stroke="currentColor" stroke-opacity="0.6" />
    <line x1={crest2} y1={midY - A - 10} x2={crest2} y2={midY - A - 2} stroke="currentColor" stroke-opacity="0.6" />
    <text x={(crest1 + crest2) / 2} y={midY - A - 11} text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">λ 波長</text>
    <!-- 振幅 -->
    <line x1={crest1} y1={midY} x2={crest1} y2={midY - A} stroke="oklch(0.6 0.17 30)" stroke-width="1.5" />
    <text x={crest1 + 6} y={midY - A / 2} font-size="10" fill="oklch(0.55 0.17 30)">振幅</text>
  </svg>
  <p class="-mt-1 mb-3 text-xs leading-relaxed text-base-content/70">
    <b>波長 λ</b>＝相鄰兩波峰的距離（單位 m）。<b>頻率 ν</b>＝每秒通過的完整波數（單位 Hz＝1/s）。<b>振幅</b>越大＝光越強（強度）。
  </p>

  <!-- 建設性 vs 破壞性 -->
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <div class="rounded-box bg-base-200/50 p-2">
      <div class="mb-1 text-center text-xs font-bold text-success">建設性重疊（同相）</div>
      <svg viewBox="0 0 420 64" class="w-full" role="img" aria-label="兩波同相疊加變強">
        <path d={wave(14, 0, 32)} fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.5" />
        <path d={wave(14, 0, 32)} fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.5" />
        <path d={wave(26, 0, 32)} fill="none" stroke="oklch(0.6 0.16 150)" stroke-width="2.5" />
      </svg>
      <div class="text-center text-[0.7rem] text-base-content/60">波峰對波峰 → 合成<b>更強</b></div>
    </div>
    <div class="rounded-box bg-base-200/50 p-2">
      <div class="mb-1 text-center text-xs font-bold text-error">破壞性重疊（反相）</div>
      <svg viewBox="0 0 420 64" class="w-full" role="img" aria-label="兩波反相疊加抵消">
        <path d={wave(16, 0, 32)} fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.5" />
        <path d={wave(16, 0.5, 32)} fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.5" />
        <line x1={x0} y1="32" x2={x1} y2="32" stroke="oklch(0.62 0.2 25)" stroke-width="2.5" />
      </svg>
      <div class="text-center text-[0.7rem] text-base-content/60">波峰對波谷 → 互相<b>抵消</b></div>
    </div>
  </div>
</div>
