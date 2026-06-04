<script lang="ts">
  // 理想氣體方程式 PV = nRT 求解器：選一個要求的量，輸入另外三個，自動算出。
  // 提醒溫度一定要用 K。R = 0.082 L·atm/(mol·K)。
  const R = 0.082
  type V = 'P' | 'V' | 'n' | 'T'
  let solveFor = $state<V>('V')
  let P = $state(1) // atm
  let Vol = $state(22.4) // L
  let n = $state(1) // mol
  let T = $state(273) // K

  const num = (x: number) => (Number.isFinite(x) && x > 0 ? x : 1)
  const result = $derived.by(() => {
    const p = num(P), v = num(Vol), nn = num(n), t = num(T)
    if (solveFor === 'P') return (nn * R * t) / v
    if (solveFor === 'V') return (nn * R * t) / p
    if (solveFor === 'n') return (p * v) / (R * t)
    return (p * v) / (nn * R) // T
  })
  const UNIT: Record<V, string> = { P: 'atm', V: 'L', n: 'mol', T: 'K' }
  const LABEL: Record<V, string> = { P: '壓力 P', V: '體積 V', n: '莫耳數 n', T: '溫度 T' }
  const VARS: V[] = ['P', 'V', 'n', 'T']
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧮</span>
    <span class="font-display font-bold">PV = nRT 求解器</span>
  </div>

  <div class="mb-3 text-sm">要求的量：
    <div class="join mt-1">
      {#each VARS as v (v)}
        <button type="button" class={`btn join-item btn-sm ${solveFor === v ? 'btn-primary' : 'btn-outline'}`} onclick={() => (solveFor = v)}>{v}</button>
      {/each}
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
    {#each VARS as v (v)}
      <div class={`rounded-lg p-2.5 ${solveFor === v ? 'bg-primary/10' : 'bg-base-200/60'}`}>
        <div class="text-xs text-base-content/55">{LABEL[v]}（{UNIT[v]}）</div>
        {#if solveFor === v}
          <div class="text-lg font-bold tabular-nums text-primary">{result.toFixed(2)}</div>
        {:else}
          <input type="number" min="0" step="0.1"
            value={v === 'P' ? P : v === 'V' ? Vol : v === 'n' ? n : T}
            oninput={(e) => { const x = +e.currentTarget.value; if (v === 'P') P = x; else if (v === 'V') Vol = x; else if (v === 'n') n = x; else T = x }}
            class="input input-bordered input-sm w-full" />
        {/if}
      </div>
    {/each}
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    R = 0.082 L·atm/(mol·K)。<b>溫度一定要用 K</b>（K ＝ °C + 273），這是最常失分的地方。
    預設那組（1 atm、22.4 L、1 mol、273 K）就是標準狀態（STP）下 1 莫耳氣體。
  </p>
</div>
