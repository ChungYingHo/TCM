<script lang="ts">
  // 光反應的兩個光系統與環式路徑：點一個，看反應中心、電子來源、產物。
  type Mode = { key: string; name: string; center: string; eSource: string; products: string; note: string }
  const MODES: Mode[] = [
    {
      key: 'psii', name: '光系統 II（PSII）', center: 'P680（吸 680 nm）',
      eSource: '水的光解：2H₂O → 4H⁺ + 4e⁻ + O₂（補回 P680 失去的電子）',
      products: '推動電子傳遞鏈產 ATP、放出 O₂',
      note: '唯一會分解水、放 O₂ 的地方。',
    },
    {
      key: 'psi', name: '光系統 I（PSI）', center: 'P700（吸 700 nm）',
      eSource: '由 PSII 經電子傳遞鏈傳來的電子',
      products: '把電子交給 NADP⁺ → 產 NADPH',
      note: 'NADPH 的唯一來源。',
    },
    {
      key: 'cyclic', name: '環式光合磷酸化', center: '只用 PSI（P700）',
      eSource: '電子繞回 PSI，不從水來',
      products: '只產 ATP',
      note: '不分解水、不產 NADPH、不放 O₂。「PSII 行環式磷酸化」是常見錯誤敘述。',
    },
  ]
  let i = $state(0)
  const m = $derived(MODES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">☀️</span>
    <span class="font-display font-bold">光反應：兩個光系統</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each MODES as md, k (md.key)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{md.name}</button>
    {/each}
  </div>

  <div class="space-y-2 rounded-box bg-base-200/60 p-3 text-sm">
    <div class="font-bold text-primary">{m.name}</div>
    <div><span class="text-base-content/55">反應中心：</span>{m.center}</div>
    <div><span class="text-base-content/55">電子來源：</span>{m.eSource}</div>
    <div><span class="text-base-content/55">產物：</span>{m.products}</div>
    <div class="rounded bg-warning/15 px-2 py-1 text-xs text-base-content/75">{m.note}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    順序：<b>PSII →</b> 電子傳遞鏈（產 ATP）<b>→ PSI</b>（產 NADPH）。編號反直覺，PSII 先作用。非環式（直線式）兩者都用、會放 O₂＋產 NADPH；環式只用 PSI、只產 ATP。
  </p>
</div>
