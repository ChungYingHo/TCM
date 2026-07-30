// 把筆記渲染成「列印級 A4 PDF」到桌面 TCM-exports/，依科目／分類分子資料夾。
// 需先啟動 dev server（npm start，預設 port 4330）。用法：npm run pdf
//
// 機制：用 Playwright 開無頭 Chromium → POST 密碼到 /api/unlock 取得 cookie
// → 逐章 emulateMedia('print') 套用列印 CSS → 注入思源宋體（僅產 PDF 時載入）
// → 等字體就緒 → page.pdf({ preferCSSPageSize })，讓 @page 的 A4／橫向生效。
//
// 智慧分頁：純 CSS 無法依「頁面剩餘空間」條件分頁，故產完後用 PyMuPDF 量測真實分頁
// （_pdf_lowsections.py），找出「起點落在頁面下半（剩<50%）」的大節標題，對其注入
// break-before:page 後重產，反覆到收斂——讓擠在頁尾的新章節整節挪到新頁。
import { chromium } from 'playwright'
import { spawnSync } from 'node:child_process'
import { readFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BASE = process.env.PDF_BASE_URL || 'http://localhost:4330'
const BROWSER_EXECUTABLE = process.env.PDF_CHROME_PATH
// 輸出到桌面的 TCM-exports/（用 iPad GoodNotes 看，不再印紙本）。可用 PDF_OUT_DIR 覆寫。
const OUT = process.env.PDF_OUT_DIR || path.join(homedir(), 'Desktop', 'TCM-exports')
const SERIF = 'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&display=swap'
const PYTHON = process.env.PYTHON || 'python'

// 與 src/models/notes.ts 同步（清單小且穩定，手動維護）。`dir`＝exports 下的子資料夾
// ＝科目；快速複習類另置於「快速複習/」。
const NOTES = [
  { dir: '化學', href: '/periodic-table', file: '1-元素週期表' },
  { dir: '化學', href: '/amino-acids', file: '2-胺基酸' },
  { dir: '化學', href: '/chem-atomic-theory', file: '3-學說與理論' },
  { dir: '化學', href: '/chem-units', file: '4-化學上重要的單位' },
  { dir: '化學', href: '/chem-molecules', file: '5-化學分子表達' },
  { dir: '化學', href: '/chem-stoichiometry', file: '6-化學反應方程式與化學計量' },
  { dir: '化學', href: '/chem-thermo', file: '7-熱力學' },
  { dir: '化學', href: '/chem-quantum', file: '8-光電效應與量子論' },
  { dir: '化學', href: '/chem-atomic-spectra', file: '9-原子光譜與波耳模型' },
  { dir: '化學', href: '/chem-orbitals', file: '10-量子力學與原子軌域' },
  { dir: '化學', href: '/chem-electron-config', file: '11-原子軌域能階與電子組態' },
  { dir: '化學', href: '/chem-ions-magnetism', file: '12-帶電離子的電子組態與磁光行為' },
  { dir: '化學', href: '/chem-periodicity', file: '13-週期表與週期性' },
  { dir: '化學', href: '/chem-periodic-trends', file: '14-週期性趨勢-半徑親和力電負度' },
  { dir: '化學', href: '/chem-chemical-bonding', file: '15-化學鍵與分子結構' },
  { dir: '生物', href: '/bio-cell-1', file: '1-概論顯微鏡原核真核' },
  { dir: '生物', href: '/bio-cell-2', file: '2-細胞核內膜系統能量胞器' },
  { dir: '生物', href: '/bio-cell-3', file: '3-細胞骨架與細胞外連結' },
  { dir: '生物', href: '/bio-cell-4', file: '4-細胞膜構造與功能' },
  { dir: '生物', href: '/bio-cell-5', file: '5-跨膜運輸與囊泡運輸' },
  { dir: '生物', href: '/bio-cell-6', file: '6-細胞訊號傳遞' },
  { dir: '英文', href: '/readings/r1', file: '1-增補廣讀R1-VOA字彙' },
  { dir: '快速複習', href: '/bio-cell-summary', file: '生物-細胞一頁速查總表' },
]

// 參數可為 dir（科目，如 `npm run pdf -- 生物`）或單篇 href／檔名（如 `npm run pdf -- /bio-cell-4`），
// 皆精確比對；不給則全產。
const ONLY = process.argv.slice(2)
const SELECTED = ONLY.length
  ? NOTES.filter((n) => ONLY.includes(n.dir) || ONLY.includes(n.href) || ONLY.includes(n.file))
  : NOTES

function sitePassword() {
  if (process.env.SITE_PASSWORD) return process.env.SITE_PASSWORD
  try {
    const m = readFileSync(path.join(ROOT, '.env'), 'utf8').match(/^SITE_PASSWORD=(.*)$/m)
    if (m) return m[1].trim()
  } catch { /* 無 .env 就靠環境變數 */ }
  return ''
}

// 量測剛產出的 PDF，回傳「起點被擠在頁尾、又被切到下一頁、該挪到新頁」的標題文字陣列。
// python/PyMuPDF 不可用時回傳 null（外層據此略過智慧分頁，仍輸出 PDF）。
function analyzeLowSections(pdfPath, headings) {
  if (!headings.length) return []
  const res = spawnSync(
    PYTHON,
    [path.join(ROOT, 'scripts', '_pdf_lowsections.py'), pdfPath],
    { input: JSON.stringify(headings), encoding: 'utf8' },
  )
  if (res.status !== 0) {
    const why = (res.stderr || res.error?.message || '').split('\n')[0]
    console.warn(`  （略過智慧分頁：PDF 分析不可用${why ? `——${why}` : ''}）`)
    return null
  }
  try {
    return JSON.parse(res.stdout.trim() || '[]')
  } catch {
    return null
  }
}

// 對 forced 集合內的大節標題注入 break-before:page（並歸零上邊距避免頁首多一段空白）；
// 不在集合內者清掉，確保 idempotent。回傳本頁所有 h2/h3 標題的 {t:文字, l:階層}（依文件順序）。
function applyBreaksAndListHeadings(page, forced) {
  return page.evaluate((texts) => {
    const norm = (s) => s.replace(/\s+/g, '')
    const set = new Set(texts.map(norm))
    const headings = [...document.querySelectorAll('.prose h2, .prose h3')]
    for (const h of headings) {
      const on = set.has(norm(h.textContent || ''))
      h.style.breakBefore = on ? 'page' : ''
      h.style.marginTop = on ? '0' : ''
    }
    return headings.map((h) => ({
      t: (h.textContent || '').replace(/\s+/g, ' ').trim(),
      l: h.tagName === 'H2' ? 2 : 3,
    }))
  }, [...forced])
}

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

  const browser = await chromium.launch(
    BROWSER_EXECUTABLE ? { executablePath: BROWSER_EXECUTABLE } : undefined,
  )
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
    // 先在「螢幕媒體」載入並捲動，觸發 lazy 圖與 client:visible 島嶼——IntersectionObserver 在
    // print 媒體／無捲動時不會觸發，會導致 Figure.astro(loading=lazy) 與 client:visible 圖空白。
    // 全部載好/hydrate 完才切 print 出 PDF（已畫好的圖切媒體後保留）。
    await page.goto(`${BASE}${note.href}`, { waitUntil: 'load' })
    // 注入列印用襯線字體（思源宋體）——只在產 PDF 時載，平時頁面不受影響
    await page.evaluate((href) => {
      const l = document.createElement('link')
      l.rel = 'stylesheet'
      l.href = href
      document.head.appendChild(l)
    }, SERIF)
    // 觸發載圖與島嶼：lazy 圖改 eager、逐段捲到底再回頂讓每個 IntersectionObserver 都觸發、
    // 等所有 <img> 解碼完成（少一張圖都不行）。
    await page.evaluate(async () => {
      const eagerAll = () =>
        document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
          img.loading = 'eager'
        })
      const scrollAll = async () => {
        const step = Math.max(400, Math.floor(window.innerHeight * 0.8))
        for (let y = 0; y <= document.body.scrollHeight; y += step) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 150))
        }
        window.scrollTo(0, 0)
      }
      const decodeAll = async () => {
        const imagesReady = Promise.all(
          [...document.images].map((img) =>
            img.complete && img.naturalWidth > 0 ? null : img.decode().catch(() => {}),
          ),
        )
        await Promise.race([imagesReady, new Promise((resolve) => setTimeout(resolve, 15_000))])
      }
      const pending = () =>
        [...document.images].filter((img) => !(img.complete && img.naturalWidth > 0)).length

      // 重複「轉 eager → 捲一遍 → 等解碼」直到圖片數不再增加且全部載完。
      // 一輪不夠：考古題區的 RelatedQuestions 是 client:load 非同步 fetch 完才插入 DOM，
      // 那些卡片的 <img loading="lazy"> 不在第一輪的 eager 轉換範圍內，只跑一輪會整片空白。
      for (let pass = 0; pass < 4; pass++) {
        const before = document.images.length
        eagerAll()
        await scrollAll()
        await decodeAll()
        if (document.images.length === before && pending() === 0) break
      }
    })
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
    // 給 client:visible 的 canvas/svg 繪製時間，再切列印媒體出 PDF。
    await page.waitForTimeout(500)
    await page.emulateMedia({ media: 'print' })
    // 直向為主；只有 118 格表在 CSS 標為具名橫向頁（@page pt-landscape）。
    // preferCSSPageSize 讓同一份 PDF 內單頁橫向、其餘直向，且套用各自的 @page 邊界。
    const outPath = path.join(dir, `${note.file}.pdf`)
    const render = () =>
      page.pdf({ path: outPath, printBackground: true, preferCSSPageSize: true })

    // 智慧分頁：產 → 量測 → 對「擠在頁尾又被切開的新章節」注入 break-before → 重產，反覆到收斂。
    // forced 只增不減（單調收斂）；最多 10 輪保險。python 不可用則只產一次。
    const forced = new Set()
    let breaks = 0
    for (let iter = 0; iter < 10; iter++) {
      const headings = await applyBreaksAndListHeadings(page, forced)
      await render()
      const low = analyzeLowSections(outPath, headings)
      if (!low) break // 分析不可用：保留這份正常輸出
      const fresh = low.filter((t) => !forced.has(t))
      if (process.env.PDF_DEBUG) console.error(`  [iter${iter}] low=${JSON.stringify(low)} fresh=${JSON.stringify(fresh)}`)
      if (!fresh.length) break
      fresh.forEach((t) => forced.add(t))
      breaks = forced.size
    }
    console.log(`✓ ${note.dir}/${note.file}.pdf${breaks ? `（${breaks} 節挪新頁）` : ''}`)
    await page.close()
  }

  await browser.close()
  console.log(`\n完成：${SELECTED.length} 份 PDF → ${OUT}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
