<script lang="ts">
  // 英文閱讀四大題型：點一種，看常見題幹、對策與陷阱。
  type Q = { type: string; stem: string; how: string; trap: string }
  const TYPES: Q[] = [
    { type: '主旨題', stem: 'What is the main idea? / The passage mainly discusses… / The best title is…', how: '看首段與末段；每段第一句通常是主題句，綜合成全文核心。', trap: '選只涵蓋「其中一段」的細節，或太絕對的概括。' },
    { type: '細節題', stem: 'According to the passage… / The author states that…', how: '用關鍵字（人名、數字、專有名詞）回原文定位，逐選項比對。', trap: '同義替換、偷換主詞；選項「感覺對」但原文用別的說法。' },
    { type: '推論題', stem: 'It can be inferred that… / The author implies that…', how: '選項必須能從原文「直接推出」，不需額外知識。', trap: '加入自己的常識、超出原文；太絕對的選項。' },
    { type: 'NOT true／EXCEPT 題', stem: 'Which is NOT true / NOT mentioned / NOT true NOR implied?', how: '四個選項逐一確認：三個在文中有明說或可推出，找那個沒根據或相反的。', trap: '只檢查到一半就下結論；漏看某個選項。' },
  ]
  let i = $state(0)
  const q = $derived(TYPES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📑</span>
    <span class="font-display font-bold">英文閱讀四大題型</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each TYPES as t, k (t.type)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{t.type}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{q.type}</div>
    <div class="rounded bg-base-100 px-2 py-1 text-xs italic text-base-content/70">{q.stem}</div>
    <div class="mt-1.5 text-base-content/80"><span class="text-base-content/50">對策：</span>{q.how}</div>
    <div class="mt-2 rounded bg-error/10 px-2 py-1 text-xs text-base-content/80"><b>陷阱：</b>{q.trap}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    做題順序：<b>先看題目圈關鍵字 → 帶問題讀文章 → 回原文定位 → 比對選項</b>。答案都在文章裡，<b>不靠印象</b>選。
  </p>
</div>
