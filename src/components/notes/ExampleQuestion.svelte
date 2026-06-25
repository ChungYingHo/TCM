<script lang="ts">
  // Self-authored worked example — stem + clickable options. Pick option(s), tap
  // 對答案 to check (right/wrong highlight), then the step-by-step solution opens.
  // Correct option(s) come from the answer's leading "(X)" letter(s): single
  // "(C) …" → one correct; multi "(A)、(B) …" → 複選 (set-equality grading). Falls
  // back to text-matching, then to reveal-only if unparseable or no options.
  // Math/formulas in props: use unicode (CH₃COOH, ×10⁻⁵) or simple HTML;
  // `q`, `options[]` and `steps[]` accept HTML.
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

  const letters = ['A', 'B', 'C', 'D', 'E']

  // correct option index/indices, parsed from the answer's leading "(X)" label.
  // "(C) 7" → [2]; "(A)、(B) …" → [0,1].
  const correctIdxs = $derived.by(() => {
    const label = answer.trim().split(/\s/)[0] ?? ''
    const found = [...label.matchAll(/\(([A-Ea-e])\)/g)]
      .map((m) => letters.indexOf(m[1].toUpperCase()))
      .filter((i) => i >= 0 && i < options.length)
    if (found.length) return found
    // fallback: text-match a single option
    const a = answer.replace(/^\s*\([A-Ea-e]\)\s*/, '').trim()
    const exact = options.findIndex((o) => o.trim() === a)
    if (exact >= 0) return [exact]
    const incl = options.findIndex((o) => a.length > 0 && (a.includes(o.trim()) || o.trim().includes(a)))
    return incl >= 0 ? [incl] : []
  })

  const interactive = $derived(options.length > 0 && correctIdxs.length > 0)
  const multi = $derived(correctIdxs.length > 1)
  const correctLabel = $derived(correctIdxs.map((i) => letters[i]).join('、'))

  let picked = $state<number[]>([])
  let checked = $state(false)
  let open = $state(false) // reveal toggle for the no-options fallback

  const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every((x) => b.includes(x))
  const isCorrect = $derived(checked && sameSet(picked, correctIdxs))
  const showSolution = $derived(interactive ? checked : open)

  function toggle(i: number) {
    if (checked) return
    if (multi) picked = picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i]
    else picked = [i]
  }
  function check() {
    if (picked.length) checked = true
  }
  function reset() {
    picked = []
    checked = false
  }

  function optClass(i: number) {
    if (!checked) {
      return picked.includes(i)
        ? 'border-primary bg-primary/10 ring-1 ring-primary'
        : 'border-base-300 hover:border-primary/40 hover:bg-base-200/60'
    }
    if (correctIdxs.includes(i)) return 'border-success bg-success/10'
    if (picked.includes(i)) return 'border-error bg-error/10'
    return 'border-base-300 opacity-55'
  }
</script>

<div class="my-3 rounded-box border border-base-300 bg-base-100 print:break-inside-avoid">
  <div class="print:hidden">
  <div class="flex items-start gap-2 p-3.5">
    <span class="badge badge-secondary badge-sm shrink-0 font-bold">例 {n}</span>
    <div class="min-w-0 flex-1">
      <p class="font-medium leading-relaxed">{@html q}</p>

      {#if options.length}
        {#if interactive}
          {#if multi}<p class="mt-2 text-xs text-base-content/55">可複選——選好全部正解再對答案</p>{/if}
          <ul class="mt-2 grid gap-1.5 sm:grid-cols-2" role="group" aria-label="選項">
            {#each options as opt, i (i)}
              <li>
                <button
                  type="button"
                  disabled={checked}
                  aria-pressed={picked.includes(i)}
                  onclick={() => toggle(i)}
                  class={`flex w-full items-start gap-1.5 rounded-lg border px-2.5 py-2 text-left text-sm transition ${optClass(i)}`}
                >
                  <span class="font-semibold text-primary">({letters[i]})</span>
                  <span class="min-w-0 flex-1">{@html opt}</span>
                  {#if checked && correctIdxs.includes(i)}<span class="font-bold text-success" aria-hidden="true">✓</span>{/if}
                  {#if checked && picked.includes(i) && !correctIdxs.includes(i)}<span class="font-bold text-error" aria-hidden="true">✗</span>{/if}
                </button>
              </li>
            {/each}
          </ul>

          {#if !checked}
            <button type="button" class="btn btn-primary btn-sm mt-2.5" disabled={picked.length === 0} onclick={check}>對答案</button>
          {:else}
            <p class={`mt-2.5 flex flex-wrap items-center gap-1.5 text-sm font-semibold ${isCorrect ? 'text-success' : 'text-error'}`}>
              {isCorrect ? '答對了 🎉' : `再想想——正解是 (${correctLabel})`}
              <button type="button" class="btn btn-ghost btn-xs" onclick={reset}>再做一次</button>
            </p>
          {/if}
        {:else}
          <!-- no parseable answer key: show options statically -->
          <ul class="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {#each options as opt, i (i)}
              <li class="flex gap-1.5">
                <span class="font-semibold text-primary">({letters[i]})</span>
                <span>{@html opt}</span>
              </li>
            {/each}
          </ul>
        {/if}
      {/if}
    </div>
  </div>

  {#if !interactive}
    <button
      type="button"
      class="flex w-full items-center justify-between gap-2 border-t border-base-300 px-3.5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
      aria-expanded={open}
      onclick={() => (open = !open)}
    >
      <span>{open ? '▾ 收合解答' : '▸ 看解答與步驟'}</span>
    </button>
  {/if}

  {#if showSolution}
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

  <!-- 列印：題目＋全部選項＋手寫空白＋答案詳解 -->
  <div class="hidden print:block p-3.5">
    <p class="font-medium leading-relaxed"><span class="font-bold">例 {n}　</span>{@html q}</p>
    {#if options.length}
      <div class="mt-2 space-y-1 text-sm">
        {#each options as opt, i (i)}
          <div><span class="font-semibold">({letters[i]})</span> {@html opt}</div>
        {/each}
      </div>
    {/if}
    <div class="write-area mt-3"></div>
    {#if answer}
      <p class="mt-2 text-sm"><span class="font-bold">答案：</span>{@html answer}</p>
    {/if}
    {#if steps.length}
      <ol class="mt-1 ml-5 list-decimal space-y-0.5 text-sm">
        {#each steps as s, i (i)}<li>{@html s}</li>{/each}
      </ol>
    {/if}
  </div>
</div>
