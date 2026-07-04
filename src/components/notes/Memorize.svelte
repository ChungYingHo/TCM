<script lang="ts">
  // 必背速查表（合併原 Memorize＋KeyPoints，2026-07-04 Aira 定案：一個區塊、表格化、不要擠）。
  // items：每則寫「主題：內容」，元件自動以第一個「：」拆成兩欄（主題｜內容）；無「：」則內容獨佔整列。
  // 每列 print:break-inside-avoid，長表可自然跨頁但單列不被切。
  let { label = '必背', items = [] }: { label?: string; items?: string[] } = $props()
  const split = (s: string): [string, string] => {
    const i = s.indexOf('：')
    return i > 0 && i <= 18 ? [s.slice(0, i), s.slice(i + 1)] : ['', s]
  }
</script>

<aside class="note-summary-card my-6 overflow-hidden rounded-box border border-accent/30 bg-base-100">
  <div class="flex items-center gap-1.5 border-b border-accent/25 bg-accent/10 px-5 py-3 text-sm font-bold tracking-wide text-accent">
    <span aria-hidden="true">🔑</span>{label}・一定要記
  </div>
  {#if items.length}
    <table class="w-full text-[0.9375rem] leading-relaxed">
      <tbody>
        {#each items as item, i (i)}
          {@const parts = split(item)}
          <tr class="border-t border-base-200 align-top first:border-t-0 print:break-inside-avoid">
            {#if parts[0]}
              <th scope="row" class="w-[6.5rem] whitespace-normal break-words px-5 py-3.5 text-left font-semibold text-accent sm:w-32">{@html parts[0]}</th>
              <td class="px-5 py-3.5">{@html parts[1]}</td>
            {:else}
              <td colspan="2" class="px-5 py-3.5">{@html parts[1]}</td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <div class="px-5 py-4 text-[0.9375rem] leading-relaxed">
      <slot />
    </div>
  {/if}
</aside>
