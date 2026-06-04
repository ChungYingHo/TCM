<script lang="ts">
  // 分詞構句：點一種型態，看用法與例句。核心：隱藏主詞＝主句主詞，主動 V-ing／被動 p.p.。
  type Form = { name: string; when: string; eg: string }
  const FORMS: Form[] = [
    { name: 'V-ing（主動）', when: '主詞「主動」做這個動作。', eg: 'Studying hard, she passed the exam.（她主動讀書）' },
    { name: 'Having + p.p.（先完成）', when: '動作比主句「先完成」。', eg: 'Having finished the report, he left.' },
    { name: 'p.p.（被動）', when: '主詞「被動」承受這個動作。', eg: 'Strategically positioned between Asia and Europe, Canada is a hub.（加拿大被佈署）' },
  ]
  let i = $state(0)
  const f = $derived(FORMS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🪢</span>
    <span class="font-display font-bold">分詞構句：主動 V-ing／被動 p.p.</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each FORMS as fm, k (fm.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{fm.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{f.name}</div>
    <div class="text-base-content/80">{f.when}</div>
    <div class="mt-1 rounded bg-base-100 px-2 py-1 text-base-content/75">{f.eg}</div>
  </div>

  <div class="mt-3 grid gap-2 sm:grid-cols-2">
    <div class="rounded-box bg-success/10 p-2 text-xs"><b class="text-success">✓ 對：</b>Having seen the movie, <b>I</b> had a headache.（看電影的是 I＝主句主詞）</div>
    <div class="rounded-box bg-error/10 p-2 text-xs"><b class="text-error">✗ 垂懸：</b>Having seen the movie, <b>my headache</b> got worse.（頭痛不會看電影）</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    黃金規則：句首分詞片語的<b>隱藏主詞必須等於主句主詞</b>。選答案先看主句主詞是誰，確認它做得出那個動作。主動用 <b>V-ing</b>、被動用 <b>p.p.</b>。
  </p>
</div>
