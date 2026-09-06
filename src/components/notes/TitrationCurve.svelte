<script lang="ts">
  // 滴定曲線（強鹼滴定酸）：切換「強酸 / 弱酸」，看 pH 隨滴入鹼的體積變化。
  // 弱酸有緩衝平緩段，半當量點(50%) pH=pKa；當量點(100%)強酸=7、弱酸>7。
  let weak = $state(true)
  const C = 0.1, pKa = 4.74, Kw = 1e-14
  const Ka = Math.pow(10, -pKa)

  function pHat(v: number, w: boolean): number {
    if (v < 0.995) {
      if (w) {
        if (v < 0.005) return -Math.log10(Math.sqrt(Ka * C)) // 純弱酸
        return Math.min(pKa + Math.log10(v / (1 - v)), 13) // 緩衝段
      }
      return -Math.log10(Math.max((C * (1 - v)) / (1 + v), 1e-7))
    }
    if (v <= 1.005) {
      if (w) return 14 + Math.log10(Math.sqrt((Kw / Ka) * (C / 2))) // 共軛鹼水解
      return 7
    }
    return 14 - -Math.log10(Math.max((C * (v - 1)) / (1 + v), 1e-7))
  }
  const eqPH = $derived(weak ? pHat(1, true) : 7)

  const W = 250, H = 160, PAD = 18
  const VMAX = 2
  const sx = (v: number) => PAD + (v / VMAX) * (W - 2 * PAD)
  const sy = (ph: number) => H - PAD - (Math.max(0, Math.min(14, ph)) / 14) * (H - 2 * PAD)
  const path = $derived.by(() => {
    let d = ''
    for (let i = 0; i <= 100; i++) {
      const v = 0.01 + (i / 100) * (VMAX - 0.01)
      d += `${i === 0 ? 'M' : 'L'}${sx(v).toFixed(1)},${sy(pHat(v, weak)).toFixed(1)} `
    }
    return d
  })
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">📉</span>
    <span class="font-display font-bold">滴定曲線（強鹼滴定酸）</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${!weak ? 'btn-primary' : 'btn-outline'}`} onclick={() => (weak = false)}>強酸</button>
      <button type="button" class={`btn btn-xs ${weak ? 'btn-primary' : 'btn-outline'}`} onclick={() => (weak = true)}>弱酸</button>
    </div>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="w-full" role="img" aria-label="滴定曲線">
    <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} class="stroke-base-content/25" />
    <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} class="stroke-base-content/25" />
    <!-- pH=7 參考線 -->
    <line x1={PAD} y1={sy(7)} x2={W - PAD} y2={sy(7)} class="stroke-base-content/15" stroke-dasharray="3 3" />
    <text x={W - PAD} y={sy(7) - 2} text-anchor="end" class="fill-base-content/35 text-[8px]">pH 7</text>
    <!-- 當量點 -->
    <line x1={sx(1)} y1={PAD} x2={sx(1)} y2={H - PAD} class="stroke-error/50" stroke-dasharray="2 2" />
    <circle cx={sx(1)} cy={sy(eqPH)} r="3" class="fill-error" />
    <text x={sx(1) + 3} y={sy(eqPH) - 3} class="fill-error text-[8px]">當量點</text>
    <!-- 半當量點（弱酸）-->
    {#if weak}
      <circle cx={sx(0.5)} cy={sy(pKa)} r="3" class="fill-accent" />
      <text x={sx(0.5) - 2} y={sy(pKa) - 4} text-anchor="middle" class="fill-accent text-[8px]">半當量 pH=pKa</text>
    {/if}
    <path d={path} fill="none" class="stroke-primary" stroke-width="2.5" />
    <text x={W / 2} y={H - 4} text-anchor="middle" class="fill-base-content/40 text-[8px]">加入鹼的量（當量比）→</text>
  </svg>

  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    {#if weak}
      <b>弱酸</b>＋強鹼：前段有<b>緩衝平緩段</b>，<b>半當量點（50%）pH = pKa</b>（可由此讀出 pKa）。<b>當量點 pH &gt; 7</b>（生成的共軛鹼水解），宜用酚酞。
    {:else}
      <b>強酸</b>＋強鹼：起點 pH 低、當量點 pH = 7（中性），曲線在當量點附近垂直陡升。
    {/if}
    當量點＝酸鹼恰好等莫耳中和的那一點。
  </p>
</div>
