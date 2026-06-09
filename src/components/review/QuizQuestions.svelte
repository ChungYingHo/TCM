<script lang="ts">
  // Inline answerable quiz for the daily plan: renders the day's questions (drawn from
  // today's 考點 tags) as study cards. QuestionCard records attempts and files wrong
  // answers into the 錯題本 itself, so a missed quiz item comes back as a due review.
  import type { QuestionRecord } from '@/models/question'
  import { SCHOOLS } from '@/models/question'
  import { loadSchools } from '@/utils/dataset'
  import QuestionCard from '@/components/question/QuestionCard.svelte'

  let { ids }: { ids: string[] } = $props()
  let byId = $state<Map<string, QuestionRecord>>(new Map())
  let loading = $state(true)

  $effect(() => {
    loadSchools([...SCHOOLS])
      .then((qs) => { byId = new Map(qs.map((q) => [q.id, q])) })
      .finally(() => { loading = false })
  })

  const items = $derived(ids.map((id) => byId.get(id)).filter(Boolean) as QuestionRecord[])
</script>

{#if loading}
  <p class="text-sm text-base-content/50">載入考題…</p>
{:else}
  <div class="flex flex-col gap-4">
    {#each items as q (q.id)}
      <QuestionCard question={q} mode="study" />
    {/each}
  </div>
{/if}
