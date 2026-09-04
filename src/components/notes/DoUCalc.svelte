<script lang="ts">
  // 不飽和度 DoU 計算：DoU = (2C + 2 + N − H − X) / 2。O 不列入。
  // DoU = 環數 + π 鍵數（雙鍵 1、三鍵 2、環 1）；DoU=4 常暗示苯環。
  let C = $state(6)
  let H = $state(6)
  let N = $state(0)
  let X = $state(0)
  const v = (x: number) => (Number.isFinite(x) && x >= 0 ? x : 0)
  const dou = $derived((2 * v(C) + 2 + v(N) - v(H) - v(X)) / 2)
  const valid = $derived(Number.isInteger(dou) && dou >= 0)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">💍</span>
    <span class="font-display font-bold">不飽和度 DoU 計算</span>
  </div>

  <div class="grid grid-cols-4 gap-2 text-sm">
    <label class="flex flex-col gap-1">C<input type="number" min="0" bind:value={C} class="input input-bordered input-sm" /></label>
    <label class="flex flex-col gap-1">H<input type="number" min="0" bind:value={H} class="input input-bordered input-sm" /></label>
    <label class="flex flex-col gap-1">N<input type="number" min="0" bind:value={N} class="input input-bordered input-sm" /></label>
    <label class="flex flex-col gap-1">X(鹵)<input type="number" min="0" bind:value={X} class="input input-bordered input-sm" /></label>
  </div>

  <div class="mt-3 rounded-box bg-primary/10 p-3 text-center">
    <!-- 分數用堆疊的橫線畫，不用 ÷ 或當除號的 /（筆記規範：分數一律完整橫線）。 -->
    <div class="flex items-center justify-center gap-1.5 text-xs text-base-content/55">
      <span>DoU =</span>
      <span class="inline-flex flex-col items-center leading-tight">
        <span class="border-b border-current px-1 pb-0.5">2C + 2 + N − H − X</span>
        <span class="pt-0.5">2</span>
      </span>
      <span>（O 不算）</span>
    </div>
    {#if valid}
      <div class="text-xl font-bold tabular-nums text-primary">DoU = {dou}</div>
      <div class="mt-1 text-xs text-base-content/60">{dou === 0 ? '完全飽和（無環、無雙/三鍵）' : `共 ${dou} 個「環 + π 鍵」${dou >= 4 ? '（≥4 常暗示苯環）' : ''}`}</div>
    {:else}
      <div class="text-sm font-bold text-error">這組原子數不合理（DoU 應為非負整數）</div>
    {/if}
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    不飽和度＝分子裡<b>環的數目 + π 鍵的數目</b>（每個雙鍵算 1、三鍵算 2、每個環算 1）。注意 <b>O 不影響、不列入公式</b>。DoU = 4 常代表有一個苯環（3 個雙鍵 + 1 個環）。
  </p>
</div>
