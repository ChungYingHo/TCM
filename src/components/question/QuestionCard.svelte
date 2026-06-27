<script lang="ts">
  import type { OptionLetter, QuestionRecord } from '@/models/question'
  import { SCHOOL_LABEL, SUBJECT_LABEL } from '@/models/question'
  import QuestionImage from '@/components/question/QuestionImage.svelte'
  import OptionButtons from '@/components/question/OptionButtons.svelte'
  import AnswerReveal from '@/components/question/AnswerReveal.svelte'
  import { isChoiceCorrect } from '@/utils/score'
  import { recordWrong, removeWrong, isInWrongBook } from '@/utils/wrongBook'
  import { recordAttempt } from '@/utils/progress'
  import { askGemini, buildQuestionPrompt } from '@/utils/askAI'
  import { needsPassageContext, earlierImageUrl } from '@/utils/passageContext'
  import Icon from '@/components/common/Icon.svelte'

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

  // 題組支援。優先用 pipeline 裁好的「共用文章獨立圖」（passage_image_url）；
  // 沒有時才退回啟發式：往前翻前一題的圖找文章。
  const IMG_BASE = (import.meta.env.PUBLIC_IMG_BASE || '').replace(/\/$/, '')
  const passageUrl = $derived(question.passage_image_url || null)
  let showPassage = $state(false)
  const groupish = $derived(!passageUrl && needsPassageContext(question))
  let contextBack = $state(0) // 0 = closed; N = showing the image N questions earlier
  const contextUrl = $derived(contextBack > 0 ? earlierImageUrl(question, contextBack) : null)

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
  // Writable $derived: reflects wrong-book membership for the current question
  // (recomputed when the question changes), but the toggle below can override it
  // immediately. Avoids the $state+$effect first-render flash of `false`.
  let inBook = $derived(isInWrongBook(question.id))

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
</script>

<article class={`card border bg-base-100 ${active ? 'is-active' : ''}`}>
  <div class="card-body gap-3 p-4 sm:p-5">
    <header class="flex flex-wrap items-center gap-2 text-xs">
      <span class="badge badge-neutral">{SCHOOL_LABEL[question.school]}</span>
      <span class="badge badge-ghost">{question.year} 年</span>
      <span class="badge badge-ghost">{SUBJECT_LABEL[question.subject]}</span>
      <span class="badge badge-outline">第 {question.question_number} 題</span>
    </header>

    {#if passageUrl}
      <!-- 題組共用文章（pipeline 裁切，永遠正確） -->
      <div class="flex flex-col gap-2 rounded-box border border-info/30 bg-info/[0.05] p-2">
        <button type="button" class="btn btn-ghost btn-xs self-start" onclick={() => (showPassage = !showPassage)}>
          <Icon name="fileText" class="h-3.5 w-3.5" />
          題組閱讀文章（第 {question.group?.[0]}–{question.group?.[1]} 題共用）
          <Icon name="chevronDown" class={`h-3.5 w-3.5 transition-transform ${showPassage ? 'rotate-180' : ''}`} />
        </button>
        {#if showPassage}
          <img src={IMG_BASE + passageUrl} alt={`第 ${question.group?.[0]}–${question.group?.[1]} 題的閱讀文章`} class="w-full rounded-lg bg-white" loading="lazy" decoding="async" />
        {/if}
      </div>
    {:else if groupish}
      <div class="flex flex-col gap-2 rounded-box border border-dashed border-base-300 bg-base-200/30 p-2">
        {#if contextBack === 0}
          <button type="button" class="btn btn-ghost btn-xs self-start" onclick={() => (contextBack = 1)}>
            <Icon name="fileText" class="h-3.5 w-3.5" />
            題組題——文章在更前面的題目圖裡，點開往前找
          </button>
        {:else}
          <div class="flex flex-wrap items-center gap-2 text-xs text-base-content/60">
            <span>第 {Number(question.question_number) - contextBack} 題的圖（文章通常在圖的下半部）</span>
            <button type="button" class="btn btn-ghost btn-xs" disabled={!earlierImageUrl(question, contextBack + 1)} onclick={() => (contextBack += 1)}><Icon name="arrowLeft" class="h-3 w-3" /> 再往前</button>
            <button type="button" class="btn btn-ghost btn-xs" onclick={() => (contextBack -= 1)}>{#if contextBack === 1}收合{:else}往後 <Icon name="arrowRight" class="h-3 w-3" />{/if}</button>
          </div>
          {#if contextUrl}
            <img src={IMG_BASE + contextUrl} alt={`第 ${Number(question.question_number) - contextBack} 題（題組文章脈絡）`} class="w-full rounded-lg bg-white" loading="lazy" decoding="async" />
          {/if}
        {/if}
      </div>
    {/if}

    {#if imgVisible}
      <QuestionImage {question} />
    {:else}
      <button type="button" class="btn btn-ghost btn-sm self-start" onclick={() => (showImg = true)}>
        <Icon name="image" class="h-4 w-4" />
        看題目圖
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
          <Icon name="star" class="h-4 w-4" filled={inBook} />
          {inBook ? '已在錯題本' : '加入錯題本'}
        </button>
        <button type="button" class="btn btn-sm btn-ghost" onclick={askThis} title="複製題目並開 Gemini 詢問">
          <Icon name="sparkles" class="h-4 w-4" />
          問 AI
        </button>
      </div>
    {/if}

    {#if shownRevealed}
      <AnswerReveal {question} />
    {/if}
  </div>
</article>
