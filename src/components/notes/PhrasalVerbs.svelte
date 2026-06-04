<script lang="ts">
  // 片語動詞自測：看片語，先想真正意思（別照字面），再翻牌。
  type Card = { pv: string; literal: string; real: string }
  const CARDS: Card[] = [
    { pv: 'carry out', literal: '帶出去', real: '執行（任務）' },
    { pv: 'look up', literal: '向上看', real: '查詢（字典）' },
    { pv: 'look after', literal: '向後看', real: '照顧' },
    { pv: 'look for', literal: '向前看', real: '尋找' },
    { pv: 'look into', literal: '往裡看', real: '調查' },
    { pv: 'rule out', literal: '往外畫線', real: '排除（可能性）' },
    { pv: 'call off', literal: '喊到外面', real: '取消（活動）' },
    { pv: 'put off', literal: '放到外面', real: '推遲、拖延' },
    { pv: 'break down', literal: '往下打碎', real: '故障；崩潰' },
    { pv: 'turn down', literal: '向下轉', real: '拒絕；調低音量' },
    { pv: 'figure out', literal: '找出形狀', real: '弄清楚、想出' },
    { pv: 'take over', literal: '拿過來', real: '接管' },
    { pv: 'bring about', literal: '帶到周圍', real: '導致、引起' },
    { pv: 'pass up', literal: '往上傳', real: '錯過、放過（機會）' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧩</span>
    <span class="font-display font-bold">片語動詞自測（別照字面）</span>
    <span class="ml-auto text-xs text-base-content/50">{i + 1} / {CARDS.length}</span>
  </div>

  <div class="rounded-box bg-base-200/60 p-4 text-center">
    <div class="text-2xl font-bold text-primary">{c.pv}</div>
    <div class="mt-1 text-xs text-base-content/45 line-through">字面：{c.literal}</div>
    {#if revealed}
      <div class="mt-3 border-t border-base-300 pt-2">
        <span class="badge badge-success badge-lg font-bold">{c.real}</span>
      </div>
    {/if}
  </div>

  <div class="mt-3 flex gap-2">
    {#if !revealed}
      <button type="button" class="btn btn-primary btn-sm flex-1" onclick={() => (revealed = true)}>翻牌看真正意思</button>
    {:else}
      <button type="button" class="btn btn-outline btn-sm flex-1" onclick={next}>下一題 →</button>
    {/if}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    片語動詞 ＝ 動詞 ＋ 介副詞，意思常與<b>字面完全不同</b>，要<b>整組記</b>。遇到陌生片語：先看句子在做什麼動作，再從選項找最符合情境的。
  </p>
</div>
