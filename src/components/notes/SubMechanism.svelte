<script lang="ts">
  // SN1/SN2/E1/E2 判斷器：選受質級數與試劑類型，給出最可能的路徑與理由。
  // 對應 chem-alkyl-halides 第七節的決策表，兩邊內容必須一致。
  type Carbon = '甲基' | '1°' | '2°' | '3°'
  type Reagent = 'nu' | 'small' | 'bulky' | 'weak'
  let c = $state<Carbon>('2°')
  let r = $state<Reagent>('nu')

  const CARBONS: Carbon[] = ['甲基', '1°', '2°', '3°']
  const REAGENT_LABEL: Record<Reagent, string> = {
    nu: '強親核劑而弱鹼（I⁻、CN⁻、RS⁻）',
    small: '體積小的強鹼（NaOEt、NaOH）',
    bulky: '體積大的強鹼（t-BuOK）',
    weak: '弱親核劑且弱鹼（H₂O、ROH 等質子性溶劑）',
  }
  const TABLE: Record<Carbon, Record<Reagent, { m: string; why: string }>> = {
    甲基: {
      nu: { m: 'SN2', why: '甲基碳周圍完全沒有阻礙，強親核劑直接從背面攻擊。' },
      small: { m: 'SN2', why: '甲基碳根本沒有 β 氫可以拔，脫去不可能發生，只剩取代。' },
      bulky: { m: 'SN2', why: '沒有 β 氫，即使鹼很大也只能去攻碳。' },
      weak: { m: '幾乎不反應', why: '甲基碳陽離子最不穩定，弱試劑推不動、受質也不會自己解離。' },
    },
    '1°': {
      nu: { m: 'SN2', why: '1° 碳的空間阻礙小，強親核劑背面攻擊，該碳構型反轉。' },
      small: { m: 'SN2 為主', why: '小鹼鑽得進碳，取代勝過脫去，只有少量 E2 副產物。' },
      bulky: { m: 'E2', why: '大鹼擠不到 1° 碳上，改拔外圍的 β 氫，翻成脫去。' },
      weak: { m: '幾乎不反應', why: '1° 碳陽離子太不穩定，走不了 SN1 與 E1。' },
    },
    '2°': {
      nu: { m: 'SN2', why: '強親核劑而弱鹼，配上非質子性極性溶劑偏向取代。' },
      small: { m: 'E2 為主', why: '2° 碳已經有些阻礙，強鹼改拔 β 氫，照 Zaitsev 得取代基較多的烯。' },
      bulky: { m: 'E2', why: '大鹼只搆得到最外圍的 β 氫，得 Hofmann 產物。' },
      weak: { m: 'SN1 與 E1', why: '2° 碳陽離子還算穩定，質子性溶劑下靠自己解離，取代產物外消旋。' },
    },
    '3°': {
      nu: { m: 'SN1 與 E1（慢）', why: '3° 碳的背面被完全封住，SN2 不可能。試劑鹼性又不夠強，只能等受質自己解離。' },
      small: { m: 'E2', why: '強鹼拔 β 氫，照 Zaitsev 得取代基較多的烯。' },
      bulky: { m: 'E2', why: '3° 受質配大鹼是最典型的脫去條件。' },
      weak: { m: 'SN1 與 E1', why: '3° 碳陽離子最穩定，質子性溶劑下解離最快，取代與脫去同時發生。' },
    },
  }
  const res = $derived(TABLE[c][r])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔀</span>
    <span class="font-display font-bold">SN1 / SN2 / E1 / E2 判斷器</span>
  </div>

  <div class="mb-2 text-sm">
    受質的級數
    <div class="join ml-1">
      {#each CARBONS as v (v)}
        <button
          type="button"
          class={`btn join-item btn-sm ${c === v ? 'btn-primary' : 'btn-outline'}`}
          onclick={() => (c = v)}>{v}</button
        >
      {/each}
    </div>
  </div>
  <div class="mb-3 flex flex-col gap-1 text-sm">
    試劑與條件
    {#each Object.entries(REAGENT_LABEL) as [key, label] (key)}
      <button
        type="button"
        class={`rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${r === key ? 'bg-primary/15 font-semibold text-primary' : 'bg-base-200/50 hover:bg-base-200'}`}
        onclick={() => (r = key as Reagent)}>{label}</button
      >
    {/each}
  </div>

  <div class="rounded-box bg-primary/10 p-3 text-center">
    <div class="text-xs text-base-content/55">最可能的路徑</div>
    <div class="text-xl font-bold text-primary">{res.m}</div>
  </div>
  <p class="mt-2 text-xs leading-relaxed text-base-content/70">{res.why}</p>
  <ul class="mt-2 list-disc pl-5 text-xs leading-relaxed text-base-content/60">
    <li>受質級數：1° 利 SN2，3° 利 SN1 與 E1，2° 由試劑決定</li>
    <li>試劑強弱：強親核劑或強鹼推向 SN2 與 E2</li>
    <li>鹼的體積：體積大的強鹼一律走 E2</li>
    <li>溶劑：質子性推向 SN1 與 E1，非質子性極性推向 SN2 與 E2</li>
  </ul>
</div>
