<script lang="ts">
  // Chargaff 法則：雙股 DNA 中 A=T、G=C。給定 G%（=C%），算出四種鹼基百分比。
  let g = $state(30) // G% = C%
  const at = $derived(50 - g) // A% = T% = (100 - 2g)/2
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧪</span>
    <span class="font-display font-bold">Chargaff 法則計算器</span>
  </div>

  <label class="mb-1 flex items-center justify-between text-sm">
    <span>設 G = <b class="text-primary tabular-nums">{g}%</b></span>
    <span class="text-xs text-base-content/55">（拖動，0–50%）</span>
  </label>
  <input type="range" min="0" max="50" step="1" bind:value={g} class="range range-primary range-xs" />

  <div class="mt-3 grid grid-cols-4 gap-2 text-center">
    <div class="rounded-lg bg-error/10 p-2"><div class="text-xs text-base-content/55">A</div><div class="font-bold tabular-nums text-error">{at}%</div></div>
    <div class="rounded-lg bg-error/10 p-2"><div class="text-xs text-base-content/55">T</div><div class="font-bold tabular-nums text-error">{at}%</div></div>
    <div class="rounded-lg bg-info/10 p-2"><div class="text-xs text-base-content/55">G</div><div class="font-bold tabular-nums text-info">{g}%</div></div>
    <div class="rounded-lg bg-info/10 p-2"><div class="text-xs text-base-content/55">C</div><div class="font-bold tabular-nums text-info">{g}%</div></div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>A＝T</b>（2 氫鍵）、<b>G＝C</b>（3 氫鍵），四者相加＝100%。所以 A＋T ＝ 100% − G% − C% ＝ {100 - 2 * g}%，再各取一半 → A＝T＝<b>{at}%</b>。題目給任一鹼基比例，其餘三個都能立刻算出。
  </p>
</div>
