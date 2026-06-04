<script lang="ts">
  // 鈉鉀幫浦：每個循環 3 Na⁺ 泵出、2 K⁺ 泵入，淨送出 1 個正電荷 → 維持細胞內負電位。
  let cycles = $state(1)
  const naOut = $derived(cycles * 3)
  const kIn = $derived(cycles * 2)
  const netOut = $derived(cycles * 1)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔋</span>
    <span class="font-display font-bold">鈉鉀幫浦：3 出 2 進</span>
  </div>

  <svg viewBox="0 0 200 96" class="w-full max-w-sm" role="img" aria-label="鈉鉀幫浦示意">
    <!-- 膜 -->
    <rect x="0" y="40" width="200" height="16" class="fill-warning/40" />
    <text x="4" y="14" class="fill-base-content/45 text-[8px]">細胞外</text>
    <text x="4" y="90" class="fill-base-content/45 text-[8px]">細胞內</text>
    <!-- 幫浦 -->
    <rect x="86" y="34" width="28" height="28" rx="4" class="fill-primary/70" />
    <!-- 3 Na⁺ 向外（上） -->
    <text x="150" y="26" text-anchor="middle" class="fill-error text-[9px] font-bold">3 Na⁺ ↑出</text>
    <!-- 2 K⁺ 向內（下） -->
    <text x="150" y="78" text-anchor="middle" class="fill-info text-[9px] font-bold">2 K⁺ ↓進</text>
    <!-- ATP -->
    <text x="50" y="54" text-anchor="middle" class="fill-base-content/60 text-[8px]">ATP</text>
  </svg>

  <label class="mt-3 flex items-center justify-between text-sm">
    <span>循環次數 = <b class="text-primary tabular-nums">{cycles}</b></span>
  </label>
  <input type="range" min="1" max="10" step="1" bind:value={cycles} class="range range-primary range-xs" />

  <div class="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
    <div class="rounded-lg bg-error/10 p-2"><div class="text-xs text-base-content/55">Na⁺ 泵出</div><div class="font-bold tabular-nums text-error">{naOut}</div></div>
    <div class="rounded-lg bg-info/10 p-2"><div class="text-xs text-base-content/55">K⁺ 泵入</div><div class="font-bold tabular-nums text-info">{kIn}</div></div>
    <div class="rounded-lg bg-primary/10 p-2"><div class="text-xs text-base-content/55">淨送出正電荷</div><div class="font-bold tabular-nums text-primary">{netOut}</div></div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    每水解 1 個 ATP：<b>3 個 Na⁺ 泵出、2 個 K⁺ 泵入</b>，淨送出 1 個正電荷 → 細胞內相對為負。再加上靜止時 K⁺ 外漏，把膜電位穩在約 <b>−70 mV</b>（最接近 K⁺ 平衡電位 −90 mV，但因少量 Na⁺ 漏入而稍偏正）。
  </p>
</div>
