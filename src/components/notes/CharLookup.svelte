<script lang="ts">
  // 查字：輸入國字 → 顯示部首（＋部首讀音/意思）與各讀音的字義。
  // 字庫 src/data/chars.json 於首次查詢時 lazy-load（~1MB，不拖累初載）。
  // 資料＝教育部《重編國語辭典修訂本》經萌典整理（CC BY-ND 3.0 臺灣，定義原文照抄）。
  // 螢幕用工具，列印時隱藏（PDF 印的是下方部首總表）。
  import { RADICALS, type Radical } from '@/models/radicals'

  type Entry = { r: string; h: { b: string; d: string }[] }
  const radMap = new Map<string, Radical>(RADICALS.map((r) => [r.char, r]))

  let query = $state('')
  let db = $state<Record<string, Entry> | null>(null)
  let loading = $state(false)

  async function ensureDb() {
    if (db || loading) return
    loading = true
    try {
      const mod = await import('@/data/chars.json')
      db = mod.default as Record<string, Entry>
    } finally {
      loading = false
    }
  }

  const chars = $derived([...new Set([...query])].filter((c) => /\p{Script=Han}/u.test(c)))
  const results = $derived(db ? chars.map((c) => ({ c, entry: db![c] ?? null })) : [])
</script>

<div class="not-prose my-6 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5 print:hidden">
  <label class="mb-2 flex items-center gap-2 text-sm font-bold">
    <span aria-hidden="true">🔍</span>查字：部首與字義
  </label>
  <input
    type="text"
    bind:value={query}
    oninput={ensureDb}
    onfocus={ensureDb}
    placeholder="輸入國字（可一次多字），查部首與字義"
    class="input input-bordered w-full"
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
  />

  {#if loading && !db}
    <p class="mt-3 text-sm text-base-content/55">載入字庫中…</p>
  {/if}

  {#if query.trim() && db}
    {#if results.length === 0}
      <p class="mt-3 text-sm text-base-content/55">請輸入國字。</p>
    {:else}
      <div class="mt-3 space-y-2">
        {#each results as { c, entry } (c)}
          <div class="rounded-box bg-base-200/50 p-3">
            {#if entry}
              {@const rad = radMap.get(entry.r)}
              <div class="flex items-baseline gap-3">
                <span class="text-3xl font-bold leading-none">{c}</span>
                <span class="text-sm">
                  部首
                  <b class="text-primary">{entry.r}</b>
                  {#if rad}<span class="text-base-content/60">（{rad.zhuyin}・{rad.meaning}）</span>{/if}
                </span>
              </div>
              <ul class="mt-2 space-y-1 text-sm">
                {#each entry.h as het, i (i)}
                  <li class="flex gap-2">
                    <span class="shrink-0 font-bold tracking-wide text-secondary">{het.b}</span>
                    <span class="text-base-content/80">{het.d}</span>
                  </li>
                {/each}
              </ul>
            {:else}
              <div class="flex items-baseline gap-3">
                <span class="text-3xl font-bold leading-none">{c}</span>
                <span class="text-sm text-base-content/55">查無此字（字庫未收錄）</span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/if}

  <p class="mt-3 text-xs leading-relaxed text-base-content/45">
    字義：教育部《重編國語辭典修訂本》，萌典整理（CC BY-ND 3.0 臺灣）。
  </p>
</div>
