<script lang="ts">
  // 血糖恆定：飯後血糖高 → 胰島素（β細胞）降；空腹血糖低 → 升糖素（α細胞）升。互為拮抗。
  let fed = $state(true)
  const data = $derived(
    fed
      ? { cell: 'β 細胞', hormone: '胰島素（Insulin）', act: '促葡萄糖進入細胞、肝臟合成肝醣', effect: '血糖 ↓', cls: 'badge-info', level: 80 }
      : { cell: 'α 細胞', hormone: '升糖素（Glucagon）', act: '分解肝醣、進行糖質新生', effect: '血糖 ↑', cls: 'badge-warning', level: 22 }
  )
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">🍞</span>
    <span class="font-display font-bold">血糖恆定：胰島素 vs 升糖素</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${fed ? 'btn-primary' : 'btn-outline'}`} onclick={() => (fed = true)}>飯後（血糖高）</button>
      <button type="button" class={`btn btn-xs ${!fed ? 'btn-primary' : 'btn-outline'}`} onclick={() => (fed = false)}>空腹（血糖低）</button>
    </div>
  </div>

  <!-- 血糖儀表 -->
  <div class="relative mb-3 h-5 overflow-hidden rounded-full bg-gradient-to-r from-warning/30 via-success/30 to-info/30">
    <div class="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-base-content/30"></div>
    <div class="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-base-100 bg-primary shadow" style={`left:calc(${data.level}% - 8px); transition:left .4s`}></div>
  </div>
  <div class="mb-3 flex justify-between text-[0.65rem] text-base-content/55"><span>低血糖</span><span>正常</span><span>高血糖</span></div>

  <div class="grid gap-2 text-sm sm:grid-cols-2">
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">分泌細胞與激素</div><div class="font-bold">{data.cell} → {data.hormone}</div></div>
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">作用</div><div class="font-bold">{data.act}</div></div>
  </div>
  <div class="mt-2 text-center"><span class={`badge font-bold ${data.cls}`}>{data.effect}（拉回正常）</span></div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    兩者<b>互為拮抗</b>、共同把血糖維持在正常範圍。記憶：<b>β→胰島素→降血糖（飯後）</b>；<b>α→升糖素→升血糖（空腹）</b>。
  </p>
</div>
