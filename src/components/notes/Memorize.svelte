<script lang="ts">
  // Must-memorize callout — warm 赭 accent block (no side-stripe).
  // 兩種用法：傳 items（字串陣列，可含 HTML）→ 條列；或包 children（slot）→ 自由排版。
  let { label = '必背', items = [] }: { label?: string; items?: string[] } = $props()
</script>

<aside class="my-4 rounded-lg border border-accent/30 bg-accent/10 p-3.5 print:break-inside-avoid">
  <div class="mb-1 flex items-center gap-1.5 text-sm font-bold tracking-wide text-accent">
    <span aria-hidden="true">🔑</span>{label}・一定要記
  </div>
  <div class="text-sm leading-relaxed text-base-content">
    {#if items.length}
      <ul class="ml-4 list-disc space-y-1">
        {#each items as item, i (i)}
          <li>{@html item}</li>
        {/each}
      </ul>
    {:else}
      <slot />
    {/if}
  </div>
</aside>
