<script lang="ts">
  // 木質部 vs 韌皮部：點一邊，看運輸物質、方向、細胞死活與動力。
  let xylem = $state(true)
  const data = $derived(
    xylem
      ? { what: '水分與礦物質', dir: '由根往上（單向）', cell: '導管、管胞（死細胞，木質化）', force: '蒸散拉力（被動，不耗 ATP）' }
      : { what: '有機物（蔗糖等）', dir: '可雙向（源 → 積）', cell: '篩管細胞＋伴細胞（活細胞）', force: '壓力流：主動裝載糖造成滲透壓差（耗 ATP）' }
  )
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">🌿</span>
    <span class="font-display font-bold">木質部 vs 韌皮部</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${xylem ? 'btn-primary' : 'btn-outline'}`} onclick={() => (xylem = true)}>木質部</button>
      <button type="button" class={`btn btn-xs ${!xylem ? 'btn-primary' : 'btn-outline'}`} onclick={() => (xylem = false)}>韌皮部</button>
    </div>
  </div>

  <div class="grid gap-2 text-sm sm:grid-cols-2">
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">運輸物質</div><div class="font-bold">{data.what}</div></div>
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">方向</div><div class="font-bold">{data.dir}</div></div>
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">主要細胞</div><div class="font-bold">{data.cell}</div></div>
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">動力來源</div><div class="font-bold">{data.force}</div></div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    口訣：<b>木質部運「水往上」、韌皮部運「糖上下」</b>。木質部是<b>死細胞</b>、靠蒸散拉力被動向上；韌皮部是<b>活細胞</b>、靠主動裝載糖驅動、可雙向。
  </p>
</div>
