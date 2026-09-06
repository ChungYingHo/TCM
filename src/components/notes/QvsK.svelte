<script lang="ts">
  // Q vs K 判方向：設 K 與當前 Q，比較大小 → 反應往哪邊跑（把 Q 拉回 K）。
  // Q < K 正向（右）、Q > K 逆向（左）、Q = K 平衡。
  let K = $state(1)
  let Q = $state(0.3)
  const sK = $derived(Number.isFinite(K) && K > 0 ? K : 1)
  const dir = $derived.by(() => {
    const r = Q / sK
    if (r > 0.92 && r < 1.08) return { t: '非常接近平衡（Q ≈ K）', arrow: '＝', cls: 'badge-warning' }
    return Q < sK ? { t: '正向（往右、生成產物）', arrow: '→', cls: 'badge-success' } : { t: '逆向（往左、分解產物）', arrow: '←', cls: 'badge-error' }
  })
  // 數線：0 … 2K，K 在中間，Q 為點
  const max = $derived(sK * 2)
  const qx = $derived(Math.max(0, Math.min(100, (Q / max) * 100)))
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧭</span>
    <span class="font-display font-bold">Q 與 K 比大小 → 反應方向</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
    <label class="flex items-center gap-1.5">平衡常數 K
      <input type="number" min="0.01" step="0.1" bind:value={K} class="input input-bordered input-sm w-20" />
    </label>
    <label class="flex items-center gap-1.5">當前 Q
      <input type="number" min="0" step="0.05" bind:value={Q} class="input input-bordered input-sm w-20" />
    </label>
  </div>

  <!-- 數線 -->
  <div class="relative mt-1 mb-2 h-10">
    <div class="absolute top-5 right-0 left-0 h-1 rounded-full bg-base-300/70"></div>
    <div class="absolute top-3 left-1/2 h-5 w-0.5 -translate-x-1/2 bg-accent"></div>
    <span class="absolute top-0 left-1/2 -translate-x-1/2 text-[0.65rem] font-bold text-accent">K = {sK}</span>
    <div class="absolute top-4 h-3 w-3 -translate-x-1/2 rounded-full bg-primary transition-all duration-200" style={`left:${qx}%`}></div>
    <span class="absolute top-8 -translate-x-1/2 text-[0.65rem] font-bold text-primary" style={`left:${qx}%`}>Q</span>
  </div>

  <div class="flex items-center gap-2">
    <span class="text-2xl font-bold text-base-content/70">{dir.arrow}</span>
    <span class={`badge font-bold ${dir.cls}`}>{dir.t}</span>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>Q</b> 和 K 的算式一樣，但用<b>當前（還沒平衡）的濃度</b>。比大小：<b>Q &lt; K</b> 表示產物還不夠，反應<b>往右</b>生成產物。<b>Q &gt; K</b> 表示產物太多，<b>往左</b>分解。<b>Q = K</b> 已平衡。口訣「Q 小向右、Q 大向左」。
  </p>
</div>
