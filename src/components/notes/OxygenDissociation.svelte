<script lang="ts">
  // 氧解離曲線與波耳效應：切換「肺部」與「運動中組織」，看曲線左右移與 O₂ 結合/釋放。
  let tissue = $state(true) // true = 運動中組織（右移、釋放 O₂）

  // pO₂(x:0-100) → svg x(20-180)；飽和度(0-100%) → svg y(135-15)
  const SX = (po2: number) => 20 + po2 / 100 * 160
  const SY = (sat: number) => 135 - sat / 100 * 120
  // 正常曲線
  const NORMAL = [[0, 0], [10, 12], [20, 32], [30, 57], [40, 75], [50, 84], [60, 90], [80, 96], [100, 98]]
  // 右移（親和力↓，同 pO₂ 飽和度較低）
  const RIGHT = [[0, 0], [10, 6], [20, 18], [30, 38], [40, 58], [50, 70], [60, 80], [80, 91], [100, 96]]
  const toPts = (arr: number[][]) => arr.map(([x, y]) => `${SX(x)},${SY(y)}`).join(' ')
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">🩸</span>
    <span class="font-display font-bold">氧解離曲線與波耳效應</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${tissue ? 'btn-primary' : 'btn-outline'}`} onclick={() => (tissue = true)}>運動中組織</button>
      <button type="button" class={`btn btn-xs ${!tissue ? 'btn-primary' : 'btn-outline'}`} onclick={() => (tissue = false)}>肺部</button>
    </div>
  </div>

  <svg viewBox="0 0 200 155" class="w-full" role="img" aria-label="氧解離曲線">
    <!-- 軸 -->
    <line x1="20" y1="135" x2="185" y2="135" class="stroke-base-content/30" stroke-width="1" />
    <line x1="20" y1="15" x2="20" y2="135" class="stroke-base-content/30" stroke-width="1" />
    <text x="100" y="151" text-anchor="middle" class="fill-base-content/50 text-[7px]">氧分壓 pO₂ →</text>
    <text x="10" y="20" class="fill-base-content/50 text-[7px]">飽和%</text>
    <!-- 正常曲線（參考，淡） -->
    <polyline points={toPts(NORMAL)} fill="none" class="stroke-base-content/30" stroke-width="1.5" stroke-dasharray="3 2" />
    <!-- 作用中曲線 -->
    <polyline points={toPts(tissue ? RIGHT : NORMAL)} fill="none" class={tissue ? 'stroke-error' : 'stroke-info'} stroke-width="2.5" />
    <text x="150" y={tissue ? 60 : 40} class={`text-[7px] font-bold ${tissue ? 'fill-error' : 'fill-info'}`}>{tissue ? '右移' : '正常/左移'}</text>
  </svg>

  <div class="mt-2 rounded-box bg-base-200/60 p-3 text-sm">
    {#if tissue}
      <b class="text-error">運動中組織</b>：CO₂↑、pH↓、溫度↑ → 曲線<b>右移</b>，Hb 對 O₂ 親和力下降 → <b>釋放更多 O₂</b> 給需要的肌肉。
    {:else}
      <b class="text-info">肺部</b>：CO₂ 低、pH 高、溫度低 → 曲線偏左 → Hb 對 O₂ 親和力高 → <b>充分結合 O₂</b>。
    {/if}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>波耳效應</b>：CO₂↑、pH↓（酸）、溫度↑ 都讓曲線<b>右移</b>（放氧）；反之左移（抓氧）。這讓血紅素「在缺氧又代謝旺盛的組織多放氧、在肺多抓氧」。
  </p>
</div>
