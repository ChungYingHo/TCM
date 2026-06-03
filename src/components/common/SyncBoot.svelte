<script lang="ts">
  // Headless: load the cloud-stored wrong-book/progress on every gated page,
  // then save changes back. localStorage is the local cache; the DB is durable.
  import { onMount } from 'svelte'
  import { bootCloud } from '@/utils/cloud'
  onMount(() => bootCloud())
</script>
