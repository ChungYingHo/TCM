<script lang="ts">
  // Reusable dialog: native <dialog> + DaisyUI modal. Native gives Esc + focus-trap
  // for free; `onclose`/`oncancel` keep the bound `open` in sync when the user
  // closes via Esc or backdrop. Body is a snippet so callers pass any content.
  import type { Snippet } from 'svelte'

  interface Props {
    open?: boolean
    title?: string
    size?: 'md' | 'lg' | 'xl' | 'full'
    onclose?: () => void
    children?: Snippet
  }
  let { open = $bindable(false), title = '', size = 'lg', onclose, children }: Props = $props()

  let dialog = $state<HTMLDialogElement>()

  const sizeCls: Record<NonNullable<Props['size']>, string> = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-5xl',
  }

  $effect(() => {
    const d = dialog
    if (!d) return
    if (open && !d.open) d.showModal()
    else if (!open && d.open) d.close()
  })

  function handleClose() {
    if (!open) return
    open = false
    onclose?.()
  }
</script>

<dialog bind:this={dialog} class="modal modal-bottom sm:modal-middle" onclose={handleClose} oncancel={handleClose}>
  <div class={`modal-box flex max-h-[90vh] w-full flex-col gap-3 ${sizeCls[size]} ${size === 'full' ? 'h-[90vh]' : ''}`}>
    <div class="flex items-center gap-3">
      {#if title}<h3 class="text-lg font-bold tracking-tight">{title}</h3>{/if}
      <form method="dialog" class="ml-auto">
        <button class="btn btn-circle btn-ghost btn-sm" aria-label="關閉">✕</button>
      </form>
    </div>
    <div class="min-h-0 flex-1 overflow-y-auto">
      {@render children?.()}
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button aria-label="關閉背景">close</button>
  </form>
</dialog>
