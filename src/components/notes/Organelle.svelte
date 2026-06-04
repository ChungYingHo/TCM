<script lang="ts">
  // 胞器探索（細胞工廠）：選一個胞器，看它的「工廠部門」比喻、功能、以及哪種細胞才有。
  type O = { name: string; dept: string; func: string; where: string; whereCls: string }
  const ORG: O[] = [
    { name: '細胞核', dept: 'CEO 辦公室', func: '儲存 DNA、主宰基因表現', where: '動植物皆有', whereCls: 'badge-ghost' },
    { name: '核糖體', dept: '生產線', func: '蛋白質合成（原核 70S、真核 80S）', where: '動植物皆有', whereCls: 'badge-ghost' },
    { name: '粗糙內質網', dept: '初步加工', func: '蛋白質折疊、送往高基氏體', where: '動植物皆有', whereCls: 'badge-ghost' },
    { name: '高基氏體', dept: '郵局', func: '蛋白質修飾、分類、包裝、運輸', where: '動植物皆有', whereCls: 'badge-ghost' },
    { name: '粒線體', dept: '發電廠', func: '有氧呼吸、產生 ATP（雙層膜、自有 DNA）', where: '動植物皆有', whereCls: 'badge-ghost' },
    { name: '葉綠體', dept: '太陽能板', func: '光合作用（雙層膜＋類囊體＋基質）', where: '植物特有', whereCls: 'badge-success' },
    { name: '溶體', dept: '廢物處理廠', func: '酸性水解酶（pH≈5）消化大分子與老舊胞器', where: '動物為主', whereCls: 'badge-warning' },
    { name: '大液胞', dept: '倉庫', func: '儲水、維持膨壓', where: '植物特有', whereCls: 'badge-success' },
    { name: '中心體', dept: '工務組', func: '形成紡錘絲（細胞分裂）', where: '動物特有', whereCls: 'badge-warning' },
    { name: '細胞壁', dept: '外牆', func: '支撐與保護（纖維素）', where: '植物特有', whereCls: 'badge-success' },
  ]
  let i = $state(0)
  const o = $derived(ORG[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🏭</span>
    <span class="font-display font-bold">細胞工廠：胞器探索</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each ORG as oo, k (oo.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{oo.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3">
    <div class="mb-1 flex flex-wrap items-center gap-2">
      <span class="font-bold text-primary">{o.name}</span>
      <span class="text-xs text-base-content/55">≈ {o.dept}</span>
      <span class={`badge badge-sm font-bold ${o.whereCls}`}>{o.where}</span>
    </div>
    <p class="text-sm text-base-content/75">{o.func}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    把細胞當工廠：核糖體＝生產線、內質網＋高基氏體＝加工與郵寄、粒線體＝發電廠。<b>植物特有</b>：細胞壁、葉綠體、大液胞；<b>動物為主</b>：中心體、發達的溶體。
  </p>
</div>
