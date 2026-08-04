<script lang="ts">
  // 線上測驗（2026-08-04）：考古題退成「想寫整份的時候才來」的地方，只有模擬考與錯題本。
  // 原本的 /study 刷題瀏覽器（依考點 tag 篩題）與 /analytics 考點趨勢已移除——筆記不再認領
  // 考古題，那兩頁失去了資料來源，日常複習改由 /home 的必背卡與筆記例題負責。
  import ExamApp from '@/components/exam/ExamApp.svelte'
  import WrongBookApp from '@/components/wrongbook/WrongBookApp.svelte'
  import Segmented from '@/components/common/Segmented.svelte'

  type Tab = 'exam' | 'wrong'
  const VALID: Tab[] = ['exam', 'wrong']

  let active = $state<Tab>('exam')

  $effect(() => {
    const t = new URLSearchParams(window.location.search).get('tab') as Tab | null
    if (t && VALID.includes(t)) active = t
  })

  let mounted = false
  $effect(() => {
    const id = active
    if (!mounted) {
      mounted = true
      return
    }
    history.replaceState(null, '', id === 'exam' ? '/exam' : `/exam?tab=${id}`)
  })
</script>

<div class="mb-5">
  <Segmented
    block
    ariaLabel="測驗模式"
    bind:value={active}
    options={[
      { value: 'exam', label: '模擬考' },
      { value: 'wrong', label: '錯題本' },
    ]}
  />
</div>

{#if active === 'exam'}
  <ExamApp />
{:else}
  <WrongBookApp />
{/if}
