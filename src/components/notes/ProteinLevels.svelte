<script lang="ts">
  // 蛋白質四級結構：選一級，看描述與主要作用力，並標出「變性」會不會破壞它。
  type L = { name: string; desc: string; force: string; denatured: boolean }
  const LEVELS: L[] = [
    { name: '一級結構', desc: '胺基酸的序列', force: '胜肽鍵（共價）', denatured: false },
    { name: '二級結構', desc: 'α-螺旋、β-摺板', force: '骨幹 N–H 與 C=O 間的氫鍵', denatured: true },
    { name: '三級結構', desc: '整條多胜肽鏈的 3D 折疊', force: '氫鍵、疏水作用、二硫鍵、離子鍵', denatured: true },
    { name: '四級結構', desc: '多條多胜肽鏈的組合', force: '非共價作用為主', denatured: true },
  ]
  let i = $state(0)
  const l = $derived(LEVELS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧶</span>
    <span class="font-display font-bold">蛋白質四級結構</span>
  </div>

  <div class="join mb-3">
    {#each LEVELS as ll, k (ll.name)}
      <button type="button" class={`btn join-item btn-sm ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{ll.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{l.name}</div>
    <div>內容：{l.desc}</div>
    <div class="mt-1">主要作用力：{l.force}</div>
    <div class="mt-2">
      <span class={`badge font-bold ${l.denatured ? 'badge-error' : 'badge-success'}`}>{l.denatured ? '變性會被破壞' : '變性不受影響'}</span>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>變性（denaturation）</b>（高溫、強酸鹼、尿素）破壞氫鍵等<b>非共價作用力</b> → 二、三、四級結構崩解。但<b>一級結構（胜肽鍵，共價）不受影響</b>，序列仍在（要斷胜肽鍵需酵素或強烈水解）。
  </p>
</div>
