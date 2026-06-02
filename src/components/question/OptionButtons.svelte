<script lang="ts">
  import type { OptionLetter, QuestionRecord } from '@/models/question'

  let {
    question,
    selected = null,
    revealed = false,
    onselect,
  }: {
    question: QuestionRecord
    selected?: OptionLetter | null
    revealed?: boolean
    onselect?: (letter: OptionLetter) => void
  } = $props()

  const letters = $derived(
    question.options.length
      ? question.options.map((o) => o.letter)
      : (['A', 'B', 'C', 'D'] as OptionLetter[]),
  )

  function stateClass(letter: OptionLetter): string {
    if (revealed) {
      if (question.award_all || question.correct_answer.includes(letter)) return 'btn-success'
      if (selected === letter) return 'btn-error'
      return 'btn-outline'
    }
    return selected === letter ? 'btn-primary' : 'btn-outline'
  }
</script>

<div class="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="選項">
  {#each letters as letter (letter)}
    <button
      type="button"
      class={`btn min-h-11 justify-start text-left ${stateClass(letter)}`}
      aria-pressed={selected === letter}
      onclick={() => onselect?.(letter)}
    >
      <span class="font-bold">{letter}</span>
      {#if question.options.find((o) => o.letter === letter)?.text}
        <span class="ml-1 truncate font-normal">
          {question.options.find((o) => o.letter === letter)?.text}
        </span>
      {/if}
    </button>
  {/each}
</div>
