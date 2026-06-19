<script lang="ts">
  // 今日元素「背誦」：一族一族、一週期一週期、一系列一系列地主動回想——給一整列（如 5A），
  // 依序「填元素符號」（N P As Sb Bi Mc），再對答案。資料全由 @/models/elements 推導，
  // 正確性非 LLM。純練習（不綁 SRS）；對一次答案即標記今日元素完成。
  import { RECALL_GROUPS, RECALL_PERIODS, RECALL_SERIES, elementByZ, type RecallSet } from '@/models/elements'
  import Segmented from '@/components/common/Segmented.svelte'
  import Icon from '@/components/common/Icon.svelte'

  let { onfinish }: { onfinish?: () => void } = $props()

  type ModeKey = 'group' | 'period' | 'series'
  const MODES: Record<ModeKey, { hint: string; sets: RecallSet[] }> = {
    group: { hint: '一族一族背（由上而下）', sets: RECALL_GROUPS },
    period: { hint: '一週期一週期背（由左而右）', sets: RECALL_PERIODS },
    series: { hint: 'B 族 3d／4d／5d 過渡系列', sets: RECALL_SERIES },
  }

  let modeKey = $state<ModeKey>('group')
  let setIdx = $state(0)
  let inputs = $state<string[]>([])
  let revealed = $state(false)
  let scored = $state(false) // 已標記今日完成

  const mode = $derived(MODES[modeKey])
  const set = $derived(mode.sets[Math.min(setIdx, mode.sets.length - 1)])
  const members = $derived(set.zs.map((z) => elementByZ(z)!))
  const ok = (j: number) => (inputs[j] ?? '').trim().toLowerCase() === members[j].sym.toLowerCase()
  const results = $derived(revealed ? members.map((_, j) => ok(j)) : [])
  const correctCount = $derived(results.filter(Boolean).length)

  // 換族/週期/系列或換下一組（set 變了）就清空作答——單一處理，取代各 handler 逐一重置。
  $effect(() => {
    inputs = Array(set.zs.length).fill('')
    revealed = false
  })

  function nextSet() {
    setIdx = (Math.min(setIdx, mode.sets.length - 1) + 1) % mode.sets.length
  }
  function check() {
    revealed = true
    if (!scored) {
      scored = true
      onfinish?.()
    }
  }
</script>

<div class="flex flex-col gap-4">
  <!-- 模式切換 -->
  <Segmented
    ariaLabel="背誦模式"
    bind:value={modeKey}
    options={[
      { value: 'group', label: '依主族' },
      { value: 'period', label: '依週期' },
      { value: 'series', label: '依系列' },
    ]}
  />

  <!-- 題目（整列） -->
  <div class="rounded-box border border-base-300 bg-base-200/40 p-4 text-center">
    <p class="text-sm text-base-content/55">{mode.hint}</p>
    <p class="mt-0.5 font-display text-2xl font-bold tracking-tight">
      {set.label}{#if set.name}　·　{set.name}{/if}
    </p>
    <p class="mt-1 text-xs text-base-content/50">依序填入 {members.length} 個元素符號（順序＝週期表排列）</p>
  </div>

  <!-- 填格 -->
  <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
    {#each members as e, j (e.z)}
      <div class="flex flex-col gap-0.5">
        <div class="flex items-center gap-1">
          <span class="w-4 shrink-0 text-right text-xs tabular-nums text-base-content/40">{j + 1}</span>
          <input
            type="text"
            bind:value={inputs[j]}
            disabled={revealed}
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            class="input input-bordered input-sm w-full min-w-0 text-center font-semibold {revealed ? (results[j] ? 'input-success' : 'input-error') : ''}"
            aria-label={`第 ${j + 1} 個元素符號`}
          />
        </div>
        {#if revealed}
          <span class={`pl-5 text-xs tabular-nums ${results[j] ? 'text-success' : 'text-error'}`}>
            {e.sym}·{e.z}{#if e.zh}·{e.zh}{/if}
          </span>
        {/if}
      </div>
    {/each}
  </div>

  <!-- 動作 -->
  {#if revealed}
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class={`text-sm font-semibold tabular-nums ${correctCount === members.length ? 'text-success' : 'text-base-content/70'}`}>
        {correctCount === members.length ? '全對！' : `答對 ${correctCount} / ${members.length}`}
      </p>
      <div class="flex gap-2">
        <button class="btn btn-ghost btn-sm border border-base-300" onclick={() => (revealed = false)}>再試一次</button>
        <button class="btn btn-primary btn-sm" onclick={nextSet}>下一組 <Icon name="arrowRight" class="h-4 w-4" /></button>
      </div>
    </div>
  {:else}
    <button class="btn btn-primary" onclick={check}>對答案</button>
  {/if}
</div>
