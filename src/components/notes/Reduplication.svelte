<script lang="ts">
  // 疊字語感：點一個疊字，看它給人的感覺與適用情境（填空語感題用）。
  type Redup = { word: string; feel: string; use: string; eg: string }
  const WORDS: Redup[] = [
    { word: '蕭蕭', feel: '風吹、馬鳴、落葉聲', use: '風聲、淒清', eg: '無邊落木蕭蕭下' },
    { word: '杳杳', feel: '深遠、幽暗、看不清', use: '深山遠路、幽寂', eg: '杳杳鐘聲晚' },
    { word: '寂寂', feel: '安靜、冷清、無人', use: '空寂、寂寥', eg: '寂寂江山搖落處' },
    { word: '嫋嫋', feel: '細長、輕柔搖曳', use: '炊煙、餘音、微風', eg: '餘音嫋嫋，不絕如縷' },
    { word: '漫漫', feel: '長遠、無邊無際', use: '長路、長夜', eg: '路漫漫其修遠兮' },
    { word: '淙淙', feel: '流水聲', use: '溪水、泉聲', eg: '泉水淙淙' },
  ]
  let i = $state(0)
  const w = $derived(WORDS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🍂</span>
    <span class="font-display font-bold">疊字語感（填空題用）</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each WORDS as wd, k (wd.word)}
      <button type="button" class={`btn btn-sm ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{wd.word}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 text-xl font-bold text-primary">{w.word}</div>
    <div class="text-base-content/70"><span class="text-base-content/50">感覺：</span>{w.feel}</div>
    <div class="mt-1 text-base-content/70"><span class="text-base-content/50">適用：</span>{w.use}</div>
    <div class="mt-1 rounded bg-base-100 px-2 py-1 text-base-content/75">例：{w.eg}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    填空語感題：先讀懂句子在寫什麼景或情，再逐空代入唸感覺。<b>用最有把握的一格定錨</b>，再靠「整組要一致」刪掉其他選項（這題型錯一格整組皆錯）。
  </p>
</div>
