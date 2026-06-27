<script lang="ts">
  // 蛋白質分泌路徑：核糖體 → 粗糙內質網 → 高基氏體 → 分泌小泡 → 胞外。點每一站看它做什麼。
  type S = { stop: string; does: string }
  const STEPS: S[] = [
    { stop: '核糖體', does: '依 mRNA 把胺基酸接成多肽鏈（合成）' },
    { stop: '粗糙內質網', does: '多肽進入內質網腔、初步折疊與品管，再以小泡送出' },
    { stop: '高基氏體', does: '修飾（加糖等）、分類、包裝成分泌小泡（郵局）' },
    { stop: '分泌小泡', does: '帶著成熟蛋白質移到細胞膜' },
    { stop: '胞外', does: '小泡與細胞膜融合、把蛋白質釋出（胞吐 exocytosis）' },
  ]
  let i = $state(0)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📦</span>
    <span class="font-display font-bold">蛋白質分泌路徑</span>
  </div>

  <div class="mb-3 flex flex-wrap items-center gap-1">
    {#each STEPS as s, k (s.stop)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{s.stop}</button>
      {#if k < STEPS.length - 1}<span class="text-base-content/40">→</span>{/if}
    {/each}
  </div>

  <div class="rounded-box bg-primary/10 p-3 text-sm">
    <span class="font-bold text-primary">{STEPS[i].stop}</span>：{STEPS[i].does}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    需要大量<b>分泌蛋白質</b>的細胞（如胰腺腺泡細胞），會有特別多的<b>粗糙內質網</b>與<b>高基氏體</b>。路徑：核糖體（合成）→ 粗糙內質網（折疊）→ 高基氏體（修飾包裝）→ 小泡 → 胞外。
  </p>
</div>
