<script lang="ts">
  // 熵變方向判斷：選反應，比較反應前後的「氣體莫耳數」——氣體變多 ΔS>0、變少 ΔS<0。
  // 這是判斷 ΔS 符號最快的方法（氣體的亂度遠大於固液）。
  type Rxn = { eq: string; before: number; after: number }
  const RXNS: Rxn[] = [
    { eq: 'CaCO₃(s) → CaO(s) + CO₂(g)', before: 0, after: 1 },
    { eq: '2H₂(g) + O₂(g) → 2H₂O(l)', before: 3, after: 0 },
    { eq: 'N₂(g) + 3H₂(g) → 2NH₃(g)', before: 4, after: 2 },
    { eq: '2KClO₃(s) → 2KCl(s) + 3O₂(g)', before: 0, after: 3 },
    { eq: 'H₂O(l) → H₂O(g)', before: 0, after: 1 },
  ]
  let i = $state(0)
  const r = $derived(RXNS[i])
  const diff = $derived(r.after - r.before)
  const sign = $derived(diff > 0 ? { t: 'ΔS > 0（亂度增加）', cls: 'badge-success' } : diff < 0 ? { t: 'ΔS < 0（亂度減少）', cls: 'badge-error' } : { t: 'ΔS ≈ 0', cls: 'badge-ghost' })
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🎲</span>
    <span class="font-display font-bold">ΔS 符號：數氣體莫耳數</span>
  </div>

  <div class="mb-3 flex flex-col gap-1">
    {#each RXNS as rx, k (rx.eq)}
      <button type="button" class={`rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${i === k ? 'bg-primary/15 font-semibold text-primary' : 'bg-base-200/50 hover:bg-base-200'}`} onclick={() => (i = k)}>{rx.eq}</button>
    {/each}
  </div>

  <div class="flex flex-wrap items-center gap-2 rounded-box bg-base-200/60 p-3 text-sm">
    <span>氣體莫耳數：<b class="tabular-nums">{r.before}</b> → <b class="tabular-nums">{r.after}</b></span>
    <span class={`badge font-bold ${sign.cls}`}>{sign.t}</span>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    判斷 ΔS 符號最快的方法：<b>比較反應前後的氣體莫耳數</b>。氣體的亂度遠大於固體、液體，所以氣體<b>變多 → ΔS&gt;0</b>、<b>變少 → ΔS&lt;0</b>。（固→液→氣、溶解，也都使 ΔS 增加。）
  </p>
</div>
