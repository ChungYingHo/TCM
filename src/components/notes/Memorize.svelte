<script lang="ts">
  // 必背速查表（合併原 Memorize＋KeyPoints，2026-07-04 Aira 定案：一個區塊、表格化、不要擠）。
  // items：每則寫「主題：內容」，元件自動以第一個「：」拆成兩欄（主題｜內容）；無「：」則內容獨佔整列。
  //
  // 2026-08-04 改版（Aira：空間壓迫、公式寫成 inline 很難讀）：
  //  - 手機改上下堆疊（主題在上、內容整寬），只有 sm 以上才並排兩欄。原本主題欄寫死
  //    6.5rem，在 375px 會把長內容擠成細長條。
  //  - 內容裡的公式用 <code> 包，渲染成不換行的色塊，跟散文分開且不會從中間斷行
  //    （像 β→Gs→AC→cAMP→PKA 這種路徑鏈以前會攔腰折斷）。
  //  - Memorize 走 {@html}，KaTeX 碰不到它，所以下標一律寫 <sub>，勿用 LaTeX 的 _。
  import type { Snippet } from 'svelte'

  let {
    label = '必背',
    items = [],
    children,
  }: { label?: string; items?: string[]; children?: Snippet } = $props()
  const split = (s: string): [string, string] => {
    const i = s.indexOf('：')
    return i > 0 && i <= 18 ? [s.slice(0, i), s.slice(i + 1)] : ['', s]
  }
</script>

<aside class="note-summary-card memorize my-6 overflow-hidden rounded-box border border-accent/30 bg-base-100">
  <div class="flex items-center gap-1.5 border-b border-accent/25 bg-accent/10 px-5 py-3 text-sm font-bold tracking-wide text-accent">
    <span aria-hidden="true">🔑</span>{label}・一定要記
  </div>
  {#if items.length}
    <dl class="text-[0.9375rem] leading-relaxed">
      {#each items as item, i (i)}
        {@const parts = split(item)}
        <div
          class="border-t border-base-200 px-5 py-3 first:border-t-0 print:break-inside-avoid sm:grid sm:grid-cols-[8.5rem_1fr] sm:gap-x-4 sm:py-3.5"
        >
          {#if parts[0]}
            <dt class="mb-0.5 font-semibold text-accent sm:mb-0">{@html parts[0]}</dt>
            <dd>{@html parts[1]}</dd>
          {:else}
            <dd class="sm:col-span-2">{@html parts[1]}</dd>
          {/if}
        </div>
      {/each}
    </dl>
  {:else}
    <div class="px-5 py-4 text-[0.9375rem] leading-relaxed">
      {@render children?.()}
    </div>
  {/if}
</aside>

<style>
  /* {@html} 的內容不吃 Svelte 的樣式作用域，要用 :global 才套得到。 */
  .memorize :global(code) {
    display: inline-block;
    padding: 0.05em 0.4em;
    border-radius: 0.3rem;
    /* currentColor 混色：淺色與夜讀模式都自動成立，不必各寫一套 */
    background: color-mix(in srgb, currentColor 9%, transparent);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.92em;
    /* 公式不從中間折斷；真的太長時讓色塊自己橫捲，不把頁面撐寬 */
    white-space: nowrap;
    max-width: 100%;
    overflow-x: auto;
    vertical-align: bottom;
  }
  /* 列印時不能靠捲動，改成允許折行 */
  @media print {
    .memorize :global(code) {
      white-space: normal;
      overflow-x: visible;
    }
  }

  /* 速查卡以條列為主：一項一行，比一整段話好掃 */
  .memorize :global(ul) {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .memorize :global(li) {
    position: relative;
    padding-left: 0.85em;
    margin-top: 0.3em;
  }
  .memorize :global(li:first-child) {
    margin-top: 0.15em;
  }
  .memorize :global(li)::before {
    content: '·';
    position: absolute;
    left: 0.1em;
    font-weight: 700;
    opacity: 0.45;
  }
  .memorize :global(code) :global(sub) {
    font-family: inherit;
  }
</style>
