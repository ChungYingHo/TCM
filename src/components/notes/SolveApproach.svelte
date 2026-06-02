<script lang="ts">
  // Solving playbook — cool primary-tinted block with numbered chips.
  let { steps = [] }: { steps?: string[] } = $props()
</script>

<section class="my-4 rounded-box border border-primary/25 bg-primary/5 p-4">
  <h3 class="mb-3 flex items-center gap-1.5 font-display text-base font-bold text-primary">
    <span aria-hidden="true">🧭</span>解題方向・遇到這類題就這樣想
  </h3>
  <ol class="flex flex-col gap-2.5 text-sm leading-relaxed">
    {#each steps as step, i (i)}
      <li class="grid grid-cols-[1.5rem_1fr] items-start gap-2">
        <span class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-content">{i + 1}</span>
        <span class="pt-0.5">{@html step}</span>
      </li>
    {/each}
  </ol>
</section>
