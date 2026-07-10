<script lang="ts">
  // 填入順序畫在「拉長版週期表」上（把 f 區排進來）：一列一個週期，欄位順序 s → f → d → p。
  // 由上而下、每列由左往右讀，就是電子填入順序，所以 4s 在 3d 左邊（先填）、4f 在 5d 左邊（先填）。
  // 純 SSR、PDF 完整。顏色與小週期表共用 @/models/elements 的區塊底色。
  import { BLOCK_BG, type Block } from '@/models/elements'
  const COLS: Block[] = ['s', 'f', 'd', 'p']
  type Row = { n: number; s: string; f: string; d: string; p: string }
  const rows: Row[] = [
    { n: 1, s: '1s', f: '', d: '', p: '' },
    { n: 2, s: '2s', f: '', d: '', p: '2p' },
    { n: 3, s: '3s', f: '', d: '', p: '3p' },
    { n: 4, s: '4s', f: '', d: '3d', p: '4p' },
    { n: 5, s: '5s', f: '', d: '4d', p: '5p' },
    { n: 6, s: '6s', f: '4f', d: '5d', p: '6p' },
    { n: 7, s: '7s', f: '5f', d: '6d', p: '7p' },
  ]
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧭</span>
    <span class="font-display font-bold">填入順序＝拉長版週期表由左到右讀</span>
  </div>
  <div class="overflow-x-auto pb-1 print:overflow-visible">
    <div class="grid min-w-[20rem] gap-1" style="grid-template-columns: 1.3rem 2fr 7fr 5fr 3fr;">
      <div></div>
      <div class="text-center text-[0.65rem] font-semibold text-base-content/55">s 區</div>
      <div class="text-center text-[0.65rem] font-semibold text-base-content/55">f 區</div>
      <div class="text-center text-[0.65rem] font-semibold text-base-content/55">d 區</div>
      <div class="text-center text-[0.65rem] font-semibold text-base-content/55">p 區</div>
      {#each rows as r (r.n)}
        <div class="flex items-center justify-end pr-0.5 text-[0.6rem] text-base-content/45">n={r.n}</div>
        {#each COLS as b (b)}
          {#if r[b]}
            <div class="flex h-7 items-center justify-center rounded text-xs font-bold sm:h-8" style={`background:${BLOCK_BG[b]}`}>{r[b]}</div>
          {:else}
            <div></div>
          {/if}
        {/each}
      {/each}
    </div>
  </div>
  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    把 f 區排進週期表（拉長版），<b>由上而下、每一列由左往右</b>讀，就是電子填入順序。同一列裡 <b>4s 排在 3d 左邊</b>所以先填 4s，<b>4f 排在 5d 左邊</b>所以先填 4f。
  </p>
</div>
