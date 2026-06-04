<script lang="ts">
  // 三種子句：點一種，看功能、引導詞與例句。附間接問句語序提醒。
  type Clause = { name: string; role: string; leads: string; eg: string }
  const CLAUSES: Clause[] = [
    { name: '名詞子句', role: '當主詞、受詞或補語。', leads: 'that、whether（是否）、wh- 疑問詞（what／why／how…）', eg: 'I don’t know why he left.（why 子句當 know 的受詞）' },
    { name: '副詞子句', role: '修飾動詞，表時間／原因／讓步／條件。', leads: 'when／while／after（時間）、because／since（原因）、although（讓步）、if／unless（條件）', eg: 'Although it rained, we went out.' },
    { name: '形容詞（關係）子句', role: '修飾前面的名詞（先行詞）。', leads: 'who／whom／whose／which／that', eg: 'the drug which was approved' },
  ]
  let i = $state(0)
  const c = $derived(CLAUSES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧩</span>
    <span class="font-display font-bold">三種子句的功能與引導詞</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each CLAUSES as cl, k (cl.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{cl.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{c.name}</div>
    <div class="text-base-content/80">{c.role}</div>
    <div class="mt-1 text-base-content/70"><span class="text-base-content/50">引導詞：</span>{c.leads}</div>
    <div class="mt-1 rounded bg-base-100 px-2 py-1 text-base-content/75">{c.eg}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    高頻陷阱：<b>間接問句用直述語序</b>（S + V），不倒裝——I wonder <b>where he is</b>（不是 where is he）。<b>what</b> ＝ the thing(s) that，可引導名詞子句、也可當限定詞接名詞（what forms of life），且不能用 that 代替。
  </p>
</div>
