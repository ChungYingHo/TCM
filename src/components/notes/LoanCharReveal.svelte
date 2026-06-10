<script lang="ts">
  // 通假字還原自測：看課文句，先想本字，再翻牌核對。
  type Card = { q: string; a: string; note: string }
  const CARDS: Card[] = [
    { q: '學而時習之，不亦「說」乎', a: '說 通「悅」', note: '喜悅' },
    { q: '是「知」也', a: '知 通「智」', note: '智慧' },
    { q: '寒暑易節，始一「反」焉', a: '反 通「返」', note: '返回' },
    { q: '「食」馬者不知其能千里而食也', a: '食（ㄙˋ）通「飼」', note: '餵養' },
    { q: '才美不外「見」', a: '見（ㄒㄧㄢˋ）通「現」', note: '顯現' },
    { q: '困於心，「衡」於慮', a: '衡 通「橫」', note: '阻塞、不順' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📜</span>
    <span class="font-display font-bold">通假字還原自測</span>
    <span class="ml-auto text-xs text-base-content/50">{i + 1} / {CARDS.length}</span>
  </div>

  <div class="rounded-box bg-base-200/60 p-4 text-center">
    <p class="text-lg font-bold leading-relaxed">{c.q}</p>
    {#if revealed}
      <div class="mt-3 border-t border-base-300 pt-2 text-sm">
        <span class="badge badge-success badge-lg font-bold">{c.a}</span>
        <p class="mt-2 text-base-content/75">{c.note}</p>
      </div>
    {/if}
  </div>

  <div class="mt-3 flex gap-2">
    {#if !revealed}
      <button type="button" class="btn btn-primary btn-sm flex-1" onclick={() => (revealed = true)}>看本字</button>
    {:else}
      <button type="button" class="btn btn-outline btn-sm flex-1" onclick={next}>下一題 →</button>
    {/if}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    字面講不通時，用「<b>以聲求義</b>」找同音／音近的本字，代回句中通順即是。
  </p>
</div>
