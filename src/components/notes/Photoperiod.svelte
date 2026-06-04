<script lang="ts">
  // 光週期：選短日/長日植物、調夜長、可在夜間插入紅光打斷黑暗，看會不會開花。
  // 關鍵是「連續黑暗」長度 vs 臨界夜長；紅光把連續黑暗打成兩段。
  const CRITICAL = 9 // 臨界夜長（小時）
  let shortDay = $state(true)
  let night = $state(10)
  let redFlash = $state(false)

  const day = $derived(24 - night)
  // 紅光在夜間中段打斷 → 最長「連續黑暗」約為夜長的一半
  const longestDark = $derived(redFlash ? night / 2 : night)
  const flowers = $derived(shortDay ? longestDark >= CRITICAL : longestDark < CRITICAL)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">🌙</span>
    <span class="font-display font-bold">光週期與開花</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${shortDay ? 'btn-primary' : 'btn-outline'}`} onclick={() => (shortDay = true)}>短日植物</button>
      <button type="button" class={`btn btn-xs ${!shortDay ? 'btn-primary' : 'btn-outline'}`} onclick={() => (shortDay = false)}>長日植物</button>
    </div>
  </div>

  <label class="mb-1 flex items-center justify-between text-sm">
    <span>夜長（黑暗總時數）= <b class="text-primary tabular-nums">{night}</b> 小時</span>
    <span class="text-xs text-base-content/55">臨界夜長 {CRITICAL}h</span>
  </label>
  <input type="range" min="4" max="16" step="1" bind:value={night} class="range range-primary range-xs" />

  <!-- 24 小時時間軸 -->
  <div class="relative mt-3 flex h-6 overflow-hidden rounded-lg">
    <div class="flex items-center justify-center bg-warning/70 text-[0.6rem] font-bold text-base-content/70" style={`width:${day / 24 * 100}%`}>日 {day}h</div>
    <div class="relative flex items-center justify-center bg-neutral text-[0.6rem] font-bold text-neutral-content" style={`width:${night / 24 * 100}%`}>
      夜 {night}h
      {#if redFlash}<div class="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-error"></div>{/if}
    </div>
  </div>

  <label class="mt-3 flex cursor-pointer items-center gap-2 text-sm">
    <input type="checkbox" class="toggle toggle-sm toggle-error" bind:checked={redFlash} />
    <span>夜間插入紅光（打斷黑暗）</span>
  </label>

  <div class={`mt-3 rounded-box p-3 text-sm ${flowers ? 'bg-success/15' : 'bg-base-200/60'}`}>
    <span class="text-base-content/55">最長連續黑暗 {longestDark} 小時 → </span>
    <span class={`badge font-bold ${flowers ? 'badge-success' : 'badge-ghost'}`}>{flowers ? '開花 🌸' : '不開花'}</span>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    決定開花的是<b>連續黑暗</b>長度，不是日照長度。<b>短日植物</b>需連續黑暗 ≥ 臨界夜長才開花；<b>長日植物</b>需黑暗 &lt; 臨界夜長才開花。夜間插入<b>紅光</b>會把連續黑暗切成兩半（光敏素 Pr→Pfr）→ 短日植物因此不開花。
  </p>
</div>
