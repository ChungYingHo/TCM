<script lang="ts">
  // 文言特殊句式：選倒裝／被動／省略，看各小類的例句與還原（或標誌）。
  type Item = { kind: string; eg: string; note: string }
  type Cat = { name: string; items: Item[] }
  const CATS: Cat[] = [
    { name: '倒裝', items: [
      { kind: '賓語前置', eg: '何陋之有', note: '還原：有何陋。疑問代詞提到動詞前。' },
      { kind: '狀語後置', eg: '戰於長勺', note: '還原：於長勺戰。介詞組移到動詞後。' },
      { kind: '主語後置', eg: '甚矣，汝之不惠', note: '還原：汝之不惠甚矣。主語放到謂語後。' },
    ] },
    { name: '被動', items: [
      { kind: '為……所……', eg: '梅花為寒所勒', note: '最明確的被動標誌＝被寒冷所抑制。' },
      { kind: '見＋動詞', eg: '信而見疑', note: '被懷疑。（注意「見背」的「見」是「對我」，非被動）' },
      { kind: '被', eg: '忠而被謗', note: '同今語「被」＝被毀謗。' },
      { kind: '於引施事', eg: '勞力者治於人', note: '「治於人」＝被人治。' },
    ] },
    { name: '省略', items: [
      { kind: '省主語', eg: '攀條折其榮，將以遺所思', note: '攀、折、遺的主語都是「我（詩人）」，只是省略。' },
      { kind: '省主語（連續動作）', eg: '見藐小微物，必細察其紋理', note: '主語「我」相同，後面不再重寫。' },
    ] },
  ]
  let ci = $state(0)
  const cat = $derived(CATS[ci])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧱</span>
    <span class="font-display font-bold">文言特殊句式</span>
  </div>

  <div class="mb-3 join">
    {#each CATS as ct, k (ct.name)}
      <button type="button" class={`btn join-item btn-xs ${ci === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (ci = k)}>{ct.name}</button>
    {/each}
  </div>

  <div class="space-y-2">
    {#each cat.items as it (it.kind)}
      <div class="rounded-box bg-base-200/60 p-2 text-sm">
        <div class="flex flex-wrap items-center gap-2">
          <span class="badge badge-sm badge-primary shrink-0">{it.kind}</span>
          <span class="font-bold text-base-content/85">{it.eg}</span>
        </div>
        <p class="mt-1 text-xs text-base-content/70">{it.note}</p>
      </div>
    {/each}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    排除型問法（「何者<b>未使用</b>倒裝／被動」）的破解：逐句套上面的規則檢查，<b>唯一不符</b>的那句就是答案。被動先找標誌（為…所…、見、被、於）。
  </p>
</div>
