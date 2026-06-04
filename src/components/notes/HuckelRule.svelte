<script lang="ts">
  // 休克爾規則：輸入 π 電子數，判斷芳香（4n+2）、反芳香（4n）或都不是。
  // 前提：環狀、平面、完全共軛；π 電子數＝4n+2 才芳香。
  let pi = $state(6)
  const sPi = $derived(Number.isFinite(pi) && pi > 0 ? Math.round(pi) : 0)
  const result = $derived.by(() => {
    if (sPi % 2 === 1) return { t: '都不是（π 電子數需為偶數）', cls: 'badge-ghost', n: '' }
    if (sPi % 4 === 2) return { t: `芳香性（4n+2，n=${(sPi - 2) / 4}）`, cls: 'badge-success', n: '' }
    return { t: `反芳香性（4n，n=${sPi / 4}）— 特別不穩定`, cls: 'badge-error', n: '' }
  })
  const EX: Record<number, string> = { 2: 'C₃H₃⁺（環丙烯陽離子）', 4: '環丁二烯（反芳香）', 6: '苯、吡啶、吡咯', 8: '環辛四烯（會扭成非平面避開）', 10: '萘', 14: '蒽' }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⬡</span>
    <span class="font-display font-bold">休克爾規則：4n+2 芳香性</span>
  </div>

  <label class="mb-3 block text-sm">π 電子數 = <b class="tabular-nums">{sPi}</b>
    <input type="range" min="2" max="14" step="1" bind:value={pi} class="range range-primary range-sm w-full" aria-label="π 電子數" />
  </label>

  <div class="rounded-box bg-base-200/60 p-3 text-center">
    <span class={`badge font-bold ${result.cls}`}>{result.t}</span>
    {#if EX[sPi]}<div class="mt-1.5 text-xs text-base-content/60">例：{EX[sPi]}</div>{/if}
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    芳香性三條件：<b>環狀、平面、完全共軛</b>，且 <b>π 電子數 = 4n+2</b>（2、6、10、14…）。π 電子數 = 4n（4、8、12…）則為<b>反芳香性</b>（比一般烯烴更不穩定）。注意吡咯、呋喃的 N／O 孤對電子<b>進入環</b>湊成 6；吡啶的 N 孤對<b>不進環</b>（但環本身已有 6 個）。
  </p>
</div>
