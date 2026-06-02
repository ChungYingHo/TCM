<script lang="ts">
  let {
    points,
    width = 120,
    height = 30,
  }: { points: { year: number; count: number }[]; width?: number; height?: number } = $props()

  const path = $derived.by(() => {
    if (points.length < 2) return ''
    const max = Math.max(1, ...points.map((p) => p.count))
    const dx = width / (points.length - 1)
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * dx).toFixed(1)},${(height - (p.count / max) * (height - 2) - 1).toFixed(1)}`)
      .join(' ')
  })
  const last = $derived(points.at(-1))
  const max = $derived(Math.max(1, ...points.map((p) => p.count)))
</script>

<svg {width} {height} viewBox={`0 0 ${width} ${height}`} class="overflow-visible" aria-hidden="true">
  <path d={path} fill="none" stroke="currentColor" stroke-width="1.5" class="text-primary" />
  {#if last}
    <circle
      cx={width}
      cy={height - (last.count / max) * (height - 2) - 1}
      r="2"
      class="fill-primary"
    />
  {/if}
</svg>
