<script lang="ts">
  // 書信用語：選收信對象，一次看提稱語、自稱、結尾敬辭與信封啟封詞。
  type Target = { name: string; addr: string; self: string; end: string; envelope: string }
  const TARGETS: Target[] = [
    { name: '父母', addr: '膝下、膝前', self: '男／女、不孝兒', end: '敬請 福安、叩請 金安', envelope: '安啟、福啟' },
    { name: '師長', addr: '函丈、道席、講席', self: '受業、門生、學生', end: '敬請 道安、敬頌 誨安', envelope: '安啟、道啟' },
    { name: '一般長輩／上司', addr: '尊鑒、鈞鑒（官方）', self: '晚、後學', end: '敬請 崇安', envelope: '安啟' },
    { name: '平輩／朋友', addr: '台鑒、惠鑒、大鑒', self: '弟（男）、妹（女）', end: '敬請 台安、即請 大安', envelope: '大啟、台啟' },
    { name: '晚輩', addr: '知悉、覽', self: '愚', end: '即詢 近安、順詢 近好', envelope: '啟、收' },
  ]
  let i = $state(0)
  const t = $derived(TARGETS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">✉️</span>
    <span class="font-display font-bold">書信用語：對象決定用詞</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each TARGETS as tg, k (tg.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{tg.name}</button>
    {/each}
  </div>

  <div class="grid gap-2 text-sm sm:grid-cols-2">
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">提稱語（信紙內）</div><div class="font-bold">{t.addr}</div></div>
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">自稱（謙稱）</div><div class="font-bold">{t.self}</div></div>
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">結尾敬辭（祝頌）</div><div class="font-bold">{t.end}</div></div>
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">信封啟封詞</div><div class="font-bold">{t.envelope}</div></div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>提稱語</b>寫在信紙內、<b>啟封詞</b>寫在信封上，別搞混。大陷阱：信封對長輩<b>不可寫「敬啟」</b>（＝叫長輩恭敬地拆信，不合理），要用「安啟／福啟」。
  </p>
</div>
