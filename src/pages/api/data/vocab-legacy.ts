import type { APIRoute } from 'astro'
import vocabJson from '@/data/vocab-legacy.json'

export const prerender = false

// 原字庫（舊 ECDICT GRE/TOEFL 3240 字，已從主頁下架為次要）。~1.4MB，只有使用者在 /vocab
// 切到「原字庫」時才抓；serialize 一次於 module load，避免進主 JS bundle。
const BODY = JSON.stringify(vocabJson)

export const GET: APIRoute = () =>
  new Response(BODY, {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'private, max-age=3600',
    },
  })
