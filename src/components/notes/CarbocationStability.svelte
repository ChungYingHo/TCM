<script lang="ts">
  // 碳正離子穩定性階梯：3° > 2° > 1° > CH₃⁺；烯丙型/苯甲型因共振特別穩定。
  // 越穩定的碳正離子越容易生成 → 決定 Markovnikov 方向與 SN1/E1 速率。
  type C = { name: string; note: string; rank: number }
  const CATS: C[] = [
    { name: '苯甲型 / 烯丙型', note: '共振分散正電荷，特別穩定', rank: 5 },
    { name: '3°（三級）', note: '三個烷基推電子', rank: 4 },
    { name: '2°（二級）', note: '兩個烷基推電子', rank: 3 },
    { name: '1°（一級）', note: '只有一個烷基', rank: 2 },
    { name: 'CH₃⁺（甲基）', note: '沒有烷基推電子，最不穩定', rank: 1 },
  ]
  let sel = $state(1) // 3°
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">➕</span>
    <span class="font-display font-bold">碳正離子穩定性</span>
  </div>

  <div class="flex flex-col gap-1">
    {#each CATS as cc, k (cc.name)}
      <button type="button" class={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${sel === k ? 'bg-primary/15 font-bold text-primary' : 'bg-base-200/50 hover:bg-base-200'}`} onclick={() => (sel = k)}>
        <span class="w-28 shrink-0">{cc.name}</span>
        <span class="h-2 flex-1 overflow-hidden rounded-full bg-base-300/50">
          <span class={`block h-full rounded-full ${sel === k ? 'bg-primary' : 'bg-base-content/30'}`} style={`width:${cc.rank * 20}%`}></span>
        </span>
      </button>
    {/each}
  </div>
  <p class="mt-2 text-sm text-base-content/70">{CATS[sel].name}：{CATS[sel].note}。</p>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    穩定性 <b>苯甲/烯丙型 &gt; 3° &gt; 2° &gt; 1° &gt; CH₃⁺</b>（越多烷基推電子、或有共振分散正電荷越穩定）。越穩定越容易生成。這決定了 <b>加成反應加在哪一個碳上</b>（H⁺ 先加成，讓另一個碳成為較穩定的碳正離子，稱為 Markovnikov 方向），以及<b>必須先解離出碳正離子才能往下走的路徑</b>（SN1 與 E1）跑得多快，3° 最快。
  </p>
</div>
