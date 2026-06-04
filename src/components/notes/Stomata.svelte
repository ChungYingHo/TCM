<script lang="ts">
  // 氣孔開關：保衛細胞吸水膨脹（膨壓上升）→ 氣孔開；失水 → 氣孔關。
  let turgid = $state(true)
  // 兩個腎形保衛細胞之間的孔。膨脹時向外弓、孔張開；失水時變直、孔閉合。
  const gap = $derived(turgid ? 12 : 1.5) // 孔半寬
  const bow = $derived(turgid ? 18 : 4) // 細胞向外彎曲程度
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">🍃</span>
    <span class="font-display font-bold">氣孔：保衛細胞的開與關</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${turgid ? 'btn-primary' : 'btn-outline'}`} onclick={() => (turgid = true)}>吸水（膨壓↑）</button>
      <button type="button" class={`btn btn-xs ${!turgid ? 'btn-primary' : 'btn-outline'}`} onclick={() => (turgid = false)}>失水</button>
    </div>
  </div>

  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
    <svg viewBox="0 0 120 120" class="mx-auto h-32 w-32 shrink-0 sm:mx-0" role="img" aria-label="氣孔開關示意">
      <!-- 中央孔（深色背景） -->
      <ellipse cx="60" cy="60" rx={gap} ry="34" class="fill-base-content/70" style="transition:all .35s" />
      <!-- 左保衛細胞：向左弓 -->
      <path
        d={`M 60 24 C ${60 - bow} 40, ${60 - bow} 80, 60 96 C ${52} 80, ${52} 40, 60 24 Z`}
        class="fill-success/70 stroke-success"
        stroke-width="2"
        style="transition:all .35s"
      />
      <!-- 右保衛細胞：向右弓 -->
      <path
        d={`M 60 24 C ${60 + bow} 40, ${60 + bow} 80, 60 96 C ${68} 80, ${68} 40, 60 24 Z`}
        class="fill-success/70 stroke-success"
        stroke-width="2"
        style="transition:all .35s"
      />
    </svg>

    <div>
      <span class={`badge font-bold ${turgid ? 'badge-success' : 'badge-warning'}`}>{turgid ? '氣孔張開' : '氣孔關閉'}</span>
      <div class="mt-2 text-xs text-base-content/70">
        {turgid ? '保衛細胞吸水、膨壓上升，內側厚壁外側薄壁使細胞向外弓 → 中間孔張開，可進行氣體交換。' : '保衛細胞失水、變軟癱平 → 孔閉合，減少水分散失。'}
      </div>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    氣孔由兩個腎形<b>保衛細胞</b>圍成。<b>吸水膨脹→開</b>、<b>失水→關</b>。乾旱時植物分泌<b>離層酸（ABA）</b>，促 K⁺ 流出保衛細胞、使其失水關閉氣孔，減少蒸散。
  </p>
</div>
