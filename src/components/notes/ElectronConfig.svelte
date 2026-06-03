<script lang="ts">
  // Interactive electron configuration (Z = 1–36) — type/drag the atomic number
  // and watch the aufbau filling. Reinforces 4s-before-3d and counting valence e⁻.
  const ORDER: [string, number][] = [
    ['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2], ['3d', 10], ['4p', 6],
  ]
  const SYM = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al',
    'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni',
    'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr']
  const sup = (n: number) => String(n).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])

  let z = $state(17)

  const filled = $derived.by(() => {
    let left = z
    const out: { orb: string; e: number }[] = []
    for (const [orb, cap] of ORDER) {
      if (left <= 0) break
      const e = Math.min(cap, left)
      out.push({ orb, e })
      left -= e
    }
    return out
  })
  const valence = $derived.by(() => {
    // valence = electrons in the highest principal shell (n)
    const maxN = Math.max(...filled.map((f) => +f.orb[0]))
    return filled.filter((f) => +f.orb[0] === maxN).reduce((s, f) => s + f.e, 0)
  })
</script>

<div class="my-4 rounded-box border border-base-300 bg-base-100 p-4">
  <div class="mb-2 flex flex-wrap items-center gap-3">
    <label class="flex items-center gap-2 text-sm">原子序 Z
      <input type="number" min="1" max="36" bind:value={z} class="input input-bordered input-sm w-20" />
    </label>
    <span class="badge badge-primary badge-lg font-bold">{SYM[z] ?? '?'}</span>
  </div>
  <input type="range" min="1" max="36" step="1" bind:value={z} class="range range-primary range-sm w-full" aria-label="調整原子序" />

  <div class="mt-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-base">
    {#each filled as f, i (i)}
      <span class={`rounded px-1 ${i === filled.length - 1 ? 'bg-accent/20 font-bold text-accent' : ''}`}>
        {f.orb}{sup(f.e)}
      </span>
    {/each}
  </div>
  <p class="mt-2 text-xs opacity-70">
    最外層（價電子）共 <b class="text-accent">{valence}</b> 個。注意填到第四週期時 <b>4s 先於 3d</b> 填入。
  </p>
</div>
