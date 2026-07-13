<script lang="ts">
  // 靜態「過渡金屬半徑」三線圖：3d／4d／5d 三個系列，x 為系列裡的位置（3B 到 2B）、y 為半徑。
  // 純 SSR、PDF 完整。看得到 4d 與 5d 幾乎重疊、且都在 3d 上方（鑭系收縮），Zr 與 Hf 一樣高。
  // 資料全來自 @/models/elements（單一資料來源，勿另建）。
  import { SERIES, elementByZ } from '@/models/elements'

  const SERIES_META = [
    { key: '3d' as const, color: '#2563eb', label: '3d' },
    { key: '4d' as const, color: '#16a34a', label: '4d' },
    { key: '5d' as const, color: '#dc2626', label: '5d' },
  ]
  type Pt = { pos: number; r: number; sym: string; z: number }
  const lines = SERIES_META.map((m) => ({
    ...m,
    pts: SERIES[m.key]
      .map((z, i) => ({ pos: i, r: elementByZ(z)?.radius ?? 0, sym: elementByZ(z)?.sym ?? '', z }))
      .filter((p) => p.r > 0) as Pt[],
  }))

  const X0 = 30, X1 = 292, Y0 = 150, Y1 = 18, RMIN = 110, RMAX = 215
  const sx = (pos: number) => X0 + (pos / 9) * (X1 - X0)
  const sy = (r: number) => Y0 - ((r - RMIN) / (RMAX - RMIN)) * (Y0 - Y1)
  const poly = (pts: Pt[]) => pts.map((p) => `${sx(p.pos).toFixed(1)},${sy(p.r).toFixed(1)}`).join(' ')

  // Zr（4d 第 2 位）與 Hf（5d 第 2 位）——鑭系收縮讓兩者幾乎一樣
  const zr = lines[1].pts.find((p) => p.z === 40)
  const hf = lines[2].pts.find((p) => p.z === 72)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📏</span>
    <span class="font-display font-bold">過渡金屬半徑：3d／4d／5d</span>
  </div>

  <svg viewBox="0 0 300 172" class="w-full" role="img" aria-label="過渡金屬三個系列的原子半徑折線圖">
    <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="currentColor" stroke-width="0.8" class="text-base-content/40" />
    <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="currentColor" stroke-width="0.8" class="text-base-content/40" />
    <text x={X0 - 3} y={Y1 + 4} text-anchor="end" class="fill-base-content/45 text-[7px]">半徑</text>
    <text x={X1} y={Y0 + 11} text-anchor="end" class="fill-base-content/45 text-[7px]">同系列往右 →</text>

    {#each lines as ln (ln.key)}
      <polyline points={poly(ln.pts)} fill="none" stroke={ln.color} stroke-width="1.4" />
      {#each ln.pts as p (p.z)}
        <circle cx={sx(p.pos)} cy={sy(p.r)} r="1.6" fill={ln.color} />
      {/each}
      <text x={sx(ln.pts[0].pos) - 3} y={sy(ln.pts[0].r) + 2.5} text-anchor="end" class="text-[7px] font-bold" fill={ln.color}>{ln.label}</text>
    {/each}

    <!-- 標 Zr ≈ Hf -->
    {#if zr && hf}
      <circle cx={sx(zr.pos)} cy={sy(zr.r)} r="2.8" fill="none" stroke="#dc2626" stroke-width="1" />
      <text x={sx(zr.pos) + 4} y={sy(zr.r) - 4} class="fill-base-content/70 text-[7px] font-semibold">Zr ≈ Hf（都 175）</text>
    {/if}
  </svg>

  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    <b style="color:#16a34a">4d</b> 和 <b style="color:#dc2626">5d</b> 兩條線幾乎疊在一起、都在 <b style="color:#2563eb">3d</b> 上方，就是 <b>5d ≈ 4d ＞ 3d</b>。5d 多一整層卻沒變大，因為中間的鑭系收縮，代表就是 Zr 和 Hf 半徑一樣。
  </p>
</div>
