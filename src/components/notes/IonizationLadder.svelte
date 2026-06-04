<script lang="ts">
  // 連續游離能「暴增」偵測器：選元素，看 IE₁→IE₂→… 的長條。
  // 找「比值跳最大」的那一階＝剛把價電子拔光、下一個要動核心電子 → 暴增前的數量＝價電子數＝族。
  // 數值為標準連續游離能（kJ/mol，四捨五入）。
  type Elem = { sym: string; z: number; ie: number[] }
  const ELEMS: Elem[] = [
    { sym: 'Na', z: 11, ie: [496, 4562, 6910, 9543] },
    { sym: 'Mg', z: 12, ie: [738, 1451, 7733, 10540] },
    { sym: 'Al', z: 13, ie: [578, 1817, 2745, 11577] },
    { sym: 'Si', z: 14, ie: [786, 1577, 3232, 4356, 16091] },
  ]
  const GROUP: Record<number, string> = { 1: '第 1 族（IA）', 2: '第 2 族（IIA）', 3: '第 13 族（IIIA）', 4: '第 14 族（IVA）' }

  let pick = $state(0) // 索引到 ELEMS

  const el = $derived(ELEMS[pick])
  // 找相鄰兩階「比值」最大的位置 → 暴增。前面的數量＝價電子數。
  const jumpAt = $derived.by(() => {
    let best = 0
    let bestRatio = 0
    for (let i = 0; i < el.ie.length - 1; i++) {
      const r = el.ie[i + 1] / el.ie[i]
      if (r > bestRatio) { bestRatio = r; best = i }
    }
    return { index: best, ratio: bestRatio } // 暴增發生在 ie[index] → ie[index+1]
  })
  const valence = $derived(jumpAt.index + 1) // 暴增前共幾個 = 價電子數
  const maxIE = $derived(Math.max(...el.ie))
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚡</span>
    <span class="font-display font-bold">連續游離能・找價電子數</span>
  </div>

  <div class="join mb-3">
    {#each ELEMS as e, i (e.sym)}
      <button type="button" class={`btn join-item btn-sm ${pick === i ? 'btn-primary' : 'btn-outline'}`} onclick={() => (pick = i)}>{e.sym}</button>
    {/each}
  </div>

  <!-- 長條圖：價電子（主色）vs 核心電子（灰），暴增那階加閃電 -->
  <div class="flex h-44 items-end gap-1.5 sm:gap-2">
    {#each el.ie as v, i (i)}
      {@const core = i > jumpAt.index}
      <div class="flex flex-1 flex-col items-center justify-end gap-1">
        <span class="text-[0.6rem] tabular-nums text-base-content/55">{v}</span>
        {#if i === jumpAt.index + 1}
          <span class="text-xs font-bold text-accent">⚡×{jumpAt.ratio.toFixed(1)}</span>
        {/if}
        <div class={`w-full rounded-t transition-all duration-300 ${core ? 'bg-base-content/25' : 'bg-primary'}`}
          style={`height:${Math.max(4, (v / maxIE) * 100)}%`}></div>
        <span class={`text-[0.65rem] font-semibold ${core ? 'text-base-content/45' : 'text-primary'}`}>IE<sub>{i + 1}</sub></span>
      </div>
    {/each}
  </div>

  <div class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-box bg-base-200/60 p-3 text-sm">
    <span class="badge badge-primary font-bold">{valence} 個價電子</span>
    <span>第 IE<sub>{valence + 1}</sub> 暴增 <b>×{jumpAt.ratio.toFixed(1)}</b>（開始拔核心電子）→ <b>{el.sym} 在 {GROUP[valence]}</b></span>
  </div>
  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    解題法：把連續游離能由小到大看，<b>哪一階突然暴增（比值最大）</b>，暴增<b>前面</b>的個數就是價電子數，元素就在第「價電子數」族。
    藍色＝好拔的價電子、灰色＝難拔的核心電子。
  </p>
</div>
