<script lang="ts">
  // VSEPR 速查（靜態全畫，供 GoodNotes/PDF 直接看，無互動）：把 13 種 AXₙEₘ 的形狀一次畫完。
  // A=中心、X=鍵結原子、灰色橢圓=孤對；孤對畫在會把鍵推開的位置，呈現「孤對壓縮鍵角」。
  type Shape = {
    ax: string; dom: number; lp: number; egeo: string; shape: string; angle: string; ex: string
    bonds: [number, number][]; lones: [number, number][] // 螢幕座標，y 向下、上方為負
  }
  const SHAPES: Shape[] = [
    { ax: 'AX₂', dom: 2, lp: 0, egeo: '線形', shape: '線形', angle: '180°', ex: 'CO₂、BeCl₂',
      bonds: [[-1, 0], [1, 0]], lones: [] },
    { ax: 'AX₃', dom: 3, lp: 0, egeo: '平面三角形', shape: '平面三角形', angle: '120°', ex: 'BF₃',
      bonds: [[0, -1], [0.87, 0.5], [-0.87, 0.5]], lones: [] },
    { ax: 'AX₂E', dom: 3, lp: 1, egeo: '平面三角形', shape: '折線形（V 形）', angle: '約 118°', ex: 'SO₂、O₃',
      bonds: [[0.82, 0.57], [-0.82, 0.57]], lones: [[0, -1]] },
    { ax: 'AX₄', dom: 4, lp: 0, egeo: '正四面體', shape: '正四面體', angle: '109.5°', ex: 'CH₄',
      bonds: [[-0.71, -0.71], [0.71, -0.71], [-0.71, 0.71], [0.71, 0.71]], lones: [] },
    { ax: 'AX₃E', dom: 4, lp: 1, egeo: '正四面體', shape: '三角錐形', angle: '107°', ex: 'NH₃',
      bonds: [[0, 1], [0.9, 0.1], [-0.9, 0.1]], lones: [[0, -1]] },
    { ax: 'AX₂E₂', dom: 4, lp: 2, egeo: '正四面體', shape: '折線形（V 形）', angle: '104.5°', ex: 'H₂O',
      bonds: [[0.7, 0.7], [-0.7, 0.7]], lones: [[-0.5, -0.87], [0.5, -0.87]] },
    { ax: 'AX₅', dom: 5, lp: 0, egeo: '三角雙錐', shape: '三角雙錐', angle: '90° 與 120°', ex: 'PCl₅',
      bonds: [[0, -1], [0, 1], [-0.95, 0.18], [0.85, 0.18], [0.5, 0.5]], lones: [] },
    { ax: 'AX₄E', dom: 5, lp: 1, egeo: '三角雙錐', shape: '蹺蹺板形', angle: '≈90°/120°', ex: 'SF₄',
      bonds: [[0, -1], [0, 1], [-0.95, 0.18], [0.5, 0.5]], lones: [[0.85, 0.18]] },
    { ax: 'AX₃E₂', dom: 5, lp: 2, egeo: '三角雙錐', shape: 'T 形', angle: '≈90°', ex: 'ClF₃',
      bonds: [[0, -1], [0, 1], [-0.95, 0.18]], lones: [[0.85, 0.18], [0.5, 0.5]] },
    { ax: 'AX₂E₃', dom: 5, lp: 3, egeo: '三角雙錐', shape: '線形', angle: '180°', ex: 'XeF₂、I₃⁻',
      bonds: [[0, -1], [0, 1]], lones: [[-0.95, 0.18], [0.85, 0.18], [0.5, 0.5]] },
    { ax: 'AX₆', dom: 6, lp: 0, egeo: '八面體', shape: '八面體', angle: '90°', ex: 'SF₆',
      bonds: [[0, -1], [0, 1], [-1, 0], [1, 0], [-0.6, 0.55], [0.6, -0.55]], lones: [] },
    { ax: 'AX₅E', dom: 6, lp: 1, egeo: '八面體', shape: '四角錐形', angle: '≈90°', ex: 'BrF₅、IF₅',
      bonds: [[0, -1], [-1, 0], [1, 0], [-0.6, 0.55], [0.6, -0.55]], lones: [[0, 1]] },
    { ax: 'AX₄E₂', dom: 6, lp: 2, egeo: '八面體', shape: '正方平面', angle: '90°', ex: 'XeF₄',
      bonds: [[-1, 0], [1, 0], [-0.6, 0.55], [0.6, -0.55]], lones: [[0, -1], [0, 1]] },
  ]
  const C = 64
  const R = 40
  const px = (v: [number, number]) => C + v[0] * R
  const py = (v: [number, number]) => C + v[1] * R
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5 print:break-inside-avoid">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔺</span>
    <span class="font-display font-bold">VSEPR 速查：13 種電子域 → 分子形狀</span>
    <span class="text-xs text-base-content/55">A＝中心、X＝鍵結原子、灰橢圓＝孤對</span>
  </div>

  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
    {#each SHAPES as s (s.ax)}
      <div class="flex flex-col items-center rounded-lg border border-base-300 bg-base-200/40 p-2.5 text-center print:break-inside-avoid">
        <svg viewBox="0 0 128 128" class="h-20 w-20" role="img" aria-label={`${s.ax} 形狀`}>
          {#each s.bonds as b, k (k)}
            <line x1={C} y1={C} x2={px(b)} y2={py(b)} stroke="currentColor" stroke-width="2" class="text-base-content/40" />
          {/each}
          {#each s.lones as l, k (k)}
            <ellipse cx={px(l)} cy={py(l)} rx="10" ry="6.5" class="fill-base-content/15"
              transform={`rotate(${(Math.atan2(l[1], l[0]) * 180) / Math.PI}, ${px(l)}, ${py(l)})`} />
          {/each}
          {#each s.bonds as b, k (k)}
            <circle cx={px(b)} cy={py(b)} r="10" class="fill-primary/15 stroke-primary" stroke-width="1.5" />
            <text x={px(b)} y={py(b) + 3.5} text-anchor="middle" class="fill-primary text-[10px] font-bold">X</text>
          {/each}
          <circle cx={C} cy={C} r="12" class="fill-primary stroke-primary" />
          <text x={C} y={C + 4} text-anchor="middle" class="fill-primary-content text-[11px] font-bold">A</text>
        </svg>
        <div class="mt-1 font-bold text-primary">{s.ax}</div>
        <div class="text-sm font-semibold leading-tight">{s.shape}</div>
        <div class="text-xs text-base-content/60">電子域 {s.dom}（{s.dom - s.lp}鍵+{s.lp}孤對）・{s.angle}</div>
        <div class="mt-0.5 text-xs text-base-content/70">{s.ex}</div>
      </div>
    {/each}
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>電子域數＝鍵的數目＋孤對數目</b>（雙鍵、三鍵都只算 1 個域）：電子域數決定<b>電子幾何</b>；扣掉孤對後剩下的原子排列就是<b>分子形狀</b>。孤對（灰橢圓）佔的空間比鍵大，會把鍵<b>往內擠、壓縮鍵角</b>——所以 CH₄ 109.5° → NH₃ 107° → H₂O 104.5°。
  </p>
</div>
