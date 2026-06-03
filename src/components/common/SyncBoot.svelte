<script lang="ts">
  // Headless: starts local-first cloud sync on every gated page load.
  import { onMount } from 'svelte'
  import { initSync } from '@/utils/sync'
  onMount(() => initSync())
</script>
