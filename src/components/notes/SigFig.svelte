<script lang="ts">
  // 有效位數：加減看「小數位數」取最少；乘除看「有效數字位數」取最少。
  let op = $state<'add' | 'mul'>('add')
  const decimals = (s: string) => (s.includes('.') ? s.split('.')[1].length : 0)
  const sigfigs = (s: string) => s.replace('.', '').replace(/^0+/, '').length || 1

  let a = $state('23.68')
  let b = $state('4.12')
  const na = $derived(parseFloat(a)), nb = $derived(parseFloat(b))
  const raw = $derived(op === 'add' ? na + nb : na * nb)
  const result = $derived.by(() => {
    if (!Number.isFinite(raw)) return '—'
    if (op === 'add') {
      const d = Math.min(decimals(a), decimals(b))
      return raw.toFixed(d)
    }
    const sf = Math.min(sigfigs(a), sigfigs(b))
    return raw.toPrecision(sf)
  })
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔢</span>
    <span class="font-display font-bold">有效位數計算</span>
  </div>

  <div class="mb-3 flex items-center gap-2 text-sm">
    <input type="text" bind:value={a} class="input input-bordered input-sm w-24 text-center" />
    <div class="join">
      <button type="button" class={`btn join-item btn-sm ${op === 'add' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (op = 'add')}>＋</button>
      <button type="button" class={`btn join-item btn-sm ${op === 'mul' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (op = 'mul')}>×</button>
    </div>
    <input type="text" bind:value={b} class="input input-bordered input-sm w-24 text-center" />
  </div>

  <div class="rounded-box bg-primary/10 p-3 text-center">
    <div class="text-xs text-base-content/55">{op === 'add' ? '加減：看小數位數，取最少者' : '乘除：看有效數字位數，取最少者'}</div>
    <div class="text-lg font-bold tabular-nums text-primary">= {result}</div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>加減法</b>看<b>小數位數</b>：結果保留到「小數位數最少」那個的位數（如 23.68＋4.12＝27.80，保留 2 位小數）。<b>乘除法</b>看<b>有效數字位數</b>：保留到「有效位數最少」那個（如 2.0×3.14＝6.3，2 位有效）。
  </p>
</div>
