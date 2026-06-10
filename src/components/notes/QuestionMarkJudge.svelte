<script lang="ts">
  // 該用問號還是句號：先判斷是否真有疑問語氣，再翻牌核對。
  type Card = { q: string; a: string; note: string }
  const CARDS: Card[] = [
    { q: '你明天會來＿', a: '？問號', note: '真正的疑問' },
    { q: '我不知道他來不來＿', a: '。句號', note: '間接問句（直述語氣）' },
    { q: '請問你叫什麼名字＿', a: '？問號', note: '仍是發問' },
    { q: '他到底在想什麼＿', a: '？問號', note: '疑問／反詰語氣' },
    { q: '我想知道答案是什麼＿', a: '。句號', note: '間接問句，陳述「我想知道」' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">❓</span>
    <span class="font-display font-bold">該用問號還是句號</span>
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
      <button type="button" class="btn btn-primary btn-sm flex-1" onclick={() => (revealed = true)}>看答案</button>
    {:else}
      <button type="button" class="btn btn-outline btn-sm flex-1" onclick={next}>下一題 →</button>
    {/if}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    有疑問詞不一定是問句；間接問句（我不知道他來不來）用句號。
  </p>
</div>
