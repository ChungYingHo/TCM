<script lang="ts">
  // 分子極性互動：選分子，看每條鍵的「鍵偶極」箭頭（指向電負度較大的原子），
  // 以及把它們向量加總後的「淨偶極」。淨偶極 = 0 → 非極性；≠ 0 → 極性。
  type Atom = { label: string; pos: [number, number]; dip: [number, number] } // 螢幕座標，y 向下
  type Mol = { name: string; center: string; atoms: Atom[]; lones: [number, number][] }

  const MOLS: Mol[] = [
    { name: 'CO₂', center: 'C', lones: [],
      atoms: [
        { label: 'O', pos: [-1, 0], dip: [-1, 0] },
        { label: 'O', pos: [1, 0], dip: [1, 0] },
      ] },
    { name: 'BF₃', center: 'B', lones: [],
      atoms: [
        { label: 'F', pos: [0, -1], dip: [0, -1] },
        { label: 'F', pos: [0.87, 0.5], dip: [0.87, 0.5] },
        { label: 'F', pos: [-0.87, 0.5], dip: [-0.87, 0.5] },
      ] },
    { name: 'CCl₄', center: 'C', lones: [],
      atoms: [
        { label: 'Cl', pos: [-0.71, -0.71], dip: [-0.71, -0.71] },
        { label: 'Cl', pos: [0.71, -0.71], dip: [0.71, -0.71] },
        { label: 'Cl', pos: [-0.71, 0.71], dip: [-0.71, 0.71] },
        { label: 'Cl', pos: [0.71, 0.71], dip: [0.71, 0.71] },
      ] },
    { name: 'H₂O', center: 'O', lones: [[-0.5, -0.87], [0.5, -0.87]],
      atoms: [
        { label: 'H', pos: [-0.7, 0.7], dip: [0.7, -0.7] },
        { label: 'H', pos: [0.7, 0.7], dip: [-0.7, -0.7] },
      ] },
    { name: 'NH₃', center: 'N', lones: [[0, -1]],
      atoms: [
        { label: 'H', pos: [0, 1], dip: [0, -1] },
        { label: 'H', pos: [0.85, 0.3], dip: [-0.85, -0.3] },
        { label: 'H', pos: [-0.85, 0.3], dip: [0.85, -0.3] },
      ] },
    { name: 'CHCl₃', center: 'C', lones: [],
      atoms: [
        { label: 'H', pos: [0, -1], dip: [0, 0.4] }, // C 比 H 電負度大，偶極指向 C
        { label: 'Cl', pos: [-0.82, 0.45], dip: [-0.82, 0.45] },
        { label: 'Cl', pos: [0.82, 0.45], dip: [0.82, 0.45] },
        { label: 'Cl', pos: [0, 1], dip: [0, 1] },
      ] },
  ]

  let i = $state(0)
  const m = $derived(MOLS[i])
  const net = $derived.by<[number, number]>(() => [
    m.atoms.reduce((s, a) => s + a.dip[0], 0),
    m.atoms.reduce((s, a) => s + a.dip[1], 0),
  ])
  const mag = $derived(Math.hypot(net[0], net[1]))
  const polar = $derived(mag > 0.2)

  const R = 40, C = 64
  const px = (v: [number, number]) => C + v[0] * R
  const py = (v: [number, number]) => C + v[1] * R
  // 鍵偶極箭頭：沿著鍵、長度固定，指向 dip 方向
  const arrow = (a: Atom) => {
    const len = Math.hypot(a.dip[0], a.dip[1]) || 1
    const u: [number, number] = [a.dip[0] / len, a.dip[1] / len]
    const mid: [number, number] = [a.pos[0] * 0.5, a.pos[1] * 0.5]
    return { x1: px(mid) - u[0] * 12, y1: py(mid) - u[1] * 12, x2: px(mid) + u[0] * 12, y2: py(mid) + u[1] * 12 }
  }
  const netArrow = $derived.by(() => {
    if (!polar) return null
    const u: [number, number] = [net[0] / mag, net[1] / mag]
    return { x2: C + u[0] * 30, y2: C + u[1] * 30 }
  })
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧲</span>
    <span class="font-display font-bold">分子極性：鍵偶極如何加總</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each MOLS as mol, idx (mol.name)}
      <button type="button" class={`btn btn-xs ${i === idx ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = idx)}>{mol.name}</button>
    {/each}
  </div>

  <div class="flex flex-col items-center gap-4 sm:flex-row">
    <svg viewBox="0 0 128 128" class="h-36 w-36 shrink-0" role="img" aria-label={`${m.name} 偶極示意`}>
      <defs>
        <marker id="mp-bond" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" class="fill-accent" />
        </marker>
        <marker id="mp-net" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" class="fill-primary" />
        </marker>
      </defs>
      {#each m.atoms as a, k (k)}
        <line x1={C} y1={C} x2={px(a.pos)} y2={py(a.pos)} stroke="currentColor" stroke-width="2" class="text-base-content/30" />
      {/each}
      {#each m.lones as l, k (k)}
        <ellipse cx={px(l)} cy={py(l)} rx="10" ry="6" class="fill-base-content/12"
          transform={`rotate(${(Math.atan2(l[1], l[0]) * 180) / Math.PI}, ${px(l)}, ${py(l)})`} />
      {/each}
      <!-- 鍵偶極（橘色小箭頭） -->
      {#each m.atoms as a, k (k)}
        {@const ar = arrow(a)}
        <line x1={ar.x1} y1={ar.y1} x2={ar.x2} y2={ar.y2} class="stroke-accent" stroke-width="2" marker-end="url(#mp-bond)" />
      {/each}
      <!-- 淨偶極（主色粗箭頭） -->
      {#if netArrow}
        <line x1={C} y1={C} x2={netArrow.x2} y2={netArrow.y2} class="stroke-primary" stroke-width="3" marker-end="url(#mp-net)" />
      {/if}
      {#each m.atoms as a, k (k)}
        <circle cx={px(a.pos)} cy={py(a.pos)} r="11" class="fill-base-100 stroke-base-content/40" stroke-width="1.5" />
        <text x={px(a.pos)} y={py(a.pos) + 4} text-anchor="middle" class="fill-base-content text-[10px] font-bold">{a.label}</text>
      {/each}
      <circle cx={C} cy={C} r="12" class="fill-base-200 stroke-base-content/40" stroke-width="1.5" />
      <text x={C} y={C + 4} text-anchor="middle" class="fill-base-content text-[11px] font-bold">{m.center}</text>
    </svg>

    <div class="w-full">
      <div class="flex items-center gap-2">
        <span class={`badge font-bold ${polar ? 'badge-primary' : 'badge-ghost'}`}>{polar ? '極性分子' : '非極性分子'}</span>
        <span class="text-sm text-base-content/70">{polar ? '淨偶極 ≠ 0' : '鍵偶極互相抵消，淨偶極 = 0'}</span>
      </div>
      <p class="mt-2 text-sm leading-relaxed">
        <span class="text-accent">橘色小箭頭</span>＝每條鍵的偶極（指向電負度較大的原子）；
        {#if polar}<span class="text-primary">藍色粗箭頭</span>＝向量加總後的淨偶極。形狀不對稱（或有孤對），偶極<b>無法抵消</b> → 極性。{:else}形狀完全對稱，偶極<b>剛好抵消</b> → 非極性。{/if}
      </p>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    判斷三步：① 每條鍵畫出偶極箭頭（電負度差越大箭頭越強）；② 依分子形狀把箭頭<b>向量加總</b>；③ 加總 = 0 是非極性、≠ 0 是極性。完全對稱的 CO₂、BF₃、CCl₄ 會抵消；有孤對的 H₂O、NH₃ 不會。
  </p>
</div>
