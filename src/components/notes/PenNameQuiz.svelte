<script lang="ts">
  // 字號別稱自測：看別稱，先想本人，再翻牌看答案與由來與專長。
  type Card = { alias: string; person: string; origin: string; field: string }
  const CARDS: Card[] = [
    { alias: '少陵（少陵野老）', person: '杜甫', origin: '自號', field: '詩（詩聖）' },
    { alias: '青蓮（青蓮居士）', person: '李白', origin: '自號', field: '詩（詩仙）' },
    { alias: '摩詰', person: '王維', origin: '字摩詰', field: '詩、畫（詩中有畫）' },
    { alias: '右軍', person: '王羲之', origin: '曾任右軍將軍', field: '書法（書聖）' },
    { alias: '相如', person: '司馬相如', origin: '名相如', field: '漢賦' },
    { alias: '東坡（東坡居士）', person: '蘇軾', origin: '號東坡居士、字子瞻', field: '詩、詞、文（豪放派）' },
    { alias: '易安（居士）', person: '李清照', origin: '自號', field: '詞（婉約派）' },
    { alias: '五柳先生／靖節', person: '陶淵明', origin: '自號／諡號', field: '田園詩、辭賦' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🎫</span>
    <span class="font-display font-bold">字號別稱自測</span>
    <span class="ml-auto text-xs text-base-content/50">{i + 1} / {CARDS.length}</span>
  </div>

  <div class="rounded-box bg-base-200/60 p-4 text-center">
    <div class="text-xs text-base-content/55">別稱</div>
    <div class="text-2xl font-bold text-primary">{c.alias}</div>
    {#if revealed}
      <div class="mt-3 border-t border-base-300 pt-2 text-sm">
        <span class="badge badge-success badge-lg font-bold">{c.person}</span>
        <p class="mt-2 text-base-content/75">由來：{c.origin}　·　專長：{c.field}</p>
      </div>
    {/if}
  </div>

  <div class="mt-3 flex gap-2">
    {#if !revealed}
      <button type="button" class="btn btn-primary btn-sm flex-1" onclick={() => (revealed = true)}>翻牌看本人</button>
    {:else}
      <button type="button" class="btn btn-outline btn-sm flex-1" onclick={next}>下一題 →</button>
    {/if}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    稱呼題解法：把別稱<b>換回本名</b>，再判斷他的專長與句中搭配是否相符（少陵詩、摩詰畫、右軍帖、相如賦，各得其所）。
  </p>
</div>
