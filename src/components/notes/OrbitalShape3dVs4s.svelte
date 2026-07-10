<script lang="ts">
  // 靜態示意圖：3d 緊縮（定域化）vs 4s 胖散（且會穿透）。純 SSR、PDF 完整。
  // 走勢示意、非真實數值，重點是「3d 窄而集中、4s 寬而遠」，用來說明填 3d 的電子斥力較大。
  const base = 150
  // 4s：兩個近核小峰（穿透）＋ 一個又寬又遠的主峰
  const s4 = `M35,${base} Q50,132 62,${base} Q75,138 88,${base} L135,${base} Q210,58 285,${base} Z`
  // 3d：窄而集中的單峰
  const d3 = `M72,${base} Q112,36 152,${base} Z`
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚛️</span>
    <span class="font-display font-bold">3d 緊縮 vs 4s 胖散</span>
  </div>

  <svg viewBox="0 0 300 172" class="w-full" role="img" aria-label="3d 與 4s 軌域的分布對比">
    <line x1="30" y1={base} x2="290" y2={base} stroke="currentColor" stroke-width="0.8" class="text-base-content/40" />
    <text x="30" y={base + 11} text-anchor="middle" class="fill-base-content/45 text-[7px]">核</text>
    <text x="288" y={base + 11} text-anchor="end" class="fill-base-content/45 text-[8px]">離核距離 →</text>

    <path d={s4} class="fill-[#2563eb]/15 stroke-[#2563eb]" stroke-width="1.4" />
    <path d={d3} class="fill-error/20 stroke-error" stroke-width="1.4" />

    <text x="112" y="60" text-anchor="middle" class="fill-error text-[10px] font-bold">3d</text>
    <text x="112" y="72" text-anchor="middle" class="fill-error text-[7px]">窄、集中</text>
    <text x="210" y="86" text-anchor="middle" class="fill-[#2563eb] text-[10px] font-bold">4s</text>
    <text x="210" y="98" text-anchor="middle" class="fill-[#2563eb] text-[7px]">寬、遠、會穿透</text>
  </svg>

  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    3d 比 4s 更<b class="text-error">緊縮、定域化</b>在原子核附近，電子擠在小空間裡、彼此斥力較大。4s 又胖又遠，還有靠近核的穿透小峰。因為填 3d 要付出較大電子斥力，多數第一列過渡金屬的 <b>4s²3dⁿ</b> 總能量反而比較低。
  </p>
</div>
