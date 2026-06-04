<script lang="ts">
  // SN1/SN2/E1/E2 判斷器：選碳級（1°/2°/3°）與試劑類型，給出最可能的機構與理由。
  // 簡化版決策（符合大多數考題）：強親核劑→SN2、體積大強鹼→E2、弱親核劑+質子溶劑→SN1/E1。
  type Carbon = '1°' | '2°' | '3°'
  type Reagent = 'nu' | 'base' | 'weak'
  let c = $state<Carbon>('3°')
  let r = $state<Reagent>('weak')

  const REAGENT_LABEL: Record<Reagent, string> = {
    nu: '強親核劑、弱鹼（I⁻、CN⁻、RS⁻）',
    base: '體積大的強鹼（t-BuO⁻、OH⁻/醇、高溫）',
    weak: '弱親核劑、弱鹼、質子溶劑（H₂O、ROH）',
  }
  const TABLE: Record<Carbon, Record<Reagent, { m: string; why: string }>> = {
    '1°': {
      nu: { m: 'SN2', why: '1° 碳空間阻礙小，強親核劑從背面進攻 → SN2（構型反轉）。' },
      base: { m: 'E2', why: '體積大的強鹼難攻碳、改拔 β-H → E2。' },
      weak: { m: '幾乎不反應', why: '1° 碳正離子太不穩定，SN1/E1 難發生。' },
    },
    '2°': {
      nu: { m: 'SN2', why: '2° + 強親核劑、非質子極性溶劑 → 偏 SN2。' },
      base: { m: 'E2', why: '強鹼拔 β-H → E2（Zaitsev 取代最多的烯）。' },
      weak: { m: 'SN1 / E1', why: '2° 可形成碳正離子，弱親核劑＋質子溶劑 → SN1／E1 混合。' },
    },
    '3°': {
      nu: { m: 'E2 或 SN1', why: '3° 無法 SN2（空間阻礙）；偏鹼性走 E2，否則經碳正離子走 SN1。' },
      base: { m: 'E2', why: '3° + 強鹼 → 主要 E2（消去）。' },
      weak: { m: 'SN1 / E1', why: '3° 碳正離子最穩定，弱親核劑＋質子溶劑 → SN1／E1。' },
    },
  }
  const res = $derived(TABLE[c][r])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔀</span>
    <span class="font-display font-bold">SN1 / SN2 / E1 / E2 判斷器</span>
  </div>

  <div class="mb-2 text-sm">碳的級數（底物）
    <div class="join ml-1">
      {#each ['1°', '2°', '3°'] as v (v)}
        <button type="button" class={`btn join-item btn-sm ${c === v ? 'btn-primary' : 'btn-outline'}`} onclick={() => (c = v as Carbon)}>{v}</button>
      {/each}
    </div>
  </div>
  <div class="mb-3 flex flex-col gap-1 text-sm">試劑／條件
    {#each Object.entries(REAGENT_LABEL) as [key, label] (key)}
      <button type="button" class={`rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${r === key ? 'bg-primary/15 font-semibold text-primary' : 'bg-base-200/50 hover:bg-base-200'}`} onclick={() => (r = key as Reagent)}>{label}</button>
    {/each}
  </div>

  <div class="rounded-box bg-primary/10 p-3 text-center">
    <div class="text-xs text-base-content/55">最可能的機構</div>
    <div class="text-xl font-bold text-primary">{res.m}</div>
  </div>
  <p class="mt-2 text-xs leading-relaxed text-base-content/70">{res.why}</p>
  <p class="mt-2 text-xs leading-relaxed text-base-content/60">
    判斷四看：① 碳級數（1°利 SN2、3°利 SN1/E1）；② 親核劑強弱（強→SN2/E2）；③ 鹼的體積（大強鹼→E2）；④ 溶劑（質子→SN1/E1、非質子→SN2/E2）。
  </p>
</div>
