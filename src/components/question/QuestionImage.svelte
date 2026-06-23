<script lang="ts">
  import type { QuestionRecord } from '@/models/question'

  let { question }: { question: QuestionRecord } = $props()
  let zoomed = $state(false)
  let actualSize = $state(false) // false = fit-to-screen, true = 1:1 native (scrollable)
  let imgError = $state(false)

  // Question images may be served from a CDN (PUBLIC_IMG_BASE) instead of the
  // app deploy — e.g. jsDelivr over the public repo, so the ~300MB of images
  // don't ship with every Vercel build. Empty locally → fall back to /q/.
  const IMG_BASE = (import.meta.env.PUBLIC_IMG_BASE || '').replace(/\/$/, '')
  const imgSrc = $derived(
    question.question_image_url ? IMG_BASE + question.question_image_url : '',
  )

  // Reserve aspect ratio to avoid layout shift (CLS).
  const ratio = $derived(
    question.image_w && question.image_h ? `${question.image_w} / ${question.image_h}` : 'auto',
  )

  function open() {
    actualSize = false
    zoomed = true
  }
  function close() {
    zoomed = false
  }
</script>

<button
  type="button"
  class="block w-full cursor-zoom-in border-0 bg-transparent p-0"
  onclick={open}
  aria-label="放大題目圖片"
>
  {#if imgError}
    <div class="flex w-full items-center justify-center rounded-lg border border-dashed border-base-300 bg-base-200/50 py-10 text-sm text-base-content/50" style={`aspect-ratio: ${ratio}`}>
      圖片載入失敗
      <button type="button" class="ml-2 underline" onclick={(e) => { e.stopPropagation(); imgError = false }}>重試</button>
    </div>
  {:else}
    <img
      src={imgSrc}
      alt={`${question.subject} 第 ${question.question_number} 題`}
      class="w-full rounded-lg bg-white"
      style={`aspect-ratio: ${ratio}`}
      loading="lazy"
      decoding="async"
      onerror={() => (imgError = true)}
    />
  {/if}
</button>

{#if zoomed}
  <div
    class="fixed inset-0 z-50 overflow-auto overscroll-contain bg-black/85 p-2 sm:p-4"
    onclick={close}
    onkeydown={(e) => e.key === 'Escape' && close()}
    role="button"
    tabindex="0"
    aria-label="關閉放大檢視"
  >
    <div class="pointer-events-none sticky top-1 z-10 flex justify-center">
      <span class="pointer-events-auto rounded-full bg-base-100/90 px-3 py-1 text-xs shadow">
        {actualSize ? '原始大小，點圖縮回／點背景關閉' : '點圖放到最大、點背景關閉'}
      </span>
    </div>
    <div class="flex min-h-full items-start justify-center">
      <img
        src={imgSrc}
        alt={`${question.subject} 第 ${question.question_number} 題（放大）`}
        class={`rounded-lg bg-white ${actualSize ? 'max-w-none cursor-zoom-out' : 'max-h-[92vh] max-w-full cursor-zoom-in'}`}
        style={actualSize && question.image_w ? `width:${question.image_w}px` : ''}
        onclick={(e) => {
          e.stopPropagation()
          actualSize = !actualSize
        }}
      />
    </div>
  </div>
{/if}
