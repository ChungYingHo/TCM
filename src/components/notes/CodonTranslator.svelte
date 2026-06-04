<script lang="ts">
  // mRNA 讀碼：從 AUG 起，每 3 個鹼基一個密碼子，遇終止密碼子停。數出胺基酸個數。
  const CODON: Record<string, string> = {
    AUG: 'Met（起始）', UUU: 'Phe', GAA: 'Glu', GCU: 'Ala', UAC: 'Tyr',
    AAA: 'Lys', CCC: 'Pro', GGG: 'Gly', CUG: 'Leu', UGG: 'Trp',
    UAA: '終止', UAG: '終止', UGA: '終止',
  }
  type Preset = { label: string; seq: string }
  const PRESETS: Preset[] = [
    { label: '範例一', seq: 'AUGUUUGAAUAA' },
    { label: '範例二', seq: 'AUGGCUUACUGA' },
    { label: '範例三', seq: 'AUGAAACCCGGGUAG' },
  ]
  let pi = $state(0)
  const codons = $derived.by(() => {
    const s = PRESETS[pi].seq
    const out: { c: string; aa: string; stop: boolean }[] = []
    for (let i = 0; i + 3 <= s.length; i += 3) {
      const c = s.slice(i, i + 3)
      const aa = CODON[c] ?? '?'
      const stop = aa === '終止'
      out.push({ c, aa, stop })
      if (stop) break
    }
    return out
  })
  const aaCount = $derived(codons.filter((x) => !x.stop).length)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">📖</span>
    <span class="font-display font-bold">mRNA 讀碼器</span>
    <div class="join ml-auto">
      {#each PRESETS as p, k (p.label)}
        <button type="button" class={`btn btn-xs ${pi === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (pi = k)}>{p.label}</button>
      {/each}
    </div>
  </div>

  <div class="flex flex-wrap gap-2">
    {#each codons as c, k (k)}
      <div class={`rounded-lg border px-2 py-1 text-center ${c.stop ? 'border-error/40 bg-error/10' : k === 0 ? 'border-success/40 bg-success/10' : 'border-base-300 bg-base-200/60'}`}>
        <div class="font-mono text-sm font-bold">{c.c}</div>
        <div class="text-[0.65rem] text-base-content/60">{c.aa}</div>
      </div>
    {/each}
  </div>

  <div class="mt-3 rounded-box bg-primary/10 p-3 text-center text-sm">
    這條 mRNA 轉譯出 <span class="text-lg font-bold tabular-nums text-primary">{aaCount}</span> 個胺基酸（終止密碼子不算）。
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    從 <b>AUG</b>（起始、編碼 Met）開始，每 3 個鹼基讀一個密碼子；讀到 <b>UAA／UAG／UGA</b>（終止）就停，終止密碼子不編碼胺基酸。所以胜肽長度＝起始到終止之間的密碼子數。
  </p>
</div>
