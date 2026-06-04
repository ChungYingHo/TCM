<script lang="ts">
  // 三大養分的終產物與吸收路徑：醣類/蛋白質走血液（門靜脈→肝）；脂質走淋巴（乳糜管），繞過肝。
  type N = { name: string; product: string; route: 'blood' | 'lymph'; detail: string }
  const NUTRIENTS: N[] = [
    { name: '澱粉（醣類）', product: '葡萄糖', route: 'blood', detail: '由絨毛細胞 SGLT 共同運輸（伴隨 Na⁺）主動吸收 → 微血管 → 門靜脈 → 肝臟。' },
    { name: '蛋白質', product: '胺基酸', route: 'blood', detail: '同樣靠 Na⁺ 共同運輸吸收 → 微血管 → 門靜脈 → 肝臟。' },
    { name: '脂質（三酸甘油酯）', product: '脂肪酸 + 甘油', route: 'lymph', detail: '在腸壁重組三酸甘油酯、包成乳糜微粒 → 進乳糜管（淋巴）→ 胸管 → 體循環，繞過肝臟。' },
  ]
  let i = $state(2)
  const n = $derived(NUTRIENTS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🥩</span>
    <span class="font-display font-bold">三大養分：終產物與吸收路徑</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each NUTRIENTS as nu, k (nu.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{nu.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-2 flex flex-wrap items-center gap-2">
      <span class="font-bold text-primary">{n.name}</span>
      <span class="text-base-content/50">→ 終產物</span>
      <span class="badge badge-sm badge-secondary font-bold">{n.product}</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-base-content/50">吸收路徑：</span>
      <span class={`badge badge-sm font-bold ${n.route === 'blood' ? 'badge-error' : 'badge-info'}`}>{n.route === 'blood' ? '血液（門靜脈→肝）' : '淋巴（乳糜管，繞過肝）'}</span>
    </div>
    <p class="mt-2 text-base-content/75">{n.detail}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    記憶重點：<b>只有脂質走淋巴（乳糜管）</b>、繞過肝臟直接進胸管；醣類與蛋白質的小分子走<b>血液門靜脈到肝</b>。葡萄糖與胺基酸的吸收都是<b>伴隨 Na⁺ 的主動運輸</b>。
  </p>
</div>
