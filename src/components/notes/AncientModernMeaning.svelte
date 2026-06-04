<script lang="ts">
  // 古今異義對照：點一個詞，比較古義與今義，提醒別用現代意思硬解古文。
  type Word = { word: string; ancient: string; modern: string; gap: string }
  const WORDS: Word[] = [
    { word: '走', ancient: '奔跑（走馬看花）', modern: '步行', gap: '小' },
    { word: '妻子', ancient: '妻與子女', modern: '配偶（單指妻）', gap: '大' },
    { word: '犧牲', ancient: '祭祀用的牲畜', modern: '為理想放棄生命', gap: '很大' },
    { word: '交通', ancient: '互相往來溝通', modern: '道路運輸', gap: '大' },
    { word: '感激', ancient: '感動激盪（情緒）', modern: '感謝（社交）', gap: '中' },
    { word: '不過', ancient: '不超過', modern: '表轉折「但是」', gap: '大' },
    { word: '可以', ancient: '可以（憑藉）此；能夠', modern: '允許、辦得到', gap: '中' },
  ]
  let i = $state(0)
  const w = $derived(WORDS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⏳</span>
    <span class="font-display font-bold">古今異義對照</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each WORDS as wd, k (wd.word)}
      <button type="button" class={`btn btn-sm font-bold ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{wd.word}</button>
    {/each}
  </div>

  <div class="grid gap-2 sm:grid-cols-2">
    <div class="rounded-box bg-warning/10 p-3">
      <div class="text-xs font-bold text-warning">古義</div>
      <p class="mt-1 text-sm text-base-content/80">{w.ancient}</p>
    </div>
    <div class="rounded-box bg-info/10 p-3">
      <div class="text-xs font-bold text-info">今義</div>
      <p class="mt-1 text-sm text-base-content/80">{w.modern}</p>
    </div>
  </div>
  <div class="mt-2 text-center text-xs text-base-content/55">古今差異：<span class="font-bold text-primary">{w.gap}</span></div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    讀文言時，看到這些詞<b>千萬別用現代意思硬解</b>。先確認它在句中的古義，再翻譯。考「古今意義最接近」就選差異最小的（如「走」古今都指快速移動）。
  </p>
</div>
