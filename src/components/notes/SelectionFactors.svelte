<script lang="ts">
  // 天擇三要素：三個都在才會運作；關掉任一個，看天擇為何停下。
  let variation = $state(true)
  let heritable = $state(true)
  let selection = $state(true)

  const works = $derived(variation && heritable && selection)
  const reason = $derived.by(() => {
    if (works) return '三要素齊全 → 天擇能持續改變族群的性狀組成。'
    if (!variation) return '沒有變異：大家都一樣，環境無從「挑選」誰較適存 → 天擇停止。'
    if (!heritable) return '變異不可遺傳：就算被選上也傳不給後代（如後天練出的肌肉）→ 天擇停止。'
    return '沒有環境篩選壓力：各表型存活、繁殖機會相同 → 頻率不變，天擇停止。'
  })
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧭</span>
    <span class="font-display font-bold">天擇三要素：缺一不可</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-3">
    <label class="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" class="toggle toggle-sm toggle-primary" bind:checked={variation} />
      <span>① 變異</span>
    </label>
    <label class="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" class="toggle toggle-sm toggle-primary" bind:checked={heritable} />
      <span>② 可遺傳</span>
    </label>
    <label class="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" class="toggle toggle-sm toggle-primary" bind:checked={selection} />
      <span>③ 環境篩選</span>
    </label>
  </div>

  <div class={`rounded-box p-3 text-sm ${works ? 'bg-success/15' : 'bg-error/15'}`}>
    <span class={`badge badge-sm font-bold ${works ? 'badge-success' : 'badge-error'}`}>{works ? '天擇運作中' : '天擇停止'}</span>
    <p class="mt-2 text-base-content/80">{reason}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    天擇不是「強者生存」這麼簡單，而是要同時具備：族群內有<b>變異</b>、變異<b>可遺傳</b>、不同表型受<b>環境篩選</b>而有存活與繁殖的差異。注意：天擇<b>不需要</b>「資源充足、無競爭」，那反而會降低篩選壓力。
  </p>
</div>
