<script lang="ts">
  // 肌節：切換收縮／舒張，看 Z 線靠近、I 帶與 H 區縮短，A 帶（粗肌絲長度）不變。
  let contracted = $state(false)
  // Z 線位置（收縮時靠近）
  const zL = $derived(contracted ? 42 : 14)
  const zR = $derived(contracted ? 158 : 186)
  // A 帶（粗肌絲）固定置中，長度不變
  const aL = 66, aR = 134
  // 細肌絲自 Z 線往內延伸的終點（收縮時更深入、H 區縮小）
  const thinR = $derived(contracted ? 108 : 96) // 左側細肌絲右端
  const thinL = $derived(contracted ? 92 : 104) // 右側細肌絲左端
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">💪</span>
    <span class="font-display font-bold">肌節：收縮時哪裡變短</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${!contracted ? 'btn-primary' : 'btn-outline'}`} onclick={() => (contracted = false)}>舒張</button>
      <button type="button" class={`btn btn-xs ${contracted ? 'btn-primary' : 'btn-outline'}`} onclick={() => (contracted = true)}>收縮</button>
    </div>
  </div>

  <svg viewBox="0 0 200 96" class="w-full" role="img" aria-label="肌節示意圖">
    <!-- A 帶底色（粗肌絲範圍，固定） -->
    <rect x={aL} y="20" width={aR - aL} height="40" class="fill-secondary/15" style="transition:all .4s" />
    <!-- 粗肌絲（肌凝蛋白，含頭部小齒） -->
    <line x1={aL} y1="40" x2={aR} y2="40" class="stroke-secondary" stroke-width="3" />
    <!-- 細肌絲（肌動蛋白）自左右 Z 線往內 -->
    <line x1={zL} y1="33" x2={thinR} y2="33" class="stroke-primary" stroke-width="2.5" style="transition:all .4s" />
    <line x1={zL} y1="47" x2={thinR} y2="47" class="stroke-primary" stroke-width="2.5" style="transition:all .4s" />
    <line x1={zR} y1="33" x2={thinL} y2="33" class="stroke-primary" stroke-width="2.5" style="transition:all .4s" />
    <line x1={zR} y1="47" x2={thinL} y2="47" class="stroke-primary" stroke-width="2.5" style="transition:all .4s" />
    <!-- Z 線 -->
    <line x1={zL} y1="16" x2={zL} y2="64" class="stroke-base-content" stroke-width="2.5" style="transition:all .4s" />
    <line x1={zR} y1="16" x2={zR} y2="64" class="stroke-base-content" stroke-width="2.5" style="transition:all .4s" />
    <text x={zL} y="12" text-anchor="middle" class="fill-base-content/60 text-[7px] font-bold">Z</text>
    <text x={zR} y="12" text-anchor="middle" class="fill-base-content/60 text-[7px] font-bold">Z</text>
    <!-- 標示 -->
    <text x="100" y="78" text-anchor="middle" class="fill-secondary text-[7px] font-bold">A 帶（不變）</text>
    <text x={(zL + aL) / 2} y="90" text-anchor="middle" class="fill-primary text-[7px]">I 帶</text>
  </svg>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    收縮時細肌絲（藍）滑入粗肌絲（紫）之間，<b>兩端 Z 線互相靠近</b>。<b>I 帶（只有細肌絲）縮短、H 區（A 帶中央只有粗肌絲）縮短</b>，但 <b>A 帶＝粗肌絲長度恆定不變</b>。肌絲本身都沒變短，是「滑動」造成肌節縮短。
  </p>
</div>
