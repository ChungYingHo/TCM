<script lang="ts">
  // 易誤用成語：點一個成語，看實際意思、褒貶與常見錯誤用法。
  type Idiom = { word: string; tone: '貶' | '褒' | '中'; mean: string; wrong: string }
  const IDIOMS: Idiom[] = [
    { word: '治絲益棼', tone: '貶', mean: '整理絲線卻越理越亂，比喻處理事情方法不對、越弄越糟。', wrong: '誤作「把複雜的事處理得很清楚」（方向相反）。' },
    { word: '差強人意', tone: '中', mean: '大致上還令人滿意（差：勉強；強：振奮）。', wrong: '誤解為「差勁、令人失望」。' },
    { word: '空穴來風', tone: '中', mean: '有空穴才會引風，原指「事出有因、傳聞有根據」。', wrong: '今多誤用為「毫無根據的謠言」，考試以原義為準。' },
    { word: '首當其衝', tone: '貶', mean: '最先遭受攻擊或衝擊。', wrong: '誤用為「首先勇敢衝上去」（正面積極）。' },
    { word: '明日黃花', tone: '貶', mean: '重陽過後的菊花，比喻過時、失去意義的事物。', wrong: '誤作「充滿期待的明天」。' },
    { word: '炙手可熱', tone: '貶', mean: '手一靠近就燙，比喻人氣焰高、權勢大（多含貶義）。', wrong: '誤作中性的「非常熱門、受歡迎」。' },
    { word: '噤若寒蟬', tone: '貶', mean: '像寒蟬般不出聲，比喻因恐懼或壓力而不敢說話。', wrong: '誤作「安靜專注」。' },
  ]
  let i = $state(0)
  const d = $derived(IDIOMS[i])
  const toneCls = $derived(d.tone === '貶' ? 'badge-error' : d.tone === '褒' ? 'badge-success' : 'badge-ghost')
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚠️</span>
    <span class="font-display font-bold">易誤用成語：先確認褒貶</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each IDIOMS as id, k (id.word)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{id.word}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex items-center gap-2">
      <span class="text-lg font-bold text-primary">{d.word}</span>
      <span class={`badge badge-sm font-bold ${toneCls}`}>{d.tone}義</span>
    </div>
    <p class="text-base-content/80">{d.mean}</p>
    <p class="mt-2 text-xs text-error/90"><b>常見錯誤：</b>{d.wrong}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    成語用法題的破解：先確認成語的<b>本義與褒貶</b>，再看句子語境是否一致——把貶義用在正面情境（或望文生義）就是錯誤用法。
  </p>
</div>
