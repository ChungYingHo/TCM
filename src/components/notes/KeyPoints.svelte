<script lang="ts">
  // Consolidated must-memorize summary — a plain bordered card (no heavy tint),
  // deliberately a different treatment from the warm Memorize / cool SolveApproach.
  let { items = [] }: { items?: string[] } = $props()
</script>

<section class="my-4 rounded-box border border-base-300 bg-base-100 p-4 print:break-inside-avoid">
  <h3 class="mb-3 flex items-center gap-1.5 font-display text-base font-bold">
    <span aria-hidden="true">📌</span>必背重點整理
  </h3>
  <ul class="flex flex-col gap-2 text-sm leading-relaxed">
    {#each items as item, i (i)}
      <li class="grid grid-cols-[1.5rem_1fr] gap-1">
        <span class="font-semibold text-primary tabular-nums">{i + 1}.</span>
        <span>{@html item}</span>
      </li>
    {/each}
  </ul>
</section>
