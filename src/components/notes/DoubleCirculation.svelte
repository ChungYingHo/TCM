<script lang="ts">
  // 雙循環血流：點一站，看它流充氧血還是缺氧血。重點：肺動脈缺氧、肺靜脈充氧。
  type Stop = { name: string; oxy: 'low' | 'high' | 'exchange'; note: string }
  const STOPS: Stop[] = [
    { name: '右心房', oxy: 'low', note: '接收全身回來的缺氧血。' },
    { name: '右心室', oxy: 'low', note: '把缺氧血打出去。' },
    { name: '肺動脈', oxy: 'low', note: '動脈卻流缺氧血，因為它是離心往肺去交換氣體。' },
    { name: '肺（肺泡）', oxy: 'exchange', note: '氣體交換：放出 CO₂、吸收 O₂。' },
    { name: '肺靜脈', oxy: 'high', note: '靜脈卻流充氧血，因為它是回心把血帶回左心房。' },
    { name: '左心房', oxy: 'high', note: '接收肺來的充氧血。' },
    { name: '左心室', oxy: 'high', note: '壁最厚，把充氧血打向全身。' },
    { name: '主動脈', oxy: 'high', note: '充氧血出發，走體循環到全身。' },
    { name: '全身組織', oxy: 'exchange', note: '氣體交換：放出 O₂ 給細胞、帶走 CO₂。' },
  ]
  let i = $state(2)
  const s = $derived(STOPS[i])
  const color = (o: string) => (o === 'low' ? 'badge-info' : o === 'high' ? 'badge-error' : 'badge-ghost')
  const label = (o: string) => (o === 'low' ? '缺氧血' : o === 'high' ? '充氧血' : '氣體交換')
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">❤️</span>
    <span class="font-display font-bold">雙循環：血流與含氧量</span>
  </div>

  <div class="mb-3 flex flex-wrap items-center gap-1">
    {#each STOPS as st, k (st.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{st.name}</button>
      {#if k < STOPS.length - 1}<span class="text-base-content/40">→</span>{/if}
    {/each}
    <span class="text-base-content/40">↺</span>
  </div>

  <div class="rounded-box bg-base-200/60 p-3">
    <div class="mb-1 flex items-center gap-2">
      <span class="font-bold text-primary">{s.name}</span>
      <span class={`badge badge-sm font-bold ${color(s.oxy)}`}>{label(s.oxy)}</span>
    </div>
    <p class="text-sm text-base-content/75">{s.note}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    動脈與靜脈是依離心或回心的方向定義，<b>與含氧量無關</b>。所以<b>肺動脈流缺氧血、肺靜脈流充氧血</b>，與含氧量的直覺相反。胎兒的臍動脈與臍靜脈也是同樣的情形。
  </p>
</div>
