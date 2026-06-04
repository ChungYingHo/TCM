<script lang="ts">
  // 八面體晶體場：選 d 電子數與場強，把電子填入 t₂g(低)、eg(高)，數未成對電子、判高/低自旋。
  // 強場(大Δ)先把 t₂g 配對滿才上 eg → 低自旋；弱場(小Δ)先 5 軌域各一個 → 高自旋。
  let d = $state(6)
  let strong = $state(true)

  const fill = $derived.by(() => {
    const t2g = [0, 0, 0], eg = [0, 0]
    let left = d
    if (strong) {
      for (let i = 0; i < 3 && left > 0; i++) { t2g[i] = 1; left-- }
      for (let i = 0; i < 3 && left > 0; i++) { t2g[i] = 2; left-- }
      for (let i = 0; i < 2 && left > 0; i++) { eg[i] = 1; left-- }
      for (let i = 0; i < 2 && left > 0; i++) { eg[i] = 2; left-- }
    } else {
      for (let i = 0; i < 3 && left > 0; i++) { t2g[i] = 1; left-- }
      for (let i = 0; i < 2 && left > 0; i++) { eg[i] = 1; left-- }
      for (let i = 0; i < 3 && left > 0; i++) { if (t2g[i] < 2) { t2g[i] = 2; left-- } }
      for (let i = 0; i < 2 && left > 0; i++) { if (eg[i] < 2) { eg[i] = 2; left-- } }
    }
    return { t2g, eg }
  })
  const unpaired = $derived([...fill.t2g, ...fill.eg].filter((x) => x === 1).length)
  const canChoose = $derived(d >= 4 && d <= 7) // 只有 d⁴–d⁷ 有高/低自旋之分
  const spin = $derived(!canChoose ? '（與場強無關）' : strong ? '低自旋' : '高自旋')
  const arrow = (x: number) => (x === 2 ? '↑↓' : x === 1 ? '↑' : '')
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">🧲</span>
    <span class="font-display font-bold">八面體晶體場：高/低自旋</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${!strong ? 'btn-primary' : 'btn-outline'}`} onclick={() => (strong = false)}>弱場</button>
      <button type="button" class={`btn btn-xs ${strong ? 'btn-primary' : 'btn-outline'}`} onclick={() => (strong = true)}>強場</button>
    </div>
  </div>

  <label class="mb-3 block text-sm">d 電子數 = <b class="tabular-nums">d{d}</b>
    <input type="range" min="1" max="10" step="1" bind:value={d} class="range range-primary range-sm w-full" aria-label="d 電子數" />
  </label>

  <!-- 軌域圖：eg 在上、t2g 在下，中間是 Δ -->
  <div class="flex flex-col items-center gap-1">
    <span class="text-[0.65rem] text-base-content/45">eg（高能）</span>
    <div class="flex gap-1.5">
      {#each fill.eg as o, i (i)}
        <div class="flex h-8 w-9 items-center justify-center rounded border border-base-300 bg-base-200/60 text-sm font-bold text-primary">{arrow(o)}</div>
      {/each}
    </div>
    <div class="my-1 flex items-center gap-1 text-[0.65rem] text-accent">↕ 分裂能 Δ（{strong ? '大' : '小'}）</div>
    <div class="flex gap-1.5">
      {#each fill.t2g as o, i (i)}
        <div class="flex h-8 w-9 items-center justify-center rounded border border-base-300 bg-base-200/60 text-sm font-bold text-primary">{arrow(o)}</div>
      {/each}
    </div>
    <span class="text-[0.65rem] text-base-content/45">t₂g（低能）</span>
  </div>

  <div class="mt-3 flex flex-wrap items-center gap-2 rounded-box bg-base-200/60 p-3 text-sm">
    <span class="badge badge-primary font-bold">{spin}</span>
    <span>未成對電子 = <b class="tabular-nums text-primary">{unpaired}</b> 個 → {unpaired === 0 ? '抗磁性' : '順磁性'}</span>
  </div>
  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    {#if canChoose}
      <b>強場（Δ 大）</b>：電子寧可在 t₂g 配對也不上 eg → <b>低自旋</b>（未成對少）；<b>弱場（Δ 小）</b>：先把 5 個軌域各填一個 → <b>高自旋</b>（未成對多）。
    {:else}
      d{d} 的填法<b>唯一</b>，不論強場弱場、未成對電子數都一樣——<b>磁性與配位基無關</b>（只有 d⁴–d⁷ 才有高/低自旋之分）。
    {/if}
  </p>
</div>
