<script lang="ts">
  // 反應級數互動：選對某反應物的級數 m（0/1/2）與濃度倍率，看速率變幾倍（倍率^m）。
  // 反向理解比較法：濃度×2、速率×? → 由速率倍率反推級數。
  let m = $state(1)
  let mult = $state(2) // 濃度倍率
  const rateMult = $derived(Math.pow(mult, m))
  const NAME: Record<number, string> = { 0: '零級', 1: '一級', 2: '二級' }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📊</span>
    <span class="font-display font-bold">反應級數：濃度變化 → 速率變化</span>
  </div>

  <div class="mb-3 flex flex-wrap items-center gap-3 text-sm">
    <div>級數 m：
      <div class="join">
        {#each [0, 1, 2] as v (v)}
          <button type="button" class={`btn join-item btn-sm ${m === v ? 'btn-primary' : 'btn-outline'}`} onclick={() => (m = v)}>{v}</button>
        {/each}
      </div>
    </div>
    <div>濃度變：
      <div class="join">
        {#each [2, 3] as v (v)}
          <button type="button" class={`btn join-item btn-sm ${mult === v ? 'btn-primary' : 'btn-outline'}`} onclick={() => (mult = v)}>×{v}</button>
        {/each}
      </div>
    </div>
  </div>

  <div class="grid grid-cols-2 items-end gap-4">
    <div class="text-center">
      <div class="mx-auto w-12 rounded-t bg-base-content/30" style="height:24px"></div>
      <div class="mt-1 text-xs text-base-content/60">濃度 ×{mult}</div>
    </div>
    <div class="text-center">
      <div class="mx-auto w-12 rounded-t bg-primary transition-all duration-300" style={`height:${Math.min(24 * rateMult, 110)}px`}></div>
      <div class="mt-1 text-xs font-bold text-primary">速率 ×{rateMult}</div>
    </div>
  </div>

  <div class="mt-3 rounded-box bg-base-200/60 p-3 text-center text-sm">
    對這個反應物是 <b>{NAME[m]}（m={m}）</b>：濃度 ×{mult} → 速率 ×{mult}<sup>{m}</sup> = <b class="text-primary">×{rateMult}</b>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    反過來就是<b>比較法求級數</b>：固定其他濃度、只把某反應物濃度 ×2，看速率變幾倍——<b>×2 →一級、×4 →二級、不變 →零級</b>。級數只能這樣由實驗求，不能看方程式係數。
  </p>
</div>
