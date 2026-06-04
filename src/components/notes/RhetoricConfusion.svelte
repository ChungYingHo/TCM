<script lang="ts">
  // 最易混淆的三組修辭：點一組，左右對照辨別關鍵。
  type Pair = { title: string; left: { name: string; rows: string[] }; right: { name: string; rows: string[] }; labels: string[] }
  const PAIRS: Pair[] = [
    {
      title: '譬喻 vs 借代',
      labels: ['本體', '喻詞', '例'],
      left: { name: '譬喻', rows: ['存在（明說或暗示）', '有（像／如／彷彿／是）', '她的笑容像陽光'] },
      right: { name: '借代', rows: ['不出現，完全被替換', '無', '六宮粉黛無顏色（粉黛代美女）'] },
    },
    {
      title: '擬人 vs 轉品',
      labels: ['核心', '改變的是', '例'],
      left: { name: '轉化（擬人）', rows: ['無生物有了人的感情／動作', '事物被當人寫', '芭蕉惹驟雨（芭蕉「惹」事）'] },
      right: { name: '轉品（活用）', rows: ['字的詞性在句中臨時改變', '詞性（如名詞→動詞）', '春風風人（第二「風」轉動詞）'] },
    },
    {
      title: '排比 vs 對偶',
      labels: ['組數', '字數', '例'],
      left: { name: '排比', rows: ['三組以上', '不一定相等', '芭蕉惹驟雨，門環惹銅綠，惹了你'] },
      right: { name: '對偶', rows: ['恰好兩組', '上下句字數相等', '蕭蕭下，滾滾來'] },
    },
  ]
  let i = $state(0)
  const p = $derived(PAIRS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚖️</span>
    <span class="font-display font-bold">最易混淆的三組修辭</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each PAIRS as pr, k (pr.title)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{pr.title}</button>
    {/each}
  </div>

  <div class="grid grid-cols-[auto_1fr_1fr] gap-1 text-sm">
    <div></div>
    <div class="rounded-t bg-primary/15 p-2 text-center font-bold text-primary">{p.left.name}</div>
    <div class="rounded-t bg-secondary/15 p-2 text-center font-bold text-secondary">{p.right.name}</div>
    {#each p.labels as label, k (label)}
      <div class="flex items-center justify-end pr-2 text-xs text-base-content/55">{label}</div>
      <div class="rounded bg-base-200/60 p-2 text-base-content/80">{p.left.rows[k]}</div>
      <div class="rounded bg-base-200/60 p-2 text-base-content/80">{p.right.rows[k]}</div>
    {/each}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    對偶判斷要同時做到<b>字數相等＋詞性相對＋結構相對</b>，缺一就不是對仗。映襯（對比）強調<b>意義對立</b>；對偶強調<b>形式對稱</b>，語意不一定相反。
  </p>
</div>
