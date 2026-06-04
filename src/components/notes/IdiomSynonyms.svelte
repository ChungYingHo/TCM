<script lang="ts">
  // 近義成語群：點一個「意思」，看屬於同一喻意的成語群。提醒：文言外表相近≠同義。
  type Group = { meaning: string; idioms: string[] }
  const GROUPS: Group[] = [
    { meaning: '危險、情勢危急', idioms: ['險象環生', '奔車朽索', '危如累卵', '命懸一線'] },
    { meaning: '自不量力、能力不足', idioms: ['以蠡測海', '螳臂當車', '蚍蜉撼樹'] },
    { meaning: '胸有定見、早有準備', idioms: ['成竹在胸', '胸有成竹', '運籌帷幄'] },
    { meaning: '徒勞無功、方法錯誤', idioms: ['揚湯止沸', '緣木求魚', '抱薪救火'] },
    { meaning: '話少而意思完整', idioms: ['言簡意賅', '要言不煩'] },
    { meaning: '言外另有深意', idioms: ['意在言外', '弦外之音', '言近旨遠'] },
    { meaning: '日夜奔忙', idioms: ['披星戴月', '早出晚歸', '夜以繼日'] },
  ]
  let i = $state(0)
  const g = $derived(GROUPS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔗</span>
    <span class="font-display font-bold">近義成語群：翻白話再比</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each GROUPS as gr, k (gr.meaning)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{gr.meaning}</button>
    {/each}
  </div>

  <div class="rounded-box bg-primary/10 p-3">
    <div class="mb-2 text-sm font-bold text-primary">{g.meaning}</div>
    <div class="flex flex-wrap gap-1.5">
      {#each g.idioms as id (id)}
        <span class="badge badge-outline badge-lg">{id}</span>
      {/each}
    </div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    近義配對題的破解：把每個成語<b>各翻成白話</b>再比，講同一件事才算同義。陷阱：兩個成語「都很文言」不代表意思相同（「揚湯止沸」治標 ≠「成竹在胸」有把握）。
  </p>
</div>
