<script lang="ts">
  // 意義會變的動詞：先想 to V 與 V-ing 的差別，再翻牌核對。
  type Card = { verb: string; toV: string; ving: string }
  const CARDS: Card[] = [
    { verb: 'stop', toV: '停下來去做（目的）', ving: '停止做這件事' },
    { verb: 'remember', toV: '記得要去做（還沒做）', ving: '記得做過了' },
    { verb: 'forget', toV: '忘記要做（還沒做）', ving: '忘記做過了' },
    { verb: 'try', toV: '努力去做', ving: '試試看某方法' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔀</span>
    <span class="font-display font-bold">意義會變的動詞</span>
    <span class="ml-auto text-xs text-base-content/50">{i + 1} / {CARDS.length}</span>
  </div>

  <div class="rounded-box bg-base-200/60 p-4 text-center">
    <p class="text-lg font-bold leading-relaxed font-mono">{c.verb} + ?</p>
    {#if revealed}
      <div class="mt-3 border-t border-base-300 pt-2 text-sm">
        <p class="text-base-content/80"><span class="badge badge-success font-bold">+ to V</span>　{c.toV}</p>
        <p class="mt-1 text-base-content/80"><span class="badge badge-info font-bold">+ V-ing</span>　{c.ving}</p>
      </div>
    {/if}
  </div>

  <div class="mt-3 flex gap-2">
    {#if !revealed}
      <button type="button" class="btn btn-primary btn-sm flex-1" onclick={() => (revealed = true)}>看兩種意思</button>
    {:else}
      <button type="button" class="btn btn-outline btn-sm flex-1" onclick={next}>下一題 →</button>
    {/if}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    stop / remember / forget / try 後接 <b>to V</b> 或 <b>V-ing</b>，意義完全不同。
  </p>
</div>
