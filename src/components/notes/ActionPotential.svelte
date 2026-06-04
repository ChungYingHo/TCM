<script lang="ts">
  // 動作電位曲線：點四個階段，看膜電位與離子流動。
  type Phase = { key: string; name: string; x: number; mv: number; desc: string }
  const PHASES: Phase[] = [
    { key: 'rest', name: '① 靜止', x: 30, mv: -70, desc: 'Na⁺、K⁺ 電位閘門大多關閉，鈉鉀幫浦維持膜電位約 −70 mV。' },
    { key: 'depo', name: '② 去極化', x: 78, mv: 30, desc: '達閾值 −55 mV → 電位依存性 Na⁺ 通道大量開啟，Na⁺ 湧入 → 膜電位衝到 +30 mV。' },
    { key: 'repo', name: '③ 再極化', x: 100, mv: -20, desc: 'Na⁺ 通道關閉、K⁺ 通道開啟，K⁺ 外流 → 膜電位下降回到靜止值。' },
    { key: 'refr', name: '④ 不反應期', x: 118, mv: -80, desc: 'Na⁺ 通道暫時失活、無法立刻再開，確保動作電位單向傳導。' },
  ]
  let i = $state(0)
  const sel = $derived(PHASES[i])
  // mV → y（+40 → 12；−90 → 132）
  const yOf = (mv: number) => 12 + (40 - mv) / 130 * 120
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚡</span>
    <span class="font-display font-bold">動作電位：膜電位變化</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each PHASES as ph, k (ph.key)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{ph.name}</button>
    {/each}
  </div>

  <svg viewBox="0 0 200 150" class="w-full" role="img" aria-label="動作電位曲線">
    <!-- 參考線 -->
    <line x1="20" y1={yOf(-70)} x2="195" y2={yOf(-70)} class="stroke-base-content/20" stroke-width="1" stroke-dasharray="3 3" />
    <line x1="20" y1={yOf(-55)} x2="195" y2={yOf(-55)} class="stroke-warning/40" stroke-width="1" stroke-dasharray="2 2" />
    <line x1="20" y1={yOf(0)} x2="195" y2={yOf(0)} class="stroke-base-content/15" stroke-width="1" />
    <text x="18" y={yOf(-70) + 3} text-anchor="end" class="fill-base-content/45 text-[7px]">−70</text>
    <text x="18" y={yOf(-55) + 3} text-anchor="end" class="fill-warning text-[7px]">−55</text>
    <text x="18" y={yOf(0) + 3} text-anchor="end" class="fill-base-content/45 text-[7px]">0</text>
    <text x="18" y={yOf(30) + 3} text-anchor="end" class="fill-base-content/45 text-[7px]">+30</text>
    <!-- 動作電位曲線 -->
    <polyline
      points={`20,${yOf(-70)} 55,${yOf(-70)} 65,${yOf(-55)} 78,${yOf(30)} 95,${yOf(-30)} 110,${yOf(-80)} 125,${yOf(-70)} 195,${yOf(-70)}`}
      fill="none"
      class="stroke-primary"
      stroke-width="2.5"
    />
    <!-- 目前階段標記 -->
    <circle cx={sel.x} cy={yOf(sel.mv)} r="4.5" class="fill-secondary" />
  </svg>

  <div class="mt-2 rounded-box bg-base-200/60 p-3 text-sm">
    <span class="font-bold text-primary">{sel.name}</span>（約 {sel.mv} mV）：{sel.desc}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    動作電位是<b>全或無</b>：未達閾值（−55 mV）完全不發；一旦達閾值就走完固定波形。刺激越強只是<b>頻率越高</b>，振幅不變。去極化＝Na⁺ 進、再極化＝K⁺ 出。
  </p>
</div>
