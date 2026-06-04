<script lang="ts">
  // 文言虛詞探索：點一個虛詞，看它的主要用法與例句。
  type FW = { word: string; uses: { fn: string; eg: string }[] }
  const WORDS: FW[] = [
    { word: '之', uses: [
      { fn: '助詞（取獨／無義）', eg: '師道之不傳也久矣' },
      { fn: '代詞（他／它）', eg: '愛之、曲肱而枕之' },
      { fn: '動詞（到、往）', eg: '吾欲之南海' },
      { fn: '結構助詞（的）', eg: '是寡人之過也' },
    ] },
    { word: '而', uses: [
      { fn: '並列／遞進（且、又）', eg: '博學而篤志' },
      { fn: '轉折（但是、卻）', eg: '人而無信' },
      { fn: '修飾（……地）', eg: '終日而思' },
      { fn: '承接（然後）', eg: '學而時習之' },
    ] },
    { word: '以', uses: [
      { fn: '介詞（用、拿、憑）', eg: '以石投水' },
      { fn: '連詞（因為、因此）', eg: '以其境過清' },
      { fn: '動詞（認為）', eg: '我以日始出時去人近' },
    ] },
    { word: '乎', uses: [
      { fn: '語氣詞（疑問／感嘆）', eg: '不亦說乎' },
      { fn: '介詞（相當於「於」）', eg: '生乎吾前' },
    ] },
    { word: '者', uses: [
      { fn: '助詞（指人或事）', eg: '仁者愛人' },
      { fn: '句中停頓語氣', eg: '陳勝者，陽城人也' },
    ] },
    { word: '也', uses: [
      { fn: '句末判斷語氣（是／為）', eg: '師者，所以傳道受業解惑也' },
      { fn: '句中停頓', eg: '其聞道也亦先乎吾' },
    ] },
  ]
  let i = $state(0)
  const w = $derived(WORDS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📜</span>
    <span class="font-display font-bold">文言虛詞用法探索</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each WORDS as wd, k (wd.word)}
      <button type="button" class={`btn btn-sm font-bold ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{wd.word}</button>
    {/each}
  </div>

  <div class="space-y-1.5">
    {#each w.uses as u (u.fn)}
      <div class="flex flex-wrap items-center gap-2 rounded-box bg-base-200/60 p-2 text-sm">
        <span class="badge badge-sm badge-primary shrink-0">{u.fn}</span>
        <span class="text-base-content/75">{u.eg}</span>
      </div>
    {/each}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    解「下列『{w.word}』字用法相同的是」這類題：先判斷每句中虛詞的<b>功能</b>（看它前後接什麼、在句中扮演什麼角色），再兩兩比對。
  </p>
</div>
