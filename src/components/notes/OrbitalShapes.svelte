<script lang="ts">
  // 原子軌域形狀（靜態全畫，供 GoodNotes/PDF 直接看，無互動）。
  // 每個軌域都畫 x/y/z 三軸（老師強調沒軸看不清）。葉片正負相位用兩色區分。
  const C = 58
  const CY = 52
  // 三軸投影向量（SVG y 向下）：z 上、x 左下、y 右
  const AXES = [
    { k: 'x', vx: -32, vy: 18 },
    { k: 'y', vx: 42, vy: 13 },
    { k: 'z', vx: 0, vy: -38 },
  ]
  type Lobe = { a: number; pos: boolean }
  type Orb = { name: string; sub: string; note: string; sphere?: boolean; ring?: boolean; lobes: Lobe[] }
  const ORB: Orb[] = [
    { name: 's', sub: '', note: '球形，無角向節面', sphere: true, lobes: [] },
    { name: 'p', sub: 'z', note: '啞鈴，1 節面（p 沿 x/y/z 共 3 個）', lobes: [{ a: -90, pos: true }, { a: 90, pos: false }] },
    { name: 'd', sub: 'z²', note: 'z 兩葉＋腰環', ring: true, lobes: [{ a: -90, pos: true }, { a: 90, pos: true }] },
    { name: 'd', sub: 'x²−y²', note: '葉片在 ±x、±y 軸上', lobes: [{ a: 151, pos: true }, { a: 331, pos: true }, { a: 17, pos: false }, { a: 197, pos: false }] },
    { name: 'd', sub: 'xy', note: '葉片在 x、y 之間', lobes: [{ a: 84, pos: true }, { a: 264, pos: true }, { a: 174, pos: false }, { a: 354, pos: false }] },
  ]
  const rad = (d: number) => (d * Math.PI) / 180
  const lx = (a: number) => C + Math.cos(rad(a)) * 20
  const ly = (a: number) => CY + Math.sin(rad(a)) * 20
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5 print:break-inside-avoid">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🎈</span>
    <span class="font-display font-bold">原子軌域形狀（ℓ 決定形狀）</span>
  </div>

  <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
    {#each ORB as o (o.name + o.sub)}
      <div class="flex flex-col items-center rounded-lg border border-base-300 bg-base-200/40 p-2 text-center print:break-inside-avoid">
        <svg viewBox="0 0 116 100" class="h-24 w-full" role="img" aria-label={`${o.name}${o.sub} 軌域`}>
          <!-- 三軸 -->
          {#each AXES as ax (ax.k)}
            <line x1={C} y1={CY} x2={C + ax.vx} y2={CY + ax.vy} stroke="currentColor" stroke-width="0.7" class="text-base-content/40" />
            <text x={C + ax.vx * 1.18} y={CY + ax.vy * 1.18 + 3} text-anchor="middle" class="fill-base-content/45 text-[8px] italic">{ax.k}</text>
          {/each}
          <!-- 腰環（d_z²） -->
          {#if o.ring}
            <ellipse cx={C} cy={CY} rx="24" ry="7" fill="none" stroke="currentColor" stroke-width="1.5" class="text-secondary" />
          {/if}
          <!-- 球（s） -->
          {#if o.sphere}
            <circle cx={C} cy={CY} r="20" class="fill-primary/25 stroke-primary" stroke-width="1.5" />
          {/if}
          <!-- 葉片 -->
          {#each o.lobes as l, i (i)}
            <ellipse cx={lx(l.a)} cy={ly(l.a)} rx="18" ry="8.5"
              transform={`rotate(${l.a} ${lx(l.a)} ${ly(l.a)})`}
              class={l.pos ? 'fill-primary/30 stroke-primary' : 'fill-secondary/25 stroke-secondary'} stroke-width="1.3" />
          {/each}
          <!-- 核 -->
          <circle cx={C} cy={CY} r="2" class="fill-base-content/70" />
        </svg>
        <div class="mt-1 font-bold text-primary">{o.name}{#if o.sub}<sub>{o.sub}</sub>{/if}</div>
        <div class="text-xs leading-tight text-base-content/65">{o.note}</div>
      </div>
    {/each}
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    s（ℓ=0）球形、無角向節面。p（ℓ=1）啞鈴、1 個節面、3 個方向。d（ℓ=2）多為四葉片、2 個節面、5 個方向（d<sub>z²</sub> 例外，為兩葉加腰環）。兩色代表波函數的正負相位。
  </p>
</div>
