<script lang="ts">
  // Teach the relationship types via Fischer-projection pairs (same format as the
  // exam questions). Toggle between enantiomer / diastereomer / meso.
  type Kind = 'enantiomer' | 'diastereomer' | 'meso'
  let kind = $state<Kind>('enantiomer')

  const TABS: { k: Kind; label: string }[] = [
    { k: 'enantiomer', label: '鏡像異構物' },
    { k: 'diastereomer', label: '非鏡像異構物' },
    { k: 'meso', label: '內消旋 (meso)' },
  ]

  // each structure = two stereocenters shown as L/R of a Fischer projection
  const DATA: Record<Kind, { left: [string, string][]; right: [string, string][]; note: string }> = {
    enantiomer: {
      left: [['H', 'OH'], ['H', 'OH']],
      right: [['HO', 'H'], ['HO', 'H']],
      note: '左右兩個分子是「照鏡子」的關係，每一個對掌中心都相反，且無法重疊 → 鏡像異構物 (enantiomers)。旋光度大小相同、方向相反。',
    },
    diastereomer: {
      left: [['H', 'OH'], ['H', 'OH']],
      right: [['H', 'OH'], ['HO', 'H']],
      note: '只有「部分」對掌中心相反（這裡上面相同、下面相反）→ 非鏡像異構物 (diastereomers)。物理性質（熔點、溶解度）不同，可用一般方法分離。',
    },
    meso: {
      left: [['H', 'OH'], ['HO', 'H']],
      right: [['HO', 'H'], ['H', 'OH']],
      note: '分子內部有對稱面，上下互為鏡像 → 整個分子不具旋光性，叫內消旋 (meso)。左右其實是「同一個」分子（可重疊）。',
    },
  }

  const cur = $derived(DATA[kind])
</script>

<div class="my-4 rounded-xl border border-base-300 bg-base-100 p-4">
  <div role="tablist" class="tabs tabs-boxed mb-3 w-fit">
    {#each TABS as t (t.k)}
      <button role="tab" class={`tab ${kind === t.k ? 'tab-active' : ''}`} onclick={() => (kind = t.k)}>{t.label}</button>
    {/each}
  </div>

  <div class="flex items-center justify-center gap-8 font-mono text-sm">
    {#each [cur.left, cur.right] as mol, mi (mi)}
      <div class="text-center">
        <div>COOH</div>
        {#each mol as [l, r], ri (ri)}
          <div class="flex items-center justify-center gap-1">
            <span class="w-8 text-right">{l}</span><span>—|—</span><span class="w-8 text-left">{r}</span>
          </div>
        {/each}
        <div>COOH</div>
      </div>
      {#if mi === 0}<div class="text-2xl opacity-40">↔</div>{/if}
    {/each}
  </div>

  <p class="mt-3 animate-fade-in-up text-sm leading-relaxed">{cur.note}</p>
</div>
