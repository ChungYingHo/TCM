<script lang="ts">
  // 填入順序（構築原理）的對角線圖，轉 90 度：橫軸＝主層 n（左到右 1→7），縱軸＝副層（下 s、上 f）。
  // 平行的斜箭頭（↘）各代表一組 n+l 相同的副層，順著箭頭一條一條讀就是電子填入順序。
  // 純 SSR、PDF 完整。
  const xN = (n: number) => 34 + n * 34
  const yOf: Record<string, number> = { s: 176, p: 132, d: 88, f: 44 }
  type Box = { sym: string; n: number; sub: string }
  const boxes: Box[] = []
  for (let n = 1; n <= 7; n++) {
    boxes.push({ sym: `${n}s`, n, sub: 's' })
    if (n >= 2) boxes.push({ sym: `${n}p`, n, sub: 'p' })
    if (n >= 3 && n <= 6) boxes.push({ sym: `${n}d`, n, sub: 'd' })
    if (n >= 4 && n <= 5) boxes.push({ sym: `${n}f`, n, sub: 'f' })
  }
  // 每組 n+l 從最小 n 的副層指到最大 n 的副層（↘）
  const arrows = [
    { a: { n: 2, sub: 'p' }, b: { n: 3, sub: 's' } },
    { a: { n: 3, sub: 'p' }, b: { n: 4, sub: 's' } },
    { a: { n: 3, sub: 'd' }, b: { n: 5, sub: 's' } },
    { a: { n: 4, sub: 'd' }, b: { n: 6, sub: 's' } },
    { a: { n: 4, sub: 'f' }, b: { n: 7, sub: 's' } },
    { a: { n: 5, sub: 'f' }, b: { n: 7, sub: 'p' } },
  ]
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">↘️</span>
    <span class="font-display font-bold">電子填入順序（斜線規則）</span>
  </div>

  <svg viewBox="0 0 300 205" class="w-full" role="img" aria-label="電子填入順序的斜線規則圖">
    <!-- 副層標籤（左側） -->
    {#each Object.entries(yOf) as [sub, y] (sub)}
      <text x="18" y={y + 4} text-anchor="middle" class="fill-base-content/40 text-[9px] font-semibold">{sub}</text>
    {/each}
    <!-- 斜箭頭（畫在字底下） -->
    {#each arrows as ar (ar.a.n + ar.a.sub)}
      <line x1={xN(ar.a.n)} y1={yOf[ar.a.sub]} x2={xN(ar.b.n)} y2={yOf[ar.b.sub]}
        stroke="currentColor" stroke-width="1.4" class="text-primary/45" marker-end="url(#fo-a)" />
    {/each}
    <defs>
      <marker id="fo-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" class="fill-primary/60" />
      </marker>
    </defs>
    <!-- 副層方塊 -->
    {#each boxes as o (o.sym)}
      <rect x={xN(o.n) - 15} y={yOf[o.sub] - 9} width="30" height="18" rx="3" class="fill-base-100 stroke-base-300" stroke-width="0.8" />
      <text x={xN(o.n)} y={yOf[o.sub] + 4} text-anchor="middle" class="fill-base-content text-[10px] font-semibold">{o.sym}</text>
    {/each}
    <text x="150" y="200" text-anchor="middle" class="fill-base-content/45 text-[8px]">主層 n（左 1 → 右 7）</text>
  </svg>

  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    順著平行的斜箭頭（↘）一條一條讀，就是填電子的順序：<b>1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p → 5s → 4d → 5p → 6s → 4f → 5d → 6p → 7s → 5f → 6d → 7p</b>。同一條箭頭上 n+l 相同。
  </p>
</div>
