<script lang="ts">
  import StudyApp from '@/components/study/StudyApp.svelte'
  import ExamApp from '@/components/exam/ExamApp.svelte'
  import WrongBookApp from '@/components/wrongbook/WrongBookApp.svelte'

  type Tab = 'study' | 'exam' | 'wrong'
  const tabs: { id: Tab; label: string }[] = [
    { id: 'study', label: '刷題' },
    { id: 'exam', label: '模擬考' },
    { id: 'wrong', label: '錯題本' },
  ]

  let active = $state<Tab>('study')

  $effect(() => {
    const p = new URLSearchParams(window.location.search)
    const t = p.get('tab') as Tab | null
    if (t && tabs.some((x) => x.id === t)) active = t
  })

  function switchTab(id: Tab) {
    active = id
    history.replaceState(null, '', id === 'study' ? '/study' : `/study?tab=${id}`)
  }

  function tabCls(id: Tab) {
    return active === id
      ? 'flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all bg-base-100 shadow-sm text-primary'
      : 'flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-base-content/55'
  }
</script>

<div class="mb-5 flex gap-1 rounded-xl bg-base-300/50 p-1">
  {#each tabs as t (t.id)}
    <button class={tabCls(t.id)} onclick={() => switchTab(t.id)}>
      {t.label}
    </button>
  {/each}
</div>

{#if active === 'study'}
  <StudyApp />
{:else if active === 'exam'}
  <ExamApp />
{:else}
  <WrongBookApp />
{/if}
