<script lang="ts">
  // 徑向分布函數（靜態全畫，供 GoodNotes/PDF 直接看，無互動）。
  // 上圖：|ψ|²(降) × 4πr²(升) = P(r)(有峰)，解釋高峰由來（1s，峰在 r=a₀）。
  // 下圖：1s/2s/3s 的 P(r)，標徑向節點。r 以 a₀ 為單位，各曲線各自正規化到最大值。
  const PX0 = 24
  const PW = 190
  const PYb = 108 // 底線
  const PH = 92
  const sample = (f: (r: number) => number, rmax: number, n = 170) => {
    const pts: [number, number][] = []
    for (let i = 0; i <= n; i++) {
      const r = (i / n) * rmax
      pts.push([r, f(r)])
    }
    const m = Math.max(...pts.map((p) => p[1])) || 1
    return pts.map(([r, v]) => [r, v / m] as [number, number])
  }
  const path = (pts: [number, number][], rmax: number) =>
    pts.map(([r, v]) => `${(PX0 + (r / rmax) * PW).toFixed(1)},${(PYb - v * PH).toFixed(1)}`).join(' ')
  const xat = (r: number, rmax: number) => PX0 + (r / rmax) * PW

  // 上圖（1s，r 到 4a₀）
  const RA = 4
  const psi2 = path(sample((r) => Math.exp(-2 * r), RA), RA)
  const shell = path(sample((r) => r * r, RA), RA)
  const p1sTop = path(sample((r) => r * r * Math.exp(-2 * r), RA), RA)

  // 下圖（1s/2s/3s，r 到 18a₀）
  const RB = 18
  const P1s = path(sample((r) => r * r * Math.exp(-2 * r), RB), RB)
  const P2s = path(sample((r) => { const R = (2 - r) * Math.exp(-r / 2); return r * r * R * R }, RB), RB)
  const P3s = path(sample((r) => { const R = (27 - 18 * r + 2 * r * r) * Math.exp(-r / 3); return r * r * R * R }, RB), RB)
  const nodes2s = [2] // 2s 徑向節點
  const nodes3s = [1.9, 7.1] // 3s 徑向節點
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5 print:break-inside-avoid">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📈</span>
    <span class="font-display font-bold">徑向分布函數 P(r) = |ψ|²·4πr²</span>
  </div>

  <div class="grid gap-3 lg:grid-cols-2">
    <!-- 上圖：乘積的由來 -->
    <div class="rounded-lg border border-base-300 bg-base-200/40 p-2.5 print:break-inside-avoid">
      <div class="mb-1 text-sm font-semibold">高峰的由來（1s）</div>
      <svg viewBox="0 0 224 120" class="w-full" role="img" aria-label="P(r) 由 |ψ|² 與 4πr² 相乘">
        <line x1={PX0} y1={PYb} x2={PX0 + PW + 8} y2={PYb} stroke="currentColor" stroke-width="0.8" class="text-base-content/40" />
        <line x1={PX0} y1={PYb} x2={PX0} y2="10" stroke="currentColor" stroke-width="0.8" class="text-base-content/40" />
        <polyline points={psi2} fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3 2" class="text-base-content/45" />
        <polyline points={shell} fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3 2" class="text-secondary" />
        <polyline points={p1sTop} fill="none" stroke="currentColor" stroke-width="2.2" class="text-primary" />
        <text x={PX0 + PW + 6} y={PYb + 9} text-anchor="end" class="fill-base-content/50 text-[8px]">r</text>
      </svg>
      <div class="flex flex-wrap gap-x-3 gap-y-0.5 text-[0.65rem] text-base-content/70">
        <span><span class="text-base-content/45">╌</span> |ψ|²（降）</span>
        <span><span class="text-secondary">╌</span> 4πr²（升）</span>
        <span><b class="text-primary">━ P(r)（峰在 r=a₀）</b></span>
      </div>
    </div>

    <!-- 下圖：各軌域 P(r) -->
    <div class="rounded-lg border border-base-300 bg-base-200/40 p-2.5 print:break-inside-avoid">
      <div class="mb-1 text-sm font-semibold">1s / 2s / 3s 的 P(r)</div>
      <svg viewBox="0 0 224 120" class="w-full" role="img" aria-label="1s 2s 3s 徑向分布">
        <line x1={PX0} y1={PYb} x2={PX0 + PW + 8} y2={PYb} stroke="currentColor" stroke-width="0.8" class="text-base-content/40" />
        <line x1={PX0} y1={PYb} x2={PX0} y2="10" stroke="currentColor" stroke-width="0.8" class="text-base-content/40" />
        <polyline points={P1s} fill="none" stroke="currentColor" stroke-width="1.8" class="text-primary" />
        <polyline points={P2s} fill="none" stroke="currentColor" stroke-width="1.8" class="text-secondary" />
        <polyline points={P3s} fill="none" stroke="currentColor" stroke-width="1.8" class="text-accent" />
        {#each nodes2s as r (r)}<circle cx={xat(r, RB)} cy={PYb} r="2.3" class="fill-secondary" />{/each}
        {#each nodes3s as r (r)}<circle cx={xat(r, RB)} cy={PYb} r="2.3" class="fill-accent" />{/each}
        <text x={PX0 + PW + 6} y={PYb + 9} text-anchor="end" class="fill-base-content/50 text-[8px]">r</text>
      </svg>
      <div class="flex flex-wrap gap-x-3 gap-y-0.5 text-[0.65rem] text-base-content/70">
        <span><b class="text-primary">━ 1s</b>（1 峰）</span>
        <span><b class="text-secondary">━ 2s</b>（2 峰・1 節點）</span>
        <span><b class="text-accent">━ 3s</b>（3 峰・2 節點）</span>
      </div>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    |ψ|² 隨 r 遞減、球殼面積 4πr² 隨 r 遞增，兩者相乘在某個 r 出現<b>高峰</b>，就是最可能找到電子的距離（1s 落在 r=a₀）。掉到 0 的位置（軸上圓點）是<b>徑向節點</b>，峰數＝徑向節點數＋1。
  </p>
</div>
