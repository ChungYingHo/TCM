<script lang="ts">
  import type { OptionLetter, QuestionRecord } from '@/models/question'
  import { SCHOOL_LABEL, SUBJECT_LABEL } from '@/models/question'
  import QuestionImage from '@/components/question/QuestionImage.svelte'
  import OptionButtons from '@/components/question/OptionButtons.svelte'
  import AnswerReveal from '@/components/question/AnswerReveal.svelte'
  import { isChoiceCorrect } from '@/utils/score'
  import { recordWrong, removeWrong, isInWrongBook } from '@/utils/wrongBook'
  import { recordAttempt } from '@/utils/progress'

  let {
    question,
    mode = 'study',
    selected = null,
    revealed = false,
    onselect,
  }: {
    question: QuestionRecord
    mode?: 'study' | 'exam'
    selected?: OptionLetter | null
    revealed?: boolean
    onselect?: (letter: OptionLetter) => void
  } = $props()

  // study mode keeps its own selection + reveal; exam mode is parent-controlled.
  let localSelected = $state<OptionLetter | null>(null)
  let localRevealed = $state(false)
  let inBook = $state(false)

  $effect(() => {
    inBook = isInWrongBook(question.id)
  })

  const shownSelected = $derived(mode === 'exam' ? selected : localSelected)
  const shownRevealed = $derived(mode === 'exam' ? revealed : localRevealed)

  function handleSelect(letter: OptionLetter) {
    if (mode === 'exam') {
      onselect?.(letter)
      return
    }
    localSelected = letter
    localRevealed = true
    const ok = isChoiceCorrect(question, letter)
    recordAttempt(question.id, ok, Date.now())
    if (!ok) {
      recordWrong(question.id, [letter], Date.now())
      inBook = true
    }
  }

  function toggleBook() {
    if (inBook) {
      removeWrong(question.id)
      inBook = false
    } else {
      recordWrong(question.id, shownSelected ? [shownSelected] : [], Date.now())
      inBook = true
    }
  }
</script>

<article class="card border border-base-300 bg-base-100 shadow-sm">
  <div class="card-body gap-3 p-4 sm:p-5">
    <header class="flex flex-wrap items-center gap-2 text-xs">
      <span class="badge badge-neutral">{SCHOOL_LABEL[question.school]}</span>
      <span class="badge badge-ghost">{question.year} 年</span>
      <span class="badge badge-ghost">{SUBJECT_LABEL[question.subject]}</span>
      <span class="badge badge-outline">第 {question.question_number} 題</span>
    </header>

    <QuestionImage {question} />

    <OptionButtons {question} selected={shownSelected} revealed={shownRevealed} onselect={handleSelect} />

    {#if mode === 'study'}
      <div class="flex flex-wrap items-center gap-2">
        {#if !localRevealed}
          <button type="button" class="btn btn-sm btn-primary" onclick={() => (localRevealed = true)}>
            一鍵看答案
          </button>
        {/if}
        <button type="button" class={`btn btn-sm ${inBook ? 'btn-warning' : 'btn-ghost'}`} onclick={toggleBook}>
          {inBook ? '★ 已在錯題本' : '☆ 加入錯題本'}
        </button>
      </div>
    {/if}

    {#if shownRevealed}
      <AnswerReveal {question} />
    {/if}
  </div>
</article>
