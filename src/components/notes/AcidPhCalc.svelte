<script lang="ts">
  // 三招算 pH：選類型（強酸/弱酸/強鹼/弱鹼），設濃度 C（弱者再設 Ka/Kb），算出 [H⁺]/[OH⁻] 與 pH。
  type Kind = 'sa' | 'wa' | 'sb' | 'wb'
  let kind = $state<Kind>('sa')
  let C = $state(0.1) // mol/L
  let Ka = $state(1.8e-5) // 弱酸/弱鹼常數

  const sC = $derived(Number.isFinite(C) && C > 0 ? C : 1e-7)
  const sKa = $derived(Number.isFinite(Ka) && Ka > 0 ? Ka : 1e-5)
  const isBase = $derived(kind === 'sb' || kind === 'wb')
  const isWeak = $derived(kind === 'wa' || kind === 'wb')

  const KW = 1.0e-14 // 水的離子積，強酸強鹼併入水的自解離，極稀時才不會算出鹼性的酸
  const strongConc = $derived((sC + Math.sqrt(sC * sC + 4 * KW)) / 2)
  const conc = $derived(isWeak ? Math.sqrt(sKa * sC) : strongConc) // [H⁺] 或 [OH⁻]
  const pX = $derived(-Math.log10(conc)) // pH 或 pOH
  const pH = $derived(Math.max(0, Math.min(14, isBase ? 14 - pX : pX)))

  const KINDS: [Kind, string][] = [['sa', '強酸'], ['wa', '弱酸'], ['sb', '強鹼'], ['wb', '弱鹼']]
  const formula = $derived(
    kind === 'sa' ? '[H⁺] = C，pH = −log[H⁺]'
    : kind === 'wa' ? '[H⁺] ≈ √(Ka·C)，pH = −log[H⁺]'
    : kind === 'sb' ? '[OH⁻] = C，pH = 14 − pOH'
    : '[OH⁻] ≈ √(Kb·C)，pH = 14 − pOH',
  )
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧪</span>
    <span class="font-display font-bold">三招算 pH</span>
  </div>

  <div class="join mb-3">
    {#each KINDS as [k, label] (k)}
      <button type="button" class={`btn join-item btn-sm ${kind === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (kind = k)}>{label}</button>
    {/each}
  </div>

  <div class="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
    <label class="flex items-center gap-1.5">濃度 C
      <input type="number" min="0.0001" step="0.01" bind:value={C} class="input input-bordered input-sm w-24" /> M
    </label>
    {#if isWeak}
      <label class="flex items-center gap-1.5">{isBase ? 'Kb' : 'Ka'}
        <input type="number" min="0" step="0.00001" bind:value={Ka} class="input input-bordered input-sm w-28" />
      </label>
    {/if}
  </div>

  <div class="grid grid-cols-2 gap-2 text-sm">
    <div class="rounded-lg bg-base-200/70 p-2.5 text-center">
      <div class="text-xs text-base-content/55">{isBase ? '[OH⁻]' : '[H⁺]'} (M)</div>
      <div class="font-bold tabular-nums">{conc.toExponential(2)}</div>
    </div>
    <div class="rounded-lg bg-primary/10 p-2.5 text-center">
      <div class="text-xs text-base-content/55">pH</div>
      <div class="text-lg font-bold tabular-nums text-primary">{pH.toFixed(2)}</div>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    用的公式：<b>{formula}</b>。先判斷是強的（完全解離，[H⁺] 或 [OH⁻] = 濃度）還是弱的（只解離一點點，用 Ka/Kb 開根號），鹼類算出 pOH 再用 <b>pH + pOH = 14</b> 換回 pH。
  </p>
</div>
