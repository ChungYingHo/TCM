<script lang="ts" generics="T extends string | number">
  let {
    label,
    options,
    selected = $bindable([]),
    format = (v: T) => String(v),
  }: {
    label: string
    options: T[]
    selected?: T[]
    format?: (v: T) => string
  } = $props()

  function toggle(v: T) {
    selected = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]
  }
</script>

<fieldset class="flex flex-col gap-1.5">
  <legend class="mb-1 text-sm font-semibold opacity-80">{label}</legend>
  <div class="flex flex-wrap gap-1.5">
    {#each options as opt (opt)}
      <button
        type="button"
        class={`badge badge-lg min-h-9 cursor-pointer px-3 ${selected.includes(opt) ? 'badge-primary' : 'badge-outline'}`}
        aria-pressed={selected.includes(opt)}
        onclick={() => toggle(opt)}
      >
        {format(opt)}
      </button>
    {/each}
  </div>
</fieldset>
