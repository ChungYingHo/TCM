<script lang="ts">
  // 斷句示範：看未加標點的文言，先自己斷，再翻牌看斷句後與用到的訊號。
  type Item = { raw: string; done: string; signals: string }
  const ITEMS: Item[] = [
    { raw: '孔子曰學而時習之不亦說乎有朋自遠方來不亦樂乎', done: '孔子曰：「學而時習之，不亦說乎？有朋自遠方來，不亦樂乎？」', signals: '對話標誌「曰：」開引語；句末虛詞「乎」兩處結句。' },
    { raw: '學而不思則罔思而不學則殆', done: '學而不思則罔，思而不學則殆。', signals: '並列對稱結構「A 則…，B 則…」，兩個條件句中間斷開。' },
    { raw: '夫戰勇氣也一鼓作氣再而衰三而竭', done: '夫戰，勇氣也。一鼓作氣，再而衰，三而竭。', signals: '句首虛詞「夫」開新句；句末「也」判斷結句；數字並列「一、再、三」分段。' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const it = $derived(ITEMS[i])
  const pick = (k: number) => { i = k; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">／</span>
    <span class="font-display font-bold">文言斷句示範</span>
    <div class="join ml-auto">
      {#each ITEMS as _, k (k)}
        <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => pick(k)}>例{k + 1}</button>
      {/each}
    </div>
  </div>

  <div class="rounded-box bg-base-200/60 p-3">
    <div class="text-xs text-base-content/55">原文（未斷句）</div>
    <p class="mt-1 text-lg leading-relaxed tracking-wide">{it.raw}</p>
    {#if revealed}
      <div class="mt-3 border-t border-base-300 pt-2">
        <div class="text-xs text-success">斷句後</div>
        <p class="mt-1 text-lg leading-relaxed">{it.done}</p>
        <p class="mt-2 text-xs text-base-content/70"><b>用到的訊號：</b>{it.signals}</p>
      </div>
    {/if}
  </div>

  <button type="button" class="btn btn-primary btn-sm mt-3 w-full" onclick={() => (revealed = !revealed)}>{revealed ? '收合' : '翻牌看斷句'}</button>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    斷句五招：<b>句末虛詞</b>（也、矣、乎、哉）、<b>句首虛詞</b>（夫、蓋、且、然則）、<b>對話標誌</b>（曰：）、<b>並列結構</b>（A 也，B 也）、<b>看語意完整</b>。先斷大段再細修。
  </p>
</div>
