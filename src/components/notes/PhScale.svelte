<script lang="ts">
  // Interactive pH scale — drag to see how pH, pOH, [H⁺], [OH⁻] move together.
  // Drives home: pH = −log[H⁺], pH + pOH = 14, and every step is ×10.
  let ph = $state(7)
  const poh = $derived(14 - ph)

  function sci(exp: number): string {
    // 10^exp as "a.a ×10ⁿ"
    const e = Math.floor(exp)
    const mant = Math.pow(10, exp - e)
    const sup = String(e).replace(/-/g, '−').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])
    return `${mant.toFixed(1)} ×10${sup}`
  }
  const h = $derived(sci(-ph))
  const oh = $derived(sci(-poh))
  const kind = $derived(ph < 6.95 ? '酸性' : ph > 7.05 ? '鹼性' : '中性')
  const kindCls = $derived(ph < 6.95 ? 'badge-error' : ph > 7.05 ? 'badge-info' : 'badge-success')
</script>

<div class="my-4 rounded-box border border-base-300 bg-base-100 p-4">
  <div class="mb-2 flex items-center justify-between">
    <span class="font-display font-bold">pH ↔ [H⁺] 互動尺</span>
    <span class={`badge ${kindCls} font-bold`}>{kind}</span>
  </div>

  <input type="range" min="0" max="14" step="0.1" bind:value={ph}
    class="range range-primary range-sm w-full"
    style="background:linear-gradient(90deg,oklch(0.6 0.15 25),oklch(0.85 0.07 95),oklch(0.6 0.12 232));"
    aria-label="調整 pH 值" />
  <div class="mt-1 flex justify-between text-[0.65rem] opacity-50"><span>0 強酸</span><span>7 中性</span><span>14 強鹼</span></div>

  <div class="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
    <div class="rounded-lg bg-base-200 p-2 text-center"><div class="text-xs opacity-60">pH</div><div class="font-bold tabular-nums">{ph.toFixed(1)}</div></div>
    <div class="rounded-lg bg-base-200 p-2 text-center"><div class="text-xs opacity-60">pOH = 14−pH</div><div class="font-bold tabular-nums">{poh.toFixed(1)}</div></div>
    <div class="rounded-lg bg-base-200 p-2 text-center"><div class="text-xs opacity-60">[H⁺] (M)</div><div class="font-bold tabular-nums">{h}</div></div>
    <div class="rounded-lg bg-base-200 p-2 text-center"><div class="text-xs opacity-60">[OH⁻] (M)</div><div class="font-bold tabular-nums">{oh}</div></div>
  </div>
  <p class="mt-2 text-xs opacity-70">pH 每<b>降 1</b>，[H⁺] 就<b>變 10 倍</b>；pH 與 pOH 永遠相加為 14（25°C）。</p>
</div>
