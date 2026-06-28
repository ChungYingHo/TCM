<script lang="ts">
  // 有效位數運算速查（靜態全畫，供 GoodNotes/PDF 直接看，無互動）：
  // 加減看「小數位數」取最少；乘除看「有效數字位數」取最少。
  const ROWS = [
    { op: '加減', look: '小數位數', ex: '23.68 ＋ 4.12 ＝ 27.8', detail: '小數位 2、2 → 取最少 2 位', res: '27.80' },
    { op: '乘除', look: '有效數字位數', ex: '2.0 × 3.14 ＝ 6.28', detail: '有效位 2、3 → 取最少 2 位', res: '6.3' },
  ]
</script>

<div class="not-prose my-5 overflow-hidden rounded-box border border-base-300 bg-base-100 print:break-inside-avoid">
  <div class="flex items-center gap-2 border-b border-base-300 px-4 py-2.5">
    <span aria-hidden="true">🔢</span>
    <span class="font-display font-bold">有效位數運算速查</span>
  </div>
  <table class="w-full text-sm">
    <thead>
      <tr class="text-left text-xs text-base-content/55">
        <th class="px-4 py-2 font-medium">運算</th>
        <th class="px-2 py-2 font-medium">看哪個位數</th>
        <th class="px-2 py-2 font-medium">範例（取最少位）</th>
        <th class="px-4 py-2 text-right font-medium">結果</th>
      </tr>
    </thead>
    <tbody>
      {#each ROWS as r (r.op)}
        <tr class="border-t border-base-300 align-top">
          <td class="px-4 py-2.5 font-bold">{r.op}</td>
          <td class="px-2 py-2.5 font-semibold text-primary">{r.look}</td>
          <td class="px-2 py-2.5">
            <div>{r.ex}</div>
            <div class="text-xs text-base-content/55">{r.detail}</div>
          </td>
          <td class="px-4 py-2.5 text-right font-bold tabular-nums text-primary">{r.res}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
