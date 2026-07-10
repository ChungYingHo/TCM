<script lang="ts">
  // 靜態徑向機率密度圖 P(r)=r²R²（氫原子 3s/3p/3d），純 SSR、PDF 完整。
  // 徑向節點數 = n−l−1：3s 有 2 個節點（3 個峰）、3p 有 1 個（2 峰）、3d 有 0 個（1 峰）。
  // 3s 的內側小峰最靠近原子核＝穿透最深。三條各自正規化到自身最大值，方便看形狀。
  const RHO_MAX = 20
  const N = 140
  function curve(f: (rho: number) => number) {
    const raw: [number, number][] = []
    let max = 0
    for (let i = 0; i <= N; i++) {
      const rho = (i / N) * RHO_MAX
      const v = f(rho)
      raw.push([rho, v])
      if (v > max) max = v
    }
    return raw.map(([rho, v]) => [rho, v / max] as [number, number])
  }
  const ex = (rho: number) => Math.exp((-2 * rho) / 3)
  const p3s = curve((r) => r * r * Math.pow(27 - 18 * r + 2 * r * r, 2) * ex(r))
  const p3p = curve((r) => Math.pow(r, 4) * Math.pow(6 - r, 2) * ex(r))
  const p3d = curve((r) => Math.pow(r, 6) * ex(r))

  const X0 = 36, X1 = 292, Y0 = 150, Y1 = 24
  const sx = (rho: number) => X0 + (rho / RHO_MAX) * (X1 - X0)
  const sy = (v: number) => Y0 - v * (Y0 - Y1)
  const path = (pts: [number, number][]) =>
    pts.map(([r, v], i) => `${i ? 'L' : 'M'}${sx(r).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📈</span>
    <span class="font-display font-bold">徑向機率密度：3s、3p、3d 的穿透</span>
  </div>

  <svg viewBox="0 0 300 172" class="w-full" role="img" aria-label="3s 3p 3d 的徑向機率密度曲線">
    <!-- 座標軸 -->
    <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="currentColor" stroke-width="0.8" class="text-base-content/40" />
    <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="currentColor" stroke-width="0.8" class="text-base-content/40" />
    <text x={X0 - 3} y={Y1 + 2} text-anchor="end" class="fill-base-content/45 text-[7px]">機率</text>
    <text x={X1} y={Y0 + 11} text-anchor="end" class="fill-base-content/45 text-[7px]">離核距離 →</text>
    <text x={X0} y={Y0 + 11} text-anchor="middle" class="fill-base-content/45 text-[7px]">核</text>

    <!-- 曲線 -->
    <path d={path(p3d)} fill="none" stroke="#2563eb" stroke-width="1.6" />
    <path d={path(p3p)} fill="none" stroke="#16a34a" stroke-width="1.6" />
    <path d={path(p3s)} fill="none" stroke="#dc2626" stroke-width="1.6" />

    <!-- 指出 3s 最內側小峰 -->
    <text x={sx(1)} y={sy(0.32) - 3} text-anchor="middle" class="fill-error text-[7px]">↑穿透</text>

    <!-- 圖例 -->
    <g>
      <line x1="210" y1="30" x2="226" y2="30" stroke="#dc2626" stroke-width="1.6" /><text x="230" y="33" class="fill-base-content/70 text-[8px]">3s（3 峰）</text>
      <line x1="210" y1="42" x2="226" y2="42" stroke="#16a34a" stroke-width="1.6" /><text x="230" y="45" class="fill-base-content/70 text-[8px]">3p（2 峰）</text>
      <line x1="210" y1="54" x2="226" y2="54" stroke="#2563eb" stroke-width="1.6" /><text x="230" y="57" class="fill-base-content/70 text-[8px]">3d（1 峰）</text>
    </g>
  </svg>

  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    峰數＝<b>n−l−1</b> 個節點再加一：3s 有 3 個峰、3p 2 個、3d 1 個。3s 的<b class="text-error">內側小峰最靠近原子核</b>，代表 3s 最能鑽進去感受完整核電荷（穿透最深），其次 3p，再其次 3d。穿透愈深、感受核電荷愈多、能量愈低，所以同一個 n 是 <b>s &lt; p &lt; d</b>。
  </p>
</div>
