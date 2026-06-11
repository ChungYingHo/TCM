<script lang="ts">
  // Flashcard study with word-level spaced repetition. Due cards come first (calendar
  // SRS), then fresh words in frequency order. 認識 advances the box; 不熟 resets it.
  import type { VocabWord } from '@/models/vocab'
  import { dueIds, grade, learn, getCard } from '@/utils/vocabSrs'
  import VocabCard from '@/components/vocab/VocabCard.svelte'
  import Icon from '@/components/common/Icon.svelte'

  // `ids` pins the deck to a fixed set (today's due-review words on the daily page);
  // without it the component self-selects due + fresh words (the /vocab study page).
  let { words, ids, onfinish }: { words: VocabWord[]; ids?: string[]; onfinish?: () => void } = $props()
  const byId = new Map(words.map((w) => [w.id, w]))

  let deck = $state<string[]>([])
  let i = $state(0)
  let flipped = $state(false)

  function build() {
    if (ids) {
      deck = ids.filter((id) => byId.has(id))
    } else {
      const due = dueIds().slice(0, 20)
      const seen = new Set(due)
      const fresh = words.filter((w) => !getCard(w.id) && !seen.has(w.id)).slice(0, 20).map((w) => w.id)
      deck = [...due, ...fresh]
    }
    i = 0
    flipped = false
  }
  $effect(() => { build() })

  const current = $derived(deck[i] ? byId.get(deck[i]) : null)
  const remaining = $derived(Math.max(0, deck.length - i))

  function answer(known: boolean) {
    const id = deck[i]
    if (id) {
      if (!getCard(id)) learn([id])
      grade(id, known)
    }
    i += 1
    flipped = false
    if (i >= deck.length) onfinish?.()
  }
</script>

{#if !current}
  <div class="rounded-box border border-dashed border-base-300 p-8 text-center">
    <p class="text-lg font-bold">這輪複習完成 🎉</p>
    <p class="mt-1 text-sm text-base-content/55">到期的字之後會自動再排進來。</p>
    <button class="btn btn-primary btn-sm mt-3" onclick={build}>再來一輪</button>
  </div>
{:else}
  <div class="mx-auto flex max-w-md flex-col gap-3">
    <p class="text-center text-sm text-base-content/55 tabular-nums">剩 {remaining} 張</p>
    {#if !flipped}
      <button
        class="flex min-h-52 flex-col items-center justify-center gap-2 rounded-box border border-base-300 bg-base-100 p-6 shadow-soft transition-colors hover:border-primary/40"
        onclick={() => (flipped = true)}
      >
        <span class="font-display text-4xl font-bold tracking-tight">{current.word}</span>
        {#if current.phonetic}<span class="text-base-content/55">/{current.phonetic}/</span>{/if}
        <span class="mt-3 text-xs text-base-content/40">點一下看解釋與例句</span>
      </button>
    {:else}
      <VocabCard word={current} />
      <div class="grid grid-cols-2 gap-2">
        <button class="btn btn-outline btn-error" onclick={() => answer(false)}>不熟</button>
        <button class="btn btn-success" onclick={() => answer(true)}>認識 <Icon name="check" class="h-4 w-4" /></button>
      </div>
    {/if}
  </div>
{/if}
