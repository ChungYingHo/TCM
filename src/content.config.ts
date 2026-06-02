import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const notes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    subject: z.enum(['chemistry', 'chinese', 'biology', 'english']),
    tag: z.string(), // links to a concept_tag in the question bank
    summary: z.string().default(''),
    draft: z.boolean().default(false),
  }),
})

export const collections = { notes }
