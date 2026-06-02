<script lang="ts">
  import type { QuestionRecord } from '@/models/question'
  import { answerLabel } from '@/utils/score'
  import Tag from '@/components/common/Tag.svelte'

  let { question }: { question: QuestionRecord } = $props()
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

  {#if question.explanation}
    <p class="mt-2 whitespace-pre-wrap leading-relaxed opacity-90">{question.explanation}</p>
  {/if}

  {#if question.concept_tags.length}
    <div class="mt-2 flex flex-wrap gap-1">
      {#each question.concept_tags as t (t)}
        <Tag label={t} />
      {/each}
    </div>
  {/if}
</div>
