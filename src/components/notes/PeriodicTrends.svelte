<script lang="ts">
  // 週期表三大趨勢互動：切換 原子半徑／第一游離能／電負度，看「往右、往下」各是增還是減、
  // 以及最大者在哪一角。把 Zeff（核拉力）vs 電子層數 兩股力量的結果一眼視覺化。
  type Prop = 'radius' | 'ie' | 'en'
  let { initial = 'radius' }: { initial?: Prop } = $props()
  let prop = $state<Prop>(initial)

  const META: Record<Prop, {
    name: string; right: string; down: string; maxAt: 'tr' | 'bl'; maxText: string; note: string
  }> = {
    radius: {
      name: '原子半徑', right: '變小', down: '變大', maxAt: 'bl',
      maxText: '左下角最大（如 Cs、Fr）',
      note: '往右：Zeff↑ 把電子拉得更緊 → 變小。往下：多一層電子、離核更遠 → 變大。',
    },
    ie: {
      name: '第一游離能', right: '變大', down: '變小', maxAt: 'tr',
      maxText: '右上角最大（稀有氣體 He 之冠）',
      note: '往右：核抓得更緊、更難拔走 → 變大。往下：外層更遠、易拔 → 變小。例外：N＞O、Be＞B（半滿、2s 較穩）。',
    },
    en: {
      name: '電負度', right: '變大', down: '變小', maxAt: 'tr',
      maxText: '右上角最大（F＝3.98）',
      note: '「搶電子」的能力，趨勢與游離能相同。稀有氣體不形成鍵，一般不列入比較。',
    },
  }
  const m = $derived(META[prop])
  // 漸層指向最大角：右上(tr) 或 左下(bl)
  const grad = $derived(
    m.maxAt === 'tr'
      ? 'to top right, color-mix(in oklab, var(--color-primary) 4%, transparent), color-mix(in oklab, var(--color-primary) 42%, transparent)'
      : 'to bottom left, color-mix(in oklab, var(--color-primary) 4%, transparent), color-mix(in oklab, var(--color-primary) 42%, transparent)',
  )
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🗺️</span>
    <span class="font-display font-bold">週期表三大趨勢</span>
  </div>

  <div class="join mb-3">
    {#each Object.entries(META) as [key, v] (key)}
      <button type="button" class={`btn join-item btn-sm ${prop === key ? 'btn-primary' : 'btn-outline'}`} onclick={() => (prop = key as Prop)}>{v.name}</button>
    {/each}
  </div>

  <!-- 週期表示意矩形：漸層指向最大角，四角標出大小 -->
  <div class="relative h-40 overflow-hidden rounded-lg border border-base-300" style={`background:linear-gradient(${grad})`}>
    <!-- 淡格線營造「表格」感 -->
    <div class="absolute inset-0 opacity-40"
      style="background-image:repeating-linear-gradient(90deg,transparent,transparent 11.1%,color-mix(in oklab,var(--color-base-content) 8%,transparent) 11.1%,color-mix(in oklab,var(--color-base-content) 8%,transparent) calc(11.1% + 1px)),repeating-linear-gradient(0deg,transparent,transparent 25%,color-mix(in oklab,var(--color-base-content) 8%,transparent) 25%,color-mix(in oklab,var(--color-base-content) 8%,transparent) calc(25% + 1px))"></div>
    <span class={`absolute badge badge-primary badge-sm font-bold ${m.maxAt === 'tr' ? 'top-2 right-2' : 'bottom-2 left-2'}`}>最大</span>
    <span class={`absolute badge badge-ghost badge-sm ${m.maxAt === 'tr' ? 'bottom-2 left-2' : 'top-2 right-2'}`}>最小</span>
    <span class="absolute top-1.5 left-2 text-[0.65rem] text-base-content/40">← 週期表 →</span>
  </div>

  <!-- 兩個方向的結論 -->
  <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
    <div class="rounded-lg bg-base-200/70 p-2.5">
      <div class="text-xs text-base-content/55">同週期往右 →</div>
      <div class="font-bold text-primary">{m.name}{m.right}</div>
    </div>
    <div class="rounded-lg bg-base-200/70 p-2.5">
      <div class="text-xs text-base-content/55">同族往下 ↓</div>
      <div class="font-bold text-primary">{m.name}{m.down}</div>
    </div>
  </div>

  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    <b>{m.maxText}</b>。{m.note}
  </p>
</div>
