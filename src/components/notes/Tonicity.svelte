<script lang="ts">
  // 滲透與張力：選溶液（低滲/等滲/高滲）與細胞（動物/植物），看水流方向與細胞變化。
  // 水往溶質濃度高（水勢低）那側移。動物無細胞壁→低滲溶血、高滲皺縮；植物有壁→低滲膨壓、高滲質壁分離。
  let plant = $state(false)
  let tonic = $state<'hypo' | 'iso' | 'hyper'>('hypo')

  const flow = $derived(tonic === 'hypo' ? '水淨流入 →' : tonic === 'hyper' ? '← 水淨流出' : '進出平衡')
  const state = $derived.by(() => {
    if (tonic === 'iso') return { t: '體積不變（正常）', cls: 'badge-ghost' }
    if (plant) return tonic === 'hypo' ? { t: '膨壓上升（飽水、挺）', cls: 'badge-success' } : { t: '質壁分離（plasmolysis）', cls: 'badge-error' }
    return tonic === 'hypo' ? { t: '漲大 → 溶血（破裂）', cls: 'badge-error' } : { t: '皺縮（crenation）', cls: 'badge-warning' }
  })
  // 細胞內圈大小（質壁分離時縮小）
  const r = $derived(tonic === 'hyper' ? (plant ? 14 : 13) : tonic === 'hypo' ? (plant ? 21 : 22) : 18)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">💧</span>
    <span class="font-display font-bold">滲透：細胞在不同溶液</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${!plant ? 'btn-primary' : 'btn-outline'}`} onclick={() => (plant = false)}>動物</button>
      <button type="button" class={`btn btn-xs ${plant ? 'btn-primary' : 'btn-outline'}`} onclick={() => (plant = true)}>植物</button>
    </div>
  </div>

  <div class="mb-3 join">
    {#each [['hypo', '低滲（外溶質少）'], ['iso', '等滲'], ['hyper', '高滲（外溶質多）']] as [k, label] (k)}
      <button type="button" class={`btn join-item btn-xs ${tonic === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (tonic = k as 'hypo' | 'iso' | 'hyper')}>{label}</button>
    {/each}
  </div>

  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
    <svg viewBox="0 0 56 56" class="mx-auto h-24 w-24 shrink-0 sm:mx-0">
      {#if plant}
        <rect x="6" y="6" width="44" height="44" rx="3" fill="none" class="stroke-success" stroke-width="2.5" />
      {/if}
      <circle cx="28" cy="28" r={r} class="fill-primary/15 stroke-primary" stroke-width="2" />
    </svg>
    <div>
      <div class="text-sm font-bold text-base-content/70">{flow}</div>
      <div class="mt-1"><span class={`badge font-bold ${state.cls}`}>{state.t}</span></div>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    水往<b>溶質濃度高（水勢低）</b>的一側移。<b>低滲</b>外面溶質少 → 水流入；<b>高滲</b>外面溶質多 → 水流出。動物細胞沒有細胞壁：低滲會<b>溶血</b>、高滲會<b>皺縮</b>；植物有細胞壁：低滲變<b>膨壓</b>、高滲變<b>質壁分離</b>（綠框＝細胞壁，藍圈＝細胞膜/原生質體）。
  </p>
</div>
