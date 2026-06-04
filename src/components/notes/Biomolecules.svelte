<script lang="ts">
  // 四大生物分子：選一類，看單體、聚合鍵結、聚合物、水解產物。
  type B = { name: string; monomer: string; bond: string; polymer: string; hydro: string }
  const BIOS: B[] = [
    { name: '醣類', monomer: '單醣（葡萄糖、果糖…）', bond: '醣苷鍵', polymer: '澱粉、纖維素、肝醣', hydro: '單醣' },
    { name: '脂質', monomer: '甘油 ＋ 脂肪酸', bond: '酯鍵', polymer: '三酸甘油酯', hydro: '甘油 ＋ 脂肪酸' },
    { name: '蛋白質', monomer: '胺基酸', bond: '胜肽鍵', polymer: '蛋白質、胜肽', hydro: '胺基酸' },
    { name: '核酸', monomer: '核苷酸', bond: '磷酸二酯鍵', polymer: 'DNA、RNA', hydro: '核苷酸' },
  ]
  let i = $state(0)
  const b = $derived(BIOS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧬</span>
    <span class="font-display font-bold">四大生物分子</span>
  </div>

  <div class="join mb-3">
    {#each BIOS as bb, k (bb.name)}
      <button type="button" class={`btn join-item btn-sm ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{bb.name}</button>
    {/each}
  </div>

  <div class="grid grid-cols-2 gap-2 text-sm">
    <div class="rounded-lg bg-base-200/60 p-2.5"><div class="text-xs text-base-content/55">單體 monomer</div><div class="font-bold">{b.monomer}</div></div>
    <div class="rounded-lg bg-primary/10 p-2.5"><div class="text-xs text-base-content/55">聚合鍵結</div><div class="font-bold text-primary">{b.bond}</div></div>
    <div class="rounded-lg bg-base-200/60 p-2.5"><div class="text-xs text-base-content/55">聚合物例子</div><div class="font-bold">{b.polymer}</div></div>
    <div class="rounded-lg bg-base-200/60 p-2.5"><div class="text-xs text-base-content/55">水解產物</div><div class="font-bold">{b.hydro}</div></div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    四類記法：<b>醣苷／酯／胜肽／磷酸二酯</b>（醣／脂／蛋／核）。組裝（聚合）是<b>縮合脫水</b>（放出 H₂O）；消化（分解）是<b>水解加水</b>。
  </p>
</div>
