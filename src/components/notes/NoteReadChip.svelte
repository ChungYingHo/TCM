<script lang="ts">
  // 「讀完 M/D」chip — shows when this 考點筆記 was first finished (full-day read), so a
  // review is visibly a review of something you actually read. Read-state lives in the daily
  // plan log; we derive slug → first-read date the same way the schedule advances the cursor.
  import { onMount } from 'svelte'
  import scheduleJson from '@/data/schedule.json'
  import { dumpPlan } from '@/utils/dailyPlan'
  import { noteReadDates } from '@/utils/studyCursor'
  import { mdShort } from '@/utils/date'
  import type { ScheduleData } from '@/utils/studyPlan'

  let { slug }: { slug: string } = $props()
  const schedule = scheduleJson as unknown as ScheduleData

  let date = $state<string | null>(null)
  function refresh() {
    const dates = noteReadDates(dumpPlan(), schedule.tracks.notes)
    date = dates[slug] ?? null
  }
  onMount(() => {
    refresh()
    const on = () => refresh()
    window.addEventListener('tcm:statechange', on)
    window.addEventListener('tcm:cloudloaded', on)
    return () => {
      window.removeEventListener('tcm:statechange', on)
      window.removeEventListener('tcm:cloudloaded', on)
    }
  })
</script>

{#if date}
  <span class="badge badge-success badge-sm gap-1 font-medium" title={`${date} 讀完`}>✓ 讀完 {mdShort(date)}</span>
{/if}
