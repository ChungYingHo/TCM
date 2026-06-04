<script lang="ts">
  // UV-Vis 互補色：選「看到的顏色」，得出「吸收的顏色」與大致吸收波長。
  // 看到的顏色 = 吸收色的互補色；呈綠吸收最長波、呈黃吸收最短波。
  type C = { seen: string; seenHex: string; absorbed: string; absHex: string; lambda: number }
  const COLORS: C[] = [
    { seen: '黃', seenHex: '#f5d21a', absorbed: '紫／藍', absHex: '#5a3fd6', lambda: 430 },
    { seen: '橙', seenHex: '#f08a1c', absorbed: '藍', absHex: '#2a6fdb', lambda: 480 },
    { seen: '紅', seenHex: '#e23b3b', absorbed: '綠', absHex: '#3cb043', lambda: 530 },
    { seen: '紫', seenHex: '#8a3fd6', absorbed: '黃綠', absHex: '#b6d000', lambda: 560 },
    { seen: '藍', seenHex: '#2a6fdb', absorbed: '橙', absHex: '#f08a1c', lambda: 600 },
    { seen: '綠', seenHex: '#3cb043', absorbed: '紅', absHex: '#e23b3b', lambda: 680 },
  ]
  let i = $state(5) // 綠
  const c = $derived(COLORS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🎨</span>
    <span class="font-display font-bold">UV-Vis 互補色</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1.5">
    {#each COLORS as cc, k (cc.seen)}
      <button type="button" class={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-transform ${i === k ? 'scale-110 ring-2 ring-primary ring-offset-1' : ''}`} style={`background:${cc.seenHex};color:#fff`} onclick={() => (i = k)} aria-label={cc.seen}>{cc.seen}</button>
    {/each}
  </div>

  <div class="flex items-center justify-around gap-2 rounded-box bg-base-200/60 p-3 text-center text-sm">
    <div>
      <div class="mx-auto h-10 w-10 rounded-full" style={`background:${c.seenHex}`}></div>
      <div class="mt-1 text-xs">你看到<b>{c.seen}</b></div>
    </div>
    <div class="text-2xl text-base-content/40">→ 吸收</div>
    <div>
      <div class="mx-auto h-10 w-10 rounded-full" style={`background:${c.absHex}`}></div>
      <div class="mt-1 text-xs">吸收<b>{c.absorbed}</b></div>
    </div>
    <div>
      <div class="text-xs text-base-content/55">λ 約</div>
      <div class="text-lg font-bold tabular-nums text-primary">{c.lambda}</div>
      <div class="text-xs text-base-content/55">nm</div>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>看到的顏色 = 吸收色的互補色</b>（紅↔綠、黃↔紫藍、橙↔藍）。呈<b>綠</b>者吸收波長<b>最長</b>（吸紅光）、呈<b>黃</b>者最短（吸紫藍光）。共軛系統越長 → λmax 越長（紅移）→ 顏色越深。
  </p>
</div>
