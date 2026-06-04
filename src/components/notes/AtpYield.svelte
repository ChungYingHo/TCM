<script lang="ts">
  // 每葡萄糖 ATP 總帳：切換「現代估算」(NADH 2.5、FADH₂ 1.5) 與「舊版」(NADH 3、FADH₂ 2)。
  // 直接 ATP：糖解 2 + 克氏 2 = 4；其餘來自 ETC（10 NADH + 2 FADH₂）。
  let modern = $state(true)
  const nadhAtp = $derived(modern ? 2.5 : 3)
  const fadhAtp = $derived(modern ? 1.5 : 2)
  const directAtp = 4 // 糖解 2 + 克氏 2
  const nadh = 10, fadh = 2
  const etc = $derived(nadh * nadhAtp + fadh * fadhAtp)
  const total = $derived(directAtp + etc)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">🧮</span>
    <span class="font-display font-bold">每葡萄糖 ATP 總帳</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${modern ? 'btn-primary' : 'btn-outline'}`} onclick={() => (modern = true)}>現代估算</button>
      <button type="button" class={`btn btn-xs ${!modern ? 'btn-primary' : 'btn-outline'}`} onclick={() => (modern = false)}>舊版</button>
    </div>
  </div>

  <div class="grid grid-cols-3 gap-2 text-center text-sm">
    <div class="rounded-lg bg-base-200/60 p-2"><div class="text-xs text-base-content/55">直接 ATP</div><div class="font-bold tabular-nums">{directAtp}</div><div class="text-[0.6rem] text-base-content/45">糖解+克氏</div></div>
    <div class="rounded-lg bg-base-200/60 p-2"><div class="text-xs text-base-content/55">10 NADH ×{nadhAtp}</div><div class="font-bold tabular-nums">{nadh * nadhAtp}</div></div>
    <div class="rounded-lg bg-base-200/60 p-2"><div class="text-xs text-base-content/55">2 FADH₂ ×{fadhAtp}</div><div class="font-bold tabular-nums">{fadh * fadhAtp}</div></div>
  </div>
  <div class="mt-2 rounded-box bg-primary/10 p-3 text-center">
    <div class="text-xs text-base-content/55">合計 ATP / 葡萄糖</div>
    <div class="text-xl font-bold tabular-nums text-primary">≈ {total}</div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    大部分 ATP 來自<b>電子傳遞鏈</b>：每個 NADH 約 {nadhAtp} ATP、每個 FADH₂ 約 {fadhAtp} ATP。現代估算每葡萄糖 <b>約 30–32 ATP</b>；舊版課本算 <b>36–38</b>。考題問「最多」答 38、問「大約」答 30–32。
  </p>
</div>
