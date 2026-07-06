<script lang="ts">
  // 部首總表：康熙 214 部首一頁列出（部首／讀音／意思／例字），按筆畫分段。
  // 純 SSR、可印（GoodNotes）；用顏色與記號標出重要部首。資料來源＝models/radicals.ts。
  import {
    radicalsByStroke,
    STANDALONE_RADICALS,
    HARD_READ_RADICALS,
    type Radical,
  } from '@/models/radicals'

  const groups = radicalsByStroke()

  // 列底色：變形＞自成＞難讀（擇一），標出重要部首。
  function rowClass(r: Radical): string {
    if (r.variant) return 'bg-primary/5'
    if (r.standalone) return 'bg-accent/5'
    if (r.hardRead) return 'bg-warning/5'
    return ''
  }
</script>

{#snippet headCells()}
  <tr class="border-b border-base-300 text-left text-xs font-semibold text-base-content/55">
    <th class="w-[4.5rem] px-2 py-1.5">部首</th>
    <th class="w-[5.5rem] px-2 py-1.5">讀音</th>
    <th class="px-2 py-1.5">意思</th>
    <th class="w-[6rem] px-2 py-1.5">例字</th>
  </tr>
{/snippet}

{#snippet row(r: Radical)}
  <tr class={`border-b border-base-200 align-middle print:break-inside-avoid ${rowClass(r)}`}>
    <td class="px-2 py-1.5">
      <span class="inline-flex flex-wrap items-baseline gap-1">
        <span class="text-xl font-bold leading-none">{r.char}</span>
        {#if r.variant}<span class="badge badge-primary badge-sm font-bold">{r.variant}</span>{/if}
        {#if r.standalone}<span class="badge badge-accent badge-outline badge-sm">自成</span>{/if}
      </span>
    </td>
    <td class="whitespace-nowrap px-2 py-1.5 tracking-wide">
      {#if r.hardRead}<span class="font-bold text-warning">{r.zhuyin} ⚠</span>{:else}{r.zhuyin}{/if}
    </td>
    <td class="px-2 py-1.5 text-sm leading-snug">
      {r.meaning}{#if r.lookalike}<span class="ml-1 text-xs text-secondary">（似 {r.lookalike}）</span>{/if}
    </td>
    <td class="px-2 py-1.5 text-sm tracking-wide">{r.examples}</td>
  </tr>
{/snippet}

<div class="not-prose my-6 space-y-6">
  <!-- 圖例 -->
  <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-box border border-base-300 bg-base-100 px-4 py-3 text-xs">
    <span class="font-bold text-base-content/70">記號：</span>
    <span class="inline-flex items-center gap-1"><span class="badge badge-primary badge-sm font-bold">氵</span> 變形寫法</span>
    <span class="inline-flex items-center gap-1"><span class="font-bold text-warning">ㄅ ⚠</span> 讀音易錯</span>
    <span class="inline-flex items-center gap-1"><span class="badge badge-accent badge-outline badge-sm">自成</span> 整字即部首、別拆</span>
    <span class="inline-flex items-center gap-1"><span class="text-secondary">（似 X）</span> 形近易混</span>
  </div>

  <!-- 214 部首總表（按筆畫） -->
  <section class="space-y-5">
    {#each groups as g (g.strokes)}
      <div class="print:break-inside-avoid">
        <div class="mb-1.5 flex items-baseline gap-2">
          <span class="rounded-md bg-primary/10 px-2 py-0.5 text-sm font-bold text-primary">{g.strokes} 畫</span>
          <span class="text-xs text-base-content/45">{g.items.length} 部</span>
        </div>
        <table class="w-full border-collapse text-base">
          <thead>{@render headCells()}</thead>
          <tbody>
            {#each g.items as r (r.num)}{@render row(r)}{/each}
          </tbody>
        </table>
      </div>
    {/each}
  </section>

  <!-- 自成部首速查 -->
  <section class="print:break-inside-avoid">
    <h3 class="mb-1.5 text-base font-bold text-accent">自成部首（整字即部首，查字典別拆）</h3>
    <table class="w-full border-collapse text-base">
      <thead>{@render headCells()}</thead>
      <tbody>
        {#each STANDALONE_RADICALS as r (r.num)}{@render row(r)}{/each}
      </tbody>
    </table>
  </section>

  <!-- 難讀部首速查 -->
  <section class="print:break-inside-avoid">
    <h3 class="mb-1.5 text-base font-bold text-warning">難讀部首（讀音易錯，單背）</h3>
    <table class="w-full border-collapse text-base">
      <thead>{@render headCells()}</thead>
      <tbody>
        {#each HARD_READ_RADICALS as r (r.num)}{@render row(r)}{/each}
      </tbody>
    </table>
  </section>
</div>
