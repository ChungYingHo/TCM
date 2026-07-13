<script lang="ts">
  // 靜態「電子親和力趨勢」小元素表：主族第 2、3、4 週期，格子顏色深淺＝放熱多寡（EA 大小）。
  // 純 SSR、PDF 完整。看得到往右顏色變深（EA 增）、鹵素最深，Be／Mg／Ca／N 與鈍氣幾乎不放熱。
  // 資料全來自 @/models/elements（EA 存的是放熱量，null＝不放熱／非考點）。
  import { elementByZ } from '@/models/elements'

  // 每格：原子序（依主族欄位擺放）。null 位置留空。
  const GROUPS = ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A']
  const ROWS: number[][] = [
    [3, 4, 5, 6, 7, 8, 9, 10], // 第 2 週期 Li–Ne
    [11, 12, 13, 14, 15, 16, 17, 18], // 第 3 週期 Na–Ar
    [19, 20, 31, 32, 33, 34, 35, 36], // 第 4 週期 K,Ca,Ga–Kr
  ]
  const EAMAX = 349
  const cell = (z: number) => {
    const e = elementByZ(z)
    const ea = e?.ea ?? null
    const t = ea === null ? 0 : ea / EAMAX
    return { sym: e?.sym ?? '', ea, bg: `color-mix(in oklab, var(--color-primary) ${Math.round(t * 80)}%, var(--color-base-100))` }
  }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧲</span>
    <span class="font-display font-bold">電子親和力趨勢（放熱愈多顏色愈深）</span>
  </div>

  <div class="overflow-x-auto pb-1 print:overflow-visible">
    <div style="min-width: 20rem;">
      <div class="mb-1 text-center text-[0.7rem] font-semibold text-primary">同週期往右，EA 愈大 →</div>
      <div class="flex gap-1">
        <div class="flex flex-col items-center justify-center pr-0.5 text-[0.7rem] font-semibold text-primary" style="writing-mode: vertical-rl;">↓ 往下 EA 愈小</div>
        <div class="grid flex-1 gap-0.5" style="grid-template-columns: repeat(8, minmax(0, 1fr));">
          {#each GROUPS as g (g)}
            <div class="pb-0.5 text-center text-[0.5rem] font-semibold text-base-content/55">{g}</div>
          {/each}
          {#each ROWS as row (row[0])}
            {#each row as z (z)}
              {@const c = cell(z)}
              <div style={`background:${c.bg}`} class="flex aspect-square flex-col items-center justify-center rounded-[0.25rem] leading-none">
                <span class="text-[0.6rem] font-bold">{c.sym}</span>
                <span class="text-[0.42rem] text-base-content/65">{c.ea === null ? '≈0' : c.ea}</span>
              </div>
            {/each}
          {/each}
        </div>
      </div>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    各族放熱大小順序 <b>7A ＞ 6A ＞ 4A ＞ 5A</b>（5A 因為 p 軌域半滿、加電子勉強，掉到 4A 後面）。整體最大是 <b>Cl（349）</b>，不是 F。第 2 族、鈍氣與氮幾乎不放熱。
  </p>
</div>
