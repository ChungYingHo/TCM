<script lang="ts">
  // 推論題：一個合法、三個陷阱。點一個，看判斷方式與例。
  type Item = { name: string; ok: boolean; desc: string; eg: string }
  const ITEMS: Item[] = [
    { name: '有原文直接根據', ok: true, desc: '選項的意思能從原文直接推出，不需要額外知識——這才是正確答案。', eg: '原文：「seek alternatives when conventional treatments fail to provide relief」→ 推論「病人因傳統治療無效而尋求替代」✓' },
    { name: '加入常識／額外知識', ok: false, desc: '聽起來很合理、符合常識，但原文完全沒提到——是最常見的陷阱。', eg: '「TCM 一定比西醫便宜」——原文沒提到價格，不能選。' },
    { name: '太絕對', ok: false, desc: 'always／never／all／completely／only 等字眼通常太強，除非原文也這樣說。', eg: '「Western medicine has been proven completely ineffective」——太絕對，原文沒這樣說。' },
    { name: '與原文相反', ok: false, desc: '選項說法和原文矛盾。', eg: '原文說 TCM「LACK rigorous clinical trials」，選項卻說「已通過所有臨床試驗」→ 相反。' },
  ]
  let i = $state(0)
  const it = $derived(ITEMS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🎯</span>
    <span class="font-display font-bold">推論題：一個合法，三個陷阱</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each ITEMS as item, k (item.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{item.name}</button>
    {/each}
  </div>

  <div class={`rounded-box p-3 text-sm ${it.ok ? 'bg-success/15' : 'bg-error/10'}`}>
    <div class="mb-1 flex items-center gap-2">
      <span class="font-bold text-primary">{it.name}</span>
      <span class={`badge badge-sm font-bold ${it.ok ? 'badge-success' : 'badge-error'}`}>{it.ok ? '可選' : '陷阱'}</span>
    </div>
    <p class="text-base-content/80">{it.desc}</p>
    <p class="mt-2 rounded bg-base-100 px-2 py-1 text-xs text-base-content/70">{it.eg}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    推論題鐵律：<b>選項必須能從原文直接推出</b>。原文沒提到的常識、太絕對的字眼、與原文矛盾的，全是陷阱。「可能（likely／can）」的選項有時比「一定（must）」更容易是正解。
  </p>
</div>
