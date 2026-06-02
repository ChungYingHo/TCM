<script lang="ts">
  // Special marking for must-memorize content.
  let { label = '必背' }: { label?: string } = $props()
</script>

<aside class="my-4 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3">
  <div class="mb-1 flex items-center gap-1.5 text-sm font-bold text-amber-700">
    <span aria-hidden="true">🔑</span>{label}（一定要記）
  </div>
  <div class="text-sm leading-relaxed text-base-content">
    <slot />
  </div>
</aside>
