<script lang="ts">
  // 細胞呼吸四階段：點一個階段，看它的「地點」與「每葡萄糖的產物」。
  type St = { name: string; loc: string; locCls: string; products: string }
  const STAGES: St[] = [
    { name: '糖解', loc: '細胞質', locCls: 'badge-info', products: '2 丙酮酸、淨 2 ATP、2 NADH（不需氧、不產 CO₂）' },
    { name: '丙酮酸氧化', loc: '粒線體基質', locCls: 'badge-success', products: '2 乙醯 CoA、2 NADH、2 CO₂' },
    { name: '克氏循環（×2 圈）', loc: '粒線體基質', locCls: 'badge-success', products: '2 ATP、6 NADH、2 FADH₂、4 CO₂' },
    { name: '電子傳遞鏈', loc: '粒線體內膜', locCls: 'badge-warning', products: 'NADH/FADH₂ 交電子 → H⁺ 梯度 → 約 28 ATP；O₂ 接電子生 H₂O' },
  ]
  let i = $state(0)
  const s = $derived(STAGES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔋</span>
    <span class="font-display font-bold">細胞呼吸四階段</span>
  </div>

  <div class="mb-3 flex flex-wrap items-center gap-1">
    {#each STAGES as st, k (st.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{st.name}</button>
      {#if k < STAGES.length - 1}<span class="text-base-content/40">→</span>{/if}
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3">
    <div class="mb-1 flex items-center gap-2">
      <span class="font-bold text-primary">{s.name}</span>
      <span class={`badge badge-sm font-bold ${s.locCls}`}>{s.loc}</span>
    </div>
    <p class="text-sm text-base-content/75">{s.products}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    地點口訣：<b>糖解在細胞質</b>；<b>丙酮酸氧化、克氏循環在粒線體基質</b>；<b>電子傳遞鏈在粒線體內膜</b>。CO₂ 只在丙酮酸氧化(2)＋克氏循環(4)＝<b>6 個</b>（糖解不產 CO₂）。
  </p>
</div>
