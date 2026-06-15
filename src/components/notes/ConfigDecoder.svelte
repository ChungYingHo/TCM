<script lang="ts">
  // 電子組態怎麼讀：把每一段拆成「n（第幾層）｜副層 s/p/d/f｜電子數」三塊，
  // 直接回答學生的疑問——「1s²2s²2p⁴ 前面那個數字到底是什麼」。可切換示例元素。
  // 全用純 s/p 的元素，把「前面數字＝n」這個重點講清楚（d 軌域的 4s/3d 順序另見軌域填法）。
  type Seg = { n: number; sub: string; e: number }
  type Ex = { sym: string; name: string; z: number; segs: Seg[] }
  const EXAMPLES: Ex[] = [
    { sym: 'O', name: '氧', z: 8, segs: [{ n: 1, sub: 's', e: 2 }, { n: 2, sub: 's', e: 2 }, { n: 2, sub: 'p', e: 4 }] },
    { sym: 'F', name: '氟', z: 9, segs: [{ n: 1, sub: 's', e: 2 }, { n: 2, sub: 's', e: 2 }, { n: 2, sub: 'p', e: 5 }] },
    { sym: 'Na', name: '鈉', z: 11, segs: [{ n: 1, sub: 's', e: 2 }, { n: 2, sub: 's', e: 2 }, { n: 2, sub: 'p', e: 6 }, { n: 3, sub: 's', e: 1 }] },
    { sym: 'S', name: '硫', z: 16, segs: [{ n: 1, sub: 's', e: 2 }, { n: 2, sub: 's', e: 2 }, { n: 2, sub: 'p', e: 6 }, { n: 3, sub: 's', e: 2 }, { n: 3, sub: 'p', e: 4 }] },
  ]
  let idx = $state(0)
  const ex = $derived(EXAMPLES[idx])
  const sum = $derived(ex.segs.reduce((s, g) => s + g.e, 0))
  const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹']
  const sup = (x: number) => String(x).split('').map((d) => SUP[+d]).join('')
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔢</span>
    <span class="font-display font-bold">電子組態怎麼讀</span>
    <div class="join ml-auto">
      {#each EXAMPLES as e, i (e.sym)}
        <button type="button" class={`btn btn-xs join-item ${idx === i ? 'btn-primary' : 'btn-outline'}`} onclick={() => (idx = i)}>{e.sym}</button>
      {/each}
    </div>
  </div>

  <p class="mb-3 text-sm text-base-content/75">
    <b>{ex.name}（{ex.sym}）</b>有 {ex.z} 個電子，把它們由內而外填好，寫出來就是：
  </p>

  <!-- 逐段拆解：每段都是 n｜副層｜電子數 -->
  <div class="flex flex-wrap items-center gap-2">
    {#each ex.segs as g, i (i)}
      <div class="flex items-baseline rounded-lg border border-base-300 bg-base-200/50 px-2.5 py-1.5">
        <span class="text-2xl font-bold leading-none text-primary">{g.n}</span><span class="text-2xl font-bold leading-none text-secondary">{g.sub}</span><span class="text-base font-bold leading-none text-base-content/80">{sup(g.e)}</span>
      </div>
    {/each}
  </div>

  <!-- 圖例：三個位置各代表什麼 -->
  <div class="mt-3 grid gap-1.5 text-sm sm:grid-cols-3">
    <div class="rounded-lg bg-base-200/50 p-2.5"><span class="mr-1 text-lg font-bold text-primary">n</span>前面的數字＝<b>第幾層</b>（主量子數）</div>
    <div class="rounded-lg bg-base-200/50 p-2.5"><span class="mr-1 text-lg font-bold text-secondary">s p d f</span>字母＝<b>副層</b>（ℓ 的代號）</div>
    <div class="rounded-lg bg-base-200/50 p-2.5"><span class="mr-1 text-lg font-bold text-base-content/80">{sup(2)}</span>右上小字＝該副層<b>電子數</b></div>
  </div>

  <p class="mt-3 text-sm text-base-content/75">
    各段電子數相加：{ex.segs.map((g) => g.e).join(' ＋ ')} ＝ <b>{sum}</b>，正好等於電子總數，也就是中性原子的原子序 Z＝{ex.z}。
  </p>
</div>
