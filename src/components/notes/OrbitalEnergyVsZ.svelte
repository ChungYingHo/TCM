<script lang="ts">
  // 靜態「軌域能量對原子序」圖，純 SSR、PDF 完整。
  // 兩條線隨原子序增大都往下（更穩定）。K、Ca 時 3d 在 4s 之上，約 Ca 之後交錯、
  // Sc 起 3d 落到 4s 之下。schematic 走勢、非真實數值。
  const Zmin = 18, Zmax = 30
  const X0 = 40, X1 = 290, sx = (z: number) => X0 + ((z - Zmin) / (Zmax - Zmin)) * (X1 - X0)
  const y4s = (z: number) => 60 + (z - 18) * 4.5
  const y3d = (z: number) => 50 + (z - 18) * 9.2
  const zs = Array.from({ length: Zmax - Zmin + 1 }, (_, i) => Zmin + i)
  const line = (f: (z: number) => number) => zs.map((z, i) => `${i ? 'L' : 'M'}${sx(z).toFixed(1)},${f(z).toFixed(1)}`).join(' ')
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📉</span>
    <span class="font-display font-bold">4s 與 3d 能量隨原子序的變化</span>
  </div>

  <svg viewBox="0 0 300 210" class="w-full" role="img" aria-label="4s 與 3d 軌域能量對原子序的交錯圖">
    <!-- K、Ca 區（3d 在 4s 之上） -->
    <rect x={sx(18.5)} y="20" width={sx(20.5) - sx(18.5)} height="150" class="fill-primary/8" />
    <line x1={X0} y1="170" x2={X1} y2="170" stroke="currentColor" stroke-width="0.8" class="text-base-content/40" />
    <line x1={X0} y1="20" x2={X0} y2="170" stroke="currentColor" stroke-width="0.8" class="text-base-content/40" />
    <text x={X0 - 4} y="26" text-anchor="end" class="fill-base-content/45 text-[7px]">能量高</text>
    <text x={X1} y="182" text-anchor="end" class="fill-base-content/45 text-[8px]">原子序 Z →</text>

    <!-- 曲線 -->
    <path d={line(y3d)} fill="none" stroke="#dc2626" stroke-width="1.8" />
    <path d={line(y4s)} fill="none" stroke="#2563eb" stroke-width="1.8" />
    <text x={sx(29.4)} y={y3d(29.4) + 3} class="fill-error text-[9px] font-bold">3d</text>
    <text x={sx(29.4)} y={y4s(29.4) - 2} class="fill-[#2563eb] text-[9px] font-bold">4s</text>

    <!-- 元素標記 -->
    <text x={sx(19)} y="190" text-anchor="middle" class="fill-base-content/70 text-[8px]">K</text>
    <text x={sx(20)} y="190" text-anchor="middle" class="fill-base-content/70 text-[8px]">Ca</text>
    <text x={sx(21)} y="190" text-anchor="middle" class="fill-base-content/70 text-[8px]">Sc</text>
    <text x={sx(30)} y="190" text-anchor="middle" class="fill-base-content/70 text-[8px]">Zn</text>

    <!-- 標註兩區 -->
    <text x={sx(19.5)} y="34" text-anchor="middle" class="fill-primary text-[7.5px] font-semibold">K、Ca：3d 在上</text>
    <text x={sx(25.5)} y="150" text-anchor="middle" class="fill-base-content/60 text-[7.5px] font-semibold">Sc 起：3d 在 4s 之下</text>
  </svg>

  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    在 K、Ca 時 <b class="text-error">3d 的能量比 4s 高</b>，所以電子先填 4s。原子序再增大，3d 掉得比 4s 快，約在 Ca 之後兩條交錯，Sc 之後 3d 反而在 4s 之下。這也是為什麼過渡金屬形成陽離子時是先移除 4s。
  </p>
</div>
