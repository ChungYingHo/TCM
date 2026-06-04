<script lang="ts">
  // 氫原子能階與躍遷互動。能階依 Eₙ = −13.6/n²（eV）真實比例畫出 → 一眼看出
  // 「低層之間擠得最開」，所以 n=1↔2 的 ΔE 最大。選起點/終點看吸收或放出、ΔE、光譜系列。
  // 只「標註＋可選」分得開的 n=1,2,3；n=4、5 真實位置會擠在頂端，改畫成不標字的淡線
  // 純示意收斂（避免窄螢幕標籤互相重疊）。
  const LEVELS = [1, 2, 3]
  const GHOST = [4, 5]
  const E = (n: number) => -13.6 / (n * n) // eV
  // 由上(0 eV，最頂)到下(−13.6 eV，n=1)，依能量真實比例擺位；
  // 上下各留 3% 邊距給游離線與 n=1，避免貼邊。
  const y = (n: number) => 3 + (((0 - E(n)) / 13.6) * 100) * 0.94

  let ni = $state(1)
  let nf = $state(2)

  const dE = $derived(E(nf) - E(ni)) // >0 吸收、<0 放出
  const absorb = $derived(dE > 0)
  const dEabs = $derived(Math.abs(dE))
  const dEjoule = $derived(dEabs * 1.602e-19)
  const lower = $derived(Math.min(ni, nf))
  const series = $derived.by(() => {
    if (lower === 1) return { name: 'Lyman 系列', band: '紫外光' }
    if (lower === 2) return { name: 'Balmer 系列', band: '可見光' }
    if (lower === 3) return { name: 'Paschen 系列', band: '紅外光' }
    return { name: '', band: '紅外光' }
  })
  const sci = (x: number) => {
    const e = Math.floor(Math.log10(x))
    const m = x / Math.pow(10, e)
    const sup = String(e).replace(/-/g, '−').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])
    return `${m.toFixed(2)}×10${sup}`
  }

  // 躍遷箭頭位置（用同一個 y() 換算，確保和能階線對齊）
  const arrowTop = $derived(Math.min(y(ni), y(nf)))
  const arrowH = $derived(Math.abs(y(ni) - y(nf)))
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🪜</span>
    <span class="font-display font-bold">氫原子能階・電子跳階</span>
  </div>

  <!-- 能階圖（依真實能量比例；越上面越擠＝游離極限） -->
  <div class="relative mr-1 h-80 rounded-lg bg-gradient-to-b from-primary/5 to-base-200/40">
    <!-- 游離極限 n→∞、E=0 -->
    <div class="absolute right-1 left-10 flex items-center" style="top:3%">
      <div class="h-px flex-1 border-t border-dashed border-base-content/30"></div>
      <span class="ml-1 shrink-0 text-[0.65rem] text-base-content/45">n→∞ 游離</span>
    </div>
    <!-- n=4、5 收斂示意（不標字，只示意越高越擠、並向游離線） -->
    {#each GHOST as n (n)}
      <div class="absolute right-10 left-10 h-px bg-base-content/15" style={`top:${y(n)}%`}></div>
    {/each}
    {#each LEVELS as n (n)}
      {@const active = n === ni || n === nf}
      <div class="absolute right-1 left-10 flex items-center" style={`top:${y(n)}%;transform:translateY(-50%)`}>
        <div class={`h-0.5 flex-1 ${active ? 'bg-primary' : 'bg-base-content/20'}`}></div>
        <span class={`ml-1 shrink-0 text-[0.7rem] tabular-nums ${active ? 'font-bold text-primary' : 'text-base-content/45'}`}>
          {E(n).toFixed(2)} eV
        </span>
      </div>
      <span class={`absolute left-1 text-xs font-bold ${active ? 'text-primary' : 'text-base-content/40'}`} style={`top:${y(n)}%;transform:translateY(-50%)`}>
        n={n}
      </span>
    {/each}
    <!-- 躍遷箭頭 -->
    <div class={`absolute left-[40%] w-0.5 ${absorb ? 'bg-error' : 'bg-success'}`}
      style={`top:${arrowTop}%;height:${arrowH}%`}>
      <span class={`absolute -translate-x-1/2 text-xs font-bold ${absorb ? 'text-error' : 'text-success'} ${absorb ? '-top-1' : '-bottom-1'}`}>
        {absorb ? '▲' : '▼'}
      </span>
    </div>
  </div>

  <!-- 控制 -->
  <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
    <div>
      <div class="mb-1 text-sm font-semibold">起點 n<sub>起</sub></div>
      <div class="join">
        {#each LEVELS as n (n)}
          <button type="button" class={`btn join-item btn-sm ${ni === n ? 'btn-primary' : 'btn-outline'}`} onclick={() => (ni = n)}>{n}</button>
        {/each}
      </div>
    </div>
    <div>
      <div class="mb-1 text-sm font-semibold">終點 n<sub>終</sub></div>
      <div class="join">
        {#each LEVELS as n (n)}
          <button type="button" class={`btn join-item btn-sm ${nf === n ? 'btn-primary' : 'btn-outline'}`} onclick={() => (nf = n)}>{n}</button>
        {/each}
      </div>
    </div>
  </div>

  <!-- 讀出 -->
  <div class="mt-3 flex flex-col gap-2 rounded-box bg-base-200/60 p-3.5 text-sm">
    {#if ni === nf}
      <span class="text-base-content/60">起點和終點同一層，沒有躍遷。換一個終點試試。</span>
    {:else}
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span class={`badge font-bold ${absorb ? 'badge-error' : 'badge-success'}`}>{absorb ? '吸收能量' : '放出光子'}</span>
        <span>|ΔE| = <b class="tabular-nums">{dEabs.toFixed(2)}</b> eV = <b class="tabular-nums">{sci(dEjoule)}</b> J</span>
      </div>
      <div class="text-base-content/70">
        {#if !absorb}
          電子落到 n={lower} → <b>{series.name}</b>，屬<b>{series.band}</b>。
        {:else}
          吸收後跳到較高層；其逆向（放光）落到 n={lower} 屬<b>{series.band}</b>。
        {/if}
      </div>
    {/if}
  </div>
  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    看圖就懂：能階<b>越往下擠得越開</b>（Eₙ 與 n² 成反比）。所以相鄰兩層裡 <b class="text-primary">n=1↔2 的 ΔE 最大</b>，
    n 越大、相鄰兩層越靠近、差越小（頂端那兩條淡線就是 n=4、5，已快並到游離線）。把電子拉到無限遠（n=∞、E=0）所需＝<b>游離能</b>。
  </p>
</div>
