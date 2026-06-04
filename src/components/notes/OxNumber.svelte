<script lang="ts">
  // 氧化數判定：選化合物，看目標元素的氧化數與算法。特別標出 O、H 的常考特例。
  type C = { f: string; el: string; ox: string; why: string; special: boolean }
  const CPDS: C[] = [
    { f: 'K₂Cr₂O₇', el: 'Cr', ox: '+6', why: '2×K(+1)=+2、7×O(−2)=−14；2 個 Cr：2x + 2 − 14 = 0 → x = +6', special: false },
    { f: 'KMnO₄', el: 'Mn', ox: '+7', why: 'K(+1)、4×O(−2)=−8；Mn：x + 1 − 8 = 0 → x = +7', special: false },
    { f: 'H₂SO₄', el: 'S', ox: '+6', why: '2×H(+1)=+2、4×O(−2)=−8；S：x + 2 − 8 = 0 → x = +6', special: false },
    { f: 'H₂O₂', el: 'O', ox: '−1', why: '過氧化物！O–O 單鍵，每個 O 是 −1（不是 −2）', special: true },
    { f: 'KO₂', el: 'O', ox: '−½', why: '超氧化物！整個 O₂⁻ 帶 −1，兩個 O 平分 → 每個 −½', special: true },
    { f: 'OF₂', el: 'O', ox: '+2', why: 'F 更電負、恆為 −1，O 反而被拉成 +2', special: true },
    { f: 'NaH', el: 'H', ox: '−1', why: '金屬氫化物！H 是 −1（不是 +1）', special: true },
  ]
  let i = $state(0)
  const c = $derived(CPDS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔢</span>
    <span class="font-display font-bold">氧化數判定</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each CPDS as cc, k (cc.f)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{cc.f}</button>
    {/each}
  </div>

  <div class={`rounded-box p-3.5 ${c.special ? 'bg-accent/10' : 'bg-base-200/60'}`}>
    <div class="flex items-center justify-between">
      <span class="text-sm">在 <b class="font-mono">{c.f}</b> 中，<b>{c.el}</b> 的氧化數</span>
      <span class={`text-2xl font-bold tabular-nums ${c.special ? 'text-accent' : 'text-primary'}`}>{c.ox}</span>
    </div>
    <p class="mt-2 text-xs leading-relaxed text-base-content/70">{c.why}</p>
    {#if c.special}<div class="mt-1 text-xs font-bold text-accent">⚠ 常考特例</div>{/if}
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    算法：先填「固定值」的原子（鹼金屬 +1、F −1、O 通常 −2、H 通常 +1），再用「<b>分子總和 = 0、離子總和 = 電荷</b>」解出目標元素。特別小心 O、H 的特例：<b>過氧化物 O=−1、超氧化物 O=−½、OF₂ 中 O=+2、金屬氫化物 H=−1</b>。
  </p>
</div>
