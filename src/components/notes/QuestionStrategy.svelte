<script lang="ts">
  // 綜合題型拆解器：點一種題型，看最快的破題方法。
  type Q = { type: string; how: string }
  const TYPES: Q[] = [
    { type: '敘述判斷題', how: '把每個選項當獨立是非題，逐項驗證；找到一個反例就刪。先刪掉用「一定、絕不、100%」這類過度誇大字眼的選項。' },
    { type: '實驗／數據題', how: '先找出自變項、應變項與對照組；對照組是用來排除其他變因。再看數據趨勢推結論——只能講數據真的支持的範圍。' },
    { type: '圖表推論題', how: '只能講圖「真的顯示」的關係。圖顯示「相關」不等於能推出「因果」；別把「危險因子」過度推成「沒有就一定不會」。' },
    { type: '時事／諾貝爾獎題', how: '剝掉新聞包裝，抓背後的核心生物學原理。藥物題特別注意「作用對象」與「作用機制」有沒有被張冠李戴。' },
    { type: '跨章回憶題', how: '給一個構造，問同源（同胚層）或同類者：先判斷它屬哪個胚層／組織，再回想同類成員。例：神經元＝外胚層 → 角膜、表皮也是外胚層。' },
    { type: '配對題', how: '先確定你最有把握的一兩組，再用刪去法收斂其餘。看到陌生英文名別慌，很多是熟悉概念換名（如 apoptosis＝細胞凋亡）。' },
  ]
  let i = $state(0)
  const q = $derived(TYPES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧩</span>
    <span class="font-display font-bold">綜合題型怎麼拆</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each TYPES as t, k (t.type)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{t.type}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{q.type}</div>
    <p class="text-base-content/75">{q.how}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    綜合題沒有單一所屬章節，重點不是學新觀念，而是<b>先辨認它在考哪個主題</b>（細胞？遺傳？生理？生態？），再回那一章用對應方法。把大題<b>拆成你會的小題</b>。
  </p>
</div>
