<script lang="ts">
  // 法拉第電解計算：電量 Q = I·t → 電子莫耳 = Q/F → 金屬莫耳 = ÷n → 質量 = ×M。
  const F = 96500
  let I = $state(2) // 電流 A
  let t = $state(965) // 時間 s
  let n = $state(2) // 每個原子需要的電子數
  let M = $state(63.5) // 莫耳質量 g/mol（預設 Cu）

  const s = (x: number, d = 1) => (Number.isFinite(x) && x > 0 ? x : d)
  const Q = $derived(s(I) * s(t)) // 庫倫
  const molE = $derived(Q / F)
  const molMetal = $derived(molE / s(n))
  const mass = $derived(molMetal * s(M))
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚡</span>
    <span class="font-display font-bold">法拉第電解：沉積多少克</span>
  </div>

  <div class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
    <label class="flex flex-col gap-1">電流 I (A)<input type="number" min="0" step="0.5" bind:value={I} class="input input-bordered input-sm" /></label>
    <label class="flex flex-col gap-1">時間 t (s)<input type="number" min="0" step="10" bind:value={t} class="input input-bordered input-sm" /></label>
    <label class="flex flex-col gap-1">電子數 n<input type="number" min="1" step="1" bind:value={n} class="input input-bordered input-sm" /></label>
    <label class="flex flex-col gap-1">莫耳質量 M<input type="number" min="1" step="1" bind:value={M} class="input input-bordered input-sm" /></label>
  </div>

  <div class="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-box bg-base-200/60 p-3 text-xs">
    <span>電量 Q = I·t = <b class="tabular-nums">{Q.toFixed(0)}</b> C</span>
    <span>→ 電子 = Q/F = <b class="tabular-nums">{molE.toFixed(4)}</b> mol</span>
    <span>→ 金屬 = ÷n = <b class="tabular-nums">{molMetal.toFixed(4)}</b> mol</span>
  </div>
  <div class="mt-2 rounded-box bg-primary/10 p-3 text-center">
    <div class="text-xs text-base-content/55">沉積質量 = 金屬莫耳 × M</div>
    <div class="text-xl font-bold tabular-nums text-primary">{mass.toFixed(3)} g</div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    四步：① <b>電量 Q = I×t</b>（電流×秒 = 庫倫）；② <b>電子莫耳 = Q ÷ 96500</b>（F=法拉第常數）；③ <b>金屬莫耳 = 電子莫耳 ÷ n</b>（n＝每個原子需要的電子數，如 Cu²⁺ 是 2）；④ <b>質量 = 金屬莫耳 × M</b>。
  </p>
</div>
