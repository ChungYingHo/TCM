<script lang="ts">
  // 標點功能對照：點一個符號，看功能與例。
  type Mark = { name: string; use: string; eg: string }
  const MARKS: Mark[] = [
    { name: '頓號、', use: '並列的詞語之間（停頓最小）', eg: '筆、墨、紙、硯' },
    { name: '分號；', use: '分隔並列的分句（長句）', eg: '前事不忘，後事之師' },
    { name: '冒號：', use: '總起下文、引出說明或引語', eg: '他只有一個願望：考上中醫' },
    { name: '引號「」', use: '引文、對話、特定稱謂或反諷', eg: '他說：「我明天會到。」' },
    { name: '破折號——', use: '解釋、轉折、聲音延續', eg: '這就是答案——其實大家早就知道' },
    { name: '刪節號……', use: '省略、語氣未完', eg: '我想說的是……算了' },
  ]
  let i = $state(0)
  const c = $derived(MARKS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">✒️</span>
    <span class="font-display font-bold">標點功能對照</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each MARKS as m, k (m.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{m.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{c.name}</div>
    <div class="text-base-content/80">{c.use}</div>
    <div class="mt-1 rounded bg-base-100 px-2 py-1 text-base-content/75">{c.eg}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    頓號分隔並列詞語、逗號分隔分句；冒號總起下文；引號末標點放引號內。
  </p>
</div>
