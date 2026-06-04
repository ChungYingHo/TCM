<script lang="ts">
  // 光譜化學序列：配位基由弱場到強場排列；點一個看它是強場還是弱場、傾向高或低自旋。
  type L = { name: string; strong: boolean }
  const LIGS: L[] = [
    { name: 'I⁻', strong: false }, { name: 'Br⁻', strong: false }, { name: 'Cl⁻', strong: false },
    { name: 'F⁻', strong: false }, { name: 'H₂O', strong: false }, { name: 'NH₃', strong: true },
    { name: 'en', strong: true }, { name: 'CN⁻', strong: true }, { name: 'CO', strong: true },
  ]
  let sel = $state(7) // CN⁻
  const l = $derived(LIGS[sel])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📶</span>
    <span class="font-display font-bold">光譜化學序列（配位基強弱）</span>
  </div>

  <div class="mb-2 flex items-center justify-between text-xs text-base-content/55"><span>← 弱場（小 Δ）</span><span>強場（大 Δ）→</span></div>
  <div class="flex flex-wrap gap-1">
    {#each LIGS as lg, k (lg.name)}
      <button type="button" class={`btn btn-xs font-mono ${sel === k ? 'btn-primary' : lg.strong ? 'btn-outline btn-primary' : 'btn-outline'}`} onclick={() => (sel = k)}>{lg.name}</button>
    {/each}
  </div>

  <div class="mt-3 rounded-box bg-base-200/60 p-3 text-sm">
    <b class="font-mono">{l.name}</b> 是<b class={l.strong ? 'text-primary' : 'text-base-content/70'}>{l.strong ? '強場' : '弱場'}</b>配位基 →
    分裂能 Δ {l.strong ? '大' : '小'} → 傾向 <b>{l.strong ? '低自旋' : '高自旋'}</b>（d⁴–d⁷ 時）。
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    記兩端就好：<b>鹵素、H₂O 偏弱場</b>（高自旋）；<b>NH₃、en、CN⁻、CO 偏強場</b>（低自旋）。最強場是 <b>CN⁻、CO</b>——這也是 CO 中毒的原因（與血紅素 Fe 形成很安定的錯合物、搶走 O₂ 的位置）。
  </p>
</div>
