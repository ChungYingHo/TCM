<script lang="ts">
  // 可見光色輪：紅橙黃綠藍紫繞成一圈，邊界標波長(nm)。紅(700)→紫(400)沿圈遞減，
  // 紫與紅在頂端相接(400/700)。正對面兩色互為互補色(紅↔綠、橙↔藍、黃↔紫)。
  const cx = 120, cy = 120, r = 72, labelR = 92
  const SECTORS = [
    { name: '紅', hex: '#e23b3b' },
    { name: '橙', hex: '#f08a1c' },
    { name: '黃', hex: '#f5d21a' },
    { name: '綠', hex: '#3cb043' },
    { name: '藍', hex: '#2a6fdb' },
    { name: '紫', hex: '#8a3fd6' },
  ]
  // 6 個邊界(由頂端順時針)的波長標籤
  const BOUNDS = ['400 / 700', '650', '600', '550', '500', '450']
  // 角度(度，由頂端順時針)→ 座標
  const pt = (deg: number, rad: number): [number, number] => {
    const a = (deg * Math.PI) / 180
    return [cx + rad * Math.sin(a), cy - rad * Math.cos(a)]
  }
  const slice = (i: number) => {
    const a1 = i * 60, a2 = (i + 1) * 60
    const [x1, y1] = pt(a1, r)
    const [x2, y2] = pt(a2, r)
    return `M${cx} ${cy} L${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`
  }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-1 flex items-center gap-2">
    <span aria-hidden="true">🎨</span>
    <span class="font-display font-bold">可見光色輪</span>
  </div>

  <svg viewBox="0 0 240 240" class="mx-auto block w-full max-w-[260px]" role="img" aria-label="可見光色輪，紅橙黃綠藍紫繞一圈並標出邊界波長">
    {#each SECTORS as s, i (s.name)}
      {@const [mx, my] = pt(i * 60 + 30, r * 0.62)}
      <path d={slice(i)} fill={s.hex} stroke="white" stroke-width="2" />
      <text x={mx} y={my + 4} text-anchor="middle" font-size="14" font-weight="bold" fill="white">{s.name}</text>
    {/each}
    {#each BOUNDS as b, i (b)}
      {@const [lx, ly] = pt(i * 60, labelR)}
      <text x={lx} y={ly + 3} text-anchor="middle" font-size="10" class="tabular-nums" fill="currentColor" fill-opacity="0.7">{b}</text>
    {/each}
    <circle cx={cx} cy={cy} r="20" fill="white" />
    <text x={cx} y={cy - 1} text-anchor="middle" font-size="8.5" fill="currentColor" fill-opacity="0.55">波長</text>
    <text x={cx} y={cy + 9} text-anchor="middle" font-size="8.5" fill="currentColor" fill-opacity="0.55">nm</text>
  </svg>

  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    沿圈紅 (700) → 紫 (400) 波長遞減、頻率遞增。<b>紫與紅在頂端相接</b> (400 / 700)。
    <b>正對面兩色互為互補色</b>：紅↔綠、橙↔藍、黃↔紫（物質吸收某色，看到的就是它對面的互補色）。
  </p>
</div>
