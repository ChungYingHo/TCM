<script lang="ts">
  // 靜態 Jablonski 圖，純 SSR、PDF 完整。
  // 左邊單重態 S₀/S₁/S₂、右邊三重態 T₁/T₂。實線＝有放光（吸收、螢光、磷光），
  // 虛線＝無放光（內轉換 IC、系統間轉換 ISC）。
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">💡</span>
    <span class="font-display font-bold">Jablonski 圖：螢光與磷光</span>
  </div>

  <svg viewBox="0 0 300 205" class="w-full" role="img" aria-label="Jablonski 能階與螢光磷光轉換圖">
    <!-- 能階線 -->
    <line x1="30" y1="188" x2="152" y2="188" stroke="currentColor" stroke-width="2" class="text-base-content/70" />
    <line x1="42" y1="100" x2="140" y2="100" stroke="currentColor" stroke-width="1.6" class="text-base-content/55" />
    <line x1="42" y1="48" x2="140" y2="48" stroke="currentColor" stroke-width="1.6" class="text-base-content/55" />
    <line x1="180" y1="124" x2="274" y2="124" stroke="currentColor" stroke-width="1.6" class="text-base-content/55" />
    <line x1="180" y1="74" x2="274" y2="74" stroke="currentColor" stroke-width="1.6" class="text-base-content/55" />
    <text x="26" y="191" text-anchor="end" class="fill-base-content/70 text-[9px] font-bold">S₀</text>
    <text x="38" y="103" text-anchor="end" class="fill-base-content/60 text-[9px] font-bold">S₁</text>
    <text x="38" y="51" text-anchor="end" class="fill-base-content/60 text-[9px] font-bold">S₂</text>
    <text x="278" y="127" class="fill-base-content/60 text-[9px] font-bold">T₁</text>
    <text x="278" y="77" class="fill-base-content/60 text-[9px] font-bold">T₂</text>
    <text x="60" y="18" text-anchor="middle" class="fill-base-content/45 text-[8px]">單重態</text>
    <text x="225" y="18" text-anchor="middle" class="fill-base-content/45 text-[8px]">三重態</text>

    <!-- 吸收（實線、向上、紅） -->
    <line x1="58" y1="188" x2="58" y2="100" stroke="#dc2626" stroke-width="1.6" marker-end="url(#jb-up)" />
    <line x1="78" y1="188" x2="78" y2="48" stroke="#dc2626" stroke-width="1.6" marker-end="url(#jb-up)" />
    <text x="52" y="150" text-anchor="end" class="fill-error text-[8px]">吸收</text>

    <!-- 內轉換 IC（虛線、S₂→S₁） -->
    <line x1="120" y1="48" x2="120" y2="100" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3 2" class="text-base-content/45" marker-end="url(#jb-down)" />
    <text x="124" y="72" class="fill-base-content/50 text-[7.5px]">內轉換 IC</text>

    <!-- 螢光（實線、S₁→S₀、綠、快） -->
    <line x1="98" y1="100" x2="98" y2="188" stroke="#16a34a" stroke-width="1.8" marker-end="url(#jb-downg)" />
    <text x="102" y="150" class="fill-[#16a34a] text-[8px] font-semibold">螢光（快）</text>

    <!-- 系統間轉換 ISC（虛線、S₁→T₁、紫） -->
    <line x1="140" y1="100" x2="180" y2="124" stroke="#7c3aed" stroke-width="1.4" stroke-dasharray="3 2" marker-end="url(#jb-isc)" />
    <text x="146" y="112" class="fill-[#7c3aed] text-[7.5px]">ISC</text>

    <!-- 磷光（實線、T₁→S₀、橘、慢） -->
    <line x1="210" y1="124" x2="210" y2="188" stroke="#ea580c" stroke-width="1.8" marker-end="url(#jb-downo)" />
    <text x="214" y="160" class="fill-[#ea580c] text-[8px] font-semibold">磷光（慢）</text>

    <defs>
      <marker id="jb-up" viewBox="0 0 10 10" refX="5" refY="1" markerWidth="5" markerHeight="5" orient="auto"><path d="M5,0 L10,10 L0,10 z" fill="#dc2626" /></marker>
      <marker id="jb-down" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0,0 L10,0 L5,10 z" class="fill-base-content/45" /></marker>
      <marker id="jb-downg" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,0 L5,10 z" fill="#16a34a" /></marker>
      <marker id="jb-downo" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,0 L5,10 z" fill="#ea580c" /></marker>
      <marker id="jb-isc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#7c3aed" /></marker>
    </defs>
  </svg>

  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    實線是有放光的轉換（吸收、螢光、磷光），虛線是無放光的轉換。<b class="text-[#16a34a]">螢光</b>是 S₁ 直接回 S₀，自旋守恆、快。<b class="text-[#ea580c]">磷光</b>要先經 <b class="text-[#7c3aed]">系統間轉換 ISC</b> 跑到三重態 T₁ 再回 S₀，自旋不守恆、慢。
  </p>
</div>
