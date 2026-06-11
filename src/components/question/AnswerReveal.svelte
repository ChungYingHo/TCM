<script lang="ts">
  import type { QuestionRecord } from '@/models/question'
  import { answerLabel } from '@/utils/score'
  import { primaryTag, tagSlug, tagShort } from '@/models/taxonomy'
  import { solveSteps } from '@/models/solveTemplates'
  import Tag from '@/components/common/Tag.svelte'
  import Icon from '@/components/common/Icon.svelte'

  let { question }: { question: QuestionRecord } = $props()

  // 解題方向 comes from the same source the matching concept note uses, so the
  // method shown here is identical to the note for this question's category.
  const ptag = $derived(primaryTag(question.concept_tags))
  const steps = $derived(ptag ? solveSteps(ptag) : [])
  const slug = $derived(ptag ? tagSlug(ptag) : null)
  // errata reason is only worth showing when the answer was actually changed
  const showReason = $derived(question.errata_applied && !!question.explanation)
</script>

<div class="mt-3 rounded-lg border border-base-300 bg-base-200/60 p-3 text-sm animate-fade-in-up">
  <div class="flex flex-wrap items-center gap-2">
    <span class="font-semibold">正確答案：</span>
    <span class="badge badge-success badge-lg font-bold">{answerLabel(question)}</span>
    {#if question.errata_applied}
      <span class="badge badge-warning" title="此題答案經釋疑更正">釋疑更正</span>
      {#if question.original_answer.length}
        <span class="text-xs opacity-70">（原答案：{question.original_answer.join('、')}）</span>
      {/if}
    {/if}
    {#if question.needs_review}
      <span class="badge badge-ghost" title="答案待人工確認">答案待確認</span>
    {/if}
  </div>

  {#if showReason}
    <p class="mt-2 whitespace-pre-wrap leading-relaxed opacity-90">{question.explanation}</p>
  {/if}

  {#if steps.length}
    <details class="mt-3 rounded-lg border border-primary/25 bg-primary/5" open>
      <summary class="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 font-semibold text-primary">
        <Icon name="compass" class="h-4 w-4 shrink-0" /> 這類題的解法{#if ptag}<span class="ml-1 text-xs font-normal opacity-70">（{tagShort(ptag)}）</span>{/if}
      </summary>
      <div class="border-t border-primary/15 px-3 py-2.5">
        <ol class="flex flex-col gap-1.5 leading-relaxed">
          {#each steps as step, i (i)}
            <li class="grid grid-cols-[1.3rem_1fr] items-start gap-1.5">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-content">{i + 1}</span>
              <span class="pt-0.5">{@html step}</span>
            </li>
          {/each}
        </ol>
        {#if slug}
          <a class="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline" href={`/notes/${slug}`}>
            看完整考點筆記與例題詳解 <Icon name="arrowRight" class="h-3 w-3" />
          </a>
        {/if}
      </div>
    </details>
  {/if}

  {#if question.concept_tags.length}
    <div class="mt-2 flex flex-wrap gap-1">
      {#each question.concept_tags as t (t)}
        <Tag label={t} />
      {/each}
    </div>
  {/if}
</div>
