<script lang="ts">
  // 分離純化選擇：依「要分開的東西差在哪」選對方法。
  type D = { q: string; method: string; why: string }
  const DIFFS: D[] = [
    { q: '差在沸點（液體混合物）', method: '蒸餾（distillation）', why: '加熱讓沸點低者先汽化、再冷凝收集；需要一定的量，毫克級不適合。' },
    { q: '差在兩相的溶解度', method: '萃取（extraction）', why: '用兩種不互溶溶劑，目標物溶進偏好的那一相而被分開。' },
    { q: '差在溶解度隨溫度變化', method: '再結晶（recrystallization）', why: '熱時溶解、冷時析出純晶體；雜質留在母液。' },
    { q: '差在極性／吸附力', method: '層析（TLC／管柱）', why: '極性大者被靜相吸附較強、跑得慢（Rf 小）；適合少量。' },
    { q: '樣品只有毫克級（量很少）', method: '避免蒸餾，改用層析／萃取／再結晶', why: '蒸餾會大量損失在器壁，回收率太低。' },
  ]
  let i = $state(0)
  const d = $derived(DIFFS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚗️</span>
    <span class="font-display font-bold">分離純化怎麼選</span>
  </div>

  <div class="mb-3 flex flex-col gap-1 text-sm">要分開的東西差在哪？
    {#each DIFFS as dd, k (dd.q)}
      <button type="button" class={`rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${i === k ? 'bg-primary/15 font-semibold text-primary' : 'bg-base-200/50 hover:bg-base-200'}`} onclick={() => (i = k)}>{dd.q}</button>
    {/each}
  </div>

  <div class="rounded-box bg-primary/10 p-3">
    <div class="text-xs text-base-content/55">建議方法</div>
    <div class="font-bold text-primary">{d.method}</div>
    <p class="mt-1 text-xs text-base-content/70">{d.why}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    口訣：<b>差沸點→蒸餾、差溶解度→萃取／再結晶、差極性→層析</b>；樣品<b>很少（毫克級）就別用蒸餾</b>。
  </p>
</div>
