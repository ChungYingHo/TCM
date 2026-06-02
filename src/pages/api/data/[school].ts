import type { APIRoute } from 'astro'
import type { School } from '@/models/question'
import CMU from '@/data/CMU.json'
import ISU from '@/data/ISU.json'
import TCU from '@/data/TCU.json'

export const prerender = false

const SHARDS: Record<School, unknown> = { CMU, ISU, TCU }

export const GET: APIRoute = ({ params }) => {
  const school = params.school as School
  const shard = SHARDS[school]
  if (!shard) {
    return new Response(JSON.stringify({ error: 'unknown school' }), { status: 404 })
  }
  return new Response(JSON.stringify(shard), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'private, max-age=3600',
    },
  })
}
