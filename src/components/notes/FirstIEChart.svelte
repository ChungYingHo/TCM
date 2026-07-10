<script lang="ts">
  // 靜態「第一游離能對原子序」折線圖（H 到 Ca），純 SSR、PDF 完整。
  // 真實 IE 數值（kJ/mol），看得到峰在惰性氣體、谷在鹼金屬，以及 Be→B、N→O 兩個下降。
  type P = { z: number; sym: string; ie: number; tag?: 'peak' | 'valley' | 'dip' }
  const DATA: P[] = [
    { z: 1, sym: 'H', ie: 1312 }, { z: 2, sym: 'He', ie: 2372, tag: 'peak' },
    { z: 3, sym: 'Li', ie: 520, tag: 'valley' }, { z: 4, sym: 'Be', ie: 899 },
    { z: 5, sym: 'B', ie: 801, tag: 'dip' }, { z: 6, sym: 'C', ie: 1086 },
    { z: 7, sym: 'N', ie: 1402 }, { z: 8, sym: 'O', ie: 1314, tag: 'dip' },
    { z: 9, sym: 'F', ie: 1681 }, { z: 10, sym: 'Ne', ie: 2081, tag: 'peak' },
    { z: 11, sym: 'Na', ie: 496, tag: 'valley' }, { z: 12, sym: 'Mg', ie: 738 },
    { z: 13, sym: 'Al', ie: 578 }, { z: 14, sym: 'Si', ie: 786 },
    { z: 15, sym: 'P', ie: 1012 }, { z: 16, sym: 'S', ie: 1000 },
    { z: 17, sym: 'Cl', ie: 1251 }, { z: 18, sym: 'Ar', ie: 1521, tag: 'peak' },
    { z: 19, sym: 'K', ie: 419, tag: 'valley' }, { z: 20, sym: 'Ca', ie: 590 },
  ]
  const X0 = 34, X1 = 294, Y0 = 158, Y1 = 20, IEMAX = 2500
  const sx = (z: number) => X0 + ((z - 1) / 19) * (X1 - X0)
  const sy = (ie: number) => Y0 - (ie / IEMAX) * (Y0 - Y1)
  const poly = DATA.map((d) => `${sx(d.z).toFixed(1)},${sy(d.ie).toFixed(1)}`).join(' ')
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📉</span>
    <span class="font-display font-bold">第一游離能對原子序（H 到 Ca）</span>
  </div>

  <svg viewBox="0 0 302 182" class="w-full" role="img" aria-label="第一游離能對原子序的折線圖">
    <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="currentColor" stroke-width="0.8" class="text-base-content/40" />
    <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="currentColor" stroke-width="0.8" class="text-base-content/40" />
    <text x={X0 - 3} y={Y1 + 4} text-anchor="end" class="fill-base-content/45 text-[7px]">IE</text>
    <text x={X1} y={Y0 + 11} text-anchor="end" class="fill-base-content/45 text-[7px]">原子序 →</text>

    <polyline points={poly} fill="none" stroke="#2563eb" stroke-width="1.4" />
    {#each DATA as d (d.z)}
      {@const cls = d.tag === 'peak' ? 'fill-error' : d.tag === 'valley' ? 'fill-[#16a34a]' : d.tag === 'dip' ? 'fill-[#ea580c]' : 'fill-[#2563eb]'}
      <circle cx={sx(d.z)} cy={sy(d.ie)} r={d.tag ? 2.4 : 1.6} class={cls} />
      {#if d.tag === 'peak' || d.tag === 'valley'}
        <text x={sx(d.z)} y={d.tag === 'peak' ? sy(d.ie) - 4 : sy(d.ie) + 9} text-anchor="middle" class={`${cls} text-[7px] font-bold`}>{d.sym}</text>
      {/if}
    {/each}
    <!-- 標兩個特殊下降 -->
    <text x={sx(5)} y={sy(801) - 5} text-anchor="middle" class="fill-[#ea580c] text-[7px] font-semibold">Be→B↓</text>
    <text x={sx(8)} y={sy(1314) - 5} text-anchor="middle" class="fill-[#ea580c] text-[7px] font-semibold">N→O↓</text>
  </svg>

  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    每個週期由左往右整體上升，<b class="text-error">峰在惰性氣體</b>（He、Ne、Ar），<b class="text-[#16a34a]">谷在鹼金屬</b>（Li、Na、K）。中間有兩個違反趨勢的<b class="text-[#ea580c]">下降</b>，就是 Be→B 和 N→O。
  </p>
</div>
