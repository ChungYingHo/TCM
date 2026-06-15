<script lang="ts">
  // 錯別字自測：成語中的關鍵字挖空，先想正確字，再翻牌看答案與線索。
  // 卡片可點擊翻面（看答案 ⇄ 蓋回），並可前後切換題目。
  type Card = { phrase: string; blank: string; right: string; wrong: string; clue: string }
  const CARDS: Card[] = [
    { phrase: '迫不◯待', blank: '◯', right: '及', wrong: '急', clue: '「及」是來得及，不是心情急。' },
    { phrase: '義不容◯', blank: '◯', right: '辭', wrong: '詞', clue: '「辭」是推辭，不是言詞的「詞」。' },
    { phrase: '再接再◯', blank: '◯', right: '厲', wrong: '勵', clue: '「厲」是磨礪、磨刀，不是勉勵的「勵」。' },
    { phrase: '察◯觀色', blank: '◯', right: '言', wrong: '顏', clue: '察的是「言語」，不是臉色的「顏」。' },
    { phrase: '出其不◯', blank: '◯', right: '意', wrong: '異', clue: '「意」是出乎意料，不是「異」。' },
    { phrase: '動輒得◯', blank: '◯', right: '咎', wrong: '救', clue: '「咎」是責怪、過失，不是「救」。' },
    { phrase: '無濟於◯', blank: '◯', right: '事', wrong: '是', clue: '對「事情」沒有幫助，用「事」。' },
    { phrase: '◯皮笑臉', blank: '◯', right: '嬉', wrong: '嘻', clue: '「嬉」從「女」、表嬉戲，不是狀聲的「嘻」。' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const go = (d: number) => { i = (i + d + CARDS.length) % CARDS.length; revealed = false }
  const flip = () => (revealed = !revealed)
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip() } }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">✏️</span>
    <span class="font-display font-bold">錯別字自測</span>
    <span class="ml-auto text-xs tabular-nums text-base-content/50">{i + 1} / {CARDS.length}</span>
  </div>

  <div
    role="button"
    tabindex="0"
    aria-pressed={revealed}
    class="w-full cursor-pointer rounded-box bg-base-200/60 p-4 text-center transition-colors hover:bg-base-200"
    onclick={flip}
    onkeydown={onKey}
  >
    <div class="text-3xl font-bold tracking-widest">
      {#each c.phrase.split('') as ch, j (j)}<span class={ch === c.blank ? 'text-primary' : ''}>{ch === c.blank ? (revealed ? c.right : '◯') : ch}</span>{/each}
    </div>
    {#if revealed}
      <div class="mt-3 text-sm">
        <span class="badge badge-success font-bold">正解：{c.right}</span>
        <span class="badge badge-error badge-outline ml-1">常誤：{c.wrong}</span>
        <p class="mt-2 text-base-content/75">{c.clue}</p>
      </div>
    {:else}
      <p class="mt-2 text-xs text-base-content/45">點一下翻牌看答案</p>
    {/if}
  </div>

  <div class="mt-3 flex items-center gap-2">
    <button type="button" class="btn btn-ghost btn-sm" onclick={() => go(-1)}>← 上一題</button>
    <button type="button" class="btn btn-primary btn-sm flex-1" onclick={flip}>{revealed ? '蓋回去' : '翻牌看答案'}</button>
    <button type="button" class="btn btn-ghost btn-sm" onclick={() => go(1)}>下一題 →</button>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    破解法：把成語<b>還原成本義</b>，用意義反推正確字形。這些都是考古題高頻易錯字，先靠自己想，再翻牌核對。
  </p>
</div>
