<script lang="ts">
  // lac operon：切換有無乳糖、有無葡萄糖，看兩層調控與表現量。
  // 乳糖 → 移除阻遏蛋白（解除負調控）；無葡萄糖 → cAMP 高 → CAP 活化（加強正調控）。
  let lactose = $state(true)
  let glucose = $state(false)

  const repressorOff = $derived(lactose) // 有乳糖 → 阻遏蛋白離開
  const capActive = $derived(!glucose) // 無葡萄糖 → cAMP 高 → CAP 活化
  const level = $derived.by(() => {
    if (!repressorOff) return { t: '關閉（不表現）', cls: 'badge-error', bar: 'bg-error', w: '5%' }
    return capActive
      ? { t: '高度表現', cls: 'badge-success', bar: 'bg-success', w: '100%' }
      : { t: '低度表現', cls: 'badge-warning', bar: 'bg-warning', w: '30%' }
  })
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔀</span>
    <span class="font-display font-bold">lac operon 調控</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-4">
    <label class="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" class="toggle toggle-sm toggle-primary" bind:checked={lactose} />
      <span>乳糖 {lactose ? '有' : '無'}</span>
    </label>
    <label class="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" class="toggle toggle-sm toggle-secondary" bind:checked={glucose} />
      <span>葡萄糖 {glucose ? '有' : '無'}</span>
    </label>
  </div>

  <div class="grid grid-cols-2 gap-2 text-sm">
    <div class="rounded-box bg-base-200/60 p-2">
      <div class="text-xs text-base-content/55">阻遏蛋白（負調控）</div>
      <div class="font-bold">{repressorOff ? '離開操縱基因 ✓' : '結合操縱基因、擋住轉錄'}</div>
    </div>
    <div class="rounded-box bg-base-200/60 p-2">
      <div class="text-xs text-base-content/55">CAP–cAMP（正調控）</div>
      <div class="font-bold">{capActive ? 'cAMP 高 → CAP 活化 ✓' : 'cAMP 低 → CAP 失活'}</div>
    </div>
  </div>

  <div class="mt-3 flex items-center gap-3">
    <span class="text-sm text-base-content/55">表現量</span>
    <div class="h-3 flex-1 overflow-hidden rounded-full bg-base-200">
      <div class={`h-full rounded-full ${level.bar}`} style={`width:${level.w}`}></div>
    </div>
    <span class={`badge font-bold ${level.cls}`}>{level.t}</span>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    兩層關卡都要過才會大量表現：<b>有乳糖</b>才會移除阻遏蛋白（解除負調控）；<b>沒葡萄糖</b>時 cAMP 上升、活化 CAP（加強正調控）。所以「<b>有乳糖＋無葡萄糖</b>」表現量最高；只要沒乳糖，無論葡萄糖如何都關閉。
  </p>
</div>
