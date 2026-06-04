<script lang="ts">
  // 族群成長速率 dN/dt 對 N 作圖：J 型 = rN（直線）；S 型 = rN(K−N)/K（拋物線，峰在 N=K/2）。
  const r = 0.2, K = 1000
  let N = $state(500)
  const jRate = $derived(r * N)
  const sRate = $derived(r * N * (K - N) / K)

  const SX = (n: number) => 20 + n / K * 175
  const SY = (v: number) => 132 - v / 200 * 116 // dN/dt 0..200 → y
  // S 型拋物線取樣點
  const sPts = Array.from({ length: 21 }, (_, k) => {
    const n = (k / 20) * K
    return `${SX(n)},${SY(r * n * (K - n) / K)}`
  }).join(' ')
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📉</span>
    <span class="font-display font-bold">族群成長速率：J 型 vs S 型</span>
  </div>
  <p class="mb-2 text-xs text-base-content/60">固定 r = 0.2、K = 1000。拉族群數 N，看兩種模型的瞬時成長速率 dN/dt。</p>

  <svg viewBox="0 0 205 150" class="w-full" role="img" aria-label="dN/dt 對 N 作圖">
    <line x1="20" y1="132" x2="200" y2="132" class="stroke-base-content/30" stroke-width="1" />
    <line x1="20" y1="14" x2="20" y2="132" class="stroke-base-content/30" stroke-width="1" />
    <text x="110" y="147" text-anchor="middle" class="fill-base-content/50 text-[7px]">族群數 N →</text>
    <text x="8" y="20" class="fill-base-content/50 text-[7px]">dN/dt</text>
    <!-- K/2 參考線 -->
    <line x1={SX(K / 2)} y1="14" x2={SX(K / 2)} y2="132" class="stroke-base-content/20" stroke-width="1" stroke-dasharray="2 2" />
    <text x={SX(K / 2)} y="11" text-anchor="middle" class="fill-base-content/45 text-[6px]">K/2</text>
    <!-- J 型直線 -->
    <line x1={SX(0)} y1={SY(0)} x2={SX(K)} y2={SY(r * K)} class="stroke-error" stroke-width="2" />
    <text x="150" y="40" class="fill-error text-[7px] font-bold">J 型 rN</text>
    <!-- S 型拋物線 -->
    <polyline points={sPts} fill="none" class="stroke-info" stroke-width="2" />
    <text x="95" y="60" class="fill-info text-[7px] font-bold">S 型</text>
    <!-- 目前 N 標記 -->
    <circle cx={SX(N)} cy={SY(jRate)} r="3.5" class="fill-error" />
    <circle cx={SX(N)} cy={SY(sRate)} r="3.5" class="fill-info" />
  </svg>

  <input type="range" min="0" max="1000" step="20" bind:value={N} class="range range-primary range-xs mt-1" />
  <div class="mt-2 grid grid-cols-2 gap-2 text-center text-sm">
    <div class="rounded-lg bg-error/10 p-2"><div class="text-xs text-base-content/55">J 型 dN/dt = rN</div><div class="font-bold tabular-nums text-error">{jRate.toFixed(0)}</div></div>
    <div class="rounded-lg bg-info/10 p-2"><div class="text-xs text-base-content/55">S 型 dN/dt</div><div class="font-bold tabular-nums text-info">{sRate.toFixed(0)}</div></div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>J 型</b>（資源無限）：N 越大長越快、無上限。<b>S 型</b>（資源有限）：受環境承載量 K 限制，<b>在 N = K/2（{K / 2}）時成長速率最大</b>，接近 K 時趨近 0。漁業永續採收正是抓在 K/2 附近。
  </p>
</div>
