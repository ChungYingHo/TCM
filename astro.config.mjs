// @ts-check
import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'
import path from 'node:path'
import remarkMath from 'remark-math'
import remarkCjkFriendly from 'remark-cjk-friendly'
import rehypeKatex from 'rehype-katex'
// 註冊 mhchem 的 \ce{}（化學式/方程式）到 katex 單例；rehype-katex 在 SSR 用同一個
// katex 實例，故化學式在「網頁」與「PDF」共用同一份輸出與 KaTeX CSS，呈現一致。
import 'katex/contrib/mhchem'

// 列印分頁用：把每個標題與其下內容（到下一個同/上層標題前）包進 <section class="note-sec">。
// 列印 CSS 對 .note-sec 下 break-inside:avoid → 「標題＋其段落」整段不跨頁切；放不下就整段
// 移到次頁（寧留白也不把一個閱讀單位切兩半，避免讀者翻頁找下文）。螢幕上 section 不帶任何
// margin/padding/border，子元素邊距 collapse 結果與未包裹時相同 → 不影響網頁版面。
function rehypeNoteSections() {
  const isHeading = (n) => n.type === 'element' && /^h[1-6]$/.test(n.tagName || '')
  return (tree) => {
    const out = []
    let current = null
    for (const node of tree.children) {
      if (isHeading(node)) {
        current = { type: 'element', tagName: 'section', properties: { className: ['note-sec'] }, children: [node] }
        out.push(current)
      } else if (current) {
        current.children.push(node)
      } else {
        out.push(node) // 首個標題前的內容（imports、NoteStats…）維持原樣，不包裹
      }
    }
    tree.children = out
  }
}

// Server output so middleware can enforce the password gate (incl. data/image routes).
export default defineConfig({
  output: 'server',
  // 釘死 dev/preview 在獨佔的 4330：strictPort 讓它寧可報錯也不會默默跳到別的 port
  // （以前 4321 被別的專案佔走 → astro 默默跳號 → 連到死掉的舊 port，登入像壞掉）。
  server: { port: 4330, strictPort: true },
  integrations: [svelte(), mdx()],
  vite: {
    resolve: { alias: { '@': path.resolve('./src') } },
    plugins: [tailwindcss()],
  },
  markdown: {
    // 關掉 smartypants：它會把直引號 '/" 轉成彎引號 ’/“”（U+2019…），而 CJK 字型
    // 把彎引號畫成「全形」，英文縮寫貼著中文時就裂出大空格（It’ s）。筆記是中英混排，
    // 這類位置很多，故全站改用直引號根治。（破折號/刪節號無人依賴，影響極小。）
    smartypants: false,
    // CommonMark 的 emphasis flanking 規則對 CJK 不友善：當 **粗體** 的收尾 ** 夾在
    // 全形標點（如「）」）與中文字之間（…）**是…），** 不符合 right-flanking → 不收尾，
    // 整段 ** 變字面顯示。remark-cjk-friendly 修補 micromark 規則，讓中英混排的 ** 正常運作。
    remarkPlugins: [remarkCjkFriendly, remarkMath],
    // rehypeNoteSections 放最後：在 katex 處理完後做最終結構分組（標題＋內容→.note-sec）。
    rehypePlugins: [rehypeKatex, rehypeNoteSections],
  },
  adapter: vercel({ webAnalytics: { enabled: true } }),
})
