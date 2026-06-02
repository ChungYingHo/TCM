<script lang="ts">
  // Consolidated must-memorize summary (the "背這些就好" box).
  let { items = [] }: { items?: string[] } = $props()
</script>

<section class="my-4 rounded-xl border border-amber-300 bg-amber-50/60 p-4">
  <h3 class="mb-2 flex items-center gap-1.5 text-base font-bold text-amber-800">
    <span aria-hidden="true">📌</span>必背重點整理
  </h3>
  <ul class="flex flex-col gap-1.5 text-sm leading-relaxed">
    {#each items as item, i (i)}
      <li class="flex gap-2">
        <span class="mt-0.5 font-bold text-amber-600">{i + 1}.</span>
        <span>{@html item}</span>
      </li>
    {/each}
  </ul>
</section>
