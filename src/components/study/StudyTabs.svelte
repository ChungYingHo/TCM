<script lang="ts">
  import StudyApp from '@/components/study/StudyApp.svelte'
  import ExamApp from '@/components/exam/ExamApp.svelte'
  import WrongBookApp from '@/components/wrongbook/WrongBookApp.svelte'
  import Segmented from '@/components/common/Segmented.svelte'

  type Tab = 'study' | 'exam' | 'wrong'
  const VALID: Tab[] = ['study', 'exam', 'wrong']

  let active = $state<Tab>('study')

  $effect(() => {
    const t = new URLSearchParams(window.location.search).get('tab') as Tab | null
    if (t && VALID.includes(t)) active = t
  })

  let mounted = false
  $effect(() => {
    const id = active
    if (!mounted) { mounted = true; return }
    history.replaceState(null, '', id === 'study' ? '/study' : `/study?tab=${id}`)
  })
</script>

<div class="mb-5">
  <Segmented
    block
    ariaLabel="題庫模式"
    bind:value={active}
    options={[
      { value: 'study', label: '刷題' },
      { value: 'exam', label: '模擬考' },
      { value: 'wrong', label: '錯題本' },
    ]}
  />
</div>

{#if active === 'study'}
  <StudyApp />
{:else if active === 'exam'}
  <ExamApp />
{:else}
  <WrongBookApp />
{/if}
