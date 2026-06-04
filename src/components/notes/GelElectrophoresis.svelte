<script lang="ts">
  // 凝膠電泳：DNA 帶負電往正極跑，小片段跑得遠。拉滑桿改變樣品片段大小，看它落在哪。
  const LADDER = [2000, 1000, 500, 250, 100] // bp 標準參考
  const MIN = 50, MAX = 3000
  let size = $state(800)
  // 遷移距離：以 log 大小換算，小片段跑遠（y 大）。well 在 y=18，最遠 y=148。
  const yOf = (bp: number) => {
    const d = (Math.log(MAX) - Math.log(bp)) / (Math.log(MAX) - Math.log(MIN))
    return 18 + Math.max(0, Math.min(1, d)) * 130
  }
  const sampleY = $derived(yOf(size))
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🟦</span>
    <span class="font-display font-bold">凝膠電泳：大小決定跑多遠</span>
  </div>

  <div class="flex items-stretch gap-4">
    <svg viewBox="0 0 200 175" class="h-52 w-full max-w-xs">
      <!-- 凝膠底 -->
      <rect x="8" y="10" width="184" height="150" rx="4" class="fill-base-200/70" />
      <!-- 電極標示 -->
      <text x="14" y="22" class="fill-base-content/45 text-[8px]">– 負極（上樣孔）</text>
      <text x="14" y="170" class="fill-base-content/45 text-[8px]">＋ 正極（DNA 往這跑）</text>
      <!-- 上樣孔 -->
      <rect x="40" y="12" width="40" height="6" rx="1" class="fill-base-content/30" />
      <rect x="120" y="12" width="40" height="6" rx="1" class="fill-base-content/30" />
      <text x="60" y="9" text-anchor="middle" class="fill-base-content/50 text-[7px]">標準</text>
      <text x="140" y="9" text-anchor="middle" class="fill-primary text-[7px] font-bold">樣品</text>
      <!-- ladder bands -->
      {#each LADDER as bp (bp)}
        <rect x="40" y={yOf(bp)} width="40" height="4" rx="1" class="fill-base-content/45" />
        <text x="34" y={yOf(bp) + 4} text-anchor="end" class="fill-base-content/45 text-[7px]">{bp}</text>
      {/each}
      <!-- sample band -->
      <rect x="120" y={sampleY} width="40" height="5" rx="1" class="fill-primary" />
    </svg>

    <div class="flex flex-col justify-center">
      <div class="text-xs text-base-content/55">樣品片段大小</div>
      <div class="text-2xl font-bold tabular-nums text-primary">{size}<span class="text-sm font-normal"> bp</span></div>
    </div>
  </div>

  <input type="range" min={MIN} max={MAX} step="10" bind:value={size} class="range range-primary range-xs mt-2" />

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    DNA 的磷酸骨架帶<b>負電</b>，通電後往<b>正極</b>移動。凝膠像篩網：<b>片段越小、阻力越小、跑得越遠</b>。所以「跑最遠的條帶＝分子量最小」。和左側標準條帶（ladder）對照就能估出樣品大小。
  </p>
</div>
