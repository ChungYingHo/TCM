<script lang="ts">
  import type { QuestionRecord } from '@/models/question'

  let { question }: { question: QuestionRecord } = $props()
  let zoomed = $state(false)

  // Reserve aspect ratio to avoid layout shift (CLS).
  const ratio = $derived(
    question.image_w && question.image_h ? `${question.image_w} / ${question.image_h}` : 'auto',
  )
</script>

<button
  type="button"
  class="block w-full cursor-zoom-in border-0 bg-transparent p-0"
  onclick={() => (zoomed = true)}
  aria-label="放大題目圖片"
>
  <img
    src={question.question_image_url}
    alt={`${question.subject} 第 ${question.question_number} 題`}
    class="w-full rounded-lg bg-white"
    style={`aspect-ratio: ${ratio}`}
    loading="lazy"
    decoding="async"
  />
</button>

{#if zoomed}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    onclick={() => (zoomed = false)}
    onkeydown={(e) => e.key === 'Escape' && (zoomed = false)}
    role="button"
    tabindex="0"
    aria-label="關閉放大檢視"
  >
    <img
      src={question.question_image_url}
      alt={`${question.subject} 第 ${question.question_number} 題（放大）`}
      class="max-h-full max-w-full cursor-zoom-out rounded-lg bg-white"
    />
  </div>
{/if}
