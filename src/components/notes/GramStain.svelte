<script lang="ts">
  // 革蘭氏染色：切換 G+ / G−，看細胞壁構造與染色結果。
  // G+ 厚肽聚糖、無外膜 → 留住結晶紫 → 紫色；G− 薄肽聚糖＋LPS 外膜 → 脫色 → 番紅複染 → 紅色。
  let gpos = $state(true)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">🦠</span>
    <span class="font-display font-bold">革蘭氏染色：壁的厚薄決定顏色</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${gpos ? 'btn-primary' : 'btn-outline'}`} onclick={() => (gpos = true)}>革蘭氏陽性 G+</button>
      <button type="button" class={`btn btn-xs ${!gpos ? 'btn-primary' : 'btn-outline'}`} onclick={() => (gpos = false)}>革蘭氏陰性 G−</button>
    </div>
  </div>

  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
    <svg viewBox="0 0 120 110" class="mx-auto h-32 w-32 shrink-0 sm:mx-0" role="img" aria-label="細胞壁分層">
      <!-- 細胞內 -->
      <rect x="0" y="0" width="120" height="110" class="fill-base-200/40" />
      <!-- 細胞膜（最內） -->
      <rect x="0" y="86" width="120" height="10" class="fill-warning" />
      <text x="60" y="94" text-anchor="middle" class="fill-base-100 text-[7px] font-bold">細胞膜</text>
      <!-- 肽聚糖層：G+ 厚、G− 薄 -->
      {#if gpos}
        <rect x="0" y="40" width="120" height="44" class="fill-secondary/70" />
        <text x="60" y="65" text-anchor="middle" class="fill-base-100 text-[7px] font-bold">厚肽聚糖層</text>
      {:else}
        <rect x="0" y="64" width="120" height="20" class="fill-secondary/70" />
        <text x="60" y="77" text-anchor="middle" class="fill-base-100 text-[6px] font-bold">薄肽聚糖</text>
        <!-- 外膜（含 LPS），僅 G− -->
        <rect x="0" y="44" width="120" height="14" class="fill-error/60" />
        <text x="60" y="53" text-anchor="middle" class="fill-base-100 text-[6px] font-bold">外膜（LPS）</text>
      {/if}
    </svg>

    <div>
      <div class="text-xs text-base-content/55">染色結果</div>
      <span class={`badge font-bold ${gpos ? 'badge-secondary' : 'badge-error'}`}>{gpos ? '紫色（保留結晶紫）' : '紅色（番紅複染）'}</span>
      <div class="mt-2 text-xs text-base-content/70">
        {gpos ? '厚肽聚糖、無外膜，酒精脫色後仍留住結晶紫。' : '薄肽聚糖＋外膜，酒精溶掉外膜、結晶紫流失，再被番紅染紅。'}
      </div>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    分辨關鍵在<b>肽聚糖層厚薄</b>與<b>有無外膜</b>。<b>G+＝厚壁、無外膜、染紫</b>；<b>G−＝薄壁、有 LPS 外膜、染紅</b>。LPS（脂多醣）是 G− 的內毒素，毒性更強、易引起敗血症。
  </p>
</div>
