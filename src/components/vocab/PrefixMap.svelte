<script lang="ts">
  // 今天在哪一組字首 ＋ 完整字首地圖（Aira 2026-08-05：「每日複習有個字根 or 字首表會不會更好？」）
  //
  // 只做字首、不做字根：字庫 386 個相異字根裡有 332 個**只出現在一個字**，做成表等於把單字表
  // 重排一次；真正可重用的骨架是 23 組字首（平均一組 11 個字）。
  //
  // 為什麼放在今日單字之前：卡片預設遮住中文，要你用字首字根推。推之前得先知道 `a-` 是「無」——
  // 原本的說明只列出形式（`a-／an-`）沒給意思，等於要你用還沒學過的東西去推。
  import { PREFIX_GROUPS, type PrefixGroup, type VocabWord } from '@/models/vocab'
  import { orderedVocab } from '@/utils/vocabSchedule'
  import Icon from '@/components/common/Icon.svelte'

  let { words, todayWords }: { words: VocabWord[]; todayWords: VocabWord[] } = $props()

  let showAll = $state(false)
  let scroller = $state<HTMLDivElement | null>(null)

  // 展開時自動捲到今天那組。整條 23 組在小視窗裡只看得到幾列，落在第 20 組的時候
  // 不捲就等於沒告訴她「我在哪」——那正是這張表要回答的問題。
  $effect(() => {
    if (!showAll || !scroller) return
    const row = scroller.querySelector('tr[data-active]')
    if (!(row instanceof HTMLElement)) return
    // 目標位置減掉表頭高度，才不會剛好被 sticky 的表頭蓋住。
    const head = scroller.querySelector('thead')
    const offset = head instanceof HTMLElement ? head.offsetHeight : 0
    scroller.scrollTop = Math.max(0, row.offsetTop - offset - 4)
  })

  const todayIds = $derived(new Set(todayWords.map((w) => w.id)))
  const activeIds = $derived(new Set(todayWords.map((w) => w.prefixId).filter(Boolean)))

  /** 每組：總字數、今天佔幾個、在整條排程裡的位置（第 N–M 個字）。 */
  const groups = $derived.by(() => {
    const ordered = orderedVocab(words)
    const rows = new Map<string, { group: PrefixGroup; total: number; todayCount: number; from: number; to: number }>()
    ordered.forEach((w, i) => {
      const id = w.prefixId
      if (!id) return
      const g = PREFIX_GROUPS.find((x) => x.id === id)
      if (!g) return
      const row = rows.get(id) ?? { group: g, total: 0, todayCount: 0, from: i + 1, to: i + 1 }
      row.total += 1
      row.to = i + 1
      if (todayIds.has(w.id)) row.todayCount += 1
      rows.set(id, row)
    })
    return [...rows.values()].sort((a, b) => a.group.order - b.group.order)
  })

  const todayGroups = $derived(groups.filter((r) => activeIds.has(r.group.id)))
</script>

<div class="mb-3 rounded-xl border border-primary/20 bg-primary/[0.04] p-3">
  <p class="mb-2 text-xs font-medium tracking-wide text-primary/75">今天在這組字首</p>

  <div class="flex flex-col gap-2">
    {#each todayGroups as row (row.group.id)}
      <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span class="rounded-md bg-primary/15 px-2 py-0.5 font-display font-bold text-primary">
          {row.group.forms.join('／')}
        </span>
        <span class="text-sm font-medium">{row.group.meaning}</span>
        <span class="text-xs tabular-nums text-base-content/45">
          這組 {row.total} 個字，今天 {row.todayCount} 個
        </span>
      </div>
    {/each}
  </div>

  <button
    class="mt-2.5 inline-flex items-center gap-1 text-xs text-base-content/55 transition-colors hover:text-primary"
    onclick={() => (showAll = !showAll)}
    aria-expanded={showAll}
  >
    <Icon name="chevronRight" class="h-3 w-3 transition-transform {showAll ? 'rotate-90' : ''}" />
    {showAll ? '收起' : `看完整字首表（${groups.length} 組）`}
  </button>

  {#if showAll}
    <!-- 表格自己捲，不把整頁撐長（23 組展開有 20 幾列，下面的今日單字會被推很遠）。
         表頭 sticky，捲到中段還看得到欄位；展開時自動捲到今天那組。
         375px 放不下三欄：字數是最不重要的一欄，手機藏起來讓「意思」有完整寬度。 -->
    <div bind:this={scroller} class="custom-scrollbar mt-2.5 max-h-64 overflow-y-auto rounded-lg border border-base-200 bg-base-100">
      <!-- border-separate（不是 collapse）：collapse 會把邊框歸屬給表格而非儲存格，sticky 的
           表頭捲動時邊框不跟著走，下緣會透出下一列的內容。改用 separate＋逐格 border-b。 -->
      <table class="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr class="text-left text-xs text-base-content/50">
            <th class="sticky top-0 z-10 border-b border-base-300 bg-base-100 px-3 py-1.5 font-medium">字首</th>
            <th class="sticky top-0 z-10 border-b border-base-300 bg-base-100 py-1.5 font-medium">意思</th>
            <th class="sticky top-0 z-10 hidden border-b border-base-300 bg-base-100 px-3 py-1.5 text-right font-medium sm:table-cell">字數</th>
          </tr>
        </thead>
        <tbody>
          {#each groups as row (row.group.id)}
            {@const active = activeIds.has(row.group.id)}
            <tr data-active={active ? '' : undefined} class={active ? 'bg-primary/10' : ''}>
              <td class="border-b border-base-200/70 px-3 py-1.5 font-display font-semibold {active ? 'text-primary' : ''}">
                {row.group.forms.join('／')}
              </td>
              <td class="border-b border-base-200/70 py-1.5 text-base-content/70">{row.group.meaning}</td>
              <td class="hidden border-b border-base-200/70 px-3 py-1.5 text-right tabular-nums text-base-content/45 sm:table-cell">{row.total}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <p class="mt-2 text-xs text-base-content/40">
        依這個順序每天走 {todayWords.length} 個字，走完一輪約 {Math.ceil(words.length / Math.max(1, todayWords.length))} 天。
      </p>
    </div>
  {/if}
</div>
