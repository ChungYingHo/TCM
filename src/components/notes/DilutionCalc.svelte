<script lang="ts">
  // 稀釋計算 M₁V₁ = M₂V₂：稀釋前後溶質莫耳數不變。
  // 輸入原濃度 M₁、原體積 V₁、稀釋後體積 V₂，算出稀釋後濃度 M₂。
  let M1 = $state(6) // mol/L
  let V1 = $state(100) // mL
  let V2 = $state(300) // mL

  const sM1 = $derived(Number.isFinite(M1) && M1 >= 0 ? M1 : 0)
  const sV1 = $derived(Number.isFinite(V1) && V1 >= 0 ? V1 : 0)
  const sV2 = $derived(Number.isFinite(V2) && V2 > 0 ? V2 : 1)
  const M2 = $derived((sM1 * sV1) / sV2)
  const moles = $derived((sM1 * sV1) / 1000) // mol（V 以 mL → /1000 換 L）
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">💧</span>
    <span class="font-display font-bold">稀釋計算 M₁V₁ = M₂V₂</span>
  </div>

  <div class="grid grid-cols-3 gap-2 text-sm">
    <label class="flex flex-col gap-1">原濃度 M₁ (M)
      <input type="number" min="0" step="0.1" bind:value={M1} class="input input-bordered input-sm" />
    </label>
    <label class="flex flex-col gap-1">原體積 V₁ (mL)
      <input type="number" min="0" step="10" bind:value={V1} class="input input-bordered input-sm" />
    </label>
    <label class="flex flex-col gap-1">稀釋後 V₂ (mL)
      <input type="number" min="1" step="10" bind:value={V2} class="input input-bordered input-sm" />
    </label>
  </div>

  <div class="mt-3 rounded-box bg-primary/10 p-3 text-center">
    <div class="text-xs text-base-content/55">稀釋後濃度 M₂ = M₁V₁ ÷ V₂</div>
    <div class="text-xl font-bold tabular-nums text-primary">{M2.toFixed(3)} M</div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    稀釋只是加水，<b>溶質的莫耳數不變</b>（這裡固定為 {moles.toFixed(3)} mol），所以 M₁V₁ = M₂V₂。加越多水（V₂ 越大），濃度越稀。
    注意 V₁、V₂ 單位要一致（這裡都用 mL）。
  </p>
</div>
