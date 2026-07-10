<script lang="ts">
  // 靜態能階對照圖，純 SSR、無互動，PDF 完整顯示。
  // 左＝單電子原子（H）：能量只看 n，同 n 的副層畫在同一高度（簡併）。
  // 右＝多電子原子：同 n 依 s<p<d 分裂，重點是 4s 落在 3d 之下。
  // 高度用 y（越小越高＝能量越高），schematic 比例、非真實數值。

  // 左欄：一個 n 一條線、寫出該層所有副層
  const single = [
    { y: 30, subs: '4s 4p 4d 4f', n: 'n=4' },
    { y: 62, subs: '3s 3p 3d', n: 'n=3' },
    { y: 100, subs: '2s 2p', n: 'n=2' },
    { y: 150, subs: '1s', n: 'n=1' },
  ]
  // 右欄：一個副層一條線，依 n+l 能量順序排（能量高在上）
  const multi = [
    { y: 24, label: '4p', nl: 5 },
    { y: 40, label: '3d', nl: 5, hi: true },
    { y: 56, label: '4s', nl: 4, hi: true },
    { y: 78, label: '3p', nl: 4 },
    { y: 92, label: '3s', nl: 3 },
    { y: 112, label: '2p', nl: 3 },
    { y: 128, label: '2s', nl: 2 },
    { y: 168, label: '1s', nl: 1 },
  ]
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🪜</span>
    <span class="font-display font-bold">軌域能階：單電子 vs 多電子</span>
  </div>

  <svg viewBox="0 0 340 200" class="w-full" role="img" aria-label="單電子原子與多電子原子的軌域能階對照">
    <!-- 能量軸箭頭 -->
    <line x1="12" y1="185" x2="12" y2="14" stroke="currentColor" stroke-width="1" class="text-base-content/40" />
    <polygon points="9,20 15,20 12,12" class="fill-base-content/40" />
    <text x="16" y="20" class="fill-base-content/50 text-[8px]">能量高</text>

    <!-- 左欄：單電子原子 H -->
    <text x="90" y="12" text-anchor="middle" class="fill-base-content/70 text-[10px] font-bold">單電子原子（H）</text>
    {#each single as lv (lv.n)}
      <line x1="40" y1={lv.y} x2="150" y2={lv.y} stroke="currentColor" stroke-width="1.6" class="text-primary/70" />
      <text x="36" y={lv.y + 3} text-anchor="end" class="fill-base-content/50 text-[8px]">{lv.n}</text>
      <text x="95" y={lv.y - 3} text-anchor="middle" class="fill-base-content/80 text-[9px] font-semibold">{lv.subs}</text>
    {/each}
    <text x="95" y="192" text-anchor="middle" class="fill-base-content/55 text-[8px]">同 n 同高度＝簡併</text>

    <!-- 分隔 -->
    <line x1="175" y1="16" x2="175" y2="185" stroke="currentColor" stroke-width="0.6" stroke-dasharray="3 3" class="text-base-content/20" />

    <!-- 右欄：多電子原子 -->
    <text x="255" y="12" text-anchor="middle" class="fill-base-content/70 text-[10px] font-bold">多電子原子</text>
    {#each multi as o (o.label)}
      <line x1="205" y1={o.y} x2="290" y2={o.y} stroke="currentColor" stroke-width="1.6" class={o.hi ? 'text-error' : 'text-base-content/45'} />
      <text x="200" y={o.y + 3} text-anchor="end" class={o.hi ? 'fill-error text-[9px] font-bold' : 'fill-base-content/70 text-[9px] font-semibold'}>{o.label}</text>
      <text x="295" y={o.y + 3} class="fill-base-content/40 text-[7px]">n+l={o.nl}</text>
    {/each}
    <text x="255" y="192" text-anchor="middle" class="fill-error text-[8px] font-semibold">4s 落在 3d 之下</text>
  </svg>

  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    單電子原子的能量<b>只由 n 決定</b>，同一個 n 的軌域能量相同（簡併）。多電子原子還要看 l，同一個 n 依 <b>s &lt; p &lt; d</b> 分裂，而且用 n+l 規則會發現 <b class="text-error">4s（n+l=4）比 3d（n+l=5）低</b>。
  </p>
</div>
