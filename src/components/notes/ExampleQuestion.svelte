<script lang="ts">
  // Self-authored worked example — stem + options, with a collapsible
  // answer + step-by-step solution. The steps should mirror the note's
  // 解題方向 so the method the student practises is the method they revise.
  // Math/formulas in props: use unicode (CH₃COOH, ×10⁻⁵) or simple HTML;
  // `q` and `steps[]` accept HTML.
  let {
    n = 0,
    q = '',
    options = [],
    answer = '',
    steps = [],
  }: {
    n?: number
    q?: string
    options?: string[]
    answer?: string
    steps?: string[]
  } = $props()

  let open = $state(false)
  const letters = ['A', 'B', 'C', 'D', 'E']
</script>

<div class="my-3 rounded-box border border-base-300 bg-base-100">
  <div class="flex items-start gap-2 p-3.5">
    <span class="badge badge-secondary badge-sm shrink-0 font-bold">例 {n}</span>
    <div class="min-w-0 flex-1">
      <p class="font-medium leading-relaxed">{@html q}</p>
      {#if options.length}
        <ul class="mt-2 grid gap-1 text-sm sm:grid-cols-2">
          {#each options as opt, i (i)}
            <li class="flex gap-1.5">
              <span class="font-semibold text-primary">({letters[i]})</span>
              <span>{@html opt}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>

  <button
    type="button"
    class="flex w-full items-center justify-between gap-2 border-t border-base-300 px-3.5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    <span>{open ? '▾ 收合解答' : '▸ 看解答與步驟'}</span>
  </button>

  {#if open}
    <div class="animate-fade-in-up border-t border-base-300 p-3.5">
      {#if answer}
        <div class="mb-2 flex flex-wrap items-center gap-2 text-sm">
          <span class="font-semibold">答案</span>
          <span class="badge badge-success font-bold">{@html answer}</span>
        </div>
      {/if}
      {#if steps.length}
        <ol class="flex flex-col gap-2 text-sm leading-relaxed">
          {#each steps as step, i (i)}
            <li class="grid grid-cols-[1.4rem_1fr] items-start gap-1.5">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/15 text-xs font-bold text-secondary">{i + 1}</span>
              <span class="pt-0.5">{@html step}</span>
            </li>
          {/each}
        </ol>
      {/if}
    </div>
  {/if}
</div>
