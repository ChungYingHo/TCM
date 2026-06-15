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

  // 化學結構式等「圖片選項」抽不出文字，按鈕只剩字母 → 提示對照題目圖作答
  const imageOptions = $derived(
    question.options.length > 0 && question.options.every((o) => !o.text?.trim()),
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

{#if imageOptions}
  <p class="-mb-1 text-xs text-base-content/50">此題選項為圖片（如化學結構式），請對照上方題目圖作答。</p>
{/if}
<div class="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="選項">
  {#each letters as letter (letter)}
    <button
      type="button"
      class={`btn h-auto min-h-11 select-text items-start justify-start gap-1 whitespace-normal py-2 text-left leading-snug ${stateClass(letter)}`}
      aria-pressed={selected === letter}
      onclick={() => onselect?.(letter)}
    >
      <span class="font-bold">{letter}</span>
      {#if question.options.find((o) => o.letter === letter)?.text}
        <span class="font-normal break-words">
          {question.options.find((o) => o.letter === letter)?.text}
        </span>
      {/if}
    </button>
  {/each}
</div>
