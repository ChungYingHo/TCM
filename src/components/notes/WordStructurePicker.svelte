<script lang="ts">
  // 複詞六種結構：點一類，看定義與例。
  type Kind = { name: string; def: string; eg: string }
  const KINDS: Kind[] = [
    { name: '並列', def: '兩語素地位平等（同義或反義並排）', eg: '朋友、是非、買賣' },
    { name: '偏正', def: '前修飾後（修飾＋中心）', eg: '紅花、火車、小說' },
    { name: '動賓', def: '前動作、後對象', eg: '讀書、革命、將軍' },
    { name: '主謂', def: '前主語、後陳述', eg: '地震、海嘯、年輕' },
    { name: '補充', def: '後補充說明前（述補）', eg: '提高、改正、推翻' },
    { name: '重疊', def: '同字相疊', eg: '漸漸、津津、欣欣' },
  ]
  let i = $state(0)
  const c = $derived(KINDS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧱</span>
    <span class="font-display font-bold">複詞六種結構</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each KINDS as k, idx (k.name)}
      <button type="button" class={`btn btn-xs ${i === idx ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = idx)}>{k.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{c.name}</div>
    <div class="text-base-content/80">{c.def}</div>
    <div class="mt-1 text-base-content/70"><span class="text-base-content/50">例：</span>{c.eg}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    判法：用一句話說出兩字關係——「紅的花」偏正、「地在震」主謂、「提到高」補充。
  </p>
</div>
