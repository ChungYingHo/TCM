<script lang="ts">
  // 半衰期互動：拖「經過時間」，看 64 顆原子方格一個半衰期掉一半，
  // 數值同步跑出 N = N₀·(½)^(t/t½)。把「每過一個 t½ 剩一半」變成看得見的事。
  let n0 = $state(80) // 起始量 (g)
  let thalf = $state(10) // 半衰期 (天)
  let t = $state(30) // 經過時間 (天)

  // 防呆：欄位被清空會變 NaN，半衰期清成 0 會除以零 → 一律給安全值
  const safeN0 = $derived(Number.isFinite(n0) && n0 > 0 ? n0 : 0)
  const safeTh = $derived(Number.isFinite(thalf) && thalf > 0 ? thalf : 1)
  const safeT = $derived(Number.isFinite(t) && t > 0 ? t : 0)

  const maxT = $derived(Math.max(safeTh * 6, 1))
  const step = $derived(Math.max(safeTh / 4, 0.1))
  $effect(() => { if (t > maxT) t = maxT }) // t½ 調小時把 t 夾回範圍

  const n = $derived(safeT / safeTh) // 經過幾個半衰期
  const frac = $derived(Math.pow(0.5, n)) // 剩餘比例
  const remain = $derived(safeN0 * frac)
  const litCount = $derived(Math.round(64 * frac)) // 64 格代表整份樣本
  const cells = Array.from({ length: 64 }, (_, i) => i)
  const nRound = $derived(Number.isInteger(n) ? `${n}` : n.toFixed(2))
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⏳</span>
    <span class="font-display font-bold">半衰期・看樣本一半一半地少</span>
  </div>

  <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
    <!-- 方格樣本 -->
    <div class="grid shrink-0 grid-cols-8 gap-1" aria-hidden="true">
      {#each cells as i (i)}
        <div class={`h-5 w-5 rounded-sm transition-colors duration-300 ${i < litCount ? 'bg-primary' : 'bg-base-300/50'}`}></div>
      {/each}
    </div>

    <!-- 數值 -->
    <div class="flex-1">
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div class="rounded-lg bg-base-200/70 p-2.5 text-center">
          <div class="text-xs text-base-content/55">經過幾個半衰期 n</div>
          <div class="font-bold tabular-nums">{nRound}</div>
        </div>
        <div class="rounded-lg bg-base-200/70 p-2.5 text-center">
          <div class="text-xs text-base-content/55">剩餘比例 (½)<sup>n</sup></div>
          <div class="font-bold tabular-nums">{(frac * 100).toFixed(1)}%</div>
        </div>
        <div class="col-span-2 rounded-lg bg-primary/10 p-2.5 text-center">
          <div class="text-xs text-base-content/55">剩餘量 N = N₀ × (½)<sup>n</sup></div>
          <div class="text-lg font-bold tabular-nums text-primary">{remain.toFixed(2)} g</div>
        </div>
      </div>

      <label class="mt-3 flex items-center gap-2 text-sm">
        經過時間
        <b class="tabular-nums">{t.toFixed(0)}</b> 天
      </label>
      <input type="range" min="0" max={maxT} step={step} bind:value={t}
        class="range range-primary range-sm w-full" aria-label="調整經過時間" />
      <div class="mt-1 flex justify-between text-[0.65rem] text-base-content/45">
        {#each [0, 1, 2, 3, 4, 5, 6] as m (m)}
          <span>{m}t½</span>
        {/each}
      </div>

      <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
        <label class="flex items-center gap-1.5">起始量
          <input type="number" min="1" bind:value={n0} class="input input-bordered input-xs w-16" /> g
        </label>
        <label class="flex items-center gap-1.5">半衰期
          <input type="number" min="1" bind:value={thalf} class="input input-bordered input-xs w-16" /> 天
        </label>
      </div>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    解題就兩步：① 先算 <b>經過幾個半衰期</b>（n＝經過時間除以半衰期）。② 套 <b>N = N₀ × (½)<sup>n</sup></b>。
    例：80 g、半衰期 10 天、過 30 天 → n=3 → 80 → 40 → 20 → <b class="text-primary">10 g</b>。
  </p>
</div>
