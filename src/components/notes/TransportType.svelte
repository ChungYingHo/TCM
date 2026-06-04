<script lang="ts">
  // 運輸方式判斷：選一個情境，看屬於哪種運輸、順/逆濃度、是否耗能、是否需要膜蛋白。
  type T = { case: string; type: string; dir: string; atp: boolean; protein: boolean }
  const CASES: T[] = [
    { case: 'O₂、CO₂ 穿過磷脂層', type: '簡單擴散', dir: '順濃度', atp: false, protein: false },
    { case: '葡萄糖進入紅血球（GLUT）', type: '促進擴散', dir: '順濃度', atp: false, protein: true },
    { case: '水經由水通道進出', type: '滲透', dir: '順濃度（往水勢低處）', atp: false, protein: true },
    { case: '鈉鉀幫浦（3Na⁺出、2K⁺入）', type: '初級主動運輸', dir: '逆濃度', atp: true, protein: true },
    { case: '小腸吸葡萄糖（SGLT，搭 Na⁺）', type: '次級主動運輸', dir: '逆濃度（靠 Na⁺ 梯度）', atp: true, protein: true },
    { case: '神經末梢釋放神經傳遞物', type: '胞吐（exocytosis）', dir: '大分子外送', atp: true, protein: false },
  ]
  let i = $state(0)
  const c = $derived(CASES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🚪</span>
    <span class="font-display font-bold">運輸方式判斷</span>
  </div>

  <div class="mb-3 flex flex-col gap-1 text-sm">
    {#each CASES as cc, k (cc.case)}
      <button type="button" class={`rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${i === k ? 'bg-primary/15 font-semibold text-primary' : 'bg-base-200/50 hover:bg-base-200'}`} onclick={() => (i = k)}>{cc.case}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3">
    <div class="mb-2 font-bold text-primary">{c.type}</div>
    <div class="flex flex-wrap gap-1.5">
      <span class="badge badge-sm">{c.dir}</span>
      <span class={`badge badge-sm font-bold ${c.atp ? 'badge-error' : 'badge-success'}`}>{c.atp ? '耗 ATP（主動）' : '不耗能（被動）'}</span>
      <span class={`badge badge-sm ${c.protein ? 'badge-warning' : 'badge-ghost'}`}>{c.protein ? '需膜蛋白' : '不需膜蛋白'}</span>
    </div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    口訣：<b>順濃度＝被動（不耗能）、逆濃度＝主動（耗 ATP）</b>。簡單擴散不需蛋白；促進擴散、幫浦都需要膜蛋白。胞吞胞吐搬大分子，也是耗能的主動過程。
  </p>
</div>
