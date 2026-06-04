<script lang="ts">
  // 假設語氣四型：點一型，看觸發條件、結構與例句。
  type Case = { name: string; trigger: string; form: string; eg: string }
  const CASES: Case[] = [
    {
      name: '建議／要求 that 子句', trigger: 'suggest／recommend／demand／insist；It is essential／necessary that …',
      form: 'that + S + 原形 V（被動 = be + p.p.）',
      eg: 'The doctor recommended that he take the medicine. / It is essential that the report be submitted.',
    },
    {
      name: '與現在相反', trigger: '假設與現在事實相反',
      form: 'If + 過去式 …, S would／could + 原形 V',
      eg: 'If I were you, I would accept it.',
    },
    {
      name: '與過去相反', trigger: '假設與過去事實相反',
      form: 'If + had + p.p. …, S would／could have + p.p.',
      eg: 'If he had studied, he would have passed.',
    },
    {
      name: '倒裝（省略 If）', trigger: '把 If 省略、助動詞提前',
      form: 'Had／Were／Should + S …（= If 子句）',
      eg: 'Had he studied … = If he had studied … ；Were I you … ；Should you need help …',
    },
  ]
  let i = $state(0)
  const c = $derived(CASES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔮</span>
    <span class="font-display font-bold">假設語氣四型</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each CASES as ca, k (ca.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{ca.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{c.name}</div>
    <div class="text-base-content/70"><span class="text-base-content/50">觸發：</span>{c.trigger}</div>
    <div class="mt-1 text-base-content/80"><span class="text-base-content/50">結構：</span><span class="font-mono">{c.form}</span></div>
    <div class="mt-1 rounded bg-base-100 px-2 py-1 text-base-content/75">{c.eg}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    兩大高頻陷阱：① <b>建議／要求／重要 that 子句動詞用原形</b>（藏了 should），被動就是 <b>be + p.p.</b>。② 句首 <b>Had／Were／Should + 主詞</b> = 省略 If 的<b>倒裝假設句</b>。
  </p>
</div>
