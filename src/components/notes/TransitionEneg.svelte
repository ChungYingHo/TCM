<script lang="ts">
  // 靜態「過渡金屬電負度」d 區熱圖＋ㄇ 字形趨勢箭頭：3d／4d／5d 三列、3B 到 2B 十欄。
  // 純 SSR、PDF 完整。橘色粗箭頭把「電負度變大的方向」畫成 ㄇ（⊓）：
  //   左邊前 3 欄往上增、頂上往右增、右邊後面欄往下增。底色深淺＝電負度大小。
  // 資料全來自 @/models/elements（單一資料來源，勿另建）。
  import { SERIES, elementByZ } from '@/models/elements'

  const COLS = ['3B', '4B', '5B', '6B', '7B', '8B', '8B', '8B', '1B', '2B']
  const ROW_KEYS = ['3d', '4d', '5d'] as const
  const ENMIN = 1.0, ENMAX = 2.6

  // 版面座標
  const GX = 50, GY = 46, CW = 27, CH = 29
  const GR = GX + 10 * CW // grid right
  const GB = GY + 3 * CH // grid bottom

  type Cell = { x: number; y: number; sym: string; en: number | null; fill: string; tw: string }
  const cells: Cell[] = []
  ROW_KEYS.forEach((rk, r) => {
    SERIES[rk].forEach((z, c) => {
      const e = elementByZ(z)
      const en = e?.eneg ?? null
      const t = en === null ? 0 : Math.max(0, Math.min(1, (en - ENMIN) / (ENMAX - ENMIN)))
      cells.push({
        x: GX + c * CW,
        y: GY + r * CH,
        sym: e?.sym ?? '',
        en,
        fill: `color-mix(in oklab, var(--color-primary) ${Math.round(18 + t * 72)}%, var(--color-base-100))`,
        tw: t > 0.55 ? '#fff' : 'var(--color-base-content)',
      })
    })
  })
  const ARROW = '#ea580c'
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🌉</span>
    <span class="font-display font-bold">過渡金屬電負度（d 區＝週期表中間的 ㄇ 字塊）</span>
  </div>

  <div class="overflow-x-auto pb-1 print:overflow-visible">
    <svg viewBox="0 0 {GR + 26} {GB + 14}" style="min-width: 26rem;" class="w-full" role="img" aria-label="過渡金屬電負度熱圖與 ㄇ 字形趨勢箭頭">
      <defs>
        <marker id="tearrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={ARROW} />
        </marker>
      </defs>

      <!-- 欄標 -->
      {#each COLS as g, i (i)}
        <text x={GX + i * CW + CW / 2} y={GY - 5} text-anchor="middle" class="fill-base-content/55 text-[7px] font-semibold">{g}</text>
      {/each}
      <!-- 列標 -->
      {#each ROW_KEYS as rk, r (rk)}
        <text x={GX - 6} y={GY + r * CH + CH / 2 + 3} text-anchor="end" class="fill-base-content/60 text-[8px] font-bold">{rk}</text>
      {/each}

      <!-- 格子 -->
      {#each cells as c (c.x + '-' + c.y)}
        <rect x={c.x + 0.6} y={c.y + 0.6} width={CW - 1.2} height={CH - 1.2} rx="2.5" style={`fill:${c.fill}`} />
        <text x={c.x + CW / 2} y={c.y + CH / 2 - 1} text-anchor="middle" style={`fill:${c.tw}`} class="text-[7.5px] font-bold">{c.sym}</text>
        <text x={c.x + CW / 2} y={c.y + CH / 2 + 8} text-anchor="middle" style={`fill:${c.tw}`} class="text-[6px] opacity-80">{c.en ?? '—'}</text>
      {/each}

      <!-- 前 3 欄 / 後面欄 分隔 -->
      <line x1={GX + 3 * CW} y1={GY - 2} x2={GX + 3 * CW} y2={GB + 2} stroke="var(--color-base-content)" stroke-width="0.8" stroke-dasharray="2 2" class="opacity-30" />

      <!-- ㄇ 字形趨勢箭頭（電負度增大方向）：左↑、頂→、右↓ -->
      <line x1={GX - 14} y1={GB} x2={GX - 14} y2={GY - 10} stroke={ARROW} stroke-width="2.4" marker-end="url(#tearrow)" />
      <line x1={GX - 14} y1={GY - 12} x2={GR + 12} y2={GY - 12} stroke={ARROW} stroke-width="2.4" marker-end="url(#tearrow)" />
      <line x1={GR + 12} y1={GY - 10} x2={GR + 12} y2={GB} stroke={ARROW} stroke-width="2.4" marker-end="url(#tearrow)" />
      <text x={GX - 22} y={(GY + GB) / 2} transform={`rotate(-90 ${GX - 22} ${(GY + GB) / 2})`} text-anchor="middle" class="text-[6.5px] font-bold" style={`fill:${ARROW}`}>前3欄往上增</text>
      <text x={GR + 20} y={(GY + GB) / 2} transform={`rotate(90 ${GR + 20} ${(GY + GB) / 2})`} text-anchor="middle" class="text-[6.5px] font-bold" style={`fill:${ARROW}`}>後面往下增</text>
      <text x={(GX + GR) / 2} y={GY - 15} text-anchor="middle" class="text-[6.5px] font-bold" style={`fill:${ARROW}`}>往右增</text>
    </svg>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    橘色箭頭就是電負度變大的方向，連起來是個 <b style="color:#ea580c">ㄇ 字形</b>：<b>前 3 欄（3B、4B、5B）往下遞減</b>（所以往上才是增、和主族一樣），<b>後面幾欄往下遞增</b>（和主族相反，底下的 W、Au、Pt 特別深）。
  </p>
</div>
