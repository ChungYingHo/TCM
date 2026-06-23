<script lang="ts">
  import { onMount } from 'svelte'
  import { bootCloud } from '@/utils/cloud'

  const RESET_KEY = 'tcm.reset.v2'

  onMount(() => {
    if (!localStorage.getItem(RESET_KEY)) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('tcm.'))
        .forEach((k) => localStorage.removeItem(k))
      localStorage.setItem(RESET_KEY, '1')
      fetch('/api/state', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ state: { wrongbook: {}, progress: {}, updatedAt: Date.now() } }),
      }).catch(() => {})
    }
    bootCloud()
  })
</script>
