// 把筆記渲染成「列印級 A4 PDF」到 exports/，依科目／分類分子資料夾。
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

// 與 src/models/notes.ts 同步（清單小且穩定，手動維護）。`dir`＝exports 下的子資料夾
// ＝科目；快速複習類另置於「快速複習/」。
const NOTES = [
  { dir: '化學', href: '/periodic-table', file: '1-元素週期表' },
  { dir: '化學', href: '/amino-acids', file: '2-胺基酸' },
  { dir: '化學', href: '/chem-atomic-theory', file: '3-學說與理論' },
  { dir: '化學', href: '/chem-units', file: '4-化學上重要的單位' },
  { dir: '化學', href: '/chem-molecules', file: '5-化學分子表達' },
  { dir: '化學', href: '/chem-stoichiometry', file: '6-化學反應方程式與化學計量' },
  { dir: '化學', href: '/chem-thermo', file: '7-簡單的熱力學' },
  { dir: '化學', href: '/chem-quantum', file: '8-光電效應與量子論' },
  { dir: '生物', href: '/bio-cell-1', file: '1-細胞（一）概論顯微鏡原核真核' },
  { dir: '生物', href: '/bio-cell-2', file: '2-細胞（二）細胞核內膜系統能量胞器' },
  { dir: '生物', href: '/bio-cell-3', file: '3-細胞（三）細胞骨架與細胞外連結' },
  { dir: '快速複習', href: '/bio-cell-summary', file: '生物-細胞一頁速查總表' },
]

// 只產指定子資料夾（如 `npm run pdf -- 生物`）；不給則全產。
const ONLY = process.argv.slice(2)
const SELECTED = ONLY.length ? NOTES.filter((n) => ONLY.includes(n.dir)) : NOTES

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

  for (const note of SELECTED) {
    const dir = path.join(OUT, note.dir)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
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
      path: path.join(dir, `${note.file}.pdf`),
      printBackground: true,
      preferCSSPageSize: true,
    })
    console.log(`✓ ${note.dir}/${note.file}.pdf`)
    await page.close()
  }

  await browser.close()
  console.log(`\n完成：${SELECTED.length} 份 PDF → ${OUT}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
