<script lang="ts">
  import type { OptionLetter, QuestionRecord } from '@/models/question'
  import { SCHOOL_LABEL, SUBJECT_LABEL } from '@/models/question'
  import QuestionImage from '@/components/question/QuestionImage.svelte'
  import OptionButtons from '@/components/question/OptionButtons.svelte'
  import AnswerReveal from '@/components/question/AnswerReveal.svelte'
  import { isChoiceCorrect } from '@/utils/score'
  import { recordWrong, removeWrong, isInWrongBook } from '@/utils/wrongBook'
  import { recordAttempt } from '@/utils/progress'
  import { primaryTag } from '@/models/taxonomy'
  import { addNote, notesByQuestion } from '@/utils/notes'
  import { askGemini, buildQuestionPrompt } from '@/utils/askAI'

  let {
    question,
    mode = 'study',
    selected = null,
    revealed = false,
    active = false,
    compact = false,
    onselect,
    onanswer,
  }: {
    question: QuestionRecord
    mode?: 'study' | 'exam'
    selected?: OptionLetter | null
    revealed?: boolean
    active?: boolean
    compact?: boolean
    onselect?: (letter: OptionLetter) => void
    onanswer?: (correct: boolean) => void
  } = $props()

  let showImg = $state(false)
  const imgVisible = $derived(!compact || showImg)

  const letters = $derived(
    question.options.length
      ? question.options.map((o) => o.letter)
      : (['A', 'B', 'C', 'D'] as OptionLetter[]),
  )

  // keyboard-driven actions (called by the parent list when this card is active)
  export function selectByIndex(i: number) {
    if (i >= 0 && i < letters.length) handleSelect(letters[i])
  }
  export function reveal() {
    if (mode === 'study') localRevealed = true
  }

  // study mode keeps its own selection + reveal; exam mode is parent-controlled.
  let localSelected = $state<OptionLetter | null>(null)
  let localRevealed = $state(false)
  let inBook = $state(false)
  let showNote = $state(false)
  let noteText = $state('')
  let myNotes = $state<ReturnType<typeof notesByQuestion>>([])

  $effect(() => {
    inBook = isInWrongBook(question.id)
    myNotes = notesByQuestion(question.id)
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
    onanswer?.(ok)
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

  function askThis() { void askGemini(buildQuestionPrompt(question)) }
  function saveNote() {
    const t = noteText.trim()
    if (!t) return
    addNote(primaryTag(question.concept_tags) ?? question.concept_tags[0] ?? '', question.id, t)
    noteText = ''
    showNote = false
    myNotes = notesByQuestion(question.id)
  }
</script>

<article class={`card border bg-base-100 transition-shadow ${active ? 'border-primary shadow-md ring-1 ring-primary/40' : 'border-base-300 shadow-sm'}`}>
  <div class="card-body gap-3 p-4 sm:p-5">
    <header class="flex flex-wrap items-center gap-2 text-xs">
      <span class="badge badge-neutral">{SCHOOL_LABEL[question.school]}</span>
      <span class="badge badge-ghost">{question.year} 年</span>
      <span class="badge badge-ghost">{SUBJECT_LABEL[question.subject]}</span>
      <span class="badge badge-outline">第 {question.question_number} 題</span>
    </header>

    {#if imgVisible}
      <QuestionImage {question} />
    {:else}
      <button type="button" class="btn btn-ghost btn-sm self-start" onclick={() => (showImg = true)}>
        ▸ 看題目圖
      </button>
    {/if}

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
        <button type="button" class="btn btn-sm btn-ghost" onclick={askThis} title="複製題目並開 Gemini 詢問">
          ✦ 問 AI
        </button>
        <button type="button" class={`btn btn-sm btn-ghost ${myNotes.length ? 'text-primary' : ''}`} onclick={() => (showNote = !showNote)}>
          ✎ 筆記{myNotes.length ? ` (${myNotes.length})` : ''}
        </button>
      </div>

      {#if showNote}
        <div class="flex flex-col gap-2" data-no-ai>
          <textarea
            bind:value={noteText}
            rows="2"
            placeholder="寫一句筆記，會收進這個考點的「我的筆記」…"
            class="textarea textarea-bordered w-full text-sm"
          ></textarea>
          <div class="flex gap-2">
            <button type="button" class="btn btn-sm btn-primary" onclick={saveNote} disabled={!noteText.trim()}>儲存筆記</button>
            <button type="button" class="btn btn-sm btn-ghost" onclick={() => { showNote = false; noteText = '' }}>取消</button>
          </div>
        </div>
      {/if}

      {#if myNotes.length}
        <ul class="flex flex-col gap-1 rounded-lg border border-base-300 bg-base-200/40 p-2.5 text-sm" data-no-ai>
          {#each myNotes as n (n.id)}
            <li class="flex items-start gap-1.5">
              <span aria-hidden="true" class="text-primary">✎</span>
              <span class="whitespace-pre-wrap">{n.text}</span>
            </li>
          {/each}
        </ul>
      {/if}
    {/if}

    {#if shownRevealed}
      <AnswerReveal {question} />
    {/if}
  </div>
</article>
