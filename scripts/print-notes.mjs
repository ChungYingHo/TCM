// 把化學七章渲染成「列印級 A4 PDF」到 exports/。
// 需先啟動 dev server（npm start，預設 port 4330）。用法：npm run pdf
//
// 機制：用 Playwright 開無頭 Chromium → POST 密碼到 /api/unlock 取得 cookie
// → 逐章 emulateMedia('print') 套用列印 CSS → 注入思源宋體（僅產 PDF 時載入）
// → 等字體就緒 → page.pdf({ preferCSSPageSize })，讓 @page 的 A4／橫向生效。
import { chromium } from 'playwright'
import { readFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BASE = process.env.PDF_BASE_URL || 'http://localhost:4330'
const OUT = path.join(ROOT, 'exports')
const SERIF = 'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&display=swap'

// 與 src/models/notes.ts 的化學七章同步（清單小且穩定，手動維護）
const NOTES = [
  { href: '/periodic-table', file: '1-元素週期表' },
  { href: '/amino-acids', file: '2-胺基酸' },
  { href: '/chem-atomic-theory', file: '3-學說與理論' },
  { href: '/chem-units', file: '4-化學上重要的單位' },
  { href: '/chem-molecules', file: '5-化學分子表達' },
  { href: '/chem-stoichiometry', file: '6-化學反應方程式與化學計量' },
  { href: '/chem-thermo', file: '7-簡單的熱力學' },
]

function sitePassword() {
  if (process.env.SITE_PASSWORD) return process.env.SITE_PASSWORD
  try {
    const m = readFileSync(path.join(ROOT, '.env'), 'utf8').match(/^SITE_PASSWORD=(.*)$/m)
    if (m) return m[1].trim()
  } catch { /* 無 .env 就靠環境變數 */ }
  return ''
}

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext()

  const res = await context.request.post(`${BASE}/api/unlock`, { data: { password: sitePassword() } })
  if (!res.ok()) {
    console.error(`解鎖失敗（${res.status()}）：請確認 dev server 已啟動於 ${BASE}，且 SITE_PASSWORD 正確。`)
    await browser.close()
    process.exit(1)
  }

  for (const note of NOTES) {
    const page = await context.newPage()
    await page.emulateMedia({ media: 'print' })
    await page.goto(`${BASE}${note.href}`, { waitUntil: 'load' })
    // 注入列印用襯線字體（思源宋體）——只在產 PDF 時載，平時頁面不受影響
    await page.evaluate((href) => {
      const l = document.createElement('link')
      l.rel = 'stylesheet'
      l.href = href
      document.head.appendChild(l)
    }, SERIF)
    // 等字體與島嶼就緒，避免落字或 fallback metrics
    await page.evaluate(async () => {
      await document.fonts.ready
      for (let i = 0; i < 50; i++) {
        if (
          document.fonts.check('16px "Noto Serif TC"') &&
          document.fonts.check('16px "KaTeX_Main"') &&
          document.fonts.check('16px "Noto Sans TC"')
        ) break
        await new Promise((r) => setTimeout(r, 100))
      }
    })
    // 直向為主；只有 118 格表在 CSS 標為具名橫向頁（@page pt-landscape）。
    // preferCSSPageSize 讓同一份 PDF 內單頁橫向、其餘直向，且套用各自的 @page 邊界。
    await page.pdf({
      path: path.join(OUT, `${note.file}.pdf`),
      printBackground: true,
      preferCSSPageSize: true,
    })
    console.log(`✓ ${note.file}.pdf`)
    await page.close()
  }

  await browser.close()
  console.log(`\n完成：${NOTES.length} 份 PDF → ${OUT}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
