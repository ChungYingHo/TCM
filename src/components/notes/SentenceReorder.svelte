<script lang="ts">
  // 句子重組示範：晉文公出亡。先看打散的分句，再逐步揭示正確順序與理由。
  type Frag = { label: string; text: string; reason: string }
  // 正確順序：乙 → 丙 → 丁 → 甲
  const ORDER: Frag[] = [
    { label: '乙', text: '將適齊', reason: '接題幹「在狄十二年」，起念要出發前往齊國。' },
    { label: '丙', text: '行過五鹿', reason: '出發後在路上，途經五鹿這地方。' },
    { label: '丁', text: '野人舉塊以與之', reason: '路上發生事件：農夫拿土塊給他（含羞辱意）。' },
    { label: '甲', text: '公子怒（欲鞭之）', reason: '受辱後的反應：公子發怒想鞭打農夫。' },
  ]
  const SHUFFLED = [ORDER[3], ORDER[0], ORDER[2], ORDER[1]] // 甲乙丁丙 打散呈現
  let step = $state(0) // 已揭示幾步
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-2 flex items-center gap-2">
    <span aria-hidden="true">🔢</span>
    <span class="font-display font-bold">句子重組示範（晉文公出亡）</span>
  </div>
  <p class="mb-3 text-xs text-base-content/60">題幹：「文公在狄十二年，____」　打散的分句：</p>

  <div class="mb-3 flex flex-wrap gap-1.5">
    {#each SHUFFLED as f (f.label)}
      <span class="badge badge-outline badge-lg">{f.label}　{f.text}</span>
    {/each}
  </div>

  <div class="space-y-1.5">
    {#each ORDER as f, k (f.label)}
      {#if k < step}
        <div class="flex gap-2 rounded-box bg-base-200/60 p-2 text-sm">
          <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">{k + 1}</span>
          <div><b>{f.label}　{f.text}</b><span class="text-base-content/70">——{f.reason}</span></div>
        </div>
      {/if}
    {/each}
  </div>

  <div class="mt-3 flex gap-2">
    {#if step < ORDER.length}
      <button type="button" class="btn btn-primary btn-sm flex-1" onclick={() => (step += 1)}>{step === 0 ? '開始排序 →' : '下一句 →'}</button>
    {:else}
      <div class="flex-1 rounded-box bg-success/15 p-2 text-center text-sm font-bold text-success">正確順序：乙 → 丙 → 丁 → 甲</div>
      <button type="button" class="btn btn-outline btn-sm" onclick={() => (step = 0)}>重來</button>
    {/if}
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    重組四招：<b>找首句</b>（有主語、能接題幹）→ <b>追代詞與連詞</b>（之／其／乃／遂／而後）→ 照<b>起因→經過→結果</b>串接 → <b>接回題幹首尾</b>驗證通順。
  </p>
</div>
