<script lang="ts">
  // Consolidated solving approach for this concept (step-by-step playbook).
  let { steps = [] }: { steps?: string[] } = $props()
</script>

<section class="my-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
  <h3 class="mb-2 flex items-center gap-1.5 text-base font-bold text-primary">
    <span aria-hidden="true">🧭</span>解題方向（遇到這類題就這樣想）
  </h3>
  <ol class="flex flex-col gap-2 text-sm leading-relaxed">
    {#each steps as step, i (i)}
      <li class="flex gap-2">
        <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-content">{i + 1}</span>
        <span>{@html step}</span>
      </li>
    {/each}
  </ol>
</section>
