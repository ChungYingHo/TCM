<script lang="ts">
  // at / on / in：切換時間或地點，看三者的用法與例子。範圍越大用 in。
  let time = $state(true)
  type Row = { prep: string; use: string; egs: string }
  const TIME: Row[] = [
    { prep: 'at', use: '精確時刻、節日（特定點）', egs: 'at 8 a.m.、at noon、at midnight、at night' },
    { prep: 'on', use: '特定日期、星期幾', egs: 'on Monday、on January 1st、on my birthday' },
    { prep: 'in', use: '月份、年份、季節、世紀', egs: 'in June、in 2024、in winter、in the morning' },
  ]
  const PLACE: Row[] = [
    { prep: 'at', use: '視為一個「點」', egs: 'at the hospital、at the corner、at the bus stop' },
    { prep: 'on', use: '表面接觸、道路', egs: 'on the table、on the wall、on Fifth Avenue' },
    { prep: 'in', use: '三維空間內部、城市／國家', egs: 'in the room、in Taipei、in the box' },
  ]
  const rows = $derived(time ? TIME : PLACE)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">📍</span>
    <span class="font-display font-bold">at／on／in：範圍越大用 in</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${time ? 'btn-primary' : 'btn-outline'}`} onclick={() => (time = true)}>時間</button>
      <button type="button" class={`btn btn-xs ${!time ? 'btn-primary' : 'btn-outline'}`} onclick={() => (time = false)}>地點</button>
    </div>
  </div>

  <div class="space-y-2">
    {#each rows as r (r.prep)}
      <div class="flex gap-3 rounded-box bg-base-200/60 p-2 text-sm">
        <span class="flex h-7 w-10 shrink-0 items-center justify-center rounded bg-primary/15 font-mono font-bold text-primary">{r.prep}</span>
        <div>
          <div class="text-base-content/80">{r.use}</div>
          <div class="text-xs text-base-content/60">{r.egs}</div>
        </div>
      </div>
    {/each}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    口訣：<b>越具體用 at、越大範圍用 in</b>。時間 at（時刻）→ on（日／星期）→ in（月／年／季）；地點 at（點）→ on（面／路）→ in（內部／城市）。固定例外：at night、in the morning。
  </p>
</div>
