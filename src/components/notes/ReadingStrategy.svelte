<script lang="ts">
  // 閱讀五招：點一種題型，看在問什麼、解題策略與陷阱。
  type Q = { type: string; ask: string; how: string; trap: string }
  const TYPES: Q[] = [
    { type: '主旨題', ask: '全文的核心意旨是什麼。', how: '先讀首段、尾段，找重複出現的關鍵詞，就是主旨。', trap: '選了只有「其中一段」提到的細節，而非全文重點。' },
    { type: '細節題', ask: '文章中明確說了什麼。', how: '抓問題關鍵詞 → 帶回原文找對應句 → 逐字比對。', trap: '「偷換主詞」「同義替換」；選項感覺對但原文用的是別的詞。' },
    { type: '推論題', ask: '作者暗示了什麼。', how: '只選「原文有直接根據」的推論（A → B 是 A 的直接涵義）。', trap: '推論超出文本；常識正確但文章沒說，也不能選。' },
    { type: '詞義題', ask: '某個詞在此處是什麼意思。', how: '代入法——把選項的意思代入原句，哪個語意通順就選。', trap: '帶入平常用法、忽略上下文；忽略文言詞性活用。' },
    { type: '句子排序', ask: '打亂的句子如何重組。', how: '找首句（無代名詞、無連接詞）→ 追連接詞（因此／然而）與代名詞。', trap: '看不出邏輯連接詞或代名詞的指涉對象。' },
  ]
  let i = $state(0)
  const q = $derived(TYPES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔍</span>
    <span class="font-display font-bold">閱讀五招：題型對策</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each TYPES as t, k (t.type)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{t.type}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{q.type}</div>
    <div class="text-base-content/70"><span class="text-base-content/50">在問：</span>{q.ask}</div>
    <div class="mt-1 text-base-content/80"><span class="text-base-content/50">策略：</span>{q.how}</div>
    <div class="mt-2 rounded bg-error/10 px-2 py-1 text-xs text-base-content/80"><b>陷阱：</b>{q.trap}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    閱讀題的鐵律：<b>不靠感覺，永遠「找原文根據」後再選</b>。文章沒說的不能推；選項「感覺合理」但原文沒寫，就是錯的。
  </p>
</div>
