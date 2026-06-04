<script lang="ts">
  // 兩種空格：切換文法空格／字彙空格，看特徵、解法與例。
  let grammar = $state(true)
  const data = $derived(
    grammar
      ? {
          feature: '四個選項是「同一個字的不同形式」。',
          options: 'trigger ／ triggered ／ triggering ／ to trigger',
          how: '純看詞性與時態，語意幾乎不用想——情態動詞 may 後接原形 → trigger。',
        }
      : {
          feature: '四個選項是「不同的字」。',
          options: 'alleviate ／ escalate ／ restore ／ detect',
          how: '詞性多半都對，要靠上下文語意選（用同義字／情境判斷）。',
        }
  )
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">🕳️</span>
    <span class="font-display font-bold">兩種空格：文法 vs 字彙</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${grammar ? 'btn-primary' : 'btn-outline'}`} onclick={() => (grammar = true)}>文法空格</button>
      <button type="button" class={`btn btn-xs ${!grammar ? 'btn-primary' : 'btn-outline'}`} onclick={() => (grammar = false)}>字彙空格</button>
    </div>
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="text-base-content/80"><span class="text-base-content/50">特徵：</span>{data.feature}</div>
    <div class="mt-1 rounded bg-base-100 px-2 py-1 font-mono text-xs text-base-content/75">選項：{data.options}</div>
    <div class="mt-2 text-base-content/80"><span class="text-base-content/50">怎麼解：</span>{data.how}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    先看四個選項的長相：<b>長得很像（同字不同形）＝文法空格</b>，先刪詞性／時態錯的；<b>四個是不同的字＝字彙空格</b>，回到上下文判斷語意。
  </p>
</div>
