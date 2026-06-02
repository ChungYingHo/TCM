import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const notes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    subject: z.enum(['chemistry', 'chinese', 'biology', 'english']),
    tag: z.string(), // links to a concept_tag in the question bank
    summary: z.string().default(''),
    audio: z.string().default(''), // spoken key-points for the TTS player (drive-time review)
    draft: z.boolean().default(false),
  }),
})

export const collections = { notes }
