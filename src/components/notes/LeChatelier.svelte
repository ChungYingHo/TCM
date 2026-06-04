<script lang="ts">
  // 勒沙特列原理互動：以 N₂ + 3H₂ ⇌ 2NH₃（放熱，氣態 4→2 莫耳）為例，
  // 選一個擾動，看平衡往哪邊移動、K 變不變。
  type D = { label: string; dir: '右' | '左' | '不動'; kChange: '增大' | '減小' | '不變'; why: string }
  const DIST: D[] = [
    { label: '加入 N₂（反應物）', dir: '右', kChange: '不變', why: '增加反應物 → 往消耗反應物的正向移動。' },
    { label: '加入 NH₃（產物）', dir: '左', kChange: '不變', why: '增加產物 → 往消耗產物的逆向移動。' },
    { label: '升高溫度', dir: '左', kChange: '減小', why: '放熱反應升溫 → 往吸熱（逆）方向；K 變小。' },
    { label: '降低溫度', dir: '右', kChange: '增大', why: '往放熱（正）方向；K 變大。（只有溫度會改變 K）' },
    { label: '加壓（縮小體積）', dir: '右', kChange: '不變', why: '往氣態莫耳數少的一側（產物 2 < 反應物 4）。' },
    { label: '減壓（增大體積）', dir: '左', kChange: '不變', why: '往氣態莫耳數多的一側（反應物 4）。' },
    { label: '等容加入惰性氣體', dir: '不動', kChange: '不變', why: '各物質分壓不變 → Q 不變 → 不移動。' },
    { label: '加入催化劑', dir: '不動', kChange: '不變', why: '只加快到達平衡，不移動平衡、不改變 K。' },
  ]
  let i = $state(0)
  const d = $derived(DIST[i])
  const arrow = $derived(d.dir === '右' ? '→' : d.dir === '左' ? '←' : '＝')
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-1 flex items-center gap-2">
    <span aria-hidden="true">⚖️</span>
    <span class="font-display font-bold">勒沙特列：平衡往哪移</span>
  </div>
  <p class="mb-3 font-mono text-sm text-base-content/70">N₂ + 3H₂ ⇌ 2NH₃　（放熱；氣態 4 → 2 莫耳）</p>

  <div class="mb-3 grid grid-cols-2 gap-1.5">
    {#each DIST as dd, k (dd.label)}
      <button type="button" class={`rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${i === k ? 'bg-primary/15 font-semibold text-primary' : 'bg-base-200/50 hover:bg-base-200'}`} onclick={() => (i = k)}>{dd.label}</button>
    {/each}
  </div>

  <div class="flex flex-wrap items-center gap-2 rounded-box bg-base-200/60 p-3 text-sm">
    <span class="text-2xl font-bold text-primary">{arrow}</span>
    <span class="badge badge-primary font-bold">平衡{d.dir === '不動' ? '不移動' : `往${d.dir}移`}</span>
    <span class={`badge font-bold ${d.kChange === '不變' ? 'badge-ghost' : 'badge-warning'}`}>K {d.kChange}</span>
  </div>
  <p class="mt-2 text-xs leading-relaxed text-base-content/70">{d.why}</p>
  <p class="mt-2 text-xs leading-relaxed text-base-content/60">
    原則：系統會往<b>減弱該擾動</b>的方向移動。記住<b>只有改變溫度會改變 K</b>；改濃度、壓力、加催化劑都只改 Q、不改 K。
  </p>
</div>
