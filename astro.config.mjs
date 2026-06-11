// @ts-check
import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'
import path from 'node:path'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

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
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  adapter: vercel({ webAnalytics: { enabled: true } }),
})
