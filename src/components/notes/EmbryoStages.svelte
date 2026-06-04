<script lang="ts">
  // 早期胚胎發育五階段：點一階，看發生的事。
  type Stage = { name: string; en: string; what: string }
  const STAGES: Stage[] = [
    { name: '受精', en: 'fertilization', what: '精子與卵子結合成受精卵（zygote），染色體恢復二倍體（2n）。' },
    { name: '卵裂', en: 'cleavage', what: '受精卵快速有絲分裂，細胞數增加但總體積幾乎不變 → 細胞（blastomere）越來越小，DNA 量增加。' },
    { name: '囊胚', en: 'blastula／blastocyst', what: '形成充滿液體的囊胚腔；哺乳類的內細胞群（ICM）→ 胚胎本體，滋養層 → 胎盤。' },
    { name: '原腸化', en: 'gastrulation', what: '細胞大規模遷移、內陷，形成外／中／內三胚層與原腸腔，確立身體軸線。' },
    { name: '器官形成', en: 'organogenesis', what: '三胚層各自分化成不同器官與組織（如外胚層 → 神經管 → 腦脊髓）。' },
  ]
  let i = $state(0)
  const s = $derived(STAGES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🐣</span>
    <span class="font-display font-bold">早期胚胎發育五階段</span>
  </div>

  <div class="mb-3 flex flex-wrap items-center gap-1">
    {#each STAGES as st, k (st.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{st.name}</button>
      {#if k < STAGES.length - 1}<span class="text-base-content/40">→</span>{/if}
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex flex-wrap items-center gap-2">
      <span class="font-bold text-primary">{s.name}</span>
      <span class="badge badge-sm badge-ghost">{s.en}</span>
    </div>
    <p class="text-base-content/75">{s.what}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    順序：受精 → 卵裂 → 囊胚 → 原腸化 → 器官形成。<b>卵裂</b>細胞越分越小（總體積不變）；<b>原腸化</b>才產生三胚層、決定體軸。
  </p>
</div>
