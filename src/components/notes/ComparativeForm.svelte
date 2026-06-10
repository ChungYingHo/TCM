<script lang="ts">
  // 比較級與最高級構成：點一類，看規則與例。
  type Rule = { name: string; rule: string; eg: string }
  const RULES: Rule[] = [
    { name: '單音節', rule: '加 -er / -est', eg: 'tall → taller → tallest' },
    { name: '雙音節 -y', rule: '去 y 加 -ier / -iest', eg: 'busy → busier → busiest' },
    { name: '多音節', rule: '前加 more / most', eg: 'careful → more careful → most careful' },
    { name: '不規則', rule: '需個別熟記', eg: 'good→better→best；bad→worse→worst；many/much→more→most；little→less→least' },
  ]
  let i = $state(0)
  const c = $derived(RULES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📊</span>
    <span class="font-display font-bold">比較級與最高級構成</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each RULES as r, k (r.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{r.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{c.name}</div>
    <div class="text-base-content/80">{c.rule}</div>
    <div class="mt-1 rounded bg-base-100 px-2 py-1 font-mono text-base-content/75">{c.eg}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    兩者比較級 + <b>than</b>；三者以上最高級 + <b>the</b>；加強用 much / far / even（不可用 very）。
  </p>
</div>
