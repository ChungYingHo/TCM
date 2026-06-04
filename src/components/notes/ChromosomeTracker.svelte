<script lang="ts">
  // 追蹤人類（2n=46）在各時期的「染色體數」與「DNA 量（C）」。切換有絲／減數。
  type Stage = { label: string; chrom: number; dna: string; note: string }
  const MITOSIS: Stage[] = [
    { label: 'G1 期', chrom: 46, dna: '2C', note: '每條染色體 1 個 DNA。' },
    { label: 'S／G2 期', chrom: 46, dna: '4C', note: 'DNA 複製：染色體數不變，DNA 量加倍（每條染色體變 2 個姐妹染色分體）。' },
    { label: '後期', chrom: 92, dna: '4C', note: '著絲點分裂、姐妹染色分體分開 → 暫時計 92 條。' },
    { label: '分裂完成', chrom: 46, dna: '2C', note: '兩個子細胞各 46 條，與母細胞相同。' },
  ]
  const MEIOSIS: Stage[] = [
    { label: 'G1 期', chrom: 46, dna: '2C', note: '每條染色體 1 個 DNA。' },
    { label: 'S／G2 期', chrom: 46, dna: '4C', note: 'DNA 複製：染色體數不變，DNA 量加倍。' },
    { label: '減數 I 完成', chrom: 23, dna: '2C', note: '同源染色體分離 → 染色體數在此減半（每條仍含 2 個分體）。' },
    { label: '減數 II 完成', chrom: 23, dna: '1C', note: '姐妹染色分體分離 → 每條染色體只剩 1 個 DNA。' },
  ]
  let meiosis = $state(false)
  let i = $state(0)
  const stages = $derived(meiosis ? MEIOSIS : MITOSIS)
  const s = $derived(stages[Math.min(i, stages.length - 1)])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">🧬</span>
    <span class="font-display font-bold">染色體數／DNA 量追蹤（人類 2n=46）</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${!meiosis ? 'btn-primary' : 'btn-outline'}`} onclick={() => { meiosis = false; i = 0 }}>有絲分裂</button>
      <button type="button" class={`btn btn-xs ${meiosis ? 'btn-primary' : 'btn-outline'}`} onclick={() => { meiosis = true; i = 0 }}>減數分裂</button>
    </div>
  </div>

  <div class="mb-3 flex flex-wrap items-center gap-1">
    {#each stages as st, k (st.label)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{st.label}</button>
      {#if k < stages.length - 1}<span class="text-base-content/40">→</span>{/if}
    {/each}
  </div>

  <div class="grid grid-cols-2 gap-2 text-center">
    <div class="rounded-box bg-base-200/60 p-3">
      <div class="text-xs text-base-content/55">染色體數</div>
      <div class="text-2xl font-bold tabular-nums text-primary">{s.chrom}</div>
    </div>
    <div class="rounded-box bg-base-200/60 p-3">
      <div class="text-xs text-base-content/55">DNA 量</div>
      <div class="text-2xl font-bold tabular-nums text-secondary">{s.dna}</div>
    </div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">{s.note}</p>
</div>
