<script lang="ts">
  // 能量金字塔：每升一個營養層級只剩約 10%。拉生產者能量，看各層剩多少。
  let producer = $state(10000) // 生產者能量（大卡）
  const LEVELS = [
    { name: '生產者（植物）', factor: 1, w: 100 },
    { name: '初級消費者（草食）', factor: 0.1, w: 72 },
    { name: '次級消費者（肉食）', factor: 0.01, w: 46 },
    { name: '三級消費者', factor: 0.001, w: 24 },
  ]
  const fmt = (x: number) => (x >= 1 ? x.toLocaleString('en-US') : x.toString())
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔺</span>
    <span class="font-display font-bold">能量金字塔：百分之十定律</span>
  </div>

  <label class="mb-1 flex items-center justify-between text-sm">
    <span>生產者能量 = <b class="text-primary tabular-nums">{producer.toLocaleString('en-US')}</b> 大卡</span>
  </label>
  <input type="range" min="1000" max="100000" step="1000" bind:value={producer} class="range range-primary range-xs" />

  <div class="mt-3 flex flex-col items-center gap-1">
    {#each LEVELS as lv (lv.name)}
      <div class="flex h-10 items-center justify-center rounded bg-primary/70 px-2 text-center text-[0.7rem] font-bold text-primary-content" style={`width:${lv.w}%`}>
        {lv.name}：{fmt(Math.round(producer * lv.factor * 100) / 100)} 大卡
      </div>
    {/each}
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    能量沿食物鏈<b>單向流動</b>，每升一級只傳遞約 <b>10%</b>（其餘約 90% 以熱散失或自身呼吸消耗）。所以食物鏈通常不超過 <b>4–5 級</b>，頂端掠食者能得到的能量極少。
  </p>
</div>
