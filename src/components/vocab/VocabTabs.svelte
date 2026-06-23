<script lang="ts">
  import VocabApp from '@/components/vocab/VocabApp.svelte'
  import ClassicsList from '@/components/classics/ClassicsList.svelte'
  import Segmented from '@/components/common/Segmented.svelte'

  type Tab = 'vocab' | 'classics'
  const VALID: Tab[] = ['vocab', 'classics']

  let active = $state<Tab>('vocab')

  $effect(() => {
    const t = new URLSearchParams(window.location.search).get('tab') as Tab | null
    if (t && VALID.includes(t)) active = t
  })

  let mounted = false
  $effect(() => {
    const id = active
    if (!mounted) { mounted = true; return }
    history.replaceState(null, '', id === 'vocab' ? '/vocab' : `/vocab?tab=${id}`)
  })
</script>

<div class="mb-5">
  <Segmented
    block
    ariaLabel="字庫模式"
    bind:value={active}
    options={[
      { value: 'vocab', label: '單字' },
      { value: 'classics', label: '古文' },
    ]}
  />
</div>

{#if active === 'vocab'}
  <VocabApp />
{:else}
  <ClassicsList />
{/if}
