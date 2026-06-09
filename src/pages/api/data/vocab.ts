import type { APIRoute } from 'astro'
import vocabJson from '@/data/vocab.json'

export const prerender = false

// vocab.json is large (~1.2MB) and changes rarely; serialize once at module load
// so it is fetched lazily by the client instead of bloating the main JS bundle.
const BODY = JSON.stringify(vocabJson)

export const GET: APIRoute = () =>
  new Response(BODY, {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'private, max-age=3600',
    },
  })
