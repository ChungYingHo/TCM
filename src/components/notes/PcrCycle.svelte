<script lang="ts">
  // PCR：上半部點三步驟看溫度與作用；下半部拉循環數看 2ⁿ 倍擴增。
  type Step = { name: string; temp: string; does: string; cls: string }
  const STEPS: Step[] = [
    { name: '變性', temp: '94–96°C', does: '高溫打斷雙股間的氫鍵，DNA 分離成兩條單股。', cls: 'badge-error' },
    { name: '黏合', temp: '50–65°C', does: '降溫讓「引子」與單股模板互補配對，決定要擴增的區段。', cls: 'badge-info' },
    { name: '延長', temp: '72°C', does: '耐熱的 Taq 聚合酶從引子 3′ 端沿 5′→3′ 合成新股。', cls: 'badge-success' },
  ]
  let i = $state(0)
  const s = $derived(STEPS[i])

  let cycles = $state(4)
  const copies = $derived(Math.pow(2, cycles))
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔥</span>
    <span class="font-display font-bold">PCR：三步驟與擴增倍數</span>
  </div>

  <div class="mb-3 flex flex-wrap items-center gap-1">
    {#each STEPS as st, k (st.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{k + 1}. {st.name}</button>
      {#if k < STEPS.length - 1}<span class="text-base-content/40">→</span>{/if}
    {/each}
  </div>
  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex items-center gap-2"><span class="font-bold text-primary">{s.name}</span><span class={`badge badge-sm font-bold ${s.cls}`}>{s.temp}</span></div>
    <p class="text-base-content/75">{s.does}</p>
  </div>

  <div class="mt-4">
    <label class="mb-1 flex items-center justify-between text-sm">
      <span>循環數 n = <b class="text-primary tabular-nums">{cycles}</b></span>
      <span class="text-xs text-base-content/55">每輪加倍</span>
    </label>
    <input type="range" min="1" max="10" step="1" bind:value={cycles} class="range range-primary range-xs" />
    <div class="mt-2 rounded-box bg-primary/10 p-2 text-center text-sm">
      1 個模板 → 2<sup>{cycles}</sup> = <span class="text-lg font-bold tabular-nums text-primary">{copies.toLocaleString('en-US')}</span> 份
    </div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    三步驟循環一次就讓目標片段加倍，所以 n 輪後約 <b>2ⁿ 倍</b>。關鍵在 <b>Taq 聚合酶耐熱</b>，每輪 94°C 變性後仍保有活性，不必每輪補酵素。
  </p>
</div>
