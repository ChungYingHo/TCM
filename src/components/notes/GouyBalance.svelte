<script lang="ts">
  // 古埃天平示意圖（放大、加清楚說明）：樣品管吊在天平、下端伸入電磁鐵兩極之間的磁場。
  // 順磁被吸入變重、反磁被排斥變輕。純 SSR、PDF 完整。
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚖️</span>
    <span class="font-display font-bold">古埃天平：測順磁與反磁</span>
  </div>

  <svg viewBox="0 0 240 200" class="mx-auto block w-full max-w-[15rem]" role="img" aria-label="古埃天平量測磁性的示意圖">
    <!-- 支架與天平橫樑 -->
    <line x1="30" y1="22" x2="150" y2="22" stroke="currentColor" stroke-width="2.5" class="text-base-content/70" />
    <polygon points="90,22 84,10 96,10" class="fill-base-content/55" />
    <line x1="90" y1="10" x2="90" y2="3" stroke="currentColor" stroke-width="2" class="text-base-content/55" />
    <text x="118" y="17" class="fill-base-content/50 text-[9px]">天平</text>
    <!-- 右臂配重 -->
    <line x1="150" y1="22" x2="150" y2="30" stroke="currentColor" stroke-width="1" class="text-base-content/45" />
    <rect x="143" y="30" width="14" height="9" rx="1.5" class="fill-base-content/20 stroke-base-content/40" stroke-width="0.8" />

    <!-- 吊線與樣品管 -->
    <line x1="55" y1="22" x2="55" y2="52" stroke="currentColor" stroke-width="1" class="text-base-content/45" />
    <rect x="43" y="52" width="24" height="104" rx="4" class="fill-primary/8 stroke-primary/60" stroke-width="1.3" />
    <rect x="43" y="118" width="24" height="38" rx="0" class="fill-primary/25" />
    <text x="55" y="46" text-anchor="middle" class="fill-base-content/55 text-[8px]">樣品管</text>

    <!-- 電磁鐵兩極（樣品管下端在中間） -->
    <rect x="8" y="112" width="30" height="30" rx="2" class="fill-error/15 stroke-error/50" stroke-width="1.2" />
    <text x="23" y="132" text-anchor="middle" class="fill-error text-[12px] font-bold">N</text>
    <rect x="72" y="112" width="30" height="30" rx="2" class="fill-[#2563eb]/15 stroke-[#2563eb]/50" stroke-width="1.2" />
    <text x="87" y="132" text-anchor="middle" class="fill-[#2563eb] text-[12px] font-bold">S</text>
    <!-- 磁場（兩極間虛線） -->
    {#each [120, 127, 134] as fy (fy)}
      <line x1="38" y1={fy} x2="72" y2={fy} stroke="currentColor" stroke-width="0.7" stroke-dasharray="2 2" class="text-base-content/30" />
    {/each}
    <text x="55" y="168" text-anchor="middle" class="fill-base-content/45 text-[8px]">電磁鐵</text>

    <!-- 受力示意（在樣品管旁） -->
    <line x1="128" y1="95" x2="128" y2="120" stroke="#dc2626" stroke-width="2" marker-end="url(#gb-d)" />
    <text x="133" y="103" class="fill-error text-[8px]">順磁</text>
    <line x1="128" y1="150" x2="128" y2="125" stroke="#2563eb" stroke-width="2" marker-end="url(#gb-u)" />
    <text x="133" y="150" class="fill-[#2563eb] text-[8px]">反磁</text>
    <defs>
      <marker id="gb-d" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,0 L5,10 z" fill="#dc2626" /></marker>
      <marker id="gb-u" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="6" markerHeight="6" orient="auto"><path d="M5,0 L10,10 L0,10 z" fill="#2563eb" /></marker>
    </defs>
  </svg>

  <div class="mt-3 space-y-2 text-sm">
    <div class="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border-l-4 border-error/60 bg-error/5 px-3 py-2">
      <span class="badge badge-error badge-sm font-bold">順磁</span>
      <span>有未成對電子，被磁場<b>往下吸入</b>，秤起來<b>變重</b>。</span>
    </div>
    <div class="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border-l-4 border-info/60 bg-info/5 px-3 py-2">
      <span class="badge badge-info badge-sm font-bold">反磁</span>
      <span>電子全部成對，被磁場<b>往上排斥</b>，秤起來<b>變輕</b>。</span>
    </div>
  </div>
</div>
