<script lang="ts">
  // 初次 vs 二次免疫反應：抗體濃度隨時間變化。二次反應因記憶細胞而更快、更強——疫苗原理。
  let phase = $state<'primary' | 'secondary'>('secondary')
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">📈</span>
    <span class="font-display font-bold">初次 vs 二次免疫反應</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${phase === 'primary' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (phase = 'primary')}>初次反應</button>
      <button type="button" class={`btn btn-xs ${phase === 'secondary' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (phase = 'secondary')}>二次反應</button>
    </div>
  </div>

  <svg viewBox="0 0 230 150" class="w-full" role="img" aria-label="免疫反應抗體濃度曲線">
    <!-- 軸 -->
    <line x1="22" y1="130" x2="222" y2="130" class="stroke-base-content/30" stroke-width="1" />
    <line x1="22" y1="12" x2="22" y2="130" class="stroke-base-content/30" stroke-width="1" />
    <text x="120" y="146" text-anchor="middle" class="fill-base-content/50 text-[7px]">時間 →</text>
    <text x="6" y="18" class="fill-base-content/50 text-[7px]">抗體</text>
    <!-- 第一次注射 -->
    <line x1="40" y1="20" x2="40" y2="130" class="stroke-base-content/20" stroke-width="1" stroke-dasharray="2 2" />
    <text x="40" y="16" text-anchor="middle" class="fill-base-content/45 text-[6px]">第一次</text>
    <!-- 第二次注射 -->
    <line x1="135" y1="20" x2="135" y2="130" class="stroke-base-content/20" stroke-width="1" stroke-dasharray="2 2" />
    <text x="135" y="16" text-anchor="middle" class="fill-base-content/45 text-[6px]">第二次</text>
    <!-- 初次反應曲線（小而慢） -->
    <polyline
      points="40,130 55,126 68,104 82,96 100,108 120,124 135,126"
      fill="none"
      class={phase === 'primary' ? 'stroke-primary' : 'stroke-base-content/30'}
      stroke-width={phase === 'primary' ? 2.6 : 1.6}
    />
    <!-- 二次反應曲線（大而快） -->
    <polyline
      points="135,126 144,120 152,50 162,24 178,32 200,56 222,78"
      fill="none"
      class={phase === 'secondary' ? 'stroke-error' : 'stroke-base-content/30'}
      stroke-width={phase === 'secondary' ? 2.6 : 1.6}
    />
  </svg>

  <div class="mt-2 rounded-box bg-base-200/60 p-3 text-sm">
    {#if phase === 'primary'}
      <b class="text-primary">初次反應</b>：第一次接觸抗原，需 5–10 天活化淋巴細胞，抗體濃度<b>低、上升慢、持續短</b>，並產生<b>記憶細胞</b>留存。
    {:else}
      <b class="text-error">二次反應</b>：再次接觸同一抗原，記憶細胞快速大量增殖 → 抗體<b>1–3 天內快速上升、濃度更高、持續更久</b>。這正是<b>疫苗</b>的原理。
    {/if}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    疫苗用減毒／死病原或抗原片段引發<b>初次反應</b>、留下記憶細胞；真正感染時就能觸發又快又強的<b>二次反應</b>。
  </p>
</div>
