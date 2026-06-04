<script lang="ts">
  // 哈溫平衡：拉隱性等位基因頻率 q，算 AA(p²)、Aa(2pq)、aa(q²)。
  let q = $state(0.3)
  const p = $derived(1 - q)
  const aa = $derived(q * q)
  const Aa = $derived(2 * p * q)
  const AA = $derived(p * p)
  const pct = (x: number) => (x * 100).toFixed(1) + '%'
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📊</span>
    <span class="font-display font-bold">哈溫平衡計算器</span>
  </div>

  <label class="mb-1 flex items-center justify-between text-sm">
    <span>隱性等位基因頻率 q = <b class="text-primary tabular-nums">{q.toFixed(2)}</b></span>
    <span class="text-xs text-base-content/55">p = {p.toFixed(2)}</span>
  </label>
  <input type="range" min="0" max="1" step="0.01" bind:value={q} class="range range-primary range-xs" />

  <div class="mt-3 space-y-2 text-sm">
    <div class="flex items-center gap-2">
      <span class="w-24 shrink-0 text-base-content/70">AA（p²）</span>
      <div class="h-4 flex-1 overflow-hidden rounded-full bg-base-200"><div class="h-full rounded-full bg-success" style={`width:${AA * 100}%`}></div></div>
      <span class="w-14 text-right tabular-nums">{pct(AA)}</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="w-24 shrink-0 text-base-content/70">Aa（2pq）</span>
      <div class="h-4 flex-1 overflow-hidden rounded-full bg-base-200"><div class="h-full rounded-full bg-warning" style={`width:${Aa * 100}%`}></div></div>
      <span class="w-14 text-right tabular-nums">{pct(Aa)}</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="w-24 shrink-0 text-base-content/70">aa（q²）</span>
      <div class="h-4 flex-1 overflow-hidden rounded-full bg-base-200"><div class="h-full rounded-full bg-error" style={`width:${aa * 100}%`}></div></div>
      <span class="w-14 text-right tabular-nums">{pct(aa)}</span>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>p² + 2pq + q² = 1</b>。考題常給<b>隱性表現型比例＝q²</b>，先開根號得 q（再 p＝1−q），就能算雜合子 2pq。例：白化症 aa＝9% → q＝√0.09＝0.3 → Aa＝2×0.7×0.3＝<b>42%</b>。
  </p>
</div>
