<script lang="ts">
  // 通假／古今／異體 辨別：點一類，看定義與例。
  type Kind = { name: string; def: string; eg: string }
  const KINDS: Kind[] = [
    { name: '通假字', def: '借同音或音近字代本字（臨時借用），字面講不通、換本字才通', eg: '說→悅、蚤→早、見→現' },
    { name: '古今字', def: '同一個詞先後造字、同源分化', eg: '莫→暮、然→燃、取→娶' },
    { name: '異體字', def: '同一個字的不同寫法，音義完全相同', eg: '峰／峯、群／羣、裡／裏' },
  ]
  let i = $state(0)
  const c = $derived(KINDS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔤</span>
    <span class="font-display font-bold">通假／古今／異體 辨別</span>
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
    通假是<b>借音</b>、古今是<b>分化</b>、異體只是<b>寫法不同</b>（音義全同）。
  </p>
</div>
