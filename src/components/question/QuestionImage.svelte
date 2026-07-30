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

<!-- The error card and the zoom trigger are siblings, never nested: a retry
     <button> inside the zoom <button> is invalid HTML and breaks hydration. -->
{#if imgError}
  <div
    class="flex w-full items-center justify-center rounded-lg border border-dashed border-base-300 bg-base-200/50 py-10 text-sm text-base-content/50"
    style={`aspect-ratio: ${ratio}`}
  >
    圖片載入失敗
    <button type="button" class="ml-2 underline" onclick={() => (imgError = false)}>重試</button>
  </div>
{:else}
  <button
    type="button"
    class="block w-full cursor-zoom-in border-0 bg-transparent p-0"
    onclick={open}
    aria-label="放大題目圖片"
  >
    <img
      src={imgSrc}
      alt={`${question.subject} 第 ${question.question_number} 題`}
      class="w-full rounded-lg bg-white"
      style={`aspect-ratio: ${ratio}`}
      loading="lazy"
      decoding="async"
      onerror={() => (imgError = true)}
    />
  </button>
{/if}

<!-- svelte:window must sit at the top level, so guard on `zoomed` in the handler. -->
<svelte:window onkeydown={(e) => zoomed && e.key === 'Escape' && close()} />

{#if zoomed}
  <div
    class="fixed inset-0 z-50 overflow-auto overscroll-contain bg-black/85 p-2 sm:p-4"
    role="dialog"
    aria-modal="true"
    aria-label="題目圖片放大檢視"
  >
    <!-- Backdrop is its own button so the click target is keyboard-reachable
         without hanging handlers off a non-interactive element. -->
    <button
      type="button"
      class="fixed inset-0 cursor-default"
      aria-label="關閉放大檢視"
      onclick={close}
    ></button>

    <div class="pointer-events-none sticky top-1 z-20 flex justify-center">
      <span class="pointer-events-auto rounded-full bg-base-100/90 px-3 py-1 text-xs shadow">
        {actualSize ? '原始大小，點圖縮回／點背景關閉' : '點圖放到最大、點背景關閉'}
      </span>
    </div>

    <div class="relative z-10 flex min-h-full items-start justify-center">
      <button
        type="button"
        class={`block border-0 bg-transparent p-0 ${actualSize ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
        aria-label={actualSize ? '縮回以符合螢幕' : '放大到原始尺寸'}
        onclick={() => (actualSize = !actualSize)}
      >
        <img
          src={imgSrc}
          alt={`${question.subject} 第 ${question.question_number} 題（放大）`}
          class={`rounded-lg bg-white ${actualSize ? 'max-w-none' : 'max-h-[92vh] max-w-full'}`}
          style={actualSize && question.image_w ? `width:${question.image_w}px` : ''}
        />
      </button>
    </div>
  </div>
{/if}
