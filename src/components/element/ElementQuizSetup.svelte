<script lang="ts">
  import {
    QUIZ_MODES,
    availableTypesForElements,
    quizzableCount,
    type QuestionType,
  } from '@/utils/elementQuiz'
  import {
    QUIZ_CORE_ZS,
    COMMON_MASS,
    NOBLE_GAS_ZS,
    B_GROUP_HIGHLIGHT,
  } from '@/models/elements'
  import Icon from '@/components/common/Icon.svelte'

  let { onstart }: {
    onstart: (config: { types: QuestionType[]; elementZs: number[]; count: number }) => void
  } = $props()

  interface Preset {
    key: string
    label: string
    note: string
    zs: number[]
  }

  const PRESETS: Preset[] = [
    { key: 'core', label: 'Z = 1–36', note: '36 個', zs: Array.from({ length: 36 }, (_, i) => i + 1) },
    { key: 'mass', label: '必背原子量', note: '24 個', zs: Object.keys(COMMON_MASS).map(Number).sort((a, b) => a - b) },
    { key: 'noble', label: '8A 惰性氣體', note: '6 個', zs: [...NOBLE_GAS_ZS] },
    { key: 'bgroup', label: 'B 族', note: `${new Set(B_GROUP_HIGHLIGHT.flatMap((g) => g.zs)).size} 個`, zs: [...new Set(B_GROUP_HIGHLIGHT.flatMap((g) => g.zs))] },
    { key: 'all', label: '全部題池', note: `${QUIZ_CORE_ZS.length} 個`, zs: [...QUIZ_CORE_ZS] },
  ]

  const COUNTS = [5, 10, 15, 20]

  let selectedModes = $state<Set<string>>(new Set(QUIZ_MODES.map((m) => m.key)))
  let selectedPreset = $state('core')
  let count = $state(10)

  const currentZs = $derived(PRESETS.find((p) => p.key === selectedPreset)?.zs ?? [...QUIZ_CORE_ZS])
  const availTypes = $derived(availableTypesForElements(currentZs))
  const selectedTypes = $derived(
    QUIZ_MODES
      .filter((m) => selectedModes.has(m.key))
      .flatMap((m) => m.types)
      .filter((t) => availTypes.has(t)),
  )
  const maxQ = $derived(quizzableCount(currentZs, selectedTypes))
  const effectiveCount = $derived(Math.min(count, maxQ))
  const canStart = $derived(selectedTypes.length > 0 && maxQ > 0)

  function toggleMode(key: string) {
    // transient builder for an immutable update of the reactive `selectedModes`,
    // not reactive state itself — SvelteSet is unnecessary here.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const next = new Set(selectedModes)
    if (next.has(key)) {
      next.delete(key)
      if (next.size > 0) selectedModes = next
    } else {
      next.add(key)
      selectedModes = next
    }
  }

  function start() {
    if (!canStart) return
    onstart({ types: selectedTypes, elementZs: currentZs, count: effectiveCount })
  }
</script>

<div class="mx-auto flex max-w-lg flex-col gap-6">

  <!-- 題型 -->
  <section>
    <h3 class="mb-3 text-sm font-bold text-base-content/70">選擇題型</h3>
    <div class="grid grid-cols-2 gap-2">
      {#each QUIZ_MODES as mode (mode.key)}
        {@const avail = mode.types.some((t) => availTypes.has(t))}
        {@const selected = selectedModes.has(mode.key) && avail}
        <button
          class="rounded-box relative flex flex-col items-center gap-2 border-2 px-3 py-4 transition-colors
            {selected ? 'border-primary bg-primary/5' : 'border-base-300 bg-base-100'}
            {!avail ? 'cursor-not-allowed opacity-35' : ''}"
          disabled={!avail}
          onclick={() => toggleMode(mode.key)}
        >
          <span class="text-xs font-bold {selected ? 'text-primary' : 'text-base-content/60'}">{mode.label}</span>
          <div class="flex items-center gap-2">
            <span class="rounded-lg border border-base-300 bg-white px-2.5 py-1 font-display text-base font-bold shadow-sm">{mode.example[0]}</span>
            <span class="text-base-content/30">→</span>
            <span class="rounded-lg border border-base-300 bg-base-200 px-2.5 py-1 font-display text-base font-bold shadow-sm">{mode.example[1]}</span>
          </div>
          {#if selected}
            <span class="absolute right-2 top-2">
              <Icon name="check" class="h-4 w-4 text-primary" />
            </span>
          {/if}
        </button>
      {/each}
    </div>
  </section>

  <!-- 元素範圍 -->
  <section>
    <h3 class="mb-3 text-sm font-bold text-base-content/70">選擇範圍</h3>
    <div class="flex flex-wrap gap-2">
      {#each PRESETS as preset (preset.key)}
        <button
          class="btn btn-sm {selectedPreset === preset.key ? 'btn-primary' : 'btn-outline'}"
          onclick={() => { selectedPreset = preset.key }}
        >
          {preset.label}
          <span class="badge badge-sm {selectedPreset === preset.key ? 'badge-neutral' : ''}">{preset.note}</span>
        </button>
      {/each}
    </div>
  </section>

  <!-- 題數 -->
  <section>
    <h3 class="mb-3 text-sm font-bold text-base-content/70">題數</h3>
    <div class="flex gap-2">
      {#each COUNTS as n (n)}
        <button
          class="btn btn-sm flex-1 {count === n ? 'btn-primary' : 'btn-outline'}"
          onclick={() => { count = n }}
        >
          {n}
        </button>
      {/each}
    </div>
    {#if maxQ > 0 && maxQ < count}
      <p class="mt-2 text-xs text-base-content/50">此組合最多可出 {maxQ} 題</p>
    {/if}
  </section>

  <!-- 開始 -->
  <button
    class="btn btn-primary w-full text-base"
    disabled={!canStart}
    onclick={start}
  >
    開始練習
    {#if canStart}
      <span class="text-sm opacity-70">（{effectiveCount} 題）</span>
    {/if}
  </button>
</div>
