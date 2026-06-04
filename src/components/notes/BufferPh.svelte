<script lang="ts">
  // 緩衝 pH（Henderson-Hasselbalch）：pH = pKa + log([鹽]/[酸])。
  // 調 pKa、鹽、酸，看 pH；鹽=酸時 pH=pKa，有效範圍 pKa±1。
  let pKa = $state(4.74)
  let salt = $state(0.1) // 共軛鹼濃度
  let acid = $state(0.1) // 弱酸濃度

  const sSalt = $derived(Number.isFinite(salt) && salt > 0 ? salt : 1e-6)
  const sAcid = $derived(Number.isFinite(acid) && acid > 0 ? acid : 1e-6)
  const pH = $derived(pKa + Math.log10(sSalt / sAcid))
  const inRange = $derived(Math.abs(pH - pKa) <= 1)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧂</span>
    <span class="font-display font-bold">緩衝 pH：pH = pKa + log(鹽/酸)</span>
  </div>

  <div class="grid grid-cols-3 gap-2 text-sm">
    <label class="flex flex-col gap-1">pKa
      <input type="number" step="0.1" bind:value={pKa} class="input input-bordered input-sm" />
    </label>
    <label class="flex flex-col gap-1">[鹽] (M)
      <input type="number" min="0.001" step="0.05" bind:value={salt} class="input input-bordered input-sm" />
    </label>
    <label class="flex flex-col gap-1">[酸] (M)
      <input type="number" min="0.001" step="0.05" bind:value={acid} class="input input-bordered input-sm" />
    </label>
  </div>

  <div class="mt-3 rounded-box bg-primary/10 p-3 text-center">
    <div class="text-xs text-base-content/55">pH = {pKa} + log({sSalt}/{sAcid})</div>
    <div class="text-xl font-bold tabular-nums text-primary">pH = {pH.toFixed(2)}</div>
    <div class="mt-1 text-xs {inRange ? 'text-success' : 'text-error'}">{inRange ? '✓ 在有效緩衝範圍（pKa ± 1）內' : '✗ 超出有效緩衝範圍（pKa ± 1）'}</div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>鹽 = 酸時 pH = pKa</b>（log 1 = 0），這是最佳緩衝點。鹽多一點 pH 升、酸多一點 pH 降，但只在 <b>pKa ± 1</b> 範圍內緩衝才有效。加少量強酸會消耗鹽、少量強鹼會消耗酸，pH 只微動。
  </p>
</div>
