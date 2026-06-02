<script lang="ts">
  // Must-memorize callout — warm 赭 accent block (no side-stripe).
  let { label = '必背' }: { label?: string } = $props()
</script>

<aside class="my-4 rounded-lg border border-accent/30 bg-accent/10 p-3.5">
  <div class="mb-1 flex items-center gap-1.5 text-sm font-bold tracking-wide text-accent">
    <span aria-hidden="true">🔑</span>{label}・一定要記
  </div>
  <div class="text-sm leading-relaxed text-base-content">
    <slot />
  </div>
</aside>
