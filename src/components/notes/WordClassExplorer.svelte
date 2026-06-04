<script lang="ts">
  // 常見詞性：點一個，看定義、在句中的位置與例。提醒中文詞性可隨語境改變（兼類）。
  type WC = { name: string; def: string; pos: string; eg: string }
  const CLASSES: WC[] = [
    { name: '名詞', def: '事物的名稱。', pos: '當主語、受語（賓語）。', eg: '山、風、父母' },
    { name: '動詞', def: '動作或狀態。', pos: '當述語（謂語）核心。', eg: '跑、思、為' },
    { name: '形容詞', def: '描述性質。', pos: '當定語、述語。', eg: '美、高、白' },
    { name: '副詞', def: '修飾動詞或形容詞。', pos: '當狀語。', eg: '很、已、皆' },
    { name: '介詞', def: '引導時間、地點、對象。', pos: '與名詞合組介詞組。', eg: '以、於、與' },
    { name: '連詞', def: '連接成分或子句。', pos: '當連接語。', eg: '而、且、雖' },
  ]
  let i = $state(0)
  const c = $derived(CLASSES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🏷️</span>
    <span class="font-display font-bold">詞性與功能</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each CLASSES as cl, k (cl.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{cl.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{c.name}</div>
    <div class="text-base-content/80">{c.def}</div>
    <div class="mt-1 text-base-content/70"><span class="text-base-content/50">在句中：</span>{c.pos}</div>
    <div class="mt-1 text-base-content/70"><span class="text-base-content/50">例：</span>{c.eg}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    重點：<b>中文詞性不固定</b>！同一個字在不同句子可能是不同詞性（兼類）。判斷時先問「<b>它在這句裡做什麼</b>」，再定詞性——例如「子其子」第一個「子」當動詞（以……為子）。
  </p>
</div>
