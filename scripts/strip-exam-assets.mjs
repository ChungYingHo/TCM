// build 後把考古題截圖（public/q/**，約 425 MB）從部署輸出刪掉。
//
// 為什麼：Vercel 每次部署都會把整個靜態輸出存一份（Deployment Storage），而考古題
// 只有 /exam 線上測驗在用，筆記／每日複習完全不碰。刷題在本機 dev server 做（直接
// 讀 public/，不受影響），線上就不必背著 7000 張圖。
//
// 例外：PUBLIC_EXAM_ENABLED=1 時保留（本機 `astro preview` 要測考古題用）；
// 同一個變數也讓網站顯示 /exam 入口（見 src/utils/examEnabled.ts），兩邊一致。
import { existsSync, rmSync } from 'node:fs'

const TARGETS = ['.vercel/output/static/q', 'dist/client/q']

if (process.env.PUBLIC_EXAM_ENABLED === '1') {
  console.log('[strip-exam-assets] PUBLIC_EXAM_ENABLED=1，保留考古題圖片')
} else {
  for (const dir of TARGETS) {
    if (!existsSync(dir)) continue
    rmSync(dir, { recursive: true, force: true })
    console.log(`[strip-exam-assets] 已刪除 ${dir}`)
  }
}
