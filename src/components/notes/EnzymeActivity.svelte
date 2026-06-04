<script lang="ts">
  // 影響酵素活性的因素：切換 溫度／pH／受質濃度，看活性曲線的形狀。
  // 溫度、pH 是鐘形（有最適值，過頭變性）；受質濃度是飽和曲線（到 Vmax 後水平）。
  type F = 'temp' | 'ph' | 'sub'
  let f = $state<F>('temp')
  const W = 250, H = 140, PAD = 16
  const xN = 60
  const fy = $derived.by(() => {
    const arr: number[] = []
    for (let i = 0; i <= xN; i++) {
      const x = i / xN // 0..1
      let y: number
      if (f === 'sub') y = x / (x + 0.18) // 飽和曲線
      else if (f === 'temp') y = Math.exp(-Math.pow((x - 0.62) / 0.18, 2)) // 鐘形，峰在 ~37°C
      else y = Math.exp(-Math.pow((x - 0.5) / 0.2, 2)) // pH 鐘形，峰在中間
      arr.push(y)
    }
    return arr
  })
  const path = $derived.by(() => {
    let d = ''
    for (let i = 0; i <= xN; i++) {
      const px = PAD + (i / xN) * (W - 2 * PAD)
      const py = H - PAD - fy[i] * (H - 2 * PAD)
      d += `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)} `
    }
    return d
  })
  const META: Record<F, { x: string; note: string }> = {
    temp: { x: '溫度', note: '鐘形：低溫慢、最適溫度（人體 ~37°C）最快、過高使酵素變性（不可逆）失活。' },
    ph: { x: 'pH', note: '鐘形：每種酵素有最適 pH（胃蛋白酶 ~2、多數胞內酵素 ~7、胰蛋白酶 ~8）；偏離則活性下降。' },
    sub: { x: '受質濃度 [S]', note: '飽和曲線：受質越多速率越快，但活性部位被佔滿後達 Vmax，再加也不變。' },
  }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📈</span>
    <span class="font-display font-bold">影響酵素活性的因素</span>
  </div>

  <div class="join mb-3">
    {#each [['temp', '溫度'], ['ph', 'pH'], ['sub', '受質濃度']] as [k, label] (k)}
      <button type="button" class={`btn join-item btn-sm ${f === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (f = k as F)}>{label}</button>
    {/each}
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="w-full" role="img" aria-label="酵素活性曲線">
    <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} class="stroke-base-content/25" />
    <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} class="stroke-base-content/25" />
    <path d={path} fill="none" class="stroke-primary" stroke-width="2.5" />
    <text x={W / 2} y={H - 2} text-anchor="middle" class="fill-base-content/40 text-[8px]">{META[f].x} →</text>
    <text x={PAD - 2} y={PAD} text-anchor="end" class="fill-base-content/40 text-[8px]">活性</text>
  </svg>

  <p class="mt-2 text-xs leading-relaxed text-base-content/70">{META[f].note}</p>
</div>
