<script lang="ts">
  // 雙性狀乘法原理：兩對基因各選「顯性表現(A_=3/4)」或「隱性(aa=1/4)」，相乘得該表現型在 F2 的比例。
  // 適用兩個異型合子親代自交（AaBb × AaBb），兩對基因自由組合。
  let g1 = $state<'dom' | 'rec'>('dom')
  let g2 = $state<'dom' | 'rec'>('dom')
  const frac = (g: 'dom' | 'rec') => (g === 'dom' ? 3 : 1)
  const num = $derived(frac(g1) * frac(g2)) // 分子（/16）
  const label = (g: 'dom' | 'rec', up: string, lo: string) => (g === 'dom' ? `${up}_（顯性，3/4）` : `${lo}${lo}（隱性，1/4）`)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">✖️</span>
    <span class="font-display font-bold">雙性狀比例（乘法原理）</span>
  </div>
  <p class="mb-3 text-xs text-base-content/60">親代 AaBb × AaBb。各對基因選一個表現型，相乘得它在 F2 的比例（免畫 16 格）。</p>

  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <span class="w-20 text-sm text-base-content/70">第一對</span>
      <div class="join">
        <button type="button" class={`btn btn-xs ${g1 === 'dom' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (g1 = 'dom')}>{label('dom', 'A', 'a')}</button>
        <button type="button" class={`btn btn-xs ${g1 === 'rec' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (g1 = 'rec')}>{label('rec', 'A', 'a')}</button>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <span class="w-20 text-sm text-base-content/70">第二對</span>
      <div class="join">
        <button type="button" class={`btn btn-xs ${g2 === 'dom' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (g2 = 'dom')}>{label('dom', 'B', 'b')}</button>
        <button type="button" class={`btn btn-xs ${g2 === 'rec' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (g2 = 'rec')}>{label('rec', 'B', 'b')}</button>
      </div>
    </div>
  </div>

  <div class="mt-3 rounded-box bg-primary/10 p-3 text-center">
    <span class="font-mono text-sm text-base-content/70">{frac(g1)}/4 × {frac(g2)}/4 = </span>
    <span class="text-xl font-bold tabular-nums text-primary">{num}/16</span>
    <span class="text-sm text-base-content/55"> （{(num / 16 * 100).toFixed(2)}%）</span>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    兩個都顯性 → 9/16；一顯一隱 → 3/16；兩個都隱性 → 1/16。合起來就是 <b>9:3:3:1</b>。例：豌豆「綠色(yy)圓形(R_)」＝ 1/4 × 3/4 ＝ <b>3/16</b>。
  </p>
</div>
