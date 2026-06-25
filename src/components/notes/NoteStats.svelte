<script lang="ts">
  // Status chip at the top of a note: how heavily this concept is tested
  // (frequency tier + total + per-school split + multi-year trend). Loads the
  // gated shards client-side, same as RelatedQuestions.
  import type { QuestionRecord, School } from '@/models/question'
  import { SCHOOLS, SCHOOL_LABEL } from '@/models/question'
  import { loadSchools } from '@/utils/dataset'
  import { tagSubject, orderedTags } from '@/models/taxonomy'
  import { tagTrends } from '@/utils/analytics'

  let { tag }: { tag: string } = $props()

  let all = $state<QuestionRecord[]>([])
  let loading = $state(true)

  $effect(() => {
    loadSchools([...SCHOOLS])
      .then((qs) => { all = qs })
      .finally(() => { loading = false })
  })

  const subject = tagSubject(tag)
  const matches = $derived(all.filter((q) => q.concept_tags.includes(tag)))
  const total = $derived(matches.length)
  const perSchool = $derived(
    SCHOOLS.map((s) => ({ school: s, n: matches.filter((q) => q.school === s).length })),
  )

  // frequency tier = rank of this tag's total among its subject's tags
  const tier = $derived.by(() => {
    if (!subject || !all.length) return null
    const totals = orderedTags(subject)
      .map((t) => all.filter((q) => q.concept_tags.includes(t)).length)
      .sort((a, b) => b - a)
    const rank = totals.filter((n) => n > total).length
    const pct = rank / Math.max(1, totals.length)
    if (pct < 0.34) return { label: '高頻考點', cls: 'badge-error' }
    if (pct < 0.67) return { label: '中頻考點', cls: 'badge-warning' }
    return { label: '低頻考點', cls: 'badge-ghost' }
  })

  const trend = $derived.by(() => {
    if (!subject || !all.length) return null
    return tagTrends(all, subject).find((t) => t.tag === tag)?.trend ?? null
  })
  const trendMeta: Record<string, { icon: string; text: string; cls: string }> = {
    up: { icon: '↑', text: '近年增加', cls: 'text-error' },
    down: { icon: '↓', text: '近年減少', cls: 'text-success' },
    stable: { icon: '→', text: '穩定常考', cls: 'text-base-content/60' },
  }
</script>

<div class="my-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-box border border-base-300 bg-base-200/50 px-3.5 py-2.5 text-sm print:hidden">
  {#if loading}
    <span class="opacity-60">統計載入中…</span>
  {:else}
    <span aria-hidden="true">📊</span>
    {#if tier}<span class={`badge ${tier.cls} badge-sm font-bold`}>{tier.label}</span>{/if}
    <span>全題庫 <b class="tabular-nums">{total}</b> 題</span>
    {#if trend && trendMeta[trend]}
      <span class={`font-semibold ${trendMeta[trend].cls}`}>
        {trendMeta[trend].icon} {trendMeta[trend].text}
      </span>
    {/if}
    <span class="flex items-center gap-2 text-xs opacity-70">
      {#each perSchool as ps (ps.school)}
        <span>{SCHOOL_LABEL[ps.school as School]} {ps.n}</span>
      {/each}
    </span>
  {/if}
</div>
