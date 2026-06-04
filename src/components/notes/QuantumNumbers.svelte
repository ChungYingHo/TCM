<script lang="ts">
  // 「電子的住址」——四量子數互動。選 n → ℓ → mℓ → ms，看到這四碼如何唯一指到
  // 「一個電子座位」，並把『包立不相容』釘在眼前：任兩個電子不會四碼全同。
  // 直接回應「看到包立卻不知是哪四個量子數」的困惑。
  const SUB = ['s', 'p', 'd', 'f'] // 索引 = ℓ
  const SUB_NAME = ['球形 s', '啞鈴 p', '四瓣 d', '複雜 f']

  let n = $state(2)
  let l = $state(1)
  let ml = $state(0)
  let up = $state(true) // ms = +½ ⇒ true

  // n 變小時把 ℓ、mℓ 夾回合法範圍（ℓ ≤ n−1；|mℓ| ≤ ℓ）
  $effect(() => { if (l > n - 1) l = n - 1 })
  $effect(() => {
    if (ml > l) ml = l
    else if (ml < -l) ml = -l
  })

  const lOptions = $derived(Array.from({ length: n }, (_, i) => i)) // 0 … n−1
  const mlOptions = $derived(Array.from({ length: 2 * l + 1 }, (_, i) => i - l)) // −ℓ … +ℓ
  const subLabel = $derived(`${n}${SUB[l]}`)
  const msLabel = $derived(up ? '+½（↑）' : '−½（↓）')
  const mlText = $derived(ml > 0 ? `+${ml}` : `${ml}`)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🏠</span>
    <span class="font-display font-bold">電子的住址：四個量子數</span>
  </div>
  <p class="mb-4 text-sm text-base-content/70">
    依序選 n → ℓ → m<sub>ℓ</sub> → m<sub>s</sub>，看這四個數字（像住址四碼）如何指到唯一一個電子：
  </p>

  <div class="flex flex-col gap-3.5">
    <!-- n -->
    <div>
      <div class="mb-1.5 text-sm font-semibold">
        ① 主量子數 <span class="font-mono text-primary">n</span>
        <span class="text-base-content/55">— 第幾層樓（離核多遠、能量高低）</span>
      </div>
      <div class="join">
        {#each [1, 2, 3, 4] as v (v)}
          <button type="button" class={`btn join-item btn-sm ${n === v ? 'btn-primary' : 'btn-outline'}`} onclick={() => (n = v)}>{v}</button>
        {/each}
      </div>
    </div>

    <!-- ℓ -->
    <div>
      <div class="mb-1.5 text-sm font-semibold">
        ② 角量子數 <span class="font-mono text-primary">ℓ</span>
        <span class="text-base-content/55">— 房型（軌域形狀），只能取 0 到 n−1</span>
      </div>
      <div class="join flex-wrap">
        {#each lOptions as v (v)}
          <button type="button" class={`btn join-item btn-sm ${l === v ? 'btn-primary' : 'btn-outline'}`} onclick={() => (l = v)}>
            {v} = {SUB[v]}
          </button>
        {/each}
      </div>
    </div>

    <!-- mℓ -->
    <div>
      <div class="mb-1.5 text-sm font-semibold">
        ③ 磁量子數 <span class="font-mono text-primary">m<sub>ℓ</sub></span>
        <span class="text-base-content/55">— 第幾號房（軌域方向），共 2ℓ+1 個</span>
      </div>
      <div class="join flex-wrap">
        {#each mlOptions as v (v)}
          <button type="button" class={`btn join-item btn-sm tabular-nums ${ml === v ? 'btn-primary' : 'btn-outline'}`} onclick={() => (ml = v)}>
            {v > 0 ? `+${v}` : v}
          </button>
        {/each}
      </div>
    </div>

    <!-- ms -->
    <div>
      <div class="mb-1.5 text-sm font-semibold">
        ④ 自旋量子數 <span class="font-mono text-primary">m<sub>s</sub></span>
        <span class="text-base-content/55">— 同一間房裡的上鋪／下鋪</span>
      </div>
      <div class="join">
        <button type="button" class={`btn join-item btn-sm ${up ? 'btn-primary' : 'btn-outline'}`} onclick={() => (up = true)}>↑ +½</button>
        <button type="button" class={`btn join-item btn-sm ${!up ? 'btn-primary' : 'btn-outline'}`} onclick={() => (up = false)}>↓ −½</button>
      </div>
    </div>
  </div>

  <!-- 即時讀出 -->
  <div class="mt-4 flex flex-col gap-3 rounded-box bg-base-200/60 p-3.5 sm:flex-row sm:items-center">
    <div class="flex items-center justify-center gap-1.5">
      <!-- 軌域格子：兩個床位，標出選到的那一個 -->
      <div class="flex h-11 w-20 overflow-hidden rounded-md border-2 border-primary/60">
        <div class={`flex flex-1 items-center justify-center text-lg ${up ? 'bg-primary/15 font-bold text-primary' : 'text-base-content/30'}`}>↑</div>
        <div class="w-px bg-primary/30"></div>
        <div class={`flex flex-1 items-center justify-center text-lg ${!up ? 'bg-primary/15 font-bold text-primary' : 'text-base-content/30'}`}>↓</div>
      </div>
    </div>
    <p class="text-sm leading-relaxed">
      這四碼指到：<b class="text-primary">{subLabel}</b> 副層（{SUB_NAME[l]}）中、方向 m<sub>ℓ</sub>={mlText} 的那條軌域，
      <b>{msLabel}</b> 的電子 —— 唯一對應一個電子的位置。
    </p>
  </div>

  <!-- 把包立釘在眼前 -->
  <div class="mt-3 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm leading-relaxed">
    <span class="font-bold text-accent">🔑 包立不相容＝四碼不能全同</span><br />
    同一原子裡，<b>沒有任何兩個電子的 (n, ℓ, m<sub>ℓ</sub>, m<sub>s</sub>) 會完全一樣</b>。
    所以每條軌域（前三碼相同）最多住 <b>2 個</b>電子，靠第四碼 m<sub>s</sub>（一個 ↑、一個 ↓）區分 —— 上鋪下鋪各一人，不能再擠。
  </div>
</div>
