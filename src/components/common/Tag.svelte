<script lang="ts">
  let {
    label,
    active = false,
    onclick,
  }: { label: string; active?: boolean; onclick?: () => void } = $props()
</script>

{#if onclick}
  <button
    type="button"
    class={`badge cursor-pointer ${active ? 'badge-primary' : 'badge-outline'}`}
    aria-pressed={active}
    {onclick}
  >
    {label}
  </button>
{:else}
  <span class="badge badge-ghost">{label}</span>
{/if}
