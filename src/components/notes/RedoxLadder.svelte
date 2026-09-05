<script lang="ts">
  // 標準還原電位 E° 階梯：E° 越大（上面）= 越強氧化劑（左側氧化態），
  // E° 越小（下面）= 越強還原劑（右側還原態）。切換看哪個是最強氧化劑/還原劑。
  // n = 該半反應轉移的電子數，畫面上要印出來，否則式子電子數不守恆。
  type HR = { ox: string, red: string, e: number, n: number }
  const HR: HR[] = [
    { ox: 'F₂', red: '2F⁻', e: 2.87, n: 2 },
    { ox: 'Cl₂', red: '2Cl⁻', e: 1.36, n: 2 },
    { ox: 'Ag⁺', red: 'Ag', e: 0.8, n: 1 },
    { ox: 'Cu²⁺', red: 'Cu', e: 0.34, n: 2 },
    { ox: '2H⁺', red: 'H₂', e: 0.0, n: 2 },
    { ox: 'Fe²⁺', red: 'Fe', e: -0.44, n: 2 },
    { ox: 'Zn²⁺', red: 'Zn', e: -0.76, n: 2 },
    { ox: 'Mg²⁺', red: 'Mg', e: -2.37, n: 2 },
  ]
  let mode = $state<'ox' | 'red'>('ox')
  const top = HR[0], bottom = HR[HR.length - 1]
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">🪜</span>
    <span class="font-display font-bold">標準還原電位 E° 階梯</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${mode === 'ox' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (mode = 'ox')}>找最強氧化劑</button>
      <button type="button" class={`btn btn-xs ${mode === 'red' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (mode = 'red')}>找最強還原劑</button>
    </div>
  </div>

  <div class="flex flex-col gap-1">
    {#each HR as h, k (h.ox)}
      {@const hot = (mode === 'ox' && k === 0) || (mode === 'red' && k === HR.length - 1)}
      <div class={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${hot ? 'bg-primary/20 font-bold' : 'bg-base-200/50'}`}>
        <span class="font-mono">
          {#if mode === 'ox'}<span class={k === 0 ? 'text-primary' : ''}>{h.ox}</span> + {h.n === 1 ? '' : h.n}e⁻ → {h.red}{:else}{h.ox} + {h.n === 1 ? '' : h.n}e⁻ → <span class={k === HR.length - 1 ? 'text-primary' : ''}>{h.red}</span>{/if}
        </span>
        <span class="tabular-nums {h.e >= 0 ? 'text-base-content/70' : 'text-base-content/50'}">{h.e > 0 ? '+' : ''}{h.e.toFixed(2)} V</span>
      </div>
    {/each}
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    {#if mode === 'ox'}
      <b>E° 最大（最上面）</b>＝最想搶電子 → 該行<b>左側的氧化態（{top.ox}）是最強氧化劑</b>。
    {:else}
      <b>E° 最小、最負（最下面）</b>＝最想丟電子 → 該行<b>右側的還原態（{bottom.red}）是最強還原劑</b>。
    {/if}
    口訣：E° 越正越會搶電子（強氧化劑）、越負越會丟電子（強還原劑）。
  </p>
</div>
