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
