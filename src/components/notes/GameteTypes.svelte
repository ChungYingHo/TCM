<script lang="ts">
  // 異型合子對數 k → 配子種類數 2^k。AaBb（k=2）→ 4 種。
  let k = $state(2)
  const types = $derived(Math.pow(2, k))
  const ALLE = ['Aa', 'Bb', 'Cc', 'Dd', 'Ee']
  const genotype = $derived(ALLE.slice(0, k).join(''))
  // 列出 k=1~3 的配子組合（k 太大就不列）
  const gametes = $derived.by(() => {
    if (k > 3) return []
    const letters = ['Aa', 'Bb', 'Cc'].slice(0, k)
    let combos = ['']
    for (const pair of letters) {
      const next: string[] = []
      for (const c of combos) for (const allele of [pair[0], pair[1]]) next.push(c + allele)
      combos = next
    }
    return combos
  })
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🎲</span>
    <span class="font-display font-bold">配子種類數：2ᵏ</span>
  </div>

  <label class="mb-1 flex items-center justify-between text-sm">
    <span>異型合子對數 k = <b class="text-primary">{k}</b></span>
    <span class="text-xs text-base-content/55">基因型 {genotype}</span>
  </label>
  <input type="range" min="1" max="5" step="1" bind:value={k} class="range range-primary range-xs" />

  <div class="mt-3 rounded-box bg-primary/10 p-3 text-center">
    <span class="text-sm text-base-content/55">配子種類 = 2<sup>{k}</sup> = </span>
    <span class="text-xl font-bold tabular-nums text-primary">{types}</span>
    <span class="text-sm text-base-content/55"> 種（比例 1:1:…）</span>
  </div>

  {#if gametes.length}
    <div class="mt-2 flex flex-wrap justify-center gap-1">
      {#each gametes as g (g)}
        <span class="badge badge-outline badge-sm font-mono">{g}</span>
      {/each}
    </div>
  {:else}
    <p class="mt-2 text-center text-xs text-base-content/55">k≥4 種類太多不一一列出（共 {types} 種）。</p>
  {/if}

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    每對<b>異型合子</b>（如 Aa）在減數分裂<b>獨立分配</b>，各貢獻 2 種可能。k 對 → <b>2ᵏ 種配子</b>。例如 <b>AaBb（k=2）→ 4 種</b>（AB、Ab、aB、ab）。注意：這是<b>配子種類</b>，不是自交後代 9:3:3:1 的表現型比例。
  </p>
</div>
