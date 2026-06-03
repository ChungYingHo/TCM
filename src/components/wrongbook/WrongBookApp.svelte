<script lang="ts">
  import type { QuestionRecord } from '@/models/question'
  import { SCHOOLS } from '@/models/question'
  import { loadSchools } from '@/utils/dataset'
  import { listWrong, clearWrongBook, removeWrong } from '@/utils/wrongBook'
  import { getSyncStatus, type SyncStatus } from '@/utils/sync'
  import { exportBackup, importBackup } from '@/utils/backup'
  import QuestionCard from '@/components/question/QuestionCard.svelte'

  let byId = $state<Map<string, QuestionRecord>>(new Map())
  let entries = $state(listWrong())
  let loading = $state(true)
  let sync = $state<SyncStatus>(getSyncStatus())
  let fileInput = $state<HTMLInputElement>()

  $effect(() => {
    loadSchools([...SCHOOLS])
      .then((qs) => { byId = new Map(qs.map((q) => [q.id, q])) })
      .finally(() => { loading = false })
  })

  // keep the list + status live as sync pulls / user answers elsewhere
  $effect(() => {
    const refresh = () => { entries = listWrong() }
    const onStatus = (e: Event) => { sync = (e as CustomEvent<SyncStatus>).detail }
    window.addEventListener('tcm:synced', refresh)
    window.addEventListener('tcm:statechange', refresh)
    window.addEventListener('tcm:syncstatus', onStatus)
    return () => {
      window.removeEventListener('tcm:synced', refresh)
      window.removeEventListener('tcm:statechange', refresh)
      window.removeEventListener('tcm:syncstatus', onStatus)
    }
  })

  const items = $derived(
    entries.map((e) => ({ entry: e, q: byId.get(e.id) })).filter((x) => x.q),
  )

  const syncMeta: Record<SyncStatus, { text: string; cls: string }> = {
    synced: { text: '☁ 已雲端同步', cls: 'badge-success' },
    syncing: { text: '同步中…', cls: 'badge-ghost' },
    local: { text: '本機儲存（雲端未啟用）', cls: 'badge-ghost' },
    error: { text: '雲端暫時無法連線（已存本機）', cls: 'badge-warning' },
  }

  function refresh() { entries = listWrong() }
  function drop(id: string) { removeWrong(id); refresh() }
  function clearAll() {
    if (confirm('確定清空整本錯題本？（雲端與本機都會清空）')) { clearWrongBook(); refresh() }
  }
  async function onImport(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0]
    if (!f) return
    try {
      const r = await importBackup(f)
      refresh()
      alert(`已匯入並合併：錯題本 ${r.wrong} 題、作答紀錄 ${r.progress} 題。`)
    } catch (err) {
      alert('匯入失敗：' + (err instanceof Error ? err.message : '檔案格式不對'))
    } finally {
      if (fileInput) fileInput.value = ''
    }
  }
</script>

<div class="flex flex-col gap-3">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <p class="text-sm text-base-content/70">
      {#if loading}載入中…{:else}共 <b>{items.length}</b> 題，依錯誤次數排序{/if}
    </p>
    <div class="flex flex-wrap items-center gap-2">
      <span class={`badge badge-sm ${syncMeta[sync].cls}`} title="錯題本/作答紀錄的儲存狀態">{syncMeta[sync].text}</span>
      <button class="btn btn-ghost btn-xs" onclick={exportBackup} title="下載一份備份檔">匯出備份</button>
      <button class="btn btn-ghost btn-xs" onclick={() => fileInput?.click()} title="從備份檔還原（會合併，不覆蓋）">匯入</button>
      {#if entries.length}
        <button class="btn btn-ghost btn-xs" onclick={clearAll}>清空</button>
      {/if}
      <input bind:this={fileInput} type="file" accept="application/json,.json" class="hidden" onchange={onImport} />
    </div>
  </div>

  {#if !loading && items.length === 0}
    <div class="flex flex-col items-center gap-3 rounded-box border border-dashed border-base-300 p-8 text-center">
      <p class="opacity-70">錯題本還是空的。答錯的題目會自動收進來。</p>
      <a href="/study" class="btn btn-primary btn-sm">去刷題 →</a>
    </div>
  {/if}

  {#each items as { entry, q } (entry.id)}
    <div class="relative">
      <div class="absolute right-2 top-2 z-10 flex items-center gap-2">
        <span class="badge badge-error" title="錯誤次數">錯 {entry.wrongCount} 次</span>
        <button class="btn btn-ghost btn-xs" onclick={() => drop(entry.id)}>移除</button>
      </div>
      <QuestionCard question={q!} mode="study" />
    </div>
  {/each}
</div>
