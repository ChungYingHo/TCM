<script lang="ts">
  // 立體異構物數目：n 個掌性中心 → 最多 2ⁿ 種；有內消旋(對稱)時實際更少。
  let n = $state(3)
  const sN = $derived(Number.isFinite(n) && n >= 0 ? Math.round(n) : 0)
  const max = $derived(Math.pow(2, sN))
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔢</span>
    <span class="font-display font-bold">立體異構物最多幾種</span>
  </div>

  <label class="mb-3 block text-sm">掌性中心數 n = <b class="tabular-nums">{sN}</b>
    <input type="range" min="0" max="5" step="1" bind:value={n} class="range range-primary range-sm w-full" aria-label="掌性中心數" />
  </label>

  <div class="rounded-box bg-primary/10 p-3 text-center">
    <div class="text-xs text-base-content/55">最多立體異構物數 = 2ⁿ</div>
    <div class="text-xl font-bold tabular-nums text-primary">2<sup>{sN}</sup> = {max} 種</div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    每個掌性中心有 R、S 兩種選擇，所以 n 個中心<b>最多 2ⁿ 種</b>立體異構物。但若分子有<b>對稱面</b>（出現內消旋體），有些組合會重複，實際數目會<b>少於 2ⁿ</b>（例如酒石酸 2 個中心，理論 4 種，但 (R,S) 與 (S,R) 是同一個內消旋體 → 實際只有 3 種）。
  </p>
</div>
