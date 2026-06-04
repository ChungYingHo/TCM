<script lang="ts">
  // 連接詞依邏輯：點一種邏輯關係，看常用連接詞與例句。附連接副詞 vs 從屬連接詞提醒。
  type Logic = { name: string; words: string; eg: string }
  const LOGICS: Logic[] = [
    { name: '因果（原因）', words: 'because、since、as（從屬連接詞，引導原因副詞子句）', eg: 'Because it rained, we stayed inside.' },
    { name: '結果', words: 'therefore、thus、hence、consequently（連接副詞，放分號／句號後）', eg: 'He broke the law; therefore, he was punished.' },
    { name: '轉折', words: 'although／though（從屬）；however、yet、but（連接副詞／對等）', eg: 'Although it was late, she kept working.' },
    { name: '條件', words: 'if、unless（＝if…not）、as long as', eg: 'Unless you study, you will fail.' },
    { name: '並列', words: 'and、both…and、not only…but also', eg: 'She is both smart and hardworking.' },
    { name: '時間', words: 'when、while、after、before、once', eg: 'When she arrived, the meeting had started.' },
  ]
  let i = $state(0)
  const l = $derived(LOGICS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔌</span>
    <span class="font-display font-bold">連接詞依邏輯關係選用</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each LOGICS as lo, k (lo.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{lo.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{l.name}</div>
    <div class="text-base-content/80">{l.words}</div>
    <div class="mt-1 rounded bg-base-100 px-2 py-1 text-base-content/75">{l.eg}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    先判斷前後句是<b>同方向</b>（因果／並列）還是<b>反方向</b>（轉折），再選詞。關鍵差別：<b>從屬連接詞</b>（because、although）直接接主謂；<b>連接副詞</b>（therefore、however）要放在<b>分號／句號後</b>，不能用逗號連兩句。
  </p>
</div>
