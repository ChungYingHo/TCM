<script lang="ts">
  // 字根字首快查（同反義推義用）：點一個，看意義與例字。
  type Affix = { affix: string; mean: string; egs: string }
  const AFFIXES: Affix[] = [
    { affix: 'bene-', mean: '好', egs: 'benefit、benevolent、benign' },
    { affix: 'mal-', mean: '壞', egs: 'malicious、malnutrition、malignant' },
    { affix: 'omni-', mean: '全部', egs: 'omnivore、omnipotent' },
    { affix: 'pseudo-', mean: '假', egs: 'pseudoscience、pseudonym' },
    { affix: 'retro-', mean: '向後', egs: 'retrograde、retrospect' },
    { affix: 'circum-', mean: '環繞', egs: 'circumstance、circumvent' },
    { affix: 'inter-', mean: '之間', egs: 'interact、interrupt、interval' },
    { affix: 'intra-', mean: '內部', egs: 'intravenous、intramural' },
    { affix: 'extra-', mean: '外部', egs: 'extraordinary、extract' },
    { affix: 'trans-', mean: '穿越／轉換', egs: 'transmit、transform、transplant' },
    { affix: 'contra- / counter-', mean: '相對／反', egs: 'contradict、counteract' },
    { affix: '-logy', mean: '學科', egs: 'biology、psychology、cardiology' },
    { affix: '-phobia', mean: '恐懼', egs: 'arachnophobia、claustrophobia' },
    { affix: '-cracy', mean: '政治體制', egs: 'democracy、bureaucracy' },
  ]
  let i = $state(0)
  const a = $derived(AFFIXES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔡</span>
    <span class="font-display font-bold">字根字首快查（推義用）</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each AFFIXES as af, k (af.affix)}
      <button type="button" class={`btn btn-xs font-mono ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{af.affix}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex items-center gap-2"><span class="font-mono text-lg font-bold text-primary">{a.affix}</span><span class="badge badge-sm badge-secondary">{a.mean}</span></div>
    <div class="text-base-content/70">{a.egs}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    同反義題推義利器：看到 <b>bene-（好）</b>就偏正面、<b>mal-（壞）</b>就偏負面、<b>contra-／counter-（反）</b>表相對。例：benevolent（善意）↔ malicious（惡意）；benign（良性）↔ malignant（惡性）。
  </p>
</div>
