<script lang="ts">
  // ¹H NMR 裂分 n+1 規則：鄰碳上有 n 個氫 → 該訊號裂分成 n+1 條峰。
  let n = $state(3)
  const sN = $derived(Number.isFinite(n) && n >= 0 ? Math.round(n) : 0)
  const peaks = $derived(sN + 1)
  const NAME: Record<number, string> = { 1: 'singlet（單峰）', 2: 'doublet（雙峰）', 3: 'triplet（三峰）', 4: 'quartet（四峰）', 5: 'quintet（五峰）' }
  // 巴斯卡三角形相對高度（強度比）
  const heights = $derived.by(() => {
    const row = [1]
    for (let k = 1; k <= sN; k++) row.push((row[k - 1] * (sN - k + 1)) / k)
    return row
  })
  const maxH = $derived(Math.max(...heights, 1))
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📊</span>
    <span class="font-display font-bold">¹H NMR 裂分（n+1 規則）</span>
  </div>

  <label class="mb-3 block text-sm">鄰碳上的氫數 n = <b class="tabular-nums">{sN}</b>
    <input type="range" min="0" max="4" step="1" bind:value={n} class="range range-primary range-sm w-full" aria-label="鄰碳氫數" />
  </label>

  <!-- 峰型示意 -->
  <div class="flex h-20 items-end justify-center gap-2">
    {#each heights as h, k (k)}
      <div class="w-4 rounded-t bg-primary" style={`height:${(h / maxH) * 100}%`}></div>
    {/each}
  </div>

  <div class="mt-2 text-center">
    <span class="badge badge-primary font-bold">{NAME[peaks] ?? `${peaks} 條峰`}</span>
    <span class="ml-1 text-sm text-base-content/70">＝ n+1 = {sN}+1 = <b>{peaks}</b> 條峰</span>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    一個訊號被<b>鄰碳上的 n 個氫</b>裂分成 <b>n+1 條峰</b>（強度比依巴斯卡三角形）。例：乙醇的 CH₃ 鄰著 CH₂（n=2）→ 三峰；CH₂ 鄰著 CH₃（n=3）→ 四峰。（–OH 的氫常因快速交換而不參與裂分。）
  </p>
</div>
