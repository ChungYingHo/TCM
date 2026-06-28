<script lang="ts" generics="T extends string | number">
  // noteHref（選用）：某選項若對應一篇筆記就回傳其路徑 → 該 chip 加「📒 有筆記」標記、
  // 並可點 📒 直接開筆記（chip 本身仍是篩選開關）。用於 /study 趨勢標籤標出已寫筆記的考點。
  let {
    label,
    options,
    selected = $bindable([]),
    format = (v: T) => String(v),
    noteHref,
  }: {
    label: string
    options: T[]
    selected?: T[]
    format?: (v: T) => string
    noteHref?: (v: T) => string | null
  } = $props()

  function toggle(v: T) {
    selected = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]
  }
</script>

<fieldset class="flex flex-col gap-1.5">
  <legend class="mb-1 text-sm font-semibold opacity-80">{label}</legend>
  <div class="flex flex-wrap gap-1.5">
    {#each options as opt (opt)}
      {@const href = noteHref?.(opt)}
      <span class={`inline-flex items-center overflow-hidden rounded-full ${href ? 'ring-1 ring-primary/40' : ''}`}>
        <button
          type="button"
          class={`badge badge-lg min-h-9 cursor-pointer rounded-full px-3 ${selected.includes(opt) ? 'badge-primary' : 'badge-outline'} ${href ? 'border-transparent' : ''}`}
          aria-pressed={selected.includes(opt)}
          onclick={() => toggle(opt)}
        >
          {format(opt)}
        </button>
        {#if href}
          <a
            {href}
            class="flex min-h-9 items-center bg-primary/10 px-2 text-primary transition hover:bg-primary/20"
            title={`開啟筆記：${format(opt)}`}
            aria-label={`開啟筆記：${format(opt)}`}
          >📒</a>
        {/if}
      </span>
    {/each}
  </div>
</fieldset>
