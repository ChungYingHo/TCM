<script lang="ts">
  // 三胚層：點外／中／內胚層的同心環，看各自分化去向。
  type Layer = { key: string; name: string; en: string; organs: string; ring: string }
  const LAYERS: Layer[] = [
    { key: 'ecto', name: '外胚層', en: 'ectoderm', organs: '皮膚表皮、神經系統（腦、脊髓、感覺器官）、毛髮、指甲', ring: 'fill-info/25 stroke-info' },
    { key: 'meso', name: '中胚層', en: 'mesoderm', organs: '肌肉、骨骼、心臟與血管、腎臟、性腺、結締組織', ring: 'fill-success/25 stroke-success' },
    { key: 'endo', name: '內胚層', en: 'endoderm', organs: '消化道內壁、肝臟、胰臟、呼吸道（肺）、膀胱、甲狀腺', ring: 'fill-warning/25 stroke-warning' },
  ]
  let i = $state(0)
  const l = $derived(LAYERS[i])
  const hl = (k: number) => (i === k ? 1 : 0.3)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🫧</span>
    <span class="font-display font-bold">三胚層的分化去向</span>
  </div>

  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
    <svg viewBox="0 0 110 110" class="mx-auto h-32 w-32 shrink-0 sm:mx-0" role="img" aria-label="三胚層同心圖">
      <circle cx="55" cy="55" r="50" class={LAYERS[0].ring} stroke-width="2" style={`opacity:${hl(0)}`} />
      <circle cx="55" cy="55" r="34" class={LAYERS[1].ring} stroke-width="2" style={`opacity:${hl(1)}`} />
      <circle cx="55" cy="55" r="18" class={LAYERS[2].ring} stroke-width="2" style={`opacity:${hl(2)}`} />
      <text x="55" y="14" text-anchor="middle" class="fill-base-content/55 text-[7px]">外</text>
      <text x="55" y="30" text-anchor="middle" class="fill-base-content/55 text-[7px]">中</text>
      <text x="55" y="58" text-anchor="middle" class="fill-base-content/55 text-[7px]">內</text>
    </svg>

    <div class="flex-1">
      <div class="mb-2 flex flex-wrap gap-1">
        {#each LAYERS as la, k (la.key)}
          <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{la.name}</button>
        {/each}
      </div>
      <div class="rounded-box bg-base-200/60 p-2 text-sm">
        <div class="mb-1 flex items-center gap-2"><span class="font-bold text-primary">{l.name}</span><span class="badge badge-xs badge-ghost">{l.en}</span></div>
        <p class="text-base-content/75">{l.organs}</p>
      </div>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    口訣：<b>外 → 神經、表皮</b>；<b>中 → 肌肉、骨骼、循環、腎</b>；<b>內 → 消化、呼吸道內壁</b>。陷阱：神經系統來自<b>外</b>胚層；肝、胰、肺內壁來自<b>內</b>胚層。
  </p>
</div>
