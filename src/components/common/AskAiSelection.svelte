<script lang="ts">
  // Floating "問 AI" button on text selection within page content (notes, answer
  // explanations, option text…). Questions are images so they aren't selectable —
  // for those, the question card has its own "問 AI 這題" button.
  import { askGemini, buildSelectionPrompt } from '@/utils/askAI'

  let visible = $state(false)
  let x = $state(0)
  let y = $state(0)
  let text = $state('')

  function update() {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) { visible = false; return }
    const t = sel.toString().trim()
    if (t.length < 2) { visible = false; return }
    const node = sel.anchorNode
    const el = node instanceof Element ? node : node?.parentElement
    // only inside readable page content; never on nav / controls / the button itself
    if (!el || !el.closest('main') || el.closest('button, a, nav, input, textarea, select, [data-no-ai]')) {
      visible = false
      return
    }
    const r = sel.getRangeAt(0).getBoundingClientRect()
    if (!r.width && !r.height) { visible = false; return }
    text = t
    x = Math.min(Math.max(r.left + r.width / 2, 56), window.innerWidth - 56)
    y = Math.max(r.top - 10, 52)
    visible = true
  }

  $effect(() => {
    const onUp = () => setTimeout(update, 10)
    const onSel = () => { const s = window.getSelection(); if (!s || s.isCollapsed) visible = false }
    const onScroll = () => { visible = false }
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchend', onUp)
    document.addEventListener('selectionchange', onSel)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchend', onUp)
      document.removeEventListener('selectionchange', onSel)
      window.removeEventListener('scroll', onScroll, true)
    }
  })

  function ask() {
    visible = false
    void askGemini(buildSelectionPrompt(text))
  }
</script>

{#if visible}
  <button
    type="button"
    class="fixed z-50 flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-content shadow-lg animate-fade-in-up"
    style={`left:${x}px; top:${y}px`}
    onmousedown={(e) => e.preventDefault()}
    onclick={ask}
  >
    <span aria-hidden="true">✦</span> 問 AI
  </button>
{/if}
