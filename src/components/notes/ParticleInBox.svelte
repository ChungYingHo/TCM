<script lang="ts">
  // 一維盒中質點（靜態全畫，供 GoodNotes/PDF 直接看，無互動）。
  // 左：能階梯 Eₙ∝n²（往上越開，和氫原子相反）。右：n=1,2,3 的波函數 ψ 與機率密度 |ψ|²，標節點。
  const NS = [1, 2, 3]

  // 波形取樣（盒內 x：SVG 12→118，共 106；中心線 y=30，振幅 20）
  const X0 = 12
  const W = 106
  const psiPoints = (n: number) => {
    const pts: string[] = []
    for (let i = 0; i <= W; i++) {
      const t = i / W
      pts.push(`${X0 + i},${(30 - 20 * Math.sin(n * Math.PI * t)).toFixed(1)}`)
    }
    return pts.join(' ')
  }
  // |ψ|²：底線 y=58、往上 44
  const probPoints = (n: number) => {
    const pts: string[] = [`${X0},58`]
    for (let i = 0; i <= W; i++) {
      const t = i / W
      const v = Math.sin(n * Math.PI * t) ** 2
      pts.push(`${X0 + i},${(58 - 44 * v).toFixed(1)}`)
    }
    pts.push(`${X0 + W},58`)
    return pts.join(' ')
  }
  // 內部節點（|ψ|²=0）位置：x = k·L/n，k=1…n−1
  const nodesX = (n: number) => Array.from({ length: n - 1 }, (_, k) => X0 + ((k + 1) / n) * W)

  // 能階梯：Eₙ∝n²，y = 150 − (n²/16)·128
  const yLevel = (n: number) => 150 - ((n * n) / 16) * 128
  const LADDER = [1, 2, 3, 4]
  const label = (n: number) => (n === 1 ? 'E₁' : `${n * n}E₁`)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5 print:break-inside-avoid">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📦</span>
    <span class="font-display font-bold">一維盒中質點：能階、波函數與機率</span>
  </div>

  <div class="grid gap-4 sm:grid-cols-[auto_1fr]">
    <!-- 能階梯 -->
    <div class="rounded-lg border border-base-300 bg-base-200/40 p-3 print:break-inside-avoid">
      <div class="mb-1 text-center text-sm font-semibold">能階 Eₙ = n²E₁</div>
      <svg viewBox="0 0 120 160" class="h-48 w-40" role="img" aria-label="盒中質點能階梯">
        {#each LADDER as n (n)}
          <line x1="34" y1={yLevel(n)} x2="110" y2={yLevel(n)} stroke="currentColor" stroke-width="2" class="text-primary" />
          <text x="30" y={yLevel(n) + 3.5} text-anchor="end" class="fill-base-content/60 text-[9px]">n={n}</text>
          <text x="112" y={yLevel(n) + 3.5} class="fill-primary text-[9px] font-bold">{label(n)}</text>
        {/each}
      </svg>
      <div class="mt-1 text-center text-xs text-base-content/60">往上<b>越拉越開</b>（和氫原子相反）</div>
    </div>

    <!-- 波函數與機率 -->
    <div class="grid grid-cols-1 gap-2.5">
      {#each NS as n (n)}
        <div class="rounded-lg border border-base-300 bg-base-200/40 p-2 print:break-inside-avoid">
          <div class="mb-1 text-sm font-semibold">n = {n}<span class="ml-2 font-normal text-base-content/55">節點 {n - 1} 個</span></div>
          <div class="flex items-center gap-3">
            <div class="text-center">
              <svg viewBox="0 0 130 60" class="h-14 w-32" role="img" aria-label={`n=${n} 波函數`}>
                <line x1={X0} y1="30" x2={X0 + W} y2="30" stroke="currentColor" stroke-width="0.5" class="text-base-content/25" stroke-dasharray="2 2" />
                <polyline points={psiPoints(n)} fill="none" stroke="currentColor" stroke-width="1.8" class="text-primary" />
              </svg>
              <div class="text-[0.65rem] text-base-content/55">ψ<sub>{n}</sub></div>
            </div>
            <div class="text-center">
              <svg viewBox="0 0 130 62" class="h-14 w-32" role="img" aria-label={`n=${n} 機率密度`}>
                <polyline points={probPoints(n)} fill="currentColor" class="text-primary/20" stroke="currentColor" stroke-width="1.5" />
                {#each nodesX(n) as nx (nx)}
                  <circle cx={nx} cy="58" r="2.4" class="fill-error" />
                {/each}
              </svg>
              <div class="text-[0.65rem] text-base-content/55">|ψ<sub>{n}</sub>|²（<span class="text-error">●</span> 節點）</div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    n=1 盒子中央機率最大，n=2 中央機率為 0（節點）。節點數隨 n 上升。最低能量是 n=1 的 E₁（不為 0，即零點能量）。
  </p>
</div>
