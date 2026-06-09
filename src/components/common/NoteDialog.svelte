<script lang="ts">
  // Global note dialog: listens for openNote() and shows the note in a modal via a
  // lazy same-origin iframe (/notes/[slug]?embed=1). One iframe, swap src — the
  // interactive MDX islands hydrate inside it, so nothing has to be re-implemented.
  import Modal from '@/components/common/Modal.svelte'
  import type { OpenNoteDetail } from '@/utils/noteDialog'

  let open = $state(false)
  let title = $state('考點筆記')
  let loaded = $state('') // slug loaded into the iframe; persists across re-opens

  $effect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<OpenNoteDetail>).detail
      loaded = d.slug
      title = d.title || '考點筆記'
      open = true
    }
    window.addEventListener('tcm:opennote', onOpen)
    return () => window.removeEventListener('tcm:opennote', onOpen)
  })
</script>

<Modal bind:open {title} size="full">
  {#if loaded}
    <iframe
      src={`/notes/${loaded}?embed=1`}
      {title}
      class="h-full min-h-[70vh] w-full rounded-lg border border-base-200 bg-base-100"
    ></iframe>
  {/if}
</Modal>
