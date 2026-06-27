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

function lean(shard: { school: string; questions: QuestionRecord[] }): string {
  return JSON.stringify({
    school: shard.school,
    questions: shard.questions.map((q) => {
      const out: Record<string, unknown> = { ...q }
      for (const k of STRIP) delete out[k]
      return out
    }),
  })
}

// Shards are static at module load, so strip + serialize ONCE rather than per request
// (each shard is ~2k records). Sibling endpoints (vocab/explanations) do the same.
const BODY: Record<School, string> = {
  CMU: lean(SHARDS.CMU),
  ISU: lean(SHARDS.ISU),
  TCU: lean(SHARDS.TCU),
}

export const GET: APIRoute = ({ params }) => {
  // Object.hasOwn guard: a bare `BODY[school]` lookup would resolve inherited
  // keys like "__proto__"/"constructor" to truthy prototype objects and serve a
  // garbage 200 instead of 404.
  const school = params.school as string
  const body = Object.hasOwn(BODY, school) ? BODY[school as School] : undefined
  if (!body) {
    return new Response(JSON.stringify({ error: 'unknown school' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    })
  }
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'private, max-age=3600',
    },
  })
}
