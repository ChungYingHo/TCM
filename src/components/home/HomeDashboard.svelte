<script lang="ts">
  import { todayKey, parseYmd, zhDateLabel } from '@/utils/date'
  import DailyPlan from '@/components/review/DailyPlan.svelte'

  const today = todayKey()
  const dateLabel = zhDateLabel(new Date(parseYmd(today)))
  const hour = new Date().getHours()
  const greeting = hour < 5 ? '夜深了' : hour < 11 ? '早安' : hour < 18 ? '午安' : '晚安'
</script>

<div class="flex flex-col gap-5">
  <header class="flex flex-col gap-1">
    <p class="page-kicker tabular-nums">{dateLabel}</p>
    <h1 class="page-title">{greeting}，開始練習吧</h1>
  </header>

  <DailyPlan />
</div>
