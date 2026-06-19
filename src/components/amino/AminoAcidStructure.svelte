<script lang="ts">
  // 畫單一胺基酸的兩性離子結構：黑＝共通骨架，紅＝側鏈 R。幾何來自 @/utils/aminoAcidStructure
  // （純函式、靜態座標，正確性不靠 LLM 即時判讀）。
  import { structure } from '@/utils/aminoAcidStructure'

  let { code1, size = 150 }: { code1: string; size?: number } = $props()
  const s = $derived(structure(code1))
</script>

<svg
  viewBox={`0 0 ${s.w} ${s.h}`}
  width={size}
  height={(size * s.h) / s.w}
  role="img"
  aria-label={`胺基酸 ${code1} 結構`}
  class="amino"
>
  {#each s.prims as p, i (i)}
    {#if p.k === 'bond'}
      <line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} class={p.r ? 'side-bond' : 'bb-bond'} />
    {:else if p.k === 'poly'}
      <polyline points={p.pts} fill="none" class={p.r ? 'side-bond' : 'bb-bond'} />
    {:else if p.k === 'ring'}
      <circle cx={p.cx} cy={p.cy} r={p.rad} fill="none" class="side-bond" />
    {:else if p.k === 'atom'}
      <text x={p.x} y={p.y} text-anchor="middle" dominant-baseline="central" class={p.r ? 'side-atom' : 'bb-atom'}>{p.s}</text>
    {/if}
  {/each}
</svg>

<style>
  .amino { display: block; }
  .bb-bond { stroke: var(--color-base-content, #1f2937); stroke-width: 2; }
  .side-bond { stroke: var(--color-error, #dc2626); stroke-width: 2; }
  .bb-atom { fill: var(--color-base-content, #1f2937); font-size: 14px; font-weight: 600; }
  .side-atom { fill: var(--color-error, #dc2626); font-size: 14px; font-weight: 600; }
  text { font-family: ui-sans-serif, system-ui, sans-serif; }
</style>
