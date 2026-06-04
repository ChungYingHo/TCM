<script lang="ts">
  // 五類抗體：點一個，看主要功能與記憶關鍵字。配對題訣竅：對不上的那個通常是 IgD。
  type Ig = { name: string; key: string; fn: string }
  const IGS: Ig[] = [
    { name: 'IgG', key: '最多、過胎盤', fn: '血清中含量最多；唯一能通過胎盤保護新生兒；長效保護、促進凝集。' },
    { name: 'IgM', key: '最早', fn: '初次免疫反應最先合成的抗體；五聚體，促進細菌凝集與溶解。' },
    { name: 'IgA', key: '分泌液、母乳', fn: '存在於唾液、淚液、母乳、腸道等體外分泌物；新生兒可從母乳獲得。' },
    { name: 'IgE', key: '過敏', fn: '引起第 I 型過敏反應；與肥大細胞結合，促進組織胺釋放。' },
    { name: 'IgD', key: '功能最模糊', fn: '主要在 B 細胞表面當受體；沒有明確的獨立效應功能（配對題常是「對不上」的那個）。' },
  ]
  let i = $state(0)
  const g = $derived(IGS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🛡️</span>
    <span class="font-display font-bold">五類抗體（免疫球蛋白）</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each IGS as ig, k (ig.name)}
      <button type="button" class={`btn btn-xs font-mono ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{ig.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex items-center gap-2">
      <span class="font-mono font-bold text-primary">{g.name}</span>
      <span class="badge badge-sm badge-secondary font-bold">{g.key}</span>
    </div>
    <p class="text-base-content/75">{g.fn}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    配對題訣竅：先把有特徵的四個對上——<b>IgG 最多／過胎盤、IgM 最早、IgA 分泌液、IgE 過敏</b>，剩下「對不上任何描述」的那個通常就是 <b>IgD</b>。
  </p>
</div>
