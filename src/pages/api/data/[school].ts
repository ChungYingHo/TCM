import type { APIRoute } from 'astro'
import type { School, QuestionRecord } from '@/models/question'
import CMU from '@/data/CMU.json'
import ISU from '@/data/ISU.json'
import TCU from '@/data/TCU.json'

export const prerender = false

const SHARDS: Record<School, { school: string; questions: QuestionRecord[] }> = {
  CMU: CMU as never,
  ISU: ISU as never,
  TCU: TCU as never,
}

// Fields the UI never reads — dropped to keep the payload lean.
const STRIP = ['ocr_text', 'source_pdf', 'source_answer_pdf', 'errata_reason_image_url']

export const GET: APIRoute = ({ params }) => {
  const school = params.school as School
  const shard = SHARDS[school]
  if (!shard) {
    return new Response(JSON.stringify({ error: 'unknown school' }), { status: 404 })
  }
  const lean = {
    school: shard.school,
    questions: shard.questions.map((q) => {
      const out: Record<string, unknown> = { ...q }
      for (const k of STRIP) delete out[k]
      return out
    }),
  }
  return new Response(JSON.stringify(lean), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'private, max-age=3600',
    },
  })
}
