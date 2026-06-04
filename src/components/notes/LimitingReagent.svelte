<script lang="ts">
  // 限量試劑互動：反應 aA + bB → 產物。各反應物「莫耳數 ÷ 係數」最小者先用完 = 限量試劑。
  let nA = $state(4), a = $state(1)
  let nB = $state(9), b = $state(3)

  const sa = $derived(Number.isFinite(nA) && nA >= 0 ? nA : 0)
  const sb = $derived(Number.isFinite(nB) && nB >= 0 ? nB : 0)
  const ca = $derived(Number.isFinite(a) && a > 0 ? a : 1)
  const cb = $derived(Number.isFinite(b) && b > 0 ? b : 1)
  const ra = $derived(sa / ca) // 莫耳數 ÷ 係數
  const rb = $derived(sb / cb)
  const lr = $derived(ra <= rb ? 'A' : 'B') // 較小者為限量試劑
  const maxR = $derived(Math.max(ra, rb, 0.0001))
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚖️</span>
    <span class="font-display font-bold">限量試劑：誰先用完</span>
  </div>

  <div class="mb-3 flex flex-wrap items-center justify-center gap-2 font-mono text-sm">
    <input type="number" min="1" bind:value={a} class="input input-bordered input-xs w-12 text-center" />A
    <span>+</span>
    <input type="number" min="1" bind:value={b} class="input input-bordered input-xs w-12 text-center" />B
    <span>→ 產物</span>
  </div>

  <div class="grid grid-cols-2 gap-3">
    {#each [{ id: 'A', n: sa, c: ca, r: ra, bn: 'nA' }, { id: 'B', n: sb, c: cb, r: rb, bn: 'nB' }] as col (col.id)}
      <div class={`rounded-box border p-3 ${lr === col.id ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-200/50'}`}>
        <div class="mb-1.5 flex items-center justify-between">
          <span class="font-bold">{col.id}</span>
          {#if lr === col.id}<span class="badge badge-primary badge-sm font-bold">限量試劑</span>{:else}<span class="badge badge-ghost badge-sm">過量</span>{/if}
        </div>
        <label class="flex items-center gap-1 text-xs">莫耳數
          {#if col.id === 'A'}
            <input type="number" min="0" step="0.1" bind:value={nA} class="input input-bordered input-xs w-16" />
          {:else}
            <input type="number" min="0" step="0.1" bind:value={nB} class="input input-bordered input-xs w-16" />
          {/if}
          mol
        </label>
        <div class="mt-2 text-xs text-base-content/60">莫耳 ÷ 係數 = {col.n} ÷ {col.c} =</div>
        <div class="font-bold tabular-nums text-primary">{col.r.toFixed(2)}</div>
        <div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-base-300/50">
          <div class={`h-full rounded-full ${lr === col.id ? 'bg-primary' : 'bg-base-content/30'}`} style={`width:${(col.r / maxR) * 100}%`}></div>
        </div>
      </div>
    {/each}
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    把每個反應物的<b>莫耳數 ÷ 自己的係數</b>，數字<b>最小</b>的會先用完，就是<b>限量試劑</b>（上面較短的那條）。
    之後所有產物的量，都以限量試劑為準來算。
  </p>
</div>
