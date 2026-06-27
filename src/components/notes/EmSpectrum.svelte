<script lang="ts">
  // 電磁波譜：左→右 頻率／能量增、波長減。每段標出波長範圍(會考)，點段看化學用途。
  // 可見光放大成紅→紫(紅波長最長/頻率最低)。用途對照課本表。
  type Band = {
    key: string; label: string; en: string
    lam: string; effect: string; use: string; hue: number
  }
  // 由低頻長波(左) → 高頻短波(右)
  const BANDS: Band[] = [
    { key: 'radio', label: '無線電波', en: 'radiowave', lam: 'λ ＝ 1–5 m', effect: '原子核自旋狀態改變', use: '探測 C、H 骨架（NMR）', hue: 20 },
    { key: 'micro', label: '微波', en: 'microwave', lam: 'λ ≈ 12 cm', effect: '分子轉動（H₂O）', use: '加熱食物（微波爐）', hue: 40 },
    { key: 'ir', label: '紅外光', en: 'IR', lam: 'ṽ ＝ 400–4000 cm⁻¹', effect: '化學鍵振動', use: '探測官能基（IR 光譜）', hue: 12 },
    { key: 'vis', label: '可見光', en: 'VIS', lam: 'λ ＝ 400–700 nm', effect: '價電子躍遷', use: '探測共軛系統、焰色、UV-Vis', hue: 130 },
    { key: 'uv', label: '紫外光', en: 'UV', lam: 'λ ＝ 200–400 nm', effect: '價電子躍遷', use: '探測共軛系統', hue: 270 },
    { key: 'xray', label: 'X 射線', en: 'X-ray', lam: 'λ ≈ 1×10⁻¹⁰ m', effect: '晶體繞射', use: '探測晶體結構（莫色勒測原子序）', hue: 290 },
    { key: 'gamma', label: 'γ 射線', en: 'γ-ray', lam: 'λ ＜ 0.01 nm', effect: '核反應、游離', use: '高能游離輻射', hue: 320 },
  ]
  let sel = $state(3) // 預設可見光
  const band = $derived(BANDS[sel])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🌈</span>
    <span class="font-display font-bold">電磁波譜・能量地圖</span>
  </div>

  <div class="mb-1 flex justify-between text-[0.7rem] font-semibold text-base-content/60">
    <span>← 波長 λ 長、頻率低、能量小</span>
    <span>波長短、頻率高、能量大 →</span>
  </div>

  <!-- 譜帶：標籤＋波長 -->
  <div class="flex overflow-hidden rounded-lg">
    {#each BANDS as b, k (b.key)}
      <button
        type="button"
        onclick={() => (sel = k)}
        class={`flex-1 px-0.5 py-1.5 text-center leading-tight text-white transition ${sel === k ? 'ring-2 ring-base-content ring-inset' : 'opacity-80 hover:opacity-100'}`}
        style={`background:oklch(0.6 0.16 ${b.hue})`}
      >
        <span class="block text-[0.58rem] font-bold sm:text-[0.7rem]">{b.label}</span>
        <span class="block text-[0.5rem] opacity-90 sm:text-[0.58rem]">{b.lam}</span>
      </button>
    {/each}
  </div>

  <!-- 選定段細節（化學用途，對照課本） -->
  <div class="mt-3 rounded-box bg-base-200/60 p-3 text-sm">
    <div class="flex flex-wrap items-baseline gap-x-2">
      <span class="font-bold" style={`color:oklch(0.5 0.16 ${band.hue})`}>{band.label}</span>
      <span class="text-xs text-base-content/55">{band.en}</span>
      <span class="ml-auto text-xs tabular-nums text-base-content/60">{band.lam}</span>
    </div>
    <div class="mt-1.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
      <p class="text-base-content/80"><b>對分子的影響：</b>{band.effect}</p>
      <p class="text-base-content/80"><b>化學用途：</b>{band.use}</p>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    口訣（頻率／能量由低到高）：<b>無線電 → 微波 → 紅外 → 可見 → 紫外 → X 光 → γ</b>。比頻率先在這條軸上定位——
    例如焰色呈紅的鍶，其光頻率「只高於紅外光」（紅是可見光裡頻率最低的）。
  </p>
</div>
