<script lang="ts">
  type Point = { x: number; y: number; hidden?: boolean }
  type Edge = { from: number; to: number; hidden?: boolean }
  type Geometry = { points: Point[]; edges: Edge[] }

  const geometries: Record<number, Geometry> = {
    2: {
      points: [{ x: 14, y: 50 }, { x: 86, y: 50 }],
      edges: [],
    },
    3: {
      points: [{ x: 50, y: 13 }, { x: 14, y: 76 }, { x: 86, y: 76 }],
      edges: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 0 }],
    },
    4: {
      points: [{ x: 50, y: 10 }, { x: 13, y: 73 }, { x: 87, y: 73 }, { x: 50, y: 52, hidden: true }],
      edges: [
        { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 0 },
        { from: 0, to: 3, hidden: true }, { from: 1, to: 3, hidden: true }, { from: 2, to: 3, hidden: true },
      ],
    },
    5: {
      points: [{ x: 50, y: 6 }, { x: 50, y: 94 }, { x: 12, y: 65 }, { x: 78, y: 38 }, { x: 84, y: 77, hidden: true }],
      edges: [
        { from: 2, to: 3 }, { from: 3, to: 4, hidden: true }, { from: 4, to: 2, hidden: true },
        { from: 0, to: 2 }, { from: 0, to: 3 }, { from: 0, to: 4, hidden: true },
        { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 1, to: 4, hidden: true },
      ],
    },
    6: {
      points: [{ x: 50, y: 5 }, { x: 50, y: 95 }, { x: 12, y: 67 }, { x: 88, y: 67 }, { x: 12, y: 33, hidden: true }, { x: 88, y: 33, hidden: true }],
      edges: [
        { from: 2, to: 3 }, { from: 2, to: 4, hidden: true }, { from: 4, to: 5, hidden: true }, { from: 5, to: 3, hidden: true },
        { from: 0, to: 2 }, { from: 0, to: 3 }, { from: 0, to: 4, hidden: true }, { from: 0, to: 5, hidden: true },
        { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 1, to: 4, hidden: true }, { from: 1, to: 5, hidden: true },
      ],
    },
  }

  type Shape = {
    ax: string
    electron: string
    molecule: string
    example: string
    domains: number
    atomIndexes: number[]
  }

  const shapes: Shape[] = [
    { ax: 'AX₂', electron: '直線', molecule: '直線', example: 'CO₂', domains: 2, atomIndexes: [0, 1] },
    { ax: 'AX₃', electron: '三角平面', molecule: '三角平面', example: 'BF₃', domains: 3, atomIndexes: [0, 1, 2] },
    { ax: 'AX₂E', electron: '三角平面', molecule: '折線形', example: 'SO₂', domains: 3, atomIndexes: [1, 2] },
    { ax: 'AX₄', electron: '四面體', molecule: '四面體', example: 'CH₄', domains: 4, atomIndexes: [0, 1, 2, 3] },
    { ax: 'AX₃E', electron: '四面體', molecule: '三角錐', example: 'NH₃', domains: 4, atomIndexes: [0, 1, 2] },
    { ax: 'AX₂E₂', electron: '四面體', molecule: '折線形', example: 'H₂O', domains: 4, atomIndexes: [1, 2] },
    { ax: 'AX₅', electron: '三角雙錐', molecule: '三角雙錐', example: 'PCl₅', domains: 5, atomIndexes: [0, 1, 2, 3, 4] },
    { ax: 'AX₄E', electron: '三角雙錐', molecule: '蹺蹺板形', example: 'SF₄', domains: 5, atomIndexes: [0, 1, 2, 3] },
    { ax: 'AX₃E₂', electron: '三角雙錐', molecule: 'T 形', example: 'ClF₃', domains: 5, atomIndexes: [0, 1, 2] },
    { ax: 'AX₂E₃', electron: '三角雙錐', molecule: '直線', example: 'I₃⁻', domains: 5, atomIndexes: [0, 1] },
    { ax: 'AX₆', electron: '八面體', molecule: '八面體', example: 'SF₆', domains: 6, atomIndexes: [0, 1, 2, 3, 4, 5] },
    { ax: 'AX₅E', electron: '八面體', molecule: '四角錐', example: 'ICl₅', domains: 6, atomIndexes: [0, 2, 3, 4, 5] },
    { ax: 'AX₄E₂', electron: '八面體', molecule: '平面正方形', example: 'XeF₄', domains: 6, atomIndexes: [2, 3, 4, 5] },
    { ax: 'AX₃E₃', electron: '八面體', molecule: 'T 形', example: 'XeF₃⁻', domains: 6, atomIndexes: [0, 2, 3] },
    { ax: 'AX₂E₄', electron: '八面體', molecule: '直線', example: 'XeF₂', domains: 6, atomIndexes: [2, 3] },
  ]
</script>

<section id="vsepr-structures" class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 print:break-inside-avoid">
  <h3 class="mb-1 font-display text-lg font-bold">VSEPR 結構圖</h3>
  <p class="mb-4 text-sm text-base-content/70">以電子幾何的線框多面體呈現。實線是可見邊，虛線是後方隱藏邊。A 是中心原子，X 是鍵結原子，灰色 LP 是孤對電子。</p>
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {#each shapes as shape (shape.ax)}
      {@const geometry = geometries[shape.domains]}
      <figure class="rounded-lg border border-base-300 bg-base-200/35 p-3 text-center print:break-inside-avoid">
        <svg viewBox="0 0 100 100" class="mx-auto h-28 w-28" role="img" aria-label={`${shape.ax} ${shape.molecule}`}>
          {#each geometry.edges as edge, index (index)}
            {@const from = geometry.points[edge.from]}
            {@const to = geometry.points[edge.to]}
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} class="stroke-base-content/55" stroke-width="1.5" stroke-dasharray={edge.hidden ? '3 2' : undefined} />
          {/each}
          {#each geometry.points as point, index (index)}
            {@const isAtom = shape.atomIndexes.includes(index)}
            <line x1="50" y1="50" x2={point.x} y2={point.y} class={isAtom ? 'stroke-primary/75' : 'stroke-base-content/25'} stroke-width={isAtom ? '1.8' : '1'} stroke-dasharray={point.hidden ? '3 2' : undefined} />
            {#if isAtom}
              <circle cx={point.x} cy={point.y} r="8" class="fill-primary/15 stroke-primary" stroke-width="1.2" />
              <text x={point.x} y={point.y + 4} text-anchor="middle" class="fill-primary text-[12px] font-bold">X</text>
            {:else}
              <circle cx={point.x} cy={point.y} r="9" class="fill-base-content/15 stroke-base-content/35" stroke-width="1" />
              <text x={point.x} y={point.y + 3.5} text-anchor="middle" class="fill-base-content/60 text-[8px] font-bold">LP</text>
            {/if}
          {/each}
          <text x="50" y="54" text-anchor="middle" class="fill-secondary text-[14px] font-bold">A</text>
        </svg>
        <figcaption class="mt-1">
          <div class="font-bold text-primary">{shape.ax}：{shape.molecule}</div>
          <div class="text-xs text-base-content/65">電子幾何：{shape.electron}</div>
          <div class="text-xs text-base-content/65">例：{shape.example}</div>
        </figcaption>
      </figure>
    {/each}
  </div>
</section>
