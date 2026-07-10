<script lang="ts">
  // 靜態示意圖（無互動、純 SSR、列印完整）：膜內外主要離子的分布。
  // 胞外多：Na⁺、Cl⁻、Ca²⁺；胞內多：K⁺。
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚡</span>
    <span class="font-display font-bold">膜內外主要離子的分布</span>
  </div>

  <svg viewBox="0 0 300 150" class="w-full" role="img" aria-label="鈉、氯、鈣離子在胞外較多，鉀離子在胞內較多">
    <!-- 胞外 -->
    <text x="6" y="14" class="fill-base-content/55 text-[9px] font-bold">胞外（細胞外液）濃度高</text>
    <rect x="20" y="24" width="54" height="22" rx="11" class="fill-error/15 stroke-error" stroke-width="1.2" />
    <text x="47" y="39" text-anchor="middle" class="fill-error text-[11px] font-bold">Na⁺</text>
    <rect x="122" y="24" width="54" height="22" rx="11" class="fill-success/15 stroke-success" stroke-width="1.2" />
    <text x="149" y="39" text-anchor="middle" class="fill-success text-[11px] font-bold">Cl⁻</text>
    <rect x="224" y="24" width="54" height="22" rx="11" class="fill-secondary/15 stroke-secondary" stroke-width="1.2" />
    <text x="251" y="39" text-anchor="middle" class="fill-secondary text-[11px] font-bold">Ca²⁺</text>

    <!-- 細胞膜 -->
    <rect x="0" y="66" width="300" height="18" class="fill-warning/30" />
    <text x="150" y="79" text-anchor="middle" class="fill-base-content/60 text-[9px] font-bold">細胞膜</text>

    <!-- 胞內 -->
    <rect x="20" y="104" width="54" height="22" rx="11" class="fill-info/15 stroke-info" stroke-width="1.2" />
    <text x="47" y="119" text-anchor="middle" class="fill-info text-[11px] font-bold">K⁺</text>
    <text x="6" y="144" class="fill-base-content/55 text-[9px] font-bold">胞內（細胞質）濃度高</text>
  </svg>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    細胞靠膜上的幫浦與通道，把 <b>Na⁺、Cl⁻、Ca²⁺</b> 維持在<b>胞外</b>較多、<b>K⁺</b> 在<b>胞內</b>較多，形成胞內外的離子濃度差。
  </p>
</div>
