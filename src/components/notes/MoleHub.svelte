<script lang="ts">
  // 莫耳換算中樞：莫耳是「質量 ↔ 粒子數 ↔ 氣體體積」之間的橋。
  // 設分子量 M 和莫耳數 n，三個等價量同步算出，凸顯莫耳的中心地位。
  const NA = 6.022e23
  let M = $state(18) // 分子量 g/mol（預設水）
  let n = $state(1) // 莫耳數 mol

  const safeM = $derived(Number.isFinite(M) && M > 0 ? M : 1)
  const safeN = $derived(Number.isFinite(n) && n >= 0 ? n : 0)
  const mass = $derived(safeN * safeM)
  const particles = $derived(safeN * NA)
  const volSTP = $derived(safeN * 22.4)

  function sci(x: number): string {
    if (x === 0) return '0'
    const e = Math.floor(Math.log10(x))
    const m = x / Math.pow(10, e)
    const sup = String(e).replace(/-/g, '−').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])
    return `${m.toFixed(2)}×10${sup}`
  }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔄</span>
    <span class="font-display font-bold">莫耳換算中樞</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
    <label class="flex items-center gap-1.5">分子量 M
      <input type="number" min="1" step="1" bind:value={M} class="input input-bordered input-sm w-20" /> g/mol
    </label>
    <label class="flex items-center gap-1.5">莫耳數 n
      <input type="number" min="0" step="0.1" bind:value={n} class="input input-bordered input-sm w-20" /> mol
    </label>
  </div>

  <!-- 中樞：n mol → 三個等價量 -->
  <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
    <div class="rounded-box bg-base-200/70 p-3 text-center">
      <div class="text-xs text-base-content/55">質量 = n × M</div>
      <div class="text-lg font-bold tabular-nums text-primary">{mass.toFixed(2)} g</div>
    </div>
    <div class="rounded-box bg-base-200/70 p-3 text-center">
      <div class="text-xs text-base-content/55">粒子數 = n × Nₐ</div>
      <div class="text-lg font-bold tabular-nums text-primary">{sci(particles)}</div>
      <div class="text-[0.65rem] text-base-content/45">個</div>
    </div>
    <div class="rounded-box bg-base-200/70 p-3 text-center">
      <div class="text-xs text-base-content/55">氣體體積 = n × 22.4</div>
      <div class="text-lg font-bold tabular-nums text-primary">{volSTP.toFixed(2)} L</div>
      <div class="text-[0.65rem] text-base-content/45">STP（0°C, 1 atm）</div>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    解任何計量題的第一步都是<b>把已知量換成莫耳</b>：知道<b>質量</b>就 ÷M、知道<b>粒子數</b>就 ÷Nₐ、知道<b>STP 氣體體積</b>就 ÷22.4、知道<b>溶液</b>就 n＝莫耳濃度×體積。換成莫耳後，再用反應式係數比跨到別的物質。
  </p>
</div>
