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
    rehypePlugins: [rehypeKatex],
  },
  adapter: vercel({ webAnalytics: { enabled: true } }),
})
