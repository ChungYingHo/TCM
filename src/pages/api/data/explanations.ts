import type { APIRoute } from 'astro'
import explanationsJson from '@/data/explanations.json'

export const prerender = false

// Per-question AI-draft worked solutions; grows large once filled, so it is fetched
// lazily (cached in-module) like vocab.json rather than bloating the main bundle.
const BODY = JSON.stringify(explanationsJson)

export const GET: APIRoute = () =>
  new Response(BODY, {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'private, max-age=3600',
    },
  })
