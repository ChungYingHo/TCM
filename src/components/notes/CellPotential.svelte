<script lang="ts">
  // 電池電位：選兩個電極（各有 E°），E° 大的當陰極（還原）、小的當陽極（氧化）。
  // E°cell = E°陰 − E°陽（伽凡尼電池必 > 0），再用 ΔG° = −nFE°cell 看自發。
  const F = 96500
  type E = { name: string; e: number }
  const ELS: E[] = [
    { name: 'Li⁺/Li', e: -3.04 }, { name: 'Zn²⁺/Zn', e: -0.76 }, { name: 'Fe²⁺/Fe', e: -0.44 },
    { name: '2H⁺/H₂', e: 0.0 }, { name: 'Cu²⁺/Cu', e: 0.34 }, { name: 'Ag⁺/Ag', e: 0.8 },
  ]
  let a = $state(1) // Zn
  let b = $state(4) // Cu
  let n = $state(2)

  const eA = $derived(ELS[a].e), eB = $derived(ELS[b].e)
  const cathode = $derived(eA >= eB ? ELS[a] : ELS[b])
  const anode = $derived(eA >= eB ? ELS[b] : ELS[a])
  const cell = $derived(cathode.e - anode.e)
  const dG = $derived((-n * F * cell) / 1000) // kJ
  const same = $derived(a === b)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔋</span>
    <span class="font-display font-bold">電池電位 E°cell 與 ΔG°</span>
  </div>

  <div class="mb-3 grid grid-cols-2 gap-2 text-sm">
    <label class="flex flex-col gap-1">電極 A
      <select bind:value={a} class="select select-bordered select-sm">
        {#each ELS as el, k (el.name)}<option value={k}>{el.name}（{el.e > 0 ? '+' : ''}{el.e}）</option>{/each}
      </select>
    </label>
    <label class="flex flex-col gap-1">電極 B
      <select bind:value={b} class="select select-bordered select-sm">
        {#each ELS as el, k (el.name)}<option value={k}>{el.name}（{el.e > 0 ? '+' : ''}{el.e}）</option>{/each}
      </select>
    </label>
  </div>

  {#if same}
    <div class="rounded-box bg-base-200/60 p-3 text-center text-sm text-base-content/60">兩個電極相同，沒有電位差。換一個電極。</div>
  {:else}
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div class="rounded-lg bg-base-200/60 p-2.5">
        <div class="text-xs text-base-content/55">陰極（還原，E° 大）</div>
        <div class="font-bold">{cathode.name}</div>
      </div>
      <div class="rounded-lg bg-base-200/60 p-2.5">
        <div class="text-xs text-base-content/55">陽極（氧化，E° 小）</div>
        <div class="font-bold">{anode.name}</div>
      </div>
    </div>
    <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
      <div class="rounded-lg bg-primary/10 p-2.5 text-center">
        <div class="text-xs text-base-content/55">E°cell = E°陰 − E°陽</div>
        <div class="text-lg font-bold tabular-nums text-primary">+{cell.toFixed(2)} V</div>
      </div>
      <div class="rounded-lg bg-base-200/60 p-2.5 text-center">
        <div class="text-xs text-base-content/55">ΔG° = −nFE°cell（n={n}）</div>
        <div class="font-bold tabular-nums text-success">{dG.toFixed(0)} kJ</div>
      </div>
    </div>
    <label class="mt-2 flex items-center gap-2 text-xs">轉移電子數 n
      <input type="number" min="1" max="6" bind:value={n} class="input input-bordered input-xs w-16" />
    </label>
  {/if}

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    E° 大的半反應比較想得電子 → 當<b>陰極（還原）</b>，E° 小的當<b>陽極（氧化）</b>。<b>E°cell = E°陰 − E°陽</b> 永遠為正（伽凡尼電池自發）。再由 <b>ΔG° = −nFE°cell</b>（負值代表自發）。三件套等價：E°cell &gt; 0 ↔ ΔG° &lt; 0 ↔ K &gt; 1。
  </p>
</div>
