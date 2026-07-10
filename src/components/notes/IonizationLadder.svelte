<script lang="ts">
  // 連續游離能「暴增」偵測器：選元素，看 IE₁→IE₂→… 的值。
  // 找「比值跳最大」那一階＝剛把價電子拔光、下一個要動核心電子。暴增前的數量＝價電子數＝族。
  // 值為標準連續游離能（kJ/mol，四捨五入）。
  type Elem = { sym: string; z: number; ie: number[] }
  const ELEMS: Elem[] = [
    { sym: 'Na', z: 11, ie: [496, 4562, 6910, 9543] },
    { sym: 'Mg', z: 12, ie: [738, 1451, 7733, 10540] },
    { sym: 'Al', z: 13, ie: [578, 1817, 2745, 11577] },
    { sym: 'Si', z: 14, ie: [786, 1577, 3232, 4356, 16091] },
  ]
  const GROUP: Record<number, string> = { 1: '第 1 族（IA）', 2: '第 2 族（IIA）', 3: '第 13 族（IIIA）', 4: '第 14 族（IVA）' }

  let pick = $state(0)
  const el = $derived(ELEMS[pick])
  const jumpAt = $derived.by(() => {
    let best = 0
    let bestRatio = 0
    for (let i = 0; i < el.ie.length - 1; i++) {
      const r = el.ie[i + 1] / el.ie[i]
      if (r > bestRatio) { bestRatio = r; best = i }
    }
    return { index: best, ratio: bestRatio }
  })
  const valence = $derived(jumpAt.index + 1)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚡</span>
    <span class="font-display font-bold">連續游離能・找價電子數</span>
  </div>

  <div class="join mb-3 print:hidden">
    {#each ELEMS as e, i (e.sym)}
      <button type="button" class={`btn join-item btn-sm ${pick === i ? 'btn-primary' : 'btn-outline'}`} onclick={() => (pick = i)}>{e.sym}</button>
    {/each}
  </div>

  <!-- IE 值排成一列，比值暴增那階插入斷崖標記 -->
  <div class="flex flex-wrap items-stretch gap-1.5">
    {#each el.ie as v, i (i)}
      {@const core = i > jumpAt.index}
      {#if i === jumpAt.index + 1}
        <div class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-accent/60 bg-accent/10 px-1.5">
          <span class="text-sm font-bold text-accent">⚡</span>
          <span class="text-[0.7rem] font-bold leading-tight text-accent">×{jumpAt.ratio.toFixed(1)}</span>
          <span class="text-[0.6rem] leading-tight text-accent/80">暴增</span>
        </div>
      {/if}
      <div class={`flex min-w-[3.2rem] flex-col items-center rounded-lg border px-2 py-1.5 ${core ? 'border-base-300 bg-base-200/50 text-base-content/50' : 'border-primary/40 bg-primary/10'}`}>
        <span class="text-[0.62rem] font-semibold">IE<sub>{i + 1}</sub></span>
        <span class="text-sm font-bold tabular-nums">{v}</span>
      </div>
    {/each}
  </div>

  <div class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-box bg-base-200/60 p-3 text-sm">
    <span class="badge badge-primary font-bold">{valence} 個價電子</span>
    <span>暴增在第 {valence + 1} 個（比值 ×{jumpAt.ratio.toFixed(1)}），拔完 {valence} 個價電子後開始動核心，所以 <b>{el.sym} 在 {GROUP[valence]}</b></span>
  </div>
  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    把連續游離能由小到大看，找<b>比值突然暴增</b>那一階，暴增<b>前面</b>的個數就是價電子數。藍色是好拔的價電子、灰色是難拔的核心電子。
  </p>
</div>
