// 把 HTML 片段裡的 `$…$` 用 KaTeX 渲染成 HTML。
//
// 為什麼需要它：`Memorize` 的 items 是 JSX prop 的字串、走 `{@html}`，remark-math／rehype-katex
// 這條 MDX 管線碰不到它們——以前只好把公式寫成 `a/b`、`÷` 這種 inline 形式。Aira 2026-08-05
// 定案「公式一律要有完整那條橫線」，所以改成在**伺服器端**把必背卡的公式也交給 KaTeX。
//
// ⚠️ 這個模組會 import katex（約 300KB）。只能在**不送到瀏覽器**的地方用：
//   - `Memorize.astro`（Astro 元件永遠不出 JS）
//   - `/api/note-review`（伺服器端 endpoint，回傳已渲染好的 HTML）
// 不要在會 hydrate 的 Svelte 元件裡 import。
import katex from 'katex'
import 'katex/contrib/mhchem'

// `$…$` 之間不跨行、且不吃掉貨幣寫法（`$` 後緊接數字再接空白的情形本專案沒有，故不特判）。
const INLINE_MATH = /\$([^$\n]+?)\$/g

/** Render every `$…$` in an HTML fragment. 壞掉的式子原樣留著（並回報），不讓整則消失。 */
export function renderMathHtml(html: string): string {
  return html.replace(INLINE_MATH, (whole, tex: string) => {
    try {
      return katex.renderToString(tex, { throwOnError: true, output: 'html' })
    } catch {
      return whole
    }
  })
}
