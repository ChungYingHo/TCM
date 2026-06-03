// Manual backup: download / restore the wrong-book + progress as one JSON file.
// Works fully offline (no server needed) — the safety net regardless of cloud sync.
import { localSnapshot, mergeIntoLocal, pushDebounced, type SyncState } from '@/utils/sync'

interface Backup {
  app: 'tcm'
  version: 1
  exportedAt: string
  state: SyncState
}

export function exportBackup(): void {
  const data: Backup = {
    app: 'tcm',
    version: 1,
    exportedAt: new Date().toISOString(),
    state: localSnapshot(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const stamp = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `後中醫題庫-備份-${stamp}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Restore from a file — MERGES into existing data (never wipes), then syncs up. */
export async function importBackup(file: File): Promise<{ wrong: number; progress: number }> {
  const text = await file.text()
  const parsed = JSON.parse(text) as Partial<Backup>
  if (parsed?.app !== 'tcm' || !parsed.state) throw new Error('不是有效的備份檔')
  const merged = mergeIntoLocal(parsed.state)
  pushDebounced(0)
  return { wrong: Object.keys(merged.wrongbook).length, progress: Object.keys(merged.progress).length }
}
