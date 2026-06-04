<script lang="ts">
  // 消化道各段：點一段，看主要酵素、作用底物與最適 pH。
  type Seg = { region: string; enzyme: string; substrate: string; ph: string; phCls: string }
  const SEGS: Seg[] = [
    { region: '口腔', enzyme: '唾液澱粉酶', substrate: '澱粉 → 麥芽糖（也能分解肝醣）', ph: '中性 ~7', phCls: 'badge-success' },
    { region: '胃', enzyme: '胃蛋白酶（pepsin）', substrate: '蛋白質 → 短肽（非胺基酸）', ph: '強酸 ~2', phCls: 'badge-error' },
    { region: '小腸（胰液）', enzyme: '胰澱粉酶、胰蛋白酶、胰脂肪酶', substrate: '澱粉／蛋白質／脂質', ph: '鹼性 ~8', phCls: 'badge-info' },
    { region: '小腸（腸壁）', enzyme: '麥芽糖酶、蔗糖酶、乳糖酶、胺肽酶', substrate: '雙糖 → 單糖；短肽 → 胺基酸', ph: '鹼性', phCls: 'badge-info' },
    { region: '大腸', enzyme: '（無消化酵素）', substrate: '吸收水分與電解質、形成糞便', ph: '—', phCls: 'badge-ghost' },
  ]
  let i = $state(1)
  const s = $derived(SEGS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🍽️</span>
    <span class="font-display font-bold">消化道：各段酵素與 pH</span>
  </div>

  <div class="mb-3 flex flex-wrap items-center gap-1">
    {#each SEGS as sg, k (sg.region)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{sg.region}</button>
      {#if k < SEGS.length - 1}<span class="text-base-content/40">→</span>{/if}
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex flex-wrap items-center gap-2">
      <span class="font-bold text-primary">{s.region}</span>
      <span class={`badge badge-sm font-bold ${s.phCls}`}>pH {s.ph}</span>
    </div>
    <div class="text-base-content/70"><span class="text-base-content/50">酵素：</span>{s.enzyme}</div>
    <div class="mt-1 text-base-content/80"><span class="text-base-content/50">作用：</span>{s.substrate}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    澱粉酶只在<b>中性</b>作用（進胃就被胃酸抑制）；胃蛋白酶需<b>強酸（pH 2）</b>活化、只切到短肽；小腸是主要消化吸收場所，<b>胰液鹼性中和胃酸</b>後完成三大養分的水解。
  </p>
</div>
