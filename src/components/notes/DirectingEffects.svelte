<script lang="ts">
  // 取代基定位效應：選一個已在苯環上的取代基，看它把下一個取代基導向鄰/對位還是間位，
  // 以及活化(加速)還是鈍化(減速)。苯環上以顏色標出主要進攻位置。
  type S = { name: string; dir: 'op' | 'm'; act: '活化' | '鈍化'; note: string }
  const SUBS: S[] = [
    { name: '–NH₂', dir: 'op', act: '活化', note: '強活化（N 孤對共振推電子到 o/p）' },
    { name: '–OH', dir: 'op', act: '活化', note: '強活化（O 孤對共振）' },
    { name: '–OCH₃', dir: 'op', act: '活化', note: '活化（甲氧基）' },
    { name: '–CH₃', dir: 'op', act: '活化', note: '弱活化（烷基誘導推電子）' },
    { name: '–Cl / –Br', dir: 'op', act: '鈍化', note: '特例：誘導拉電子(鈍化)，但孤對共振補回 o/p' },
    { name: '–NO₂', dir: 'm', act: '鈍化', note: '強鈍化（強拉電子，o/p 缺電更嚴重）' },
    { name: '–COOH', dir: 'm', act: '鈍化', note: '鈍化（羰基拉電子）' },
    { name: '–CN', dir: 'm', act: '鈍化', note: '鈍化（氰基拉電子）' },
  ]
  let i = $state(0)
  const s = $derived(SUBS[i])
  // 苯環六頂點：1(上,取代基)、2/6(鄰)、3/5(間)、4(對)
  const POS = [
    { x: 50, y: 12 }, { x: 83, y: 31 }, { x: 83, y: 69 }, { x: 50, y: 88 }, { x: 17, y: 69 }, { x: 17, y: 31 },
  ]
  const isHot = (idx: number) => (s.dir === 'op' ? idx === 1 || idx === 5 || idx === 3 : idx === 2 || idx === 4)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🎯</span>
    <span class="font-display font-bold">取代基定位效應</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each SUBS as su, k (su.name)}
      <button type="button" class={`btn btn-xs font-mono ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{su.name}</button>
    {/each}
  </div>

  <div class="flex flex-col items-center gap-3 sm:flex-row">
    <svg viewBox="0 0 100 100" class="h-32 w-32 shrink-0" role="img" aria-label="苯環定位">
      <polygon points="50,12 83,31 83,69 50,88 17,69 17,31" fill="none" class="stroke-base-content/30" stroke-width="2" />
      {#each POS as p, idx (idx)}
        {#if idx === 0}
          <circle cx={p.x} cy={p.y} r="9" class="fill-primary" /><text x={p.x} y={p.y + 3} text-anchor="middle" class="fill-primary-content text-[7px] font-bold">取</text>
        {:else}
          <circle cx={p.x} cy={p.y} r="8" class={isHot(idx) ? 'fill-accent/30 stroke-accent' : 'fill-base-200 stroke-base-300'} stroke-width="1" />
          {#if isHot(idx)}<text x={p.x} y={p.y + 3} text-anchor="middle" class="fill-accent text-[7px] font-bold">{s.dir === 'op' ? (idx === 3 ? 'p' : 'o') : 'm'}</text>{/if}
        {/if}
      {/each}
    </svg>
    <div class="text-sm">
      <div class="flex gap-2">
        <span class="badge badge-primary font-bold">{s.dir === 'op' ? '鄰/對位 (o/p)' : '間位 (m)'}</span>
        <span class={`badge font-bold ${s.act === '活化' ? 'badge-success' : 'badge-error'}`}>{s.act}</span>
      </div>
      <p class="mt-2 text-xs text-base-content/70">{s.note}</p>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    規則：<b>給電子基 → 鄰/對位、活化</b>（–NH₂、–OH、–OR、烷基）；<b>強拉電子基 → 間位、鈍化</b>（–NO₂、–CN、–COOH、–CHO）。<b>鹵素是特例</b>：鈍化卻仍導向鄰/對位。
  </p>
</div>
