<script lang="ts">
  import { todayKey, parseYmd, zhDateLabel } from '@/utils/date'
  import DailyPlan from '@/components/review/DailyPlan.svelte'

  const today = todayKey()
  const dateLabel = zhDateLabel(new Date(parseYmd(today)))
  const hour = new Date().getHours()
  const greeting = hour < 5 ? '夜深了' : hour < 11 ? '早安' : hour < 18 ? '午安' : '晚安'
</script>

<div class="flex flex-col gap-6">
  <header class="rounded-box bg-gradient-to-br from-primary/8 to-primary/2 px-5 py-5">
    <p class="page-kicker tabular-nums mb-1">{dateLabel}</p>
    <h1 class="page-title">{greeting}，開始練習吧</h1>
    <p class="mt-1.5 text-sm text-base-content/50">每天一點點，日拱一卒</p>
  </header>

  <DailyPlan />
</div>
