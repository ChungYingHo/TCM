<script lang="ts">
  import VocabApp from '@/components/vocab/VocabApp.svelte'
  import ClassicsList from '@/components/classics/ClassicsList.svelte'

  type Tab = 'vocab' | 'classics'
  const tabs: { id: Tab; label: string }[] = [
    { id: 'vocab', label: '單字' },
    { id: 'classics', label: '古文' },
  ]

  let active = $state<Tab>('vocab')

  $effect(() => {
    const p = new URLSearchParams(window.location.search)
    const t = p.get('tab') as Tab | null
    if (t && tabs.some((x) => x.id === t)) active = t
  })

  function switchTab(id: Tab) {
    active = id
    history.replaceState(null, '', id === 'vocab' ? '/vocab' : `/vocab?tab=${id}`)
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

{#if active === 'vocab'}
  <VocabApp />
{:else}
  <ClassicsList />
{/if}
