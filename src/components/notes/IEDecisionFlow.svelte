<script lang="ts">
  // 游離能大小判斷流程圖：圓角起點、黃色菱形決策、綠色結果框、是/否箭頭。純 SSR、PDF 完整。
  // 三個決策：有相同電荷 → 同週期 → 同族。
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧭</span>
    <span class="font-display font-bold">游離能大小判斷流程</span>
  </div>

  <svg viewBox="0 0 360 242" class="mx-auto block w-full max-w-md" role="img" aria-label="游離能大小判斷流程圖">
    <defs>
      <marker id="ie-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" class="fill-base-content/50" />
      </marker>
    </defs>

    <!-- 起點 -->
    <rect x="30" y="6" width="110" height="26" rx="13" fill="#fbcfe8" stroke="#db2777" stroke-width="1" />
    <text x="85" y="23" text-anchor="middle" fill="#334155" class="text-[9px] font-bold">判斷游離能大小</text>
    <line x1="85" y1="32" x2="85" y2="49" stroke="currentColor" stroke-width="1.2" class="text-base-content/50" marker-end="url(#ie-arr)" />

    <!-- 決策1 有相同電荷 -->
    <polygon points="85,50 137,74 85,98 33,74" fill="#fef08a" stroke="#ca8a04" stroke-width="1" />
    <text x="85" y="71" text-anchor="middle" fill="#334155" class="text-[8px] font-bold">有相同</text>
    <text x="85" y="81" text-anchor="middle" fill="#334155" class="text-[8px] font-bold">電荷?</text>
    <line x1="137" y1="74" x2="195" y2="74" stroke="currentColor" stroke-width="1.2" class="text-base-content/50" marker-end="url(#ie-arr)" />
    <text x="164" y="69" text-anchor="middle" fill="#dc2626" class="text-[8px] font-bold">否</text>
    <rect x="196" y="55" width="158" height="38" rx="5" fill="#bbf7d0" stroke="#16a34a" stroke-width="1" />
    <text x="275" y="71" text-anchor="middle" fill="#334155" class="text-[8px]">比電荷與金屬性</text>
    <text x="275" y="83" text-anchor="middle" fill="#334155" class="text-[8px]">金屬 IE 小、非金屬 IE 大</text>
    <line x1="85" y1="98" x2="85" y2="115" stroke="currentColor" stroke-width="1.2" class="text-base-content/50" marker-end="url(#ie-arr)" />
    <text x="93" y="110" text-anchor="middle" fill="#16a34a" class="text-[8px] font-bold">是</text>

    <!-- 決策2 同週期 -->
    <polygon points="85,116 137,140 85,164 33,140" fill="#fef08a" stroke="#ca8a04" stroke-width="1" />
    <text x="85" y="143" text-anchor="middle" fill="#334155" class="text-[8px] font-bold">同週期?</text>
    <line x1="137" y1="140" x2="195" y2="140" stroke="currentColor" stroke-width="1.2" class="text-base-content/50" marker-end="url(#ie-arr)" />
    <text x="164" y="135" text-anchor="middle" fill="#16a34a" class="text-[8px] font-bold">是</text>
    <rect x="196" y="118" width="158" height="44" rx="5" fill="#bbf7d0" stroke="#16a34a" stroke-width="1" />
    <text x="275" y="132" text-anchor="middle" fill="#334155" class="text-[8px]">左小右大、8A 最大</text>
    <text x="275" y="144" text-anchor="middle" fill="#334155" class="text-[8px]">例外 2A ＞ 3A、</text>
    <text x="275" y="155" text-anchor="middle" fill="#334155" class="text-[8px]">5A ＞ 6A</text>
    <line x1="85" y1="164" x2="85" y2="181" stroke="currentColor" stroke-width="1.2" class="text-base-content/50" marker-end="url(#ie-arr)" />
    <text x="93" y="176" text-anchor="middle" fill="#dc2626" class="text-[8px] font-bold">否</text>

    <!-- 決策3 同族 -->
    <polygon points="85,182 137,206 85,230 33,206" fill="#fef08a" stroke="#ca8a04" stroke-width="1" />
    <text x="85" y="209" text-anchor="middle" fill="#334155" class="text-[8px] font-bold">同族?</text>
    <line x1="137" y1="206" x2="195" y2="206" stroke="currentColor" stroke-width="1.2" class="text-base-content/50" marker-end="url(#ie-arr)" />
    <text x="164" y="201" text-anchor="middle" fill="#16a34a" class="text-[8px] font-bold">是</text>
    <rect x="196" y="192" width="120" height="28" rx="5" fill="#bbf7d0" stroke="#16a34a" stroke-width="1" />
    <text x="256" y="210" text-anchor="middle" fill="#334155" class="text-[9px] font-semibold">上大下小</text>
  </svg>
</div>
