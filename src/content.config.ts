import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const notes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    subject: z.enum(['chemistry', 'chinese', 'biology', 'english']),
    tag: z.string(), // links to a concept_tag in the question bank
    kind: z.enum(['note', 'review']).default('note'), // 'review' = 跨考點複習摘要文章
    covers: z.array(z.string()).default([]), // review digests: concept tags recapped
    summary: z.string().default(''),
    audio: z.string().default(''), // spoken key-points — TTS player removed 2026-06 (browser voice too poor); data kept for a future better engine
    draft: z.boolean().default(false),
  }),
})

export const collections = { notes }
