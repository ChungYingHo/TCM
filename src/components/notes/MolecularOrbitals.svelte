<script lang="ts">
  // 第二週期雙原子分子的分子軌域（MO）互動圖。選一個分子，依能量由低到高把價電子
  // 填入分子軌域，當場算出鍵級、是否順磁、以及 HOMO／LUMO。
  // 能階順序有「s–p 混成」造成的切換：價電子 ≤10（B₂…N₂、CO）時 π2p 在 σ2p 之下；
  // ≥11（O₂、F₂ 及其離子、NO）時 σ2p 在 π2p 之下。圖為示意（非真實能量比例），這是
  // 教科書畫 MO 圖的標準做法。
  type MO = { key: string; label: string; bonding: boolean; orbs: 1 | 2 }

  // 由低能量到高能量。orbs=2 代表一對簡併軌域（π，共可容 4 電子）。
  const LADDER_LOW: MO[] = [
    { key: 's2s', label: 'σ2s', bonding: true, orbs: 1 },
    { key: 'ss2s', label: 'σ*2s', bonding: false, orbs: 1 },
    { key: 'p2p', label: 'π2p', bonding: true, orbs: 2 },
    { key: 's2p', label: 'σ2p', bonding: true, orbs: 1 },
    { key: 'pp2p', label: 'π*2p', bonding: false, orbs: 2 },
    { key: 'ss2p', label: 'σ*2p', bonding: false, orbs: 1 },
  ]
  // O₂、F₂… 的順序：σ2p 降到 π2p 之下
  const LADDER_HIGH: MO[] = [
    { key: 's2s', label: 'σ2s', bonding: true, orbs: 1 },
    { key: 'ss2s', label: 'σ*2s', bonding: false, orbs: 1 },
    { key: 's2p', label: 'σ2p', bonding: true, orbs: 1 },
    { key: 'p2p', label: 'π2p', bonding: true, orbs: 2 },
    { key: 'pp2p', label: 'π*2p', bonding: false, orbs: 2 },
    { key: 'ss2p', label: 'σ*2p', bonding: false, orbs: 1 },
  ]

  type Mol = { id: string; name: string; valence: number; note?: string }
  const MOLS: Mol[] = [
    { id: 'N2', name: 'N₂', valence: 10 },
    { id: 'O2', name: 'O₂', valence: 12 },
    { id: 'O2+', name: 'O₂⁺', valence: 11 },
    { id: 'O2-', name: 'O₂⁻', valence: 13 },
    { id: 'NO', name: 'NO', valence: 11, note: '異核（N＋O），用 O₂ 型順序近似' },
    { id: 'F2', name: 'F₂', valence: 14 },
  ]

  let sel = $state('O2')
  const mol = $derived(MOLS.find((m) => m.id === sel)!)
  // ≤10 用低順序、≥11 用高順序
  const ladder = $derived(mol.valence <= 10 ? LADDER_LOW : LADDER_HIGH)

  // 依洪德規則把 e 個電子填入 g 條軌域，回傳每條軌域的箭頭陣列（['↑'] 或 ['↑','↓']）
  function fillOrbs(e: number, g: number): string[][] {
    const orbs: string[][] = Array.from({ length: g }, () => [])
    for (let i = 0; i < g && e > 0; i++, e--) orbs[i].push('↑')
    for (let i = 0; i < g && e > 0; i++, e--) orbs[i].push('↓')
    return orbs
  }

  // 逐階填入，記錄每階電子數
  const filled = $derived.by(() => {
    let left = mol.valence
    return ladder.map((mo) => {
      const cap = mo.orbs * 2
      const e = Math.min(cap, left)
      left -= e
      return { ...mo, e, cap, orbs: fillOrbs(e, mo.orbs) }
    })
  })

  const bondOrder = $derived.by(() => {
    let b = 0
    let a = 0
    for (const f of filled) f.bonding ? (b += f.e) : (a += f.e)
    return (b - a) / 2
  })
  const unpaired = $derived(
    filled.reduce((n, f) => n + f.orbs.filter((o) => o.length === 1).length, 0),
  )
  const homo = $derived([...filled].reverse().find((f) => f.e > 0)?.label ?? '—')
  const lumo = $derived(filled.find((f) => f.e === 0)?.label ?? '—')

  // 顯示：高能量在上，故反轉
  const rows = $derived([...filled].reverse())
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧲</span>
    <span class="font-display font-bold">分子軌域・電子填法與鍵級</span>
  </div>

  <!-- 分子選擇 -->
  <div class="mb-4 flex flex-wrap gap-1.5">
    {#each MOLS as m (m.id)}
      <button
        type="button"
        class={`btn btn-sm ${sel === m.id ? 'btn-primary' : 'btn-outline'}`}
        onclick={() => (sel = m.id)}>{m.name}</button>
    {/each}
  </div>

  <!-- MO 能階圖：高能量在上 -->
  <div class="rounded-lg bg-gradient-to-b from-error/[0.06] to-primary/[0.06] p-3 sm:p-4">
    <div class="mb-2 flex items-center justify-between text-[0.65rem] text-base-content/45">
      <span>能量高 ↑（反鍵 σ*、π*）</span>
      <span>HOMO＝最高佔據・LUMO＝最低未佔據</span>
    </div>
    <div class="flex flex-col gap-1">
      {#each rows as f (f.key)}
        {@const isHomo = f.label === homo}
        {@const isLumo = f.label === lumo}
        <div class="grid grid-cols-[3.4rem_1fr_auto] items-center gap-2">
          <!-- 標籤 -->
          <span
            class={`text-right text-xs font-bold tabular-nums ${f.bonding ? 'text-primary' : 'text-error'}`}
            >{f.label}</span
          >
          <!-- 軌域與電子 -->
          <div class="flex items-center gap-2">
            {#each f.orbs as orb, oi (oi)}
              <span
                class={`inline-flex h-7 min-w-[2.6rem] items-center justify-center gap-0.5 rounded border px-1 text-sm leading-none ${f.bonding ? 'border-primary/40 bg-primary/5' : 'border-error/40 bg-error/5'}`}
              >
                {#each orb as arr, ai (ai)}
                  <span class={arr === '↑' ? 'text-primary' : 'text-error'}>{arr}</span>
                {/each}
                {#if orb.length === 0}<span class="text-base-content/20">·</span>{/if}
              </span>
            {/each}
          </div>
          <!-- HOMO/LUMO 標記 -->
          <span class="w-12 text-[0.65rem] font-bold">
            {#if isHomo}<span class="text-primary">HOMO</span>{:else if isLumo}<span class="text-secondary">LUMO</span>{/if}
          </span>
        </div>
      {/each}
    </div>
    <div class="mt-1 text-[0.65rem] text-base-content/45">能量低 ↓（成鍵 σ、π）｜示意圖，非真實能量比例</div>
  </div>

  <!-- 讀出 -->
  <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
    <div class="rounded-box bg-base-200/60 p-3 text-center">
      <div class="text-[0.7rem] text-base-content/55">鍵級 (bond order)</div>
      <div class="text-lg font-bold tabular-nums">{bondOrder}</div>
      <div class="text-[0.65rem] text-base-content/45">(成鍵−反鍵)/2</div>
    </div>
    <div class="rounded-box bg-base-200/60 p-3 text-center">
      <div class="text-[0.7rem] text-base-content/55">未配對電子</div>
      <div class="text-lg font-bold tabular-nums">{unpaired}</div>
      <div class={`text-[0.65rem] font-bold ${unpaired > 0 ? 'text-error' : 'text-primary'}`}>
        {unpaired > 0 ? '順磁性 paramagnetic' : '反磁性 diamagnetic'}
      </div>
    </div>
    <div class="rounded-box bg-base-200/60 p-3 text-center">
      <div class="text-[0.7rem] text-base-content/55">HOMO ／ LUMO</div>
      <div class="text-sm font-bold">{homo} ／ {lumo}</div>
      <div class="text-[0.65rem] text-base-content/45">前線軌域</div>
    </div>
  </div>

  {#if mol.note}
    <p class="mt-2 text-xs leading-relaxed text-base-content/60">＊{mol.name}：{mol.note}。</p>
  {/if}
  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    看圖就懂：把價電子由<b>低能量往上</b>填，<b class="text-primary">成鍵軌域（σ、π）</b>把分子拉緊、
    <b class="text-error">反鍵軌域（σ*、π*）</b>把分子拆鬆。<b>鍵級＝(成鍵−反鍵)/2</b>；π* 那層若用洪德規則各占一個
    →有未配對電子→<b>順磁</b>（O₂ 正是如此）。從反鍵層<b>抽走</b>電子鍵級升（O₂⁺＝2.5）、<b>加入</b>反鍵電子鍵級降（O₂⁻＝1.5）。
  </p>
</div>
