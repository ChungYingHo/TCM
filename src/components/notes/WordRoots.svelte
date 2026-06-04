<script lang="ts">
  // 字根字首：點一個，看意義與例字。陌生字靠拆解推義。
  type Root = { affix: string; mean: string; egs: string }
  const ROOTS: Root[] = [
    { affix: 'un- / in- / im- / ir-', mean: '否定', egs: 'unhappy、incomplete、impossible、irregular' },
    { affix: 're-', mean: '再次', egs: 'review、rebuild、reconsider' },
    { affix: 'pre-', mean: '之前', egs: 'predict、prevent、precaution' },
    { affix: 'mis-', mean: '錯誤', egs: 'misunderstand、misjudge' },
    { affix: 'over-', mean: '過度', egs: 'overestimate、overload' },
    { affix: 'sub-', mean: '在下／次要', egs: 'submarine、substandard' },
    { affix: 'bene-', mean: '好的', egs: 'benefit、beneficial' },
    { affix: 'mal-', mean: '壞的', egs: 'malfunction、malnutrition、malignant' },
    { affix: '-cide', mean: '殺', egs: 'homicide、pesticide' },
    { affix: '-port', mean: '攜帶', egs: 'transport、import、export' },
    { affix: '-dict', mean: '說', egs: 'predict、contradict、dictate' },
    { affix: '-vis / -vid', mean: '看', egs: 'visible、evidence、supervise' },
    { affix: '-mit / -miss', mean: '送', egs: 'transmit、mission、submit、omit' },
    { affix: '-tion / -sion', mean: '名詞化', egs: 'action、decision、invasion' },
    { affix: '-ize / -ify', mean: '動詞化', egs: 'realize、simplify' },
  ]
  let i = $state(0)
  const r = $derived(ROOTS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧬</span>
    <span class="font-display font-bold">字根字首拆解推義</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each ROOTS as ro, k (ro.affix)}
      <button type="button" class={`btn btn-xs font-mono ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{ro.affix}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex items-center gap-2"><span class="font-mono text-lg font-bold text-primary">{r.affix}</span><span class="badge badge-sm badge-secondary">{r.mean}</span></div>
    <div class="text-base-content/70">{r.egs}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    遇到陌生字先<b>拆字根字首</b>縮小範圍：<b>否定（un-／in-）、好（bene-）、壞（mal-）、再次（re-）</b>。例：alleviate → levi（輕）＝使變輕＝緩解；exacerbate → acer（尖苦）＝使更苦＝惡化。
  </p>
</div>
